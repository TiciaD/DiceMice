import { useCharacterCreateContext } from '@/context/CharacterSheetContext';
import { useGameData } from '@/context/GameDataContext';
import { useUser } from '@/context/UserDataProvider';
import { AllowedLevels } from '@/models/character.model';
import { Box, Button, FormControl, TextField, Typography } from '@mui/material'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FinalizeCharacter = () => {
  const navigate = useNavigate();
  const { counties, classes, stats, skills } = useGameData();
  const { house, loading } = useUser();
  const {
    generatedStats,
    selectedClass,
    selectedCounty,
    hpProgression,
    name,
    setName,
    level,
    selectedSkills,
    skillLevels,
    handleFinalizeCharacter
  } = useCharacterCreateContext();
  const [errors, setErrors] = useState<string[]>([])

  const isErrors = () => {
    const isClassSelected = selectedClass;
    const isHPSet = selectedClass == 'retainer' || hpProgression[level.toString() as AllowedLevels] > 0
    const isCountySelected = selectedCounty
    const isStatsSet = Object.entries(generatedStats).every(([_stat, value]) => value >= 3) // No stat can be lower than 3

    let errorsArr = []
    if (!isClassSelected) {
      errorsArr.push('Please Select A Class')
    }

    if (!isHPSet) {
      errorsArr.push(`Please Set HP for Level ${level}`)
    }

    if (!isCountySelected) {
      errorsArr.push('Please Select A County')
    }

    if (!isStatsSet) {
      errorsArr.push('All Base Stats must have a value >= 3')
    }

    setErrors([...errorsArr])
    console.log("error check", selectedClass, selectedCounty, isHPSet, isStatsSet)
    return !isClassSelected || !isHPSet || !isCountySelected || !isStatsSet
  }

  const getCountyName = (countyId: string) => {
    const county = counties.find(c => c.id === countyId);
    return county?.name ?? "No County Found."
  }

  const getClassName = (classId: string) => {
    const foundClass = classes.find(c => c.id === classId);
    return foundClass?.name ?? "No Class Found."
  }

  const getStatName = (statId: string) => {
    const foundStat = stats.find(s => s.id === statId);
    return foundStat?.name ?? "No Stat Found."
  }

  const getSkillName = (skillId: string) => {
    const foundSkill = skills.find(s => s.id === skillId);
    return foundSkill?.name ?? "No Skill Found."
  }

  const getSkillLevelName = (skillLevelId: string) => {
    const foundSkillLevel = skillLevels.find(s => s.id === skillLevelId);
    return foundSkillLevel?.name ?? "No Skill Level Found."
  }


  const getHP = () => {
    let totalHP = 0;
    Object.values(hpProgression).forEach((hitPoints) => {
      totalHP += hitPoints
    })
    return totalHP
  }

  const handleSubmit = async () => {
    console.log("errors", errors)

    if (isErrors()) {
      alert("Please complete all required fields before finalizing your character.");
      return;
    }

    await handleFinalizeCharacter(house?.id ?? '')

    navigate(`/characters`);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <FormControl sx={{ maxWidth: '20rem', pb: 3 }}>
        <TextField
          id="name"
          name="name"
          label="Mouse Name"
          fullWidth
          variant="outlined"
          helperText="A filler name will be set if no name is entered."
          value={name}
          onChange={(event) => { setName(event.target.value) }}
        />
      </FormControl>

      <Typography variant='h5'>Does this information look correct?</Typography>
      <Typography variant='body1'>Origin County: {getCountyName(selectedCounty)}</Typography>
      <Typography variant='body1'>Class: {getClassName(selectedClass)}</Typography>
      <Typography variant='body1'>Level: {level}</Typography>
      <Typography variant='body1'>Current HP: {getHP()}</Typography>
      <Typography variant='body1'>Current Stats:</Typography>
      <Box sx={{ pl: 2, pb: 2 }}>
        {Object.entries(generatedStats).map(([key, value]) => {

          return (
            <Typography key={key} variant='body1'>{getStatName(key)}: {value}</Typography>
          )
        })}
      </Box>
      <Typography variant='body1'>Current Skills:</Typography>
      {selectedSkills.length > 0 ? <Box sx={{ pl: 2, pb: 2 }}>
        {Object.values(selectedSkills).map((value) => {

          return (
            <Typography key={value.skillId} variant='body1'>{getSkillName(value.skillId)}: {getSkillLevelName(value.skillLevelId)}</Typography>
          )
        })}
      </Box>
        :
        <Typography variant='body1'>No Skills Selected</Typography>}

      <Button sx={{ maxWidth: '20rem', mt: 2 }} variant="contained" disabled={loading} onClick={handleSubmit}>
        Submit Character
      </Button>
      {errors.length > 0 && <Typography variant='subtitle1' color='red'>{errors.join(', ')}</Typography>}
    </Box>
  )
}

export default FinalizeCharacter