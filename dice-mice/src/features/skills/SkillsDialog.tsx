import { useEffect, useState } from "react";
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

interface SkillsDialogProps {
  open: boolean;
  onClose: () => void;
  characterLevel: number;
  classId: string;
  assignedSkillPoints: CharacterSkills[]; // Skill points already spent per skill
}

const SkillsDialog = ({ open, onClose, characterLevel, classId, assignedSkillPoints }: SkillsDialogProps) => {
  const { classes, skills } = useGameData();
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([]);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkills[]>(assignedSkillPoints);
  const [availableSkillPoints, setAvailableSkillPoints] = useState(0);

  useEffect(() => {
    const foundClass = classes.find((cls) => cls.id == classId) ?? null
    setSelectedClass(foundClass)

    const skillRanks = foundClass?.baseValues[characterLevel]['skill_ranks'] ?? 0
    console.log("skill ranks for class", skillRanks)
    const usedSkillPoints = calculateUsedSkillPoints();
    setAvailableSkillPoints(Number(skillRanks) - usedSkillPoints)
  }, [classes, classId, assignedSkillPoints, selectedSkills])


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
    return assignedSkillPoints.reduce((total, skill) => {
      const skillLevel = skillLevels.find(level => level.id === skill.skillLevelId);
      return total + (skillLevel ? skillLevel.cost : 0);
    }, 0);
  };

  const handleSkillSelection = (skillId: string, selectedLevel: SkillLevel) => {
    const existingSkill = selectedSkills.find(skill => skill.skillId === skillId);
    const newCost = selectedLevel.cost;

    if (!existingSkill) {
      // First time selecting the skill
      if (availableSkillPoints < newCost) return;
      setSelectedSkills([...selectedSkills, { skillId, skillLevelId: selectedLevel.id }]);
      setAvailableSkillPoints(prev => prev - newCost);
    } else {
      const previousLevel = skillLevels.find(level => level.id === existingSkill.skillLevelId);
      const previousCost = previousLevel ? previousLevel.cost : 0;
      const costDifference = newCost - previousCost;

      if (existingSkill.skillLevelId === selectedLevel.id) {
        // ✅ Unchecking the skill: refund skill points and remove from state
        setSelectedSkills(prev => prev.filter(skill => skill.skillId !== skillId));
        setAvailableSkillPoints(prev => prev + previousCost);
      } else if (newCost > previousCost) {
        // ✅ Upgrading: charge only the difference
        if (availableSkillPoints < costDifference) return;
        setSelectedSkills(prev =>
          prev.map(skill => (skill.skillId === skillId ? { ...skill, skillLevelId: selectedLevel.id } : skill))
        );
        setAvailableSkillPoints(prev => prev - costDifference);
      }
    }
  };

  const handleToggleSkill = (skillId: string) => {
    setExpandedSkill(expandedSkill === skillId ? null : skillId);
  };

  const Row = (props: { skill: Skill }) => {
    const { skill } = props;
    const isClassSkill = selectedClass?.skillIds.includes(skill.id) ?? false;
    console.log("is class skill", isClassSkill)
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
          <TableCell align="right">{0}</TableCell>
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
                    const isChecked = selectedSkills.some(selectedSkill => selectedSkill.skillId === skill.id && ((skillLevels.find(l => l.id === selectedSkill.skillLevelId)?.order ?? 0) >= level.order))

                    return (
                      <Box key={level.id} sx={{ display: "flex", flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox name={level.id} checked={isChecked}
                              disabled={isDisabled}
                              onChange={() => handleSkillSelection(skill.id, level)} />
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