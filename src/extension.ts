import * as vscode from 'vscode';
import { analyzeChanges } from './analyzers/changeAnalyzer';
import { ChangeStoryView } from './providers/changeStoryView';

let lastAnalysis: Awaited<ReturnType<typeof analyzeChanges>> | undefined;
export function activate(context: vscode.ExtensionContext): void {
  const view = new ChangeStoryView(context.extensionUri);
  context.subscriptions.push(vscode.window.registerTreeDataProvider('aiChangeStory.sidebar', {
    getChildren: () => [new vscode.TreeItem('Analyze workspace changes', vscode.TreeItemCollapsibleState.None)],
    getTreeItem: (item: vscode.TreeItem) => { item.command = { command: 'aiChangeStory.analyze', title: 'Analyze workspace changes' }; return item; }
  }));
  const analyze = vscode.commands.registerCommand('aiChangeStory.analyze', async () => { await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'AI Change Story: analyzing locally' }, async progress => { progress.report({ message: 'Reading Git changes...' }); try { lastAnalysis = await analyzeChanges(); if (!lastAnalysis.files.length) vscode.window.showInformationMessage('AI Change Story found no changes between HEAD and the working tree.'); view.show(lastAnalysis); } catch (error) { vscode.window.showErrorMessage(error instanceof Error ? error.message : 'Unable to analyze changes.'); } }); });
  const openStory = vscode.commands.registerCommand('aiChangeStory.openStory', () => { if (lastAnalysis) { view.show(lastAnalysis); view.focus('stories'); } else return vscode.commands.executeCommand('aiChangeStory.analyze'); });
  const refresh = vscode.commands.registerCommand('aiChangeStory.refresh', () => vscode.commands.executeCommand('aiChangeStory.analyze'));
  const showMap = vscode.commands.registerCommand('aiChangeStory.showMap', () => { if (lastAnalysis) { view.show(lastAnalysis); view.focus('map'); } else return vscode.commands.executeCommand('aiChangeStory.analyze'); });
  const showRisk = vscode.commands.registerCommand('aiChangeStory.showRisk', () => { if (lastAnalysis) { view.show(lastAnalysis); view.focus('risk'); } else return vscode.commands.executeCommand('aiChangeStory.analyze'); });
  const reset = vscode.commands.registerCommand('aiChangeStory.reset', () => { lastAnalysis = undefined; vscode.window.showInformationMessage('AI Change Story reset.'); });
  context.subscriptions.push(analyze, openStory, refresh, showMap, showRisk, reset);
  const watcher = vscode.workspace.createFileSystemWatcher('**/*'); let timer: NodeJS.Timeout | undefined; const notify = () => { if (!vscode.workspace.getConfiguration('aiChangeStory').get<boolean>('autoDetect', true) || timer) return; timer = setTimeout(async () => { timer = undefined; try { const analysis = await analyzeChanges(); const threshold = vscode.workspace.getConfiguration('aiChangeStory').get<number>('autoAnalyzeThreshold', 250); if (analysis.totals.changedLines >= threshold && vscode.workspace.getConfiguration('aiChangeStory').get<boolean>('showNotifications', true)) vscode.window.showInformationMessage(`Large code change detected: ${analysis.totals.changedLines} lines across ${analysis.totals.files} files.`, 'Analyze Changes').then(choice => choice && vscode.commands.executeCommand('aiChangeStory.analyze')); } catch { /* Git may not be ready while files are being written. */ } }, 1200); }; context.subscriptions.push(watcher, watcher.onDidCreate(notify), watcher.onDidChange(notify), watcher.onDidDelete(notify));
}
export function deactivate(): void { }
