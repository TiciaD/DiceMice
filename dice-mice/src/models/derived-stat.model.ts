export interface DerivedStat {
  id: string;
  name: string;
  description: string;
  type: string;
  formula: string;
  variables: string[];
  applicableClassIds?: string[]; // Used to determine what class this stat should show for - default not shown
  overrides?: StatOverride[];
}

interface StatOverride {
  classId: string;
  abilityName: string;
  minLevel: number; // At what level this applies
  newFormula?: string; // If the ability changes the formula
  newVariables?: string[]; // If the ability changes the variables
}
