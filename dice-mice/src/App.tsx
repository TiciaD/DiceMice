import './App.css'
import { useEffect, useState } from 'react';
import { SelectOption } from './models/select.model';
import { getAllPlayers, getHouseByPlayerId } from './services/firestore-service';
import House from './features/house/House';
import { PlayerHouse } from './models/player-house.model';
import { Box, Button, CircularProgress, Divider, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import CreatePlayerDialog from './features/create-player/CreatePlayerDialog';

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<string>('')
  const [currentHouse, setCurrentHouse] = useState<PlayerHouse | null>(null)
  const [players, setPlayers] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch players from Firestore on component mount
  useEffect(() => {
    setLoading(true)
    const fetchPlayers = async () => {
      const playerData = await getAllPlayers();
      setPlayers(playerData);
      setLoading(false);
    };

    fetchPlayers();
  }, []);

  async function setPlayerAndFetchHouse(selectedPlayerId: string) {
    setLoading(true)
    setCurrentPlayer(selectedPlayerId);

    // Fetch House based on selected player ID
    const house = await getHouseByPlayerId(selectedPlayerId);
    console.log("house", house)
    setCurrentHouse(house); // `house` will be null if not found
    setLoading(false)
  }

  return (
    <div>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="player-select-label">Player</InputLabel>
          <Select
            labelId="player-select-label"
            id="player-select"
            value={currentPlayer}
            label="Player"
            onChange={(e) => setPlayerAndFetchHouse(e.target.value)}
          >
            {
              players.map((player) => {
                return (
                  <MenuItem key={player.value} value={player.value}>{player.label}</MenuItem>
                )
              })
            }
          </Select>
        </FormControl>
      </Box>

      <p id="hint">Don't see your name? Click below to create a new player.</p>
      <Button variant="contained" onClick={() => setOpenDialog(true)}>Create Player</Button>
      <CreatePlayerDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onPlayerCreated={() => {
          // Refresh the player list after new player is created
          setLoading(true);
          getAllPlayers().then(setPlayers).finally(() => setLoading(false));
        }}
      />
      <Divider />

      {
        loading && <div>
          <CircularProgress />
        </div>
      }
      {currentPlayer.length > 0 && !loading &&
        <House house={currentHouse} playerId={currentPlayer} />
      }
    </div>
  )
}

export default App
