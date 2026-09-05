export type ImportanceLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FileCategory = 'Architecture' | 'Authentication' | 'Security' | 'API' | 'Database' | 'Backend' | 'Frontend' | 'UI' | 'State Management' | 'Configuration' | 'Infrastructure' | 'Tests' | 'Utilities' | 'Documentation' | 'Dependencies' | 'Other';
export type RelationshipType = 'DIRECT_CHANGE' | 'DEPENDENT_MODULE' | 'POTENTIAL_IMPACT';

export interface FileChange { path: string; status: string; additions: number; deletions: number; category: FileCategory; symbols: string[]; flags: string[]; diff: string; importance: ImportanceLevel; score: number; imports: string[]; }
export interface RiskFlag { level: ImportanceLevel; category: FileCategory | 'Testing' | 'Complexity'; message: string; why: string; recommendation: string; files: string[]; }
export interface Story { id: string; title: string; summary: string; why: string; impact: string; importance: ImportanceLevel; score: number; risk: RiskFlag[]; files: FileChange[]; symbols: string[]; category: FileCategory; technicalDetails: string[]; }
export interface Relationship { source: string; target: string; type: RelationshipType; confidence: number; }
export interface ScoreBreakdown { overall: number; security: number; architecture: number; api: number; database: number; testing: number; ui: number; complexity: number; }
export interface ArchitectureView { before: string[]; after: string[]; confidence: number; }
export interface ChangeAnalysis { files: FileChange[]; stories: Story[]; risks: RiskFlag[]; relationships: Relationship[]; scores: ScoreBreakdown; architecture: ArchitectureView; lowPriority: FileChange[]; totals: { files: number; additions: number; deletions: number; changedLines: number }; generatedAt: string; }
