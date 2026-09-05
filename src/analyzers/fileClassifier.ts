import { FileCategory } from '../models/change';

const rules: Array<[FileCategory, RegExp[]]> = [
  ['Authentication', [/(auth|login|session|token|oauth|jwt)/i]],
  ['Security', [/(security|permission|authorize|csrf|crypto|secret)/i]],
  ['Database', [/(migration|schema|database|\bdb\b|prisma|typeorm|sql)/i]],
  ['API', [/(controller|route|endpoint|api|graphql|resolver)/i]],
  ['Configuration', [/((^|\.)env|config|settings|docker|webpack|vite|tsconfig)/i]],
  ['Dependencies', [/(package\.json|package-lock|yarn\.lock|pnpm-lock)/i]],
  ['Tests', [/((^|\.|\/)(test|tests|spec|__tests__)(\.|\/|$))/i]],
  ['Documentation', [/((^|\/)(README|docs)(\.|\/|$)|\.md$)/i]],
  ['Infrastructure', [/(terraform|k8s|kubernetes|\.github\/workflows|\.ci)/i]],
  ['UI', [/(components?|views?|pages?|styles?|\.css$|\.scss$|\.tsx$|\.jsx$)/i]],
  ['Frontend', [/\.(tsx|jsx|vue|svelte)$/i]],
  ['State Management', [/(store|redux|zustand|mobx|context)/i]],
  ['Architecture', [/(index|container|module|bootstrap|main|app)\.(ts|js|tsx|jsx)$/i]],
  ['Utilities', [/(util|helper|lib)/i]],
  ['Backend', [/(service|repository|worker|job|handler)/i]]
];
export function classifyFile(path: string): FileCategory {
  for (const [category, patterns] of rules) if (patterns.some(pattern => pattern.test(path))) return category;
  return 'Other';
}
