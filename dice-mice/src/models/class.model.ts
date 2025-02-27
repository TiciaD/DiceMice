export interface Class {
  id: string;
  name: string;
  isAvailable: boolean;
  description: string;
  abilityIds: string[];
  skillIds: string[];
  base_values: ClassLevels;
}

export interface ClassLevels {
  1: ClassStats;
  2: ClassStats;
}

export interface ClassStats {
  ac: number;
  attack: number;
  damage_bonus: string;
  fortitude: number;
  leadership: number;
  reflex: number;
  skill_ranks: number;
  spell: number;
  will: number;
}
