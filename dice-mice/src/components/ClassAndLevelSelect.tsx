import { useCharacterCreateContext } from '@/context/CharacterSheetContext';
import { useGameData } from '@/context/GameDataContext';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'

const ClassAndLevelSelect = () => {
  const {
    selectedClass,
    setSelectedClass,
    setSelectedSkills,
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
    setSelectedSkills([])
  }

  return (
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
  )
}

export default ClassAndLevelSelect