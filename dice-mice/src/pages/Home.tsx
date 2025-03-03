import Characters from "@/features/character/Characters";
import CreatePlayerDialog from "@/features/create-player/CreatePlayerDialog";
import House from "@/features/house/House";
import { PlayerHouse } from "@/models/player-house.model";
import { SelectOption } from "@/models/select.model";
import { getAllPlayers, getHouseByPlayerId } from "@/services/firestore-service";
import { Box, Button, CircularProgress, Container, Divider, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";


const Home = () => {
  const [currentPlayer, setCurrentPlayer] = useState<string>('')
  const [currentHouse, setCurrentHouse] = useState<PlayerHouse | null>(null)
  const [players, setPlayers] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
    <Container>
      <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Dice Mice!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Select a Player to view House Details and Character Info
        </Typography>
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
        <Typography variant="subtitle2" gutterBottom>Don't see your name? Click below to create a new player.</Typography>
        <Button sx={{ mb: 3 }} variant="contained" onClick={() => setOpenDialog(true)}>Create Player</Button>
      </Box>

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
        loading && (<Container>
          <CircularProgress />
        </Container>)
      }
      {currentPlayer.length > 0 && !loading &&
        (
          <>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
              <Tab label="House" />
              <Tab label="Characters" />
            </Tabs>

            {activeTab === 0 && <House house={currentHouse} playerId={currentPlayer} />}
            {activeTab === 1 && <Characters house={currentHouse} />}
          </>
        )
      }
    </Container>
  )
}

export default Home