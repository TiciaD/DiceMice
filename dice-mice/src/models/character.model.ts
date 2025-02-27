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
  current_base_stats: CharacterBaseStats;
  original_base_stats: CharacterBaseStats;
  hp_progression: CharacterHitPointProgression;
}

interface CharacterBaseStats {
  strength: number;
  constitution: number;
  dexterity: number;
  wisdom: number;
  intelligence: number;
  charisma: number;
}

interface CharacterHitPointProgression {
  1?: number;
  2?: number;
  3?: number;
}
