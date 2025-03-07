import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Container, FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import StatGeneration from "@/features/character-create/StatGeneration";
import { useGameData } from "@/context/GameDataContext";
import ClassBasedStats from "@/features/character-create/ClassBasedStats";
import AddBoxIcon from '@mui/icons-material/AddBox';
import SkillsDialog from "@/features/skills/SkillsDialog";
import { Character, CharacterSkills } from "@/models/character.model";
import { useUser } from "@/context/UserDataProvider";
import { PlayerHouse } from "@/models/player-house.model";
import { getHouseByPlayerId } from "@/services/firestore-service";
import { Link } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/utils/firebase";

const CharacterCreate = () => {
  const { counties } = useGameData();
  const { user, loading } = useUser();
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [currentHouse, setCurrentHouse] = useState<PlayerHouse | null>(null)
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkills[]>([]);
  const [generatedStats, setGeneratedStats] = useState<Record<string, number>>({});
  const [hitPoints, setHitPoints] = useState(0);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openSkillsDialog, setOpenSkillsDialog] = useState(false);

  useEffect(() => {
    setIsDataLoading(true)
    const fetchHouse = async () => {
      if (user) {
        const house = await getHouseByPlayerId(user.id);
        console.log("house", house)
        setCurrentHouse(house); // `house` will be null if not found
      }
      setIsDataLoading(false)
    };

    fetchHouse();
  }, [user]);

  const handleSubmit = (stats: Record<string, number>) => {
    setGeneratedStats(stats)

    if (isAllStatsFilled) {
      setSubmitted(true)
    } else {
      setSubmitted(false)
    }
  }

  const isAllStatsFilled = Object.keys(generatedStats).every(stat => generatedStats[stat] > 0)

  const handleFinalizeCharacter = async () => {
    if (!currentHouse || !selectedCounty || !selectedClass || Object.keys(generatedStats).length === 0) {
      alert("Please complete all required fields before finalizing your character.");
      return;
    }

    setIsDataLoading(true);

    const newCharacter: Character = {
      id: "", // Firestore will auto-generate this
      name: name,
      trait: "",
      bio: "",
      xp: 0, // Defaults to 0
      level: 1, // Defaults to 1
      classId: selectedClass,
      houseId: currentHouse.id, // You might need to add this selection
      countyId: selectedCounty,
      original_base_stats: generatedStats,
      current_base_stats: { ...generatedStats }, // Initially same as original
      hp_progression: { 1: hitPoints }, // Default to Level 1 and set to hitPoint result
      skills: selectedSkills // ✅ Include skills
    };

    try {
      const docRef = await addDoc(collection(db, "characters"), newCharacter);
      console.log("Character created with ID: ", docRef.id);
      alert("Character successfully created!");
      console.log("new character", newCharacter)
    } catch (error) {
      console.error("Error creating character: ", error);
      alert("Failed to create character.");
    } finally {
      setIsDataLoading(false);
    }
  };

  return (
    <Container sx={{ pt: 2 }}>
      {!currentHouse && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>No House Found. Please Create a House First</Typography>
          <Link to="/house">
            <Button variant="contained">Create House</Button>
          </Link>
        </Box>
      )}
      {currentHouse && !loading && !isDataLoading && <Box>
        <Typography variant="h4" gutterBottom>Create Your Mouse</Typography>

        {/* Select Player */}
        {/* <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Select Player</InputLabel>
          <Select onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer} label="Select Player" name="playerId" required>
            {players.map(player => (
              <MenuItem key={player.id} value={player.id}>{player.username}</MenuItem>
            ))}
          </Select>
          {!selectedPlayer && <FormHelperText>Please select player before entering stats.</FormHelperText>}
        </FormControl> */}

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
        <Alert severity="warning">Changing County will reset all stats.</Alert>
      </Box>

      }


      {loading && <CircularProgress />}

      {currentHouse && !loading && !isDataLoading && <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: "column", md: "row" } }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <StatGeneration countyId={selectedCounty} onStatsGenerated={handleSubmit} />
          </Grid>
          <Grid size={{ xs: 12, md: 'grow' }}>
            {submitted && <ClassBasedStats generatedStats={generatedStats} onClassSelect={setSelectedClass} onHitPointsUpdate={setHitPoints} onNameUpdate={setName} />}
          </Grid>
        </Grid>
      </Box>}

      {currentHouse && !loading && !isDataLoading && selectedClass && <Box sx={{ width: '100%', display: 'inline-flex', justifyContent: 'center' }}>
        <Button variant="outlined" startIcon={<AddBoxIcon />} onClick={() => setOpenSkillsDialog(true)}>
          Add Skills
        </Button>
        <SkillsDialog
          open={openSkillsDialog}
          onClose={() => setOpenSkillsDialog(false)}
          classId={selectedClass}
          characterLevel={1}
          characterStats={generatedStats}
          selectedSkills={selectedSkills} // Placeholder, should come from character state
          setSelectedSkills={setSelectedSkills}
        />
      </Box>}
      {/* Finalize Button */}
      {currentHouse && !loading && (
        <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={Object.keys(generatedStats).length == 0 || !name || !hitPoints || !selectedClass} onClick={handleFinalizeCharacter}>
          Finalize Character
        </Button>
      )}
    </Container>
  )
}

export default CharacterCreate