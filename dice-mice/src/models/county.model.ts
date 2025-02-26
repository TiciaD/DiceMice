import { Stat } from './stat.model';

export interface County {
  id: string;
  name: string;
  description: string;
  associatedStatId: string;
  associatedStat: Stat | null;
}
