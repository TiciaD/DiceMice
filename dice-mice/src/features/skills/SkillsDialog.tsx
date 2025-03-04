import { ChangeEvent, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Box, Checkbox, CircularProgress, Collapse, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { db } from "@/utils/firebase";
import { useGameData } from "@/context/GameDataContext";
import { SkillLevel } from "@/models/skill-level.model";
import { Class } from "@/models/class.model";
import { Skill } from "@/models/skill.model";
import { CharacterSkills } from "@/models/character.model";
import { calculateModifier } from "@/utils/stat-calculations";

interface SkillsDialogProps {
  open: boolean;
  onClose: () => void;
  characterLevel: number;
  classId: string;
  characterStats: Record<string, number>;
  selectedSkills: CharacterSkills[]; // Skill points already spent per skill
  setSelectedSkills: (skills: CharacterSkills[]) => void
}

const SkillsDialog = ({ open, onClose, characterLevel, characterStats, classId, selectedSkills, setSelectedSkills }: SkillsDialogProps) => {
  const { classes, skills } = useGameData();
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([]);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [availableSkillPoints, setAvailableSkillPoints] = useState(0);

  useEffect(() => {
    const foundClass = classes.find((cls) => cls.id == classId) ?? null
    setSelectedClass(foundClass)

    const skillRanks = foundClass?.baseValues[characterLevel]['skill_ranks'] ?? 0
    console.log("skill ranks for class", skillRanks)
    const usedSkillPoints = calculateUsedSkillPoints();
    setAvailableSkillPoints(Number(skillRanks) - usedSkillPoints)
  }, [classes, classId, selectedSkills])


  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {

      // Fetch Skill Levels
      const skillLevelsSnapshot = await getDocs(collection(db, "skill_levels"));
      const fetchedSkillLevels = skillLevelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillLevel));
      setSkillLevels(fetchedSkillLevels.sort((a, b) => a.order - b.order));
      console.log("skill levels", skillLevels)
      setLoading(false)
    }

    fetchData()
  }, [])

  const calculateUsedSkillPoints = () => {
    let usedPointTotal = 0;
    selectedSkills.forEach((selectedSkill) => {
      const matchingSkillLevel = skillLevels.find((skillLevel) => skillLevel.id == selectedSkill.skillLevelId)
      if (matchingSkillLevel) {
        // Tally up the selectedSkill's level cost
        const cost = matchingSkillLevel.cost
        usedPointTotal += cost;
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
        const cost = matchingSkillLevel.bonus + calculateModifier(characterStats[skill.associatedStatId])
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

  const handleToggleSkill = (skillId: string) => {
    setExpandedSkill(expandedSkill === skillId ? null : skillId);
  };

  const Row = (props: { skill: Skill }) => {
    const { skill } = props;
    const isClassSkill = selectedClass?.skillIds.includes(skill.id) ?? false;

    return (
      <>
        <TableRow>
          <TableCell sx={{ padding: '6px' }}>
            <IconButton onClick={() => handleToggleSkill(skill.id)}>
              {expandedSkill === skill.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row" sx={isClassSkill ? { color: 'blue', textDecoration: 'underline' } : null}>
            {skill.name}
          </TableCell>
          <TableCell align="right">{getTotalPoints(skill)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} style={{ padding: 0 }}>
            <Collapse in={expandedSkill === skill.id} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="subtitle1">Skill Progression</Typography>
                <Box sx={{ display: "flex", flexDirection: 'column' }}>
                  {skillLevels.map((level) => {
                    if (level.id == 'untrained') return;
                    const requiredLevel = isClassSkill ? level.class_skill_min_level : level.non_class_skill_min_level;
                    const existingSkillId = selectedSkills.find(selectedSkill => selectedSkill.skillId === skill.id)?.skillLevelId;
                    const existingSkillCost = skillLevels.find((sl) => sl.id == existingSkillId)?.cost || 0
                    const isDisabled = characterLevel < requiredLevel || availableSkillPoints < (level.cost - existingSkillCost)
                    const isChecked = !!selectedSkills.find(selectedSkill => selectedSkill.skillId === skill.id && selectedSkill.skillLevelId == level.id)

                    return (
                      <Box key={level.id} sx={{ display: "flex", flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox name={level.id} checked={isChecked}
                              disabled={isDisabled}
                              onChange={(e) => handleSkillSelection(e, skill.id, level)} />
                          }
                          label={level.name}
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Skills</DialogTitle>
      <DialogContent>
        {!loading && <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ padding: '6px' }} />
                <TableCell>Skill</TableCell>
                <TableCell align="center">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {skills.map((skill) => {
                return (
                  <Row key={skill.id} skill={skill} />
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>}
        {loading && <CircularProgress />}
      </DialogContent>
    </Dialog>
  )
}

export default SkillsDialog