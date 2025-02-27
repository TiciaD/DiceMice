import { useEffect, useState } from "react";
import { User } from "@/models/user.model";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { CircularProgress, Container, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface PlayerSelectionProps {
  selectedPlayerId: string;
  onSelect: (playerId: string) => void
}

const PlayerSelection = ({ selectedPlayerId, onSelect }: PlayerSelectionProps) => {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchPlayers = async () => {
      const querySnapshot = await getDocs(collection(db, "players"));
      const fetchedPlayers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

      setPlayers(fetchedPlayers);
      setLoading(false);

      // Ensure selected player exists in the fetched list
      if (!fetchedPlayers.some(player => player.id === selectedPlayerId)) {
        onSelect('');
      }
    };

    fetchPlayers();
  }, [selectedPlayerId, onSelect]);

  const handleSelectPlayer = (e: any) => {
    const { value } = e.target;
    console.log("e", e)
    onSelect(value);
  };

  return (
    <Container>
      {loading ?
        <CircularProgress />
        :
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Player</InputLabel>
          {loading ? <CircularProgress /> : (
            <Select onChange={handleSelectPlayer} value={selectedPlayerId} label="Select Player" name="playerId" required>
              {players.map(player => (
                <MenuItem key={player.id} value={player.id}>{player.username}</MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      }
    </Container>
  )
}

export default PlayerSelection