import * as cp from 'node:child_process';
import * as vscode from 'vscode';

function runGit(cwd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => cp.execFile('git', args, { cwd, maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => error ? reject(new Error(stderr.trim() || 'Git is unavailable or this folder is not a repository.')) : resolve(stdout)));
}
export interface RawDiff { path: string; status: string; additions: number; deletions: number; diff: string; }
export async function collectDiff(): Promise<RawDiff[]> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) throw new Error('Open a workspace folder before analyzing changes.');
  const cwd = folder.uri.fsPath;
  await runGit(cwd, ['rev-parse', '--show-toplevel']);
  const nameStatus = await runGit(cwd, ['diff', 'HEAD', '--name-status']);
  const numstat = await runGit(cwd, ['diff', 'HEAD', '--numstat']);
  const full = await runGit(cwd, ['diff', 'HEAD', '--no-ext-diff', '--unified=3']);
  const stats = new Map<string, [number, number]>();
  for (const line of numstat.split('\n')) { const [a, d, ...parts] = line.split('\t'); const path = parts.join('\t'); if (path) stats.set(path, [a === '-' ? 0 : Number(a), d === '-' ? 0 : Number(d)]); }
  const status = nameStatus.split('\n').filter(Boolean).map(line => { const [kind, ...parts] = line.split('\t'); return { kind, path: parts.at(-1) ?? '' }; });
  return status.map(item => { const [additions, deletions] = stats.get(item.path) ?? [0, 0]; return { path: item.path, status: item.kind, additions, deletions, diff: extractFileDiff(full, item.path) }; });
}
function extractFileDiff(diff: string, path: string): string { const chunks = diff.split(/^diff --git /m); return chunks.find(chunk => chunk.includes(` b/${path}`)) ? `diff --git ${chunks.find(chunk => chunk.includes(` b/${path}`))}` : ''; }
export async function openDiff(): Promise<void> { const folder = vscode.workspace.workspaceFolders?.[0]; if (!folder) return; const uri = folder.uri.with({ scheme: 'git', path: `${folder.uri.fsPath}` }); await vscode.commands.executeCommand('git.viewChanges', uri); }
