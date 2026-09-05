import { FileChange, ImportanceLevel } from '../models/change';
export interface ImportanceResult { score: number; level: ImportanceLevel; }
type ScorableChange = Pick<FileChange, 'additions' | 'deletions' | 'category' | 'flags'>;
export function categoryScore(files: ScorableChange[], category: string): number {
  const relevant = files.filter(file => file.category === category);
  if (!relevant.length) return 0;
  const result = scoreChanges(relevant);
  return Math.max(1, Math.min(100, result.score));
}
export function scoreChanges(files: ScorableChange[]): ImportanceResult {
  let score = Math.min(25, files.reduce((sum, file) => sum + file.additions + file.deletions, 0) / 40);
  const categories = new Set(files.map(file => file.category));
  const weights: Array<[string, number]> = [['Authentication', 35], ['Security', 35], ['Database', 28], ['API', 22], ['Architecture', 22], ['Configuration', 18], ['Dependencies', 14], ['Backend', 12], ['Tests', 4], ['UI', 3]];
  for (const [category, weight] of weights) if (categories.has(category as FileChange['category'])) score += weight;
  if (files.length >= 5) score += 8;
  if (files.some(file => file.flags.includes('validation-removed') || file.flags.includes('error-handling-removed'))) score += 18;
  score = Math.min(100, Math.round(score));
  return { score, level: score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW' };
}
