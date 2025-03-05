import { Class } from "@/models/class.model";
import { County } from "@/models/county.model";
import { Skill } from "@/models/skill.model";
import { Stat } from "@/models/stat.model";
import { db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useUser } from "./UserDataProvider";

// Define context state
interface GameDataContextType {
  counties: County[];
  stats: Stat[];
  skills: Skill[];
  classes: Class[]
  loading: boolean;
}

// Create context
const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

// Provider component
export const GameDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: userLoading } = useUser();
  const [counties, setCounties] = useState<County[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userLoading) return;

    const fetchGameData = async () => {
      try {
        setLoading(true);

        // Fetch counties
        const countiesSnapshot = await getDocs(collection(db, 'counties'));
        const fetchedCounties = countiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as County[];

        // Fetch classes
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        const fetchedClasses = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[];

        // Fetch stats
        const statsSnapshot = await getDocs(collection(db, 'stats'));
        const fetchedStats = statsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Stat[];

        // Fetch skills
        const skillsSnapshot = await getDocs(collection(db, 'skills'));
        const fetchedSkills = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Skill[];
        console.log("fetched stats", fetchedStats)
        setCounties(fetchedCounties);
        setClasses(fetchedClasses)
        setStats(fetchedStats);
        setSkills(fetchedSkills);
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [user, userLoading]);

  return (
    <GameDataContext.Provider value={{ classes, counties, stats, skills, loading }}>
      {children}
    </GameDataContext.Provider>
  );
};

// Hook to use the context
export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
};