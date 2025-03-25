import { AllowedStats, BaseStatMap, Character, CharacterSkills, HPProgressionMap } from '@/models/character.model';
import { Class } from '@/models/class.model';
import { DerivedStat } from '@/models/derived-stat.model';
import { InitiativeEntry } from '@/models/initiative-entry.model';
import { SkillLevel } from '@/models/skill-level.model';
import { fetchInitiativeChart } from '@/services/firestore-service';
import { db } from '@/utils/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { createContext, useState, useContext, ReactNode } from 'react';

interface CharacterCreateContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedCounty: string;
  setSelectedCounty: (id: string) => void;
  selectedClass: string;
  setSelectedClass: (id: string) => void;
  generatedStats: BaseStatMap
  setGeneratedStats: (stats: BaseStatMap) => void;
  hpProgression: HPProgressionMap;
  setHPProgression: (hpProgression: HPProgressionMap) => void;
  name: string;
  setName: (name: string) => void;
  level: number;
  setLevel: (lvl: number) => void;
  eligibleClasses: Class[];
  setEligibleClasses: (classes: Class[]) => void;
  associatedStat: string;
  setAssociatedStat: (stat: string) => void;
  skillLevels: SkillLevel[];
  setSkillLevels: (skillLvls: SkillLevel[]) => void;
  selectedSkills: CharacterSkills[];
  setSelectedSkills: (skills: CharacterSkills[]) => void;
  derivedStats: DerivedStat[]
  setDerivedStats: (stats: DerivedStat[]) => void;
  chosenClassSkills: string[];  // skillIds selected as class skills (for Bard)
  setChosenClassSkills: (skills: string[]) => void;
  initiativeChart: InitiativeEntry[];
  setInitiativeChart: (chart: InitiativeEntry[]) => void;
  fetchData: () => Promise<void>
  handleSetGeneratedStats: (updatedStats: BaseStatMap, classes: Class[]) => void;
  handleFinalizeCharacter: (houseId: string) => Promise<void>;
}

const CharacterCreateContext = createContext<CharacterCreateContextType | undefined>(undefined);

export const CharacterCreateProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [eligibleClasses, setEligibleClasses] = useState<Class[]>([]);
  const [level, setLevel] = useState(1)
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkills[]>([]);
  const [derivedStats, setDerivedStats] = useState<DerivedStat[]>([]);
  const [associatedStat, setAssociatedStat] = useState<string>('');
  const [initiativeChart, setInitiativeChart] = useState<InitiativeEntry[]>([]);
  const [generatedStats, setGeneratedStats] = useState<BaseStatMap>({
    strength: 0,
    constitution: 0,
    dexterity: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  });
  const [name, setName] = useState('');
  const [hpProgression, setHPProgression] = useState<HPProgressionMap>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0
  });
  const [chosenClassSkills, setChosenClassSkills] = useState<string[]>([]);

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

  const handleSetGeneratedStats = (updatedStats: BaseStatMap, classes: Class[]) => {
    setSelectedClass('')
    console.log("generated stats", updatedStats)
    // Filter eligible classes
    const filteredClasses = classes.filter(cls => {
      return cls.prerequisites.every(req => updatedStats[req.stat as AllowedStats] >= req.min);
    });

    setEligibleClasses(filteredClasses);
  }

  const handleFinalizeCharacter = async (houseId: string) => {
    setIsLoading(true);
    const newCharacter: Character = {
      id: "", // Firestore will auto-generate this
      name: name ? name : 'New Mouse',
      trait: "",
      bio: "",
      xp: 0, // Defaults to 0
      level: level,
      classId: selectedClass,
      houseId: houseId,
      countyId: selectedCounty,
      original_base_stats: level == 1 ? generatedStats : {
        strength: 0,
        constitution: 0,
        dexterity: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
      },
      current_base_stats: { ...generatedStats },
      hp_progression: hpProgression,
      skills: selectedSkills,
      chosenClassSkills: chosenClassSkills
    };
    console.log("create character", newCharacter)

    try {
      const docRef = await addDoc(collection(db, "characters"), newCharacter);
      console.log("Character created with ID: ", docRef.id);
      alert("Character successfully created!");
      console.log("new character", newCharacter)
    } catch (error) {
      console.error("Error creating character: ", error);
      alert("Failed to create character.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CharacterCreateContext.Provider value={{
      isLoading, setIsLoading,
      selectedClass, setSelectedClass,
      selectedCounty, setSelectedCounty,
      level, setLevel,
      eligibleClasses, setEligibleClasses,
      generatedStats, setGeneratedStats,
      name, setName,
      hpProgression, setHPProgression,
      skillLevels, setSkillLevels,
      selectedSkills, setSelectedSkills,
      associatedStat, setAssociatedStat,
      derivedStats, setDerivedStats,
      chosenClassSkills, setChosenClassSkills,
      initiativeChart, setInitiativeChart,
      fetchData,
      handleSetGeneratedStats,
      handleFinalizeCharacter
    }}>
      {children}
    </CharacterCreateContext.Provider>
  );
};

export const useCharacterCreateContext = () => {
  const context = useContext(CharacterCreateContext);
  if (!context) throw new Error("useCharacterCreateContext must be used within CharacterCreateProvider");
  return context;
};
