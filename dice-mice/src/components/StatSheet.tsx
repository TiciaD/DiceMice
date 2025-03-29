import { useGameData } from "@/context/GameDataContext";
import { AllowedStats, Character } from "@/models/character.model"
import { DerivedStat } from "@/models/derived-stat.model";
import { InitiativeEntry } from "@/models/initiative-entry.model";
import { SkillLevel } from "@/models/skill-level.model";
import { calculateBaseWillpower, calculateModifier, calculateRetainerModifier, calculateWillpower, getDerivedStatValue, getInitiative, getNonCalculatedStatValue } from "@/utils/stat-calculations";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"

interface StatSheetProps {
  character: Character
  initiativeChart: InitiativeEntry[]
  offensiveStats: DerivedStat[]
  defensiveStats: DerivedStat[]
  skillLevels: SkillLevel[]
}

const StatSheet = ({ character, initiativeChart, offensiveStats, defensiveStats, skillLevels }: StatSheetProps) => {
  const { stats, classes, skills } = useGameData();
  const currentClass = classes.find((c) => c.id == character.classId)

  const getStatAbbrieviation = (statId: string) => {
    const stat = stats.find(s => s.id === statId);
    return stat?.abbreviation ?? '__'
  }

  const getStatAbbrieviationBySkill = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      const matchingStat = stats.find(s => s.id === skill.associatedStatId);
      return matchingStat?.abbreviation ?? '__'
    }

    return '__'
  }

  const getSkillName = (skillId: string) => {
    const foundSkill = skills.find((skill) => skill.id == skillId)
    return foundSkill?.name ?? 'Unknown Skill'
  }

  const getSkillLevelName = (skillLevelId: string) => {
    const foundSkillLevel = skillLevels.find((skillLvl) => skillLvl.id == skillLevelId)
    return foundSkillLevel?.name ?? 'Unknown Skill Level'
  }

  const getHP = () => {
    let totalHP = 0;
    Object.values(character.hp_progression).forEach((hitPoints) => {
      totalHP += hitPoints
    })
    return totalHP
  }

  const getTotalPoints = (skillId: string) => {
    const foundSkill = skills.find((skill) => skill.id == skillId)
    // See if this skill is in selectedSkills
    const foundSelectedSkill = character.skills.find((selectedSkill) => selectedSkill.skillId == skillId)
    if (foundSelectedSkill) {
      // If it is, then let's find the matching level
      const matchingSkillLevel = skillLevels.find((skillLevel) => skillLevel.id == foundSelectedSkill.skillLevelId)

      if (matchingSkillLevel && foundSkill) {
        // And calculate the cost by adding the associatedStat modifier to the skill bonus
        const cost = matchingSkillLevel.bonus + calculateModifier(character.current_base_stats[foundSkill.associatedStatId as AllowedStats])
        return cost
      }
    }

    return 0;
  }


  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' }, width: '100%', gap: 1 }}>
      <Box sx={{ display: 'inline-flex', gap: '0.5rem' }}>

        <TableContainer component={Paper} sx={{ maxWidth: 125 }}>
          <Table aria-label="stat mod table">
            <TableHead>
              <TableRow>
                <TableCell>Stat</TableCell>
                <TableCell align="right">Mod</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(character.current_base_stats).map(([key, value]) => (
                <TableRow
                  key={key}
                >
                  <TableCell component="th" scope="row">
                    <b>{getStatAbbrieviation(key)}</b>
                  </TableCell>
                  <TableCell align="right">
                    {character.classId == 'retainer' ? calculateRetainerModifier(value) : calculateModifier(value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>


        <TableContainer component={Paper} sx={{ width: 200, height: 'fit-content' }}>
          <Table aria-label="defensive stat table">
            <TableHead>
              <TableRow>
                <TableCell>Defensive Stat</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Hit Points</TableCell>
                <TableCell align="right">{getHP()}</TableCell>
              </TableRow>
              {defensiveStats.map((stat) => {
                return (
                  <TableRow
                    key={stat.id}
                  >
                    <TableCell component="th" scope="row">
                      {stat.name}
                    </TableCell>
                    {currentClass && <TableCell align="right">{character.classId == 'retainer' ? 0 : getDerivedStatValue(stats, stat, currentClass, character)}</TableCell>}
                  </TableRow>
                )
              }
              )}
              <TableRow>
                <TableCell>Willpower</TableCell>
                <TableCell align="right">{
                  character.classId == 'retainer'
                    ? 0
                    : calculateWillpower(
                      calculateBaseWillpower(character.current_base_stats),
                      character.classId,
                      character.level,
                      classes
                    )
                }</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <TableContainer component={Paper} sx={{ width: 225, height: 'fit-content' }}>
        <Table aria-label="offensive stat table">
          <TableHead>
            <TableRow>
              <TableCell>Offensive Stat</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offensiveStats.map((stat) => {
              if (stat.applicableClassIds) {
                if (!stat.applicableClassIds.includes(character.classId)) {
                  return
                }
              }
              return (
                <TableRow
                  key={stat.id}
                >
                  <TableCell component="th" scope="row">
                    {stat.name}
                  </TableCell>
                  {currentClass && <TableCell align="right">{character.classId == 'retainer' ? 0 : getNonCalculatedStatValue(stat, currentClass, character.level)}</TableCell>}
                </TableRow>
              )
            }
            )}
            <TableRow>
              <TableCell>Initiative</TableCell>
              <TableCell align="right">{character.classId == 'retainer' ? 0 : getInitiative(initiativeChart, character.current_base_stats)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <TableContainer component={Paper} sx={{ maxWidth: '400px', height: 'fit-content' }}>
        <Table aria-label="skills table">
          <TableHead>
            <TableRow>
              <TableCell>Skill</TableCell>
              <TableCell align="center">Stat</TableCell>
              <TableCell align="center">Rank</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {character.skills.map((skill, i) => {
              return (
                <TableRow key={`${skill.skillId}_${i}`}>
                  <TableCell component="th" scope="row">
                    {getSkillName(skill.skillId)}
                  </TableCell>

                  <TableCell align="center">{getStatAbbrieviationBySkill(skill.skillId)}</TableCell>
                  <TableCell align="center">
                    {getSkillLevelName(skill.skillLevelId)}
                  </TableCell>
                  <TableCell align="right">{getTotalPoints(skill.skillId)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'inline-flex', flexDirection: 'column' }}>
        <Typography variant="h5"><b>Class Abilities</b></Typography>
        {currentClass?.abilities.map((ability) => {
          if (ability.level > character.level) return
          return (
            <Box key={ability.name} sx={{ mb: 1 }}>
              <Typography variant="subtitle1"><b>Level {ability.level}: </b> <i>{ability.name}</i></Typography>
              <Typography variant="body1">{ability.description}</Typography>
            </Box>
          )
        })}
      </Box>
      <Box sx={{ display: 'inline-flex', flexDirection: 'column' }}>
        <Typography variant="h5"><b>Skill Abilities</b></Typography>
        {character?.skills.map((skl) => {
          if (skl.skillLevelId == 'skilled') return

          const foundSkill = skills.find((skill) => skl.skillId == skill.id)
          console.log("found skill", foundSkill)
          return (
            <>
              {foundSkill ?
                <Box>
                  <Typography variant="h6">{foundSkill.name}</Typography>
                  {Object.entries(foundSkill.benefits)
                    .sort(([a], [b]) => {
                      const order = ['trained', 'expert', 'master', 'legendary'];
                      return order.indexOf(a) - order.indexOf(b);
                    })
                    .map(([key, value], i) => {
                      console.log("key", key)
                      return (
                        <Box key={`${skl.skillId}_${i}`} sx={{ mb: 1 }}>

                          <Typography variant="body1"><b>{key}:</b> {value}</Typography>
                        </Box>
                      )
                    })}
                </Box>
                :
                null
              }
            </>
          )
        })}
        {character.skills.length === 0 && <Typography variant="subtitle1">No Skill Abilities Found.</Typography>}
      </Box>
    </Box>
  )
}

export default StatSheet