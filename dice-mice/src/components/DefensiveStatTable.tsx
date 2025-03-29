import { useCharacterCreateContext } from '@/context/CharacterSheetContext';
import { useGameData } from '@/context/GameDataContext';
import { AllowedStats } from '@/models/character.model';
import { DerivedStat } from '@/models/derived-stat.model';
import { calculateBaseWillpower, calculateModifier, calculateWillpower } from '@/utils/stat-calculations'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { evaluate } from 'mathjs';
import { useEffect, useState } from 'react';

const DefensiveStatTable = () => {
  const { classes, stats } = useGameData();
  const {
    derivedStats,
    selectedClass,
    generatedStats,
    level,
  } = useCharacterCreateContext()

  const [defensiveStats, setDefensiveStats] = useState<DerivedStat[]>([]);

  useEffect(() => {
    console.log("derived stats updated", derivedStats);
    console.log("selected class", selectedClass)
    setDefensiveStats(derivedStats.filter(stat => stat.type === "DEFENSE"));
  }, [derivedStats, selectedClass])

  const getDerivedStatValue = (derivedStat: DerivedStat) => {
    if (!selectedClass) return 0;

    const currentClass = classes.find((c) => c.id == selectedClass)

    // Prepare variable values
    let statFormula = derivedStat.formula; // Default formula
    let statVariables = [...derivedStat.variables]; // Default variables
    const variables: Record<string, number> = {};


    console.log("derived stats", derivedStats)
    if (currentClass?.baseValues) {
      // Check if this class has an overriding ability for this stat
      const applicableOverride = derivedStat.overrides?.find(override =>
        override.classId === selectedClass &&
        level >= override.minLevel && // Ensure character is at or above required level
        currentClass.abilities.some(ability => ability.name === override.abilityName)
      );

      if (applicableOverride) {
        // Override formula and variables if present
        if (applicableOverride.newFormula) statFormula = applicableOverride.newFormula;
        if (applicableOverride.newVariables) statVariables = applicableOverride.newVariables;
      }

      statVariables.forEach((variable) => {
        const levelOneClassStatValues = currentClass.baseValues[level]
        if (variable == 'base') {
          variables["base"] = Number(levelOneClassStatValues[derivedStat.id]) || 0
        } else {
          const matchingStat = stats.find((stat) => {
            return variable.replace("_mod", "").toUpperCase() == stat.abbreviation
          })

          variables[variable] = matchingStat ? calculateModifier(generatedStats[matchingStat.id as AllowedStats]) : 0
        }
      })

      return evaluateFormula(statFormula, variables)
    } else {
      return 0
    }

  }

  const evaluateFormula = (formula: string, values: Record<string, number>) => {
    return evaluate(formula, values);
  };


  return (
    <Box>
      {selectedClass && defensiveStats.length > 0 &&
        <TableContainer component={Paper} sx={{ width: 200, height: 'fit-content' }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Defensive Stat</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {defensiveStats.map((stat) => {
                return (
                  <TableRow
                    key={stat.id}
                  >
                    <TableCell component="th" scope="row">
                      {stat.name}
                    </TableCell>
                    <TableCell align="right">{selectedClass == 'retainer' ? 0 : getDerivedStatValue(stat)}</TableCell>
                  </TableRow>
                )
              }
              )}
              <TableRow>
                <TableCell>Willpower</TableCell>
                <TableCell align="right">{
                  selectedClass == 'retainer'
                    ? 0
                    : calculateWillpower(
                      calculateBaseWillpower(generatedStats),
                      selectedClass,
                      level,
                      classes
                    )
                }</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      }
      {!selectedClass && <Typography variant="subtitle1">No Class Found. Please Select A Class.</Typography>}
    </Box>
  )
}

export default DefensiveStatTable