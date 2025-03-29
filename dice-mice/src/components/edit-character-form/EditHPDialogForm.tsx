import { ChangeEvent, useState } from 'react';
import { Box, Button, DialogActions, FormControl, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2';
import { Character, HPProgressionMap } from '@/models/character.model';
import { Class } from '@/models/class.model';
import { calculateModifier } from '@/utils/stat-calculations';
import { rollDie } from '@/utils/dice-rolls';
import { updateCharacterField } from '@/services/firestore-service';

interface EditHPDialogFormProps {
  character: Character
  classes: Class[]
  handleClose: () => void
}

const EditHPDialogForm = ({ character, classes, handleClose }: EditHPDialogFormProps) => {
  const [hpProgression, setHPProgression] = useState<HPProgressionMap>({
    ...character.hp_progression
  });

  const getHitDie = () => {
    const classData = classes.find((c) => c.id == character.classId)
    return classData?.hit_die || "__"; // Default to blank if class is not selected
  };

  const handleRollHP = () => {
    const hitDie = getHitDie();
    const conMod = calculateModifier(character.current_base_stats["constitution"]);
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

  const handleSubmit = async () => {
    console.log("submit hp progression", hpProgression)
    console.log("defaultValue", character.hp_progression)
    await updateCharacterField(character.id, 'hp_progression', hpProgression)
    handleClose()
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>Hit Die: <b>{character.classId == 'retainer' ? 'N/A' : getHitDie()}</b></Typography>
      <Box sx={{ width: '13rem', maxHeight: '400px', display: 'inline-flex', flexDirection: 'column', flexWrap: 'wrap' }}>
        {Object.entries(hpProgression).map(([key, value]) => {

          return (
            <Grid key={key} container spacing={2} columns={14} sx={{ display: 'inline-flex', width: '100%' }}>
              <Grid size={2} sx={{ alignSelf: 'center' }}>
                <Typography variant="h6">
                  {key}
                </Typography>
              </Grid>
              <Grid size={6}>
                <FormControl size="small" sx={{ width: '70px' }} disabled={character.classId == 'retainer' || character.level < Number(key)}>
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
                    disabled={character.classId == 'retainer' || character.level < Number(key)}
                    value={value}
                    onChange={(e) => handleInputStats(e, key)}
                  />
                </FormControl>
              </Grid>
              <Grid size={6} sx={{ alignSelf: 'center' }}>
                <Button variant="contained" disabled={character.classId == 'retainer' || character.level < Number(key)} onClick={() => handleRollStat(key)}>Roll</Button>
              </Grid>
            </Grid>
          )
        })}
      </Box>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Box>
  )
}

export default EditHPDialogForm