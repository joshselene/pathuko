import { collectDiff } from '../services/gitService';
import { ChangeAnalysis, FileChange } from '../models/change';
import { classifyFile } from './fileClassifier';
import { detectRisks } from './riskAnalyzer';
import { generateStories } from './storyGenerator';

export async function analyzeChanges(): Promise<ChangeAnalysis> {
  const raw = await collectDiff();
  const files: FileChange[] = raw.map(file => { const flags: string[] = []; if (/^-\s*(if|assert|validate|throw)/m.test(file.diff)) flags.push('validation-removed'); if (/^-.*(catch|try)/m.test(file.diff)) flags.push('error-handling-removed'); const symbols = Array.from(file.diff.matchAll(/^\+\s*(?:export\s+)?(?:async\s+)?(?:function|class|interface|type|const)\s+(\w+)/gm), match => match[1]); return { ...file, category: classifyFile(file.path), symbols, flags }; });
  const risks = detectRisks(files);
  const stories = generateStories(files, risks);
  const additions = files.reduce((sum, file) => sum + file.additions, 0); const deletions = files.reduce((sum, file) => sum + file.deletions, 0);
  return { files, stories, risks, totals: { files: files.length, additions, deletions, changedLines: additions + deletions }, generatedAt: new Date().toISOString() };
}
