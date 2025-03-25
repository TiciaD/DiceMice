import { ChangeEvent, useEffect } from "react";
import { useCharacterCreateContext } from "@/context/CharacterSheetContext";
import { useGameData } from "@/context/GameDataContext";
import { Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { roll3d6, roll4d6DropLowest } from "@/utils/dice-rolls";

const BaseStats = () => {
  const { setSelectedCounty } = useCharacterCreateContext()
  const { classes, counties, stats, loading } = useGameData();
  const {
    selectedCounty,
    generatedStats,
    setGeneratedStats,
    associatedStat,
    setAssociatedStat,
    handleSetGeneratedStats
  } = useCharacterCreateContext();

  const getStatAbbrieviation = (statId: string) => {
    const stat = stats.find(s => s.id === statId);
    return stat?.abbreviation ?? '__'
  }

  const handleInputStats = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, statId: string) => {
    const updatedStats = { ...generatedStats, [statId]: Number(e.target.value) || 0 };
    setGeneratedStats(updatedStats);

    handleSetGeneratedStats(updatedStats, classes);
  }

  const handleRollStat = (statId: string) => {
    const newValue = statId === associatedStat ? roll4d6DropLowest() : roll3d6();
    const updatedStats = { ...generatedStats, [statId]: newValue };

    setGeneratedStats(updatedStats);
    handleSetGeneratedStats(updatedStats, classes);
  };

  const handleCountyUpdate = (e: SelectChangeEvent<string>) => {
    const county = counties.find(c => c.id === e.target.value);
    setAssociatedStat(county ? county.associatedStatId : '');
    setSelectedCounty(e.target.value)

    // Reset all base stats when county changes
    setGeneratedStats({
      strength: 0,
      constitution: 0,
      dexterity: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    })
  }

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', width: { xs: '100%', md: '13rem' }, gap: '0.25rem' }}>
      <Box>
        <FormControl fullWidth margin="normal" size="small" disabled={loading}>
          <InputLabel>County</InputLabel>
          <Select
            required
            labelId="county-select-label"
            id="countyId"
            name="countyId"
            label="County"
            value={selectedCounty}
            onChange={handleCountyUpdate}
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
      </Box>
      {Object.entries(generatedStats).map(([key, value]) => {
        const isAssociatedStat = key === associatedStat;

        return (
          <Grid key={key} container spacing={2} columns={24} sx={{ display: 'inline-flex', width: '100%' }}>
            <Grid size={5} sx={{ alignSelf: 'center' }}>
              <Typography variant="h6" sx={isAssociatedStat ? { color: 'blue', textDecoration: 'underline' } : null}>
                {getStatAbbrieviation(key)}
              </Typography>
            </Grid>
            <Grid size={9}>
              <FormControl size="small" sx={{ width: '70px' }} disabled={loading}>
                <TextField
                  id="outlined-number"
                  type="number"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    htmlInput: {
                      min: 0,
                    }
                  }}
                  disabled={!selectedCounty || loading}
                  value={value}
                  onChange={(e) => handleInputStats(e, key)}
                />
              </FormControl>
            </Grid>
            <Grid size={10} sx={{ alignSelf: 'center' }}>
              <Button variant="contained" disabled={!selectedCounty || loading} onClick={() => handleRollStat(key)}>Roll</Button>
            </Grid>
          </Grid>
        )
      })}
    </Box>
  )
}

export default BaseStats