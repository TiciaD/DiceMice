import { useCharacterCreateContext } from '@/context/CharacterSheetContext';
import { useGameData } from '@/context/GameDataContext';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import StatModTable from './StatModTable';

const ClassAndLevelSelect = () => {
  const {
    selectedClass,
    setSelectedClass,
    setSelectedSkills,
    setHPProgression,
    level,
    setLevel,
    eligibleClasses,
  } = useCharacterCreateContext()
  const { classes } = useGameData();

  const handleClassSelect = (e: SelectChangeEvent<string>) => {
    setSelectedClass(e.target.value);
    setSelectedSkills([])
  }

  const handleLevelSelect = (e: SelectChangeEvent<string>) => {
    setLevel(Number(e.target.value));
    setHPProgression({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
      13: 0,
      14: 0
    })
    setSelectedSkills([])
  }

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'inline-flex', gap: 1 }}>
        {classes.length > 0 && <FormControl fullWidth size="small" sx={{ minWidth: '200px' }} >
          <InputLabel>Class</InputLabel>
          <Select
            label="Class"
            value={selectedClass}
            onChange={handleClassSelect}
            disabled={!eligibleClasses.length}
          >
            {eligibleClasses.length > 0 ? (
              eligibleClasses.map(cls => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No eligible classes</MenuItem>
            )}
          </Select>
        </FormControl>}
        <FormControl size="small" sx={{ width: '100px' }} >
          <InputLabel>Level</InputLabel>
          <Select
            label="Level"
            value={level.toString()}
            onChange={handleLevelSelect}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((level, i) => (
              <MenuItem key={`${level}_${i}`} value={level}>
                {level}
              </MenuItem>
            ))
            }
          </Select>
        </FormControl>
      </Box>
      <StatModTable />
    </Box>
  )
}

export default ClassAndLevelSelect