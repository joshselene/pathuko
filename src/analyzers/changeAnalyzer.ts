import { collectDiff } from '../services/gitService';
import { ChangeAnalysis, FileChange, Relationship, ScoreBreakdown } from '../models/change';
import { classifyFile } from './fileClassifier';
import { detectRisks } from './riskAnalyzer';
import { generateStories } from './storyGenerator';
import { categoryScore, scoreChanges } from './importanceAnalyzer';

export async function analyzeChanges(): Promise<ChangeAnalysis> {
  const raw = await collectDiff();
  const draft = raw.map(file => { const flags: string[] = []; if (/^-\s*(if|assert|validate|throw)/m.test(file.diff)) flags.push('validation-removed'); if (/^-.*(catch|try)/m.test(file.diff)) flags.push('error-handling-removed'); const symbols = Array.from(file.diff.matchAll(/^\+\s*(?:export\s+)?(?:async\s+)?(?:function|class|interface|type|const)\s+(\w+)/gm), match => match[1]); const imports = Array.from(file.diff.matchAll(/^\+\s*import .*? from ['"](.+?)['"]/gm), match => match[1]); return { ...file, category: classifyFile(file.path), symbols, flags, imports }; });
  const files: FileChange[] = draft.map(file => { const importance = scoreChanges([file]); return { ...file, score: importance.score, importance: importance.level }; });
  const risks = detectRisks(files);
  const stories = generateStories(files, risks);
  const relationships = buildRelationships(files);
  const scores: ScoreBreakdown = { overall: scoreChanges(files).score, security: categoryScore(files, 'Security') || categoryScore(files, 'Authentication'), architecture: categoryScore(files, 'Architecture'), api: categoryScore(files, 'API'), database: categoryScore(files, 'Database'), testing: categoryScore(files, 'Tests'), ui: Math.max(categoryScore(files, 'UI'), categoryScore(files, 'Frontend')), complexity: Math.min(100, Math.round(files.reduce((sum, file) => sum + file.symbols.length + file.additions / 50, 0))) };
  const additions = files.reduce((sum, file) => sum + file.additions, 0); const deletions = files.reduce((sum, file) => sum + file.deletions, 0);
  const lowPriority = files.filter(file => ['Documentation', 'Dependencies'].includes(file.category) || file.path.endsWith('.css') && file.additions + file.deletions < 80 || file.additions + file.deletions < 8);
  const hasAuth = files.some(file => ['Authentication', 'Security'].includes(file.category));
  return { files, stories, risks, relationships, scores, lowPriority, architecture: { before: ['Client', 'API', 'Service', 'Database'], after: hasAuth ? ['Client', 'API', 'Auth Middleware', 'Service', 'Database'] : ['Client', 'API', 'Service', 'Database'], confidence: hasAuth ? 78 : 42 }, totals: { files: files.length, additions, deletions, changedLines: additions + deletions }, generatedAt: new Date().toISOString() };
}

function buildRelationships(files: FileChange[]): Relationship[] {
  const relationships: Relationship[] = files.map(file => ({ source: 'AI Change', target: file.category, type: 'DIRECT_CHANGE', confidence: 100 }));
  for (const file of files) for (const imported of file.imports) { const target = files.find(candidate => candidate.path.includes(imported.replace(/^\.\//, '').replace(/\.[^.]+$/, ''))); if (target) relationships.push({ source: file.path, target: target.path, type: 'DEPENDENT_MODULE', confidence: 82 }); }
  const categories = new Set(files.map(file => file.category));
  if (categories.has('Authentication') && categories.has('API')) relationships.push({ source: 'Authentication', target: 'API', type: 'POTENTIAL_IMPACT', confidence: 72 });
  if (categories.has('Database') && categories.has('Backend')) relationships.push({ source: 'Database', target: 'Backend', type: 'POTENTIAL_IMPACT', confidence: 68 });
  return Array.from(new Map(relationships.map(item => [`${item.source}:${item.target}:${item.type}`, item])).values());
}
