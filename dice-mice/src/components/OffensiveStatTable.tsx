import { useEffect, useState } from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useCharacterCreateContext } from '@/context/CharacterSheetContext';
import { useGameData } from '@/context/GameDataContext';
import { DerivedStat } from '@/models/derived-stat.model';
import { calculateModifier } from '@/utils/stat-calculations';

const OffensiveStatTable = () => {
  const { classes } = useGameData();
  const {
    derivedStats,
    selectedClass,
    generatedStats,
    level,
    initiativeChart
  } = useCharacterCreateContext()

  const [offensiveStats, setOffensiveStats] = useState<DerivedStat[]>([]);

  useEffect(() => {
    setOffensiveStats(derivedStats.filter((stat) => stat.type === "NON-CALCULATED"));
  }, [derivedStats, selectedClass])

  const getNonCalculatedStatValue = (derivedStat: DerivedStat) => {
    if (!selectedClass) return 0;

    const currentClass = classes.find((c) => c.id == selectedClass)
    if (currentClass) {
      const levelOneClassStatValues = currentClass.baseValues[level]
      return levelOneClassStatValues[derivedStat.id] || 0
    } else {
      return 0;
    }

  }

  const getInitiative = () => {
    if (initiativeChart.length > 0) {
      const dexModifier = calculateModifier(generatedStats["dexterity"])
      const entry = initiativeChart.find(e => e.modifier === dexModifier);
      if (entry) {
        return `${entry.diceRolled} ${dexModifier > 0 ? '+' : ''}${dexModifier ? dexModifier : ''}`;
      } else {
        return "Unknown"
      }
    }
  }

  return (
    <Box>
      {selectedClass && offensiveStats.length > 0 &&
        <TableContainer component={Paper} sx={{ width: 225, height: 'fit-content' }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Offensive Stat</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offensiveStats.map((stat) => {
                if (stat.applicableClassIds) {
                  if (!stat.applicableClassIds.includes(selectedClass)) {
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
                    <TableCell align="right">{selectedClass == 'retainer' ? 0 : getNonCalculatedStatValue(stat)}</TableCell>
                  </TableRow>
                )
              }
              )}
              <TableRow>
                <TableCell>Initiative</TableCell>
                <TableCell align="right">{selectedClass == 'retainer' ? 0 : getInitiative()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      }
    </Box>
  )
}

export default OffensiveStatTable