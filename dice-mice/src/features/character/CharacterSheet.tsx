import { useGameData } from "@/context/GameDataContext";
import { Character, CharacterSkills } from "@/models/character.model";
import { Alert, Box, CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from "react";
import StatGeneration from "../character-create/StatGeneration";
import ClassBasedStats from "../character-create/ClassBasedStats";


interface CharacterSheetProps {
  character: Character | null;
}

const CharacterSheet = ({ character }: CharacterSheetProps) => {
  const { counties } = useGameData();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkills[]>([]);
  const [generatedStats, setGeneratedStats] = useState<Record<string, number>>({});
  const [hitPoints, setHitPoints] = useState(0);
  const [name, setName] = useState('');
  // const [openSkillsDialog, setOpenSkillsDialog] = useState(false);

  useEffect(() => {
    if (character && counties) {
      setIsLoading(true)
      setSelectedCounty(character.countyId)
      setSelectedClass(character.classId)
      setSelectedSkills(character.skills)
      setGeneratedStats(character.current_base_stats)
      setName(character.name)
      setHitPoints(getCurrentHitPoints(character))
      setIsLoading(false)
    }

    console.log("name", name)
    console.log("hitpoints", hitPoints)
    console.log(selectedSkills)
  }, [character, counties])

  const getCurrentHitPoints = (char: Character) => {
    return char.hp_progression[char.level]
  }

  const isAllStatsFilled = Object.keys(generatedStats).every(stat => generatedStats[stat] > 0)

  const handleCountyChange = (e: SelectChangeEvent<string>) => {
    setSelectedCounty(e.target.value)
    // Reset stats when county changes
    setGeneratedStats({})
  }



  return (
    <Box>
      {counties.length > 0 && <FormControl fullWidth margin="normal" size="small">
        <InputLabel>County</InputLabel>
        <Select
          required
          labelId="county-select-label"
          id="countyId"
          name="countyId"
          label="County"
          value={selectedCounty}
          onChange={handleCountyChange}
        >
          {isLoading ? (
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
      </FormControl>}
      <Alert severity="warning">Changing County will reset all stats.</Alert>
      {isLoading && <CircularProgress />}
      {selectedCounty && !isLoading && <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: "column", md: "row" } }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <StatGeneration countyId={selectedCounty} generatedStats={generatedStats} onStatsGenerated={setGeneratedStats} />
          </Grid>
          <Grid size={{ xs: 12, md: 'grow' }}>
            {isAllStatsFilled && <ClassBasedStats generatedStats={generatedStats} charLevel={character ? character.level : 1} currentClass={selectedClass} onClassSelect={setSelectedClass} onHitPointsUpdate={setHitPoints} onNameUpdate={setName} />}
          </Grid>
        </Grid>
      </Box>}
    </Box>
  )
}

export default CharacterSheet