export type ImportanceLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FileCategory = 'Architecture' | 'Authentication' | 'Security' | 'API' | 'Database' | 'Backend' | 'Frontend' | 'UI' | 'State Management' | 'Configuration' | 'Infrastructure' | 'Tests' | 'Utilities' | 'Documentation' | 'Dependencies' | 'Other';

export interface FileChange { path: string; status: string; additions: number; deletions: number; category: FileCategory; symbols: string[]; flags: string[]; diff: string; }
export interface RiskFlag { level: ImportanceLevel; message: string; files: string[]; }
export interface Story { id: string; title: string; summary: string; why: string; impact: string; importance: ImportanceLevel; score: number; risk: RiskFlag[]; files: FileChange[]; symbols: string[]; category: FileCategory; technicalDetails: string[]; }
export interface ChangeAnalysis { files: FileChange[]; stories: Story[]; risks: RiskFlag[]; totals: { files: number; additions: number; deletions: number; changedLines: number }; generatedAt: string; }
