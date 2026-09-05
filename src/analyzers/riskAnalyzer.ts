import { FileChange, RiskFlag } from '../models/change';
export function detectRisks(files: FileChange[]): RiskFlag[] {
  const risks: RiskFlag[] = [];
  const add = (level: RiskFlag['level'], message: string, matches: FileChange[]) => { if (matches.length) risks.push({ level, message, files: matches.map(file => file.path) }); };
  add('CRITICAL', 'Authentication or authorization code changed.', files.filter(file => ['Authentication', 'Security'].includes(file.category)));
  add('HIGH', 'Database schema or migration code changed.', files.filter(file => file.category === 'Database'));
  add('HIGH', 'A public API or route may have changed.', files.filter(file => file.category === 'API'));
  add('MEDIUM', 'Production configuration or dependencies changed.', files.filter(file => ['Configuration', 'Dependencies', 'Infrastructure'].includes(file.category)));
  add('MEDIUM', 'Validation or error handling appears to have been removed.', files.filter(file => file.flags.includes('validation-removed') || file.flags.includes('error-handling-removed')));
  add('LOW', 'Large change has limited test coverage.', files.filter(file => file.additions + file.deletions > 120 && file.category !== 'Tests'));
  return risks;
}
