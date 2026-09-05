import { ChangeAnalysis, Story } from '../models/change';
export interface IChangeIntelligenceProvider { explain(story: Story, detail: 'simple' | 'medium' | 'deep'): Promise<string>; }
export class LocalChangeIntelligenceProvider implements IChangeIntelligenceProvider { async explain(story: Story, detail: 'simple' | 'medium' | 'deep'): Promise<string> { if (detail === 'simple') return story.summary; if (detail === 'deep') return `${story.summary} ${story.technicalDetails.join(' ')}`; return story.why; } }
