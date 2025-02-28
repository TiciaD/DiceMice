export interface Class {
  id: string;
  name: string;
  isAvailable: boolean;
  description: string;
  abilityIds: string[];
  skillIds: string[];
  baseValues: ClassLevels;
  prerequisites: Prerequisite[];
  willpower_advancement: 'even_levels' | 'each_level' | 'none';
  hit_die: string;
}

interface Prerequisite {
  min: number;
  stat: string;
}

interface ClassLevels {
  1: Record<string, number>;
  2?: Record<string, number>;
}
