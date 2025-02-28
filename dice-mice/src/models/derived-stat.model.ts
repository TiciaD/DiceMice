export interface DerivedStat {
  id: string;
  name: string;
  description: string;
  type: string;
  formula: string;
  variables: string[];
  applicableClassIds?: string[];
}
