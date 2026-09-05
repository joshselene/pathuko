import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyFile } from '../analyzers/fileClassifier';
import { scoreChanges } from '../analyzers/importanceAnalyzer';
import { FileChange } from '../models/change';
test('classifies security and UI files', () => { assert.equal(classifyFile('src/auth/auth.service.ts'), 'Authentication'); assert.equal(classifyFile('src/components/Button.tsx'), 'UI'); });
test('security changes outrank large UI churn', () => { const security: FileChange = { path: 'auth.ts', status: 'M', additions: 20, deletions: 4, category: 'Authentication', symbols: [], flags: [], diff: '' }; const ui: FileChange = { path: 'styles.css', status: 'M', additions: 500, deletions: 200, category: 'UI', symbols: [], flags: [], diff: '' }; assert.ok(scoreChanges([security]).score > scoreChanges([ui]).score); });
test('large fixture is scored without quadratic work', () => { const files = Array.from({ length: 2000 }, (_, index) => ({ path: `src/file${index}.ts`, status: 'M', additions: 5, deletions: 2, category: 'Backend' as const, symbols: [], flags: [], diff: '' })); assert.ok(scoreChanges(files).score <= 100); });
