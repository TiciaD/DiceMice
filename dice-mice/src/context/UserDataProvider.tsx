import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "@/models/user.model";
import { onAuthStateChanged, User as FirebaseUser, signInWithCustomToken, signOut } from "firebase/auth";
import { auth, db } from "@/utils/firebase";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { PlayerHouse } from "@/models/player-house.model";

interface UserContextType {
  user: User | null;
  house: PlayerHouse | null;
  setHouse: (house: PlayerHouse) => void
  loading: boolean;
  loadingLoggedInUser: boolean;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
const UserDataContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [house, setHouse] = useState<PlayerHouse | null>(null)
  const [loadingLoggedInUser, setLoadingLoggedInUser] = useState(true);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        console.log("current firebase user", firebaseUser)
        try {
          const userDoc = await getDoc(doc(db, "players", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          }
        } catch (error) {
          console.error("Could not fetch existing user", error)
        }
      }
      setLoadingLoggedInUser(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (code: string) => {
    console.log("login called!")
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_DICE_MICE_API_URL}api/auth?code=${code}`);
      const data = await response.json();

      if (!data.firebaseToken) throw new Error("Failed to authenticate with Firebase.");

      // Sign in with Firebase
      await signInWithCustomToken(auth, data.firebaseToken);

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "players", auth.currentUser?.uid!));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
    setLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <UserDataContext.Provider value={{ user, loading, loadingLoggedInUser, login, logout, house, setHouse }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Hook to use the context
export const useUser = () => {
  const context = useContext(UserDataContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};