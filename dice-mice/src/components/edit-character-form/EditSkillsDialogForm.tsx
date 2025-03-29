import { AllowedStats, Character, CharacterSkills } from "@/models/character.model"
import { Class } from "@/models/class.model"
import { SkillLevel } from "@/models/skill-level.model"
import { Skill } from "@/models/skill.model"
import { Stat } from "@/models/stat.model"
import { calculateModifier } from "@/utils/stat-calculations"
import { Box, Button, Checkbox, Collapse, DialogActions, FormControlLabel, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ChangeEvent, useEffect, useState } from "react"
import { updateCharacterField } from "@/services/firestore-service"

interface EditSkillsDialogFormProps {
  character: Character
  stats: Stat[]
  skills: Skill[],
  skillLevels: SkillLevel[]
  currentClass: Class
  isMobile: boolean
  handleClose: () => void
}

const EditSkillsDialogForm = ({ character, stats, skills, skillLevels, currentClass, isMobile, handleClose }: EditSkillsDialogFormProps) => {
  const [selectedSkills, setSelectedSkills] = useState([...character.skills]);
  const [chosenClassSkills, setChosenClassSkills] = useState(character?.chosenClassSkills ? [...character.chosenClassSkills] : []);
  const [availableSkillPoints, setAvailableSkillPoints] = useState(0);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  useEffect(() => {
    if (character.level >= 7 && currentClass.id != 'bard') {
      addClassCompetency()
    }


  }, [])

  useEffect(() => {
    const skillRanks = currentClass.baseValues[character.level]['skill_ranks'] ?? 0
    const usedSkillPoints = calculateUsedSkillPoints();

    setAvailableSkillPoints(Number(skillRanks) - usedSkillPoints)
  }, [currentClass, selectedSkills])

  const getStatAbbrieviation = (skill: Skill) => {
    const foundStat = stats.find((stat) => skill.associatedStatId == stat.id)
    return foundStat?.abbreviation ?? 'Unknown'
  }

  const calculateUsedSkillPoints = () => {
    let usedPointTotal = 0;
    selectedSkills.forEach((selectedSkill) => {
      // Skip free skilled point for Bard’s chosen skills or level 7
      const hasFreeSkillPoint = (
        currentClass.id === 'bard' &&
        chosenClassSkills &&
        chosenClassSkills.includes(selectedSkill.skillId))
        ||
        character.level >= 7 &&
        character.classId != 'bard' &&
        currentClass.skillIds.includes(selectedSkill.skillId)

      if (!hasFreeSkillPoint) {
        const matchingSkillLevel = skillLevels.find((skillLevel) => skillLevel.id == selectedSkill.skillLevelId)
        if (matchingSkillLevel) {
          // Tally up the selectedSkill's level cost
          const cost = matchingSkillLevel.cost
          usedPointTotal += cost;
        }
      } else {
        // If the character gets a free skill point let's check if they got a rank higher than 'Skilled'
        const matchingSkillLevel = skillLevels.find((skillLevel) => skillLevel.id == selectedSkill.skillLevelId)
        if (matchingSkillLevel && matchingSkillLevel.cost > 1) {
          // Tally up the selectedSkill's level cost but first rank 'Skilled' is free so don't count it
          const cost = matchingSkillLevel.cost - 1
          usedPointTotal += cost;
        }
        // If it's only 'Skilled' then we don't count it towards their running total
      }
    });

    console.log("used skill points", usedPointTotal)
    return usedPointTotal
  };

  const getTotalPoints = (skill: Skill) => {
    // See if this skill is in selectedSkills
    const foundSelectedSkill = selectedSkills.find((selectedSkill) => selectedSkill.skillId == skill.id)
    if (foundSelectedSkill) {
      // If it is, then let's find the matching level
      const matchingSkillLevel = skillLevels.find((skillLevel) => skillLevel.id == foundSelectedSkill.skillLevelId)

      if (matchingSkillLevel) {
        // And calculate the cost by adding the associatedStat modifier to the skill bonus
        const cost = matchingSkillLevel.bonus + calculateModifier(character.current_base_stats[skill.associatedStatId as AllowedStats])
        return cost
      }
    }

    return 0;
  }

  const handleSkillSelection = (e: ChangeEvent<HTMLInputElement>, skillId: string, selectedLevel: SkillLevel) => {
    console.log("current selected skills", selectedSkills)
    console.log("current available points", availableSkillPoints)
    // Check if this skill is already in selectedSkills
    const existingSelectedSkill = selectedSkills.find((selectedSkill) => selectedSkill.skillId == skillId)
    if (existingSelectedSkill) {
      // if so, update the skill level
      // if checked then set skill level to given skill level
      if (e.target.checked) {
        existingSelectedSkill.skillLevelId = selectedLevel.id;
        setSelectedSkills([...selectedSkills])
      } else {
        // if unchecked remove skill from selectedSkills
        const filteredSkills = selectedSkills.filter((selectedSkill) => selectedSkill.skillId != skillId)
        setSelectedSkills(filteredSkills)
      }
    } else {
      // Must be a new skill let's add it to selectedSkills
      const newSkill: CharacterSkills = { skillId: skillId, skillLevelId: selectedLevel.id }
      if (e.target.checked) {
        setSelectedSkills([...selectedSkills, newSkill])
      } else {
        console.log("how do you uncheck something that wasn't there?")
      }
    }
  };

  const handleToggleChosenClassSkill = (skillId: string) => {
    const skillRanks = Number(currentClass?.baseValues[character.level]['skill_ranks']) ?? 0

    if (chosenClassSkills.includes(skillId)) {
      setChosenClassSkills(chosenClassSkills.filter(id => id !== skillId));
      // Remove free skill point if exists
      const tempArr = selectedSkills.filter(skill => skill.skillId !== skillId)
      setSelectedSkills(tempArr);
    } else if (chosenClassSkills.length < skillRanks) {
      setChosenClassSkills([...chosenClassSkills, skillId]);

      // Add free 'Skilled' rank
      const skilledLevel = skillLevels.find(level => level.id === 'skilled');
      if (skilledLevel) {
        const freeSkill: CharacterSkills = {
          skillId: skillId,
          skillLevelId: skilledLevel.id,
        };
        setSelectedSkills([...selectedSkills, freeSkill]);
      }
    }
  };

  const addClassCompetency = () => {
    // Add free 'Skilled' rank
    const skilledLevel = skillLevels.find(level => level.id === 'skilled');
    if (skilledLevel) {
      const newSelectedSkills = currentClass?.skillIds.map((classSkill) => {
        const freeSkill: CharacterSkills = {
          skillId: classSkill,
          skillLevelId: skilledLevel.id,
        };

        return freeSkill
      }) ?? []
      setSelectedSkills([...newSelectedSkills]);
    }
  }

  const handleToggleSkill = (skillId: string) => {
    setExpandedSkill(expandedSkill === skillId ? null : skillId);
  };

  const handleSubmit = async () => {
    console.log("submit selectedSkills", selectedSkills)
    console.log("defaultValue", character.skills)
    await updateCharacterField(character.id, 'skills', selectedSkills)
    handleClose()
  }

  const Row = (props: { skill: Skill }) => {
    const { skill } = props;
    const isClassSkill = currentClass?.skillIds.includes(skill.id) && currentClass.id != 'bard' || (currentClass.id === 'bard' && chosenClassSkills.includes(skill.id))

    return (
      <>
        <TableRow>
          <TableCell sx={{ padding: '6px' }}>
            <IconButton onClick={() => handleToggleSkill(skill.id)}>
              {expandedSkill === skill.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          {currentClass.id === 'bard' && (<TableCell align="center">
            <Checkbox
              checked={chosenClassSkills.includes(skill.id)}
              disabled={
                !chosenClassSkills.includes(skill.id) && chosenClassSkills.length >= Number(currentClass?.baseValues[character.level]['skill_ranks'])
              }
              onChange={() => handleToggleChosenClassSkill(skill.id)}
            />
          </TableCell>)}

          <TableCell sx={isClassSkill ? { color: 'blue', textDecoration: 'underline' } : null}>
            {skill.name}
          </TableCell>

          <TableCell align="right">{getTotalPoints(skill)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} style={{ padding: 0 }}>
            <Collapse in={expandedSkill === skill.id} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="subtitle1">Skill Ranks</Typography>
                <Box sx={{ display: "flex", flexDirection: 'column' }}>
                  {skillLevels.map((skillLevel) => {
                    if (skillLevel.id == 'untrained') return;
                    const requiredLevel = isClassSkill ? skillLevel.class_skill_min_level : skillLevel.non_class_skill_min_level;
                    const existingSkillId = selectedSkills.find(selectedSkill => selectedSkill.skillId === skill.id)?.skillLevelId;
                    const existingSkillCost = skillLevels.find((sl) => sl.id == existingSkillId)?.cost || 0
                    const isDisabled = character.level < requiredLevel || availableSkillPoints < (skillLevel.cost - existingSkillCost)
                    const isChecked = !!selectedSkills.find(selectedSkill => selectedSkill.skillId === skill.id && selectedSkill.skillLevelId == skillLevel.id)

                    return (
                      <Box key={skillLevel.id} sx={{ display: "flex", flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox name={skillLevel.id} checked={isChecked}
                              disabled={isDisabled}
                              onChange={(e) => handleSkillSelection(e, skill.id, skillLevel)} />
                          }
                          label={skillLevel.name}
                        />

                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    )
  }

  return (
    <>
      {!isMobile ?
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant='subtitle2'>Available Skill Points: {availableSkillPoints}</Typography>
          <TableContainer sx={{ width: '38rem' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {currentClass.id === 'bard' && <TableCell align="center">Class Skill?</TableCell>}
                  <TableCell>Skill</TableCell>
                  <TableCell align="center">Stat</TableCell>
                  <TableCell align="center">Ranks</TableCell>
                  <TableCell align="center">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {skills.map((skill, i) => {
                  const isClassSkill = currentClass?.skillIds.includes(skill.id) && currentClass.id != 'bard' || (currentClass.id === 'bard' && chosenClassSkills.includes(skill.id))
                  return (
                    <TableRow key={`${skill.id}_${i}`}>
                      {currentClass.id === 'bard' && (<TableCell align="center">
                        <Checkbox
                          checked={chosenClassSkills.includes(skill.id)}
                          disabled={
                            !chosenClassSkills.includes(skill.id) && chosenClassSkills.length >= Number(currentClass?.baseValues[character.level]['skill_ranks'])
                          }
                          onChange={() => handleToggleChosenClassSkill(skill.id)}
                        />
                      </TableCell>)}

                      <TableCell component="th" scope="row" sx={isClassSkill ? { color: 'blue', textDecoration: 'underline' } : null}>
                        {skill.name}
                      </TableCell>

                      <TableCell align="center">{getStatAbbrieviation(skill)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex" }}>
                          {skillLevels.map((skillLevel) => {
                            if (skillLevel.id == 'untrained') return;
                            const requiredLevel = isClassSkill ? skillLevel.class_skill_min_level : skillLevel.non_class_skill_min_level;
                            const existingSkillId = selectedSkills.find(selectedSkill => selectedSkill.skillId === skill.id)?.skillLevelId;
                            const existingSkillCost = skillLevels.find((sl) => sl.id == existingSkillId)?.cost || 0
                            const isDisabled = character.level < requiredLevel || availableSkillPoints < (skillLevel.cost - existingSkillCost)
                            const isChecked = !!selectedSkills.find(selectedSkill => selectedSkill.skillId === skill.id && selectedSkill.skillLevelId == skillLevel.id)

                            return (
                              <Box key={skillLevel.id} sx={{ display: "flex", flexDirection: 'column', gap: 1 }}>
                                <FormControlLabel
                                  labelPlacement="bottom"
                                  sx={{ mx: '0.25rem' }}
                                  control={
                                    <Checkbox
                                      name={skillLevel.id}
                                      checked={isChecked}
                                      disabled={isDisabled}
                                      onChange={(e) => handleSkillSelection(e, skill.id, skillLevel)} />
                                  }
                                  label={skillLevel.name}
                                />

                              </Box>
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{getTotalPoints(skill)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        :
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant='subtitle2'>Available Skill Points: {availableSkillPoints}</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ padding: '6px' }} />
                  {currentClass.id === 'bard' && <TableCell align="center">Class Skill?</TableCell>}
                  <TableCell>Skill</TableCell>
                  <TableCell align="center">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {skills.map((skill, i) => {
                  return (
                    <Row key={`${skill.id}_${i}`} skill={skill} />
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>}
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </>
  )
}

export default EditSkillsDialogForm