export interface Skill {
  id: string;
  name: string;
  description: string;
  associatedStatId: string;
  benefits: Record<string, string>;
}
