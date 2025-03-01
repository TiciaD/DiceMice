import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Container, FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import StatGeneration from "@/features/character-create/StatGeneration";
import { useGameData } from "@/context/GameDataContext";
import { collection, getDocs } from "firebase/firestore";
import { User } from "@/models/user.model";
import { db } from "@/utils/firebase";
import ClassBasedStats from "@/features/character-create/ClassBasedStats";
import AddBoxIcon from '@mui/icons-material/AddBox';
import SkillsDialog from "@/features/skills/SkillsDialog";

const CharacterCreate = () => {
  const { counties } = useGameData();
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<User[]>([]);


  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [generatedStats, setGeneratedStats] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false)
  const [openSkillsDialog, setOpenSkillsDialog] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch Players
    const playerSnapshot = await getDocs(collection(db, "players"));
    const fetchedPlayers = playerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

    setPlayers(fetchedPlayers);
    setLoading(false);
  }

  const handleSubmit = (stats: Record<string, number>) => {
    console.log("submitted")
    console.log('selected class', selectedClass)
    setGeneratedStats(stats)
    console.log("is all stats filled", isAllStatsFilled)
    if (isAllStatsFilled) {
      setSubmitted(true)
    } else {
      setSubmitted(false)
    }
  }

  const isAllStatsFilled = Object.keys(generatedStats).every(stat => generatedStats[stat] > 0)

  return (
    <Container sx={{ pt: 2 }}>
      <Typography variant="h4" gutterBottom>Create Your Mouse</Typography>
      {!loading && <Box>

        {/* Select Player */}
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Select Player</InputLabel>
          <Select onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer} label="Select Player" name="playerId" required>
            {players.map(player => (
              <MenuItem key={player.id} value={player.id}>{player.username}</MenuItem>
            ))}
          </Select>
          {!selectedPlayer && <FormHelperText>Please select player before entering stats.</FormHelperText>}
        </FormControl>

        {/* Select County */}
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>County</InputLabel>
          <Select
            required
            labelId="county-select-label"
            id="countyId"
            name="countyId"
            label="County"
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
          >
            {loading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : (
              counties.map(county => (
                <MenuItem key={county.id} value={county.id}>
                  {county.name}
                </MenuItem>
              ))
            )}
          </Select>
          {!selectedCounty && <FormHelperText>Please select county before entering stats.</FormHelperText>}
        </FormControl>
        <Alert severity="warning" >Changing County will reset all stats.</Alert>
      </Box>

      }


      {loading && <CircularProgress />}

      {/* Flex Row when above md breakpoint, flex column when below md breakpoint */}
      <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: "column", md: "row" } }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <StatGeneration countyId={selectedCounty} onStatsGenerated={handleSubmit} />
          </Grid>
          <Grid size={{ xs: 12, md: 'grow' }}>
            {submitted && <ClassBasedStats generatedStats={generatedStats} onClassSelect={setSelectedClass} />}
          </Grid>
        </Grid>
      </Box>

      {selectedClass && <Box sx={{ width: '100%', display: 'inline-flex', justifyContent: 'center' }}>
        <Button variant="outlined" startIcon={<AddBoxIcon />} onClick={() => setOpenSkillsDialog(true)}>
          Add Skills
        </Button>
        <SkillsDialog
          open={openSkillsDialog}
          onClose={() => setOpenSkillsDialog(false)}
          classId={selectedClass}
          characterLevel={1}
          assignedSkillPoints={[]} // Placeholder, should come from character state
        // onSkillChange={onSkillChange}
        />
      </Box>}
      {/* Finalize Button */}
      {/* {generatedStats && (
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Finalize Character
      </Button>
    )} */}
    </Container>
  )
}

export default CharacterCreate