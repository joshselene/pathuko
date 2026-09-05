import { FileChange, RiskFlag } from '../models/change';
export function detectRisks(files: FileChange[]): RiskFlag[] {
  const risks: RiskFlag[] = [];
  const add = (level: RiskFlag['level'], category: RiskFlag['category'], message: string, why: string, recommendation: string, matches: FileChange[]) => { if (matches.length) risks.push({ level, category, message, why, recommendation, files: matches.map(file => file.path) }); };
  add('CRITICAL', 'Authentication', 'Authentication or authorization code changed.', 'A defect here can cross a security boundary for protected application paths.', 'Review token validation, authorization logic, and negative-path tests.', files.filter(file => ['Authentication', 'Security'].includes(file.category)));
  add('HIGH', 'Database', 'Database schema or migration code changed.', 'Stored data and deployment order may be affected.', 'Review migration reversibility and compatibility with existing data.', files.filter(file => file.category === 'Database'));
  add('HIGH', 'API', 'A public API or route may have changed.', 'Callers and integrations may depend on the existing contract.', 'Review request, response, validation, and versioning behavior.', files.filter(file => file.category === 'API'));
  add('MEDIUM', 'Configuration', 'Production configuration or dependencies changed.', 'Runtime behavior or supply-chain assumptions may have changed.', 'Review environment defaults, lockfiles, and deployment configuration.', files.filter(file => ['Configuration', 'Dependencies', 'Infrastructure'].includes(file.category)));
  add('MEDIUM', 'Security', 'Validation or error handling appears to have been removed.', 'Invalid input or failures may now travel further through the system.', 'Inspect the removed guard and add a regression test.', files.filter(file => file.flags.includes('validation-removed') || file.flags.includes('error-handling-removed')));
  add('LOW', 'Testing', 'Large change has limited test coverage.', 'A broad behavior change without nearby tests is harder to validate.', 'Inspect changed paths and add focused coverage before shipping.', files.filter(file => file.additions + file.deletions > 120 && file.category !== 'Tests'));
  return risks;
}
