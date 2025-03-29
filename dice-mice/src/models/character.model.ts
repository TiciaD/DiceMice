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
  current_base_stats: BaseStatMap;
  original_base_stats: BaseStatMap;
  hp_progression: HPProgressionMap; // {1, 2} i.e. Level 1, 2 HP
  skills: CharacterSkills[];
  chosenClassSkills?: string[];
}

export interface CharacterSkills {
  skillId: string;
  skillLevelId: string;
}

export type AllowedStats =
  | 'strength'
  | 'constitution'
  | 'dexterity'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export type AllowedLevels =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14';

export type BaseStatMap = {
  [key in AllowedStats]: number;
};

export type HPProgressionMap = {
  [key in AllowedLevels]: number;
};
