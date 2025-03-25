import { useCharacterCreateContext } from '@/context/CharacterSheetContext';
import { useGameData } from '@/context/GameDataContext';
import { rollDie } from '@/utils/dice-rolls';
import { calculateModifier } from '@/utils/stat-calculations';
import { Box, Button, FormControl, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2';
import { ChangeEvent } from 'react';

const HitPointProgression = () => {
  const { classes, loading } = useGameData();
  const {
    generatedStats,
    selectedClass,
    selectedCounty,
    hpProgression,
    setHPProgression,
  } = useCharacterCreateContext();

  const getHitDie = () => {
    const classData = classes.find((c) => c.id == selectedClass)
    return classData?.hit_die || "__"; // Default to blank if class is not selected
  };

  const handleRollHP = () => {
    if (!selectedClass) return;

    const hitDie = getHitDie();
    const conMod = calculateModifier(generatedStats["constitution"]);
    const isConModGreaterThanHitDieMax = conMod >= Number(hitDie.replace('1d', '')) // i.e. conMod = 5 and hitDie = 1d4

    let rolledValue;

    if (isConModGreaterThanHitDieMax) {
      // Just return max result of die
      rolledValue = Number(hitDie.replace('1d', ''))
    } else {
      do {
        rolledValue = rollDie(hitDie);
      } while (rolledValue <= conMod); // Reroll if ≤ CON mod
    }

    return rolledValue
  };

  const handleRollStat = (hpLevel: string) => {
    const newValue = handleRollHP()
    const updatedHP = { ...hpProgression, [hpLevel]: newValue };

    setHPProgression(updatedHP);
  };

  const handleInputStats = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, hpLevel: string) => {
    const updatedHP = { ...hpProgression, [hpLevel]: Number(e.target.value) || 0 };
    setHPProgression(updatedHP);
  }

  return (
    <Box>
      <Typography variant='h5'>Set Hit Points by Level</Typography>
      <Typography variant='subtitle1'>Hit Die: {getHitDie()}</Typography>
      {selectedClass && <Box sx={{ width: '13rem' }}>
        {Object.entries(hpProgression).map(([key, value]) => {

          return (
            <Grid key={key} container spacing={2} columns={14} sx={{ display: 'inline-flex', width: '100%' }}>
              <Grid size={2} sx={{ alignSelf: 'center' }}>
                <Typography variant="h6">
                  {key}
                </Typography>
              </Grid>
              <Grid size={6}>
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
              <Grid size={6} sx={{ alignSelf: 'center' }}>
                <Button variant="contained" disabled={!selectedClass || loading} onClick={() => handleRollStat(key)}>Roll</Button>
              </Grid>
            </Grid>
          )
        })}
      </Box>}
    </Box>
  )
}

export default HitPointProgression