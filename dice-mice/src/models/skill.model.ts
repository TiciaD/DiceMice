export interface Skill {
  id: string;
  name: string;
  description: string;
  associatedStatId: string;
  benefits: SkillBenefits;
}

interface SkillBenefits {
  trained: string;
  expert: string;
  master: string;
  legendary: string;
}
