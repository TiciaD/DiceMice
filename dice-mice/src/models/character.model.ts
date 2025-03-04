export interface Character {
  id: string;
  name: string;
  trait: string;
  bio: string;
  xp: number;
  level: number;
  classId: string;
  houseId: string;
  countyId: string;
  current_base_stats: Record<string, number>;
  original_base_stats: Record<string, number>;
  hp_progression: Record<number, number>; // {1, 2} i.e. Level 1, 2 HP
  skills: CharacterSkills[];
}

interface CharacterBaseStats {
  strength: number;
  constitution: number;
  dexterity: number;
  wisdom: number;
  intelligence: number;
  charisma: number;
}

export interface CharacterSkills {
  skillId: string;
  skillLevelId: string;
}
