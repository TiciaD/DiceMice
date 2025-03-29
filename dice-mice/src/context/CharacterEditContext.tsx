import { Character } from "@/models/character.model";
import { DerivedStat } from "@/models/derived-stat.model";
import { InitiativeEntry } from "@/models/initiative-entry.model";
import { SkillLevel } from "@/models/skill-level.model";
import { fetchInitiativeChart } from "@/services/firestore-service";
import { db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { createContext, ReactNode, useContext, useState } from "react";

interface CharacterEditContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentCharacter: Character | null;
  setCurrentCharacter: (char: Character | null) => void;
  skillLevels: SkillLevel[];
  setSkillLevels: (skillLvls: SkillLevel[]) => void;
  derivedStats: DerivedStat[];
  initiativeChart: InitiativeEntry[];
  setInitiativeChart: (chart: InitiativeEntry[]) => void;
  setDerivedStats: (stats: DerivedStat[]) => void;
  fetchData: () => Promise<void>
}

// Create context
const CharacterEditContext = createContext<CharacterEditContextType | undefined>(undefined);

// Provider component
export const CharacterEditProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([]);
  const [derivedStats, setDerivedStats] = useState<DerivedStat[]>([]);
  const [initiativeChart, setInitiativeChart] = useState<InitiativeEntry[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    console.log("fetching derived stats and initiative chart")

    // Fetch Derived Stats
    const derivedStatsSnapshot = await getDocs(collection(db, "derived_stats"));
    const fetchedDerivedStats = derivedStatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DerivedStat));
    setDerivedStats(fetchedDerivedStats);

    // Fetch Skill Levels
    const skillLevelsSnapshot = await getDocs(collection(db, "skill_levels"));
    const fetchedSkillLevels = skillLevelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillLevel));
    setSkillLevels(fetchedSkillLevels.sort((a, b) => a.order - b.order));

    // Fetch initiative chart
    const chart = await fetchInitiativeChart();
    // console.log("chart", chart)
    setInitiativeChart(chart);

    setIsLoading(false)
  }

  return (
    <CharacterEditContext.Provider value={{
      isLoading, setIsLoading,
      currentCharacter, setCurrentCharacter,
      skillLevels, setSkillLevels,
      derivedStats, setDerivedStats,
      initiativeChart, setInitiativeChart,
      fetchData
    }}>
      {children}
    </CharacterEditContext.Provider>
  );
};

export const useCharacterEditContext = () => {
  const context = useContext(CharacterEditContext);
  if (!context) throw new Error("useCharacterEditContext must be used within CharacterEditProvider");
  return context;
};