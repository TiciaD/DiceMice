export interface SkillLevel {
  id: string;
  name: string;
  bonus: number;
  class_skill_min_level: number;
  non_class_skill_min_level: number;
  order: number;
  cost: number;
}
