export interface Stat {
  id: string;
  name: string;
  description: string;
  abbreviation: string;
  order: number;
}

export interface BaseStatForm {
  strength: number;
  constitution: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}
