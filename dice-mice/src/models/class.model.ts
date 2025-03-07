export interface Class {
  id: string;
  name: string;
  isAvailable: boolean;
  description: string;
  abilities: Ability[];
  skillIds: string[];
  baseValues: Record<number, Record<string, string | number>>;
  prerequisites: Prerequisite[];
  willpower_advancement: 'even_levels' | 'each_level' | 'none';
  hit_die: string;
}

interface Prerequisite {
  min: number;
  stat: string;
}

// interface ClassLevels {
//   1: Record<string, number>;
//   2?: Record<string, number>;
// }

interface Ability {
  name: string;
  level: number;
  description: string;
}
