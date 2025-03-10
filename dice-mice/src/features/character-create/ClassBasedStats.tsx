import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Box, Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { evaluate } from "mathjs";
import { useGameData } from "@/context/GameDataContext";
import { Class } from "@/models/class.model";
import { DerivedStat } from "@/models/derived-stat.model";
import { db } from "@/utils/firebase";
import { calculateBaseWillpower, calculateModifier, calculateWillpower } from "@/utils/stat-calculations";
import { fetchInitiativeChart } from "@/services/firestore-service";
import { InitiativeEntry } from "@/models/initiative-entry.model";
import { rollDie } from "@/utils/dice-rolls";


interface ClassBasedStatsProps {
  generatedStats: Record<string, number>;
  currentClass?: string;
  charLevel?: number;
  onClassSelect: (classId: string) => void;
  onHitPointsUpdate: (hp: number) => void;
  onNameUpdate: (name: string) => void;
}

const ClassBasedStats = ({ generatedStats, charLevel, currentClass, onClassSelect, onHitPointsUpdate, onNameUpdate }: ClassBasedStatsProps) => {
  const { classes, stats } = useGameData();
  const [loading, setLoading] = useState(false);
  const [eligibleClasses, setEligibleClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(currentClass ?? '');
  const [derivedStats, setDerivedStats] = useState<DerivedStat[]>([]);
  const [defensiveStats, setDefensiveStats] = useState<DerivedStat[]>([]);
  const [offensiveStats, setOffensiveStats] = useState<DerivedStat[]>([]);
  const [initiativeChart, setInitiativeChart] = useState<InitiativeEntry[]>([]);
  const [rolledHP, setRolledHP] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [name, setName] = useState('')

  useEffect(() => {
    setLoading(true)
    if (charLevel) {
      setSelectedLevel(charLevel)
    }
    const fetchData = async () => {
      // Fetch Derived Stats
      const derivedStatsSnapshot = await getDocs(collection(db, "derived_stats"));
      const fetchedDerivedStats = derivedStatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DerivedStat));
      setDerivedStats(fetchedDerivedStats);

      setDefensiveStats(fetchedDerivedStats.filter(stat => stat.type === "DEFENSE"));
      setOffensiveStats(fetchedDerivedStats.filter((stat) => stat.type === "NON-CALCULATED"))

      // Fetch initiative chart
      const chart = await fetchInitiativeChart();
      // console.log("chart", chart)
      setInitiativeChart(chart);

      setLoading(false)
    }

    fetchData()


  }, [])

  useEffect(() => {
    if (Object.keys(generatedStats).length === 0 || !classes.length) return;

    // Filter eligible classes
    const filteredClasses = classes.filter(cls => {
      return cls.prerequisites.every(req => generatedStats[req.stat] >= req.min);
    });

    setEligibleClasses(filteredClasses);

  }, [generatedStats, classes]);


  const getNonCalculatedStatValue = (derivedStat: DerivedStat) => {
    if (!selectedClass) return 0;
    const level = selectedLevel

    const currentClass = classes.find((c) => c.id == selectedClass)
    if (currentClass) {
      const levelOneClassStatValues = currentClass.baseValues[level]
      return levelOneClassStatValues[derivedStat.id] || 0
    } else {
      return 0;
    }

  }

  const getDerivedStatValue = (derivedStat: DerivedStat) => {
    if (!selectedClass) return 0;
    const level = selectedLevel

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

      console.log("statFormula", statFormula)
      console.log("stat variables", statVariables)
      statVariables.forEach((variable) => {
        const levelOneClassStatValues = currentClass.baseValues[level]
        if (variable == 'base') {
          variables["base"] = Number(levelOneClassStatValues[derivedStat.id]) || 0
        } else {
          // console.log("does this match abbrieviation", variable.replace("_mod", "").toUpperCase())
          const matchingStat = stats.find((stat) => {
            return variable.replace("_mod", "").toUpperCase() == stat.abbreviation
          })
          // console.log("generated stats", generatedStats)
          variables[variable] = matchingStat ? calculateModifier(generatedStats[matchingStat.id]) : 0
        }
      })

      return evaluateFormula(statFormula, variables)
    } else {
      return 0
    }

  }

  const getHitDie = () => {
    const classData = classes.find((c) => c.id == selectedClass)
    return classData?.hit_die || "__"; // Default to blank if class is not selected
  };

  const handleRollHP = () => {
    if (!selectedClass) return;

    const hitDie = getHitDie();
    const conMod = Math.max(0, calculateModifier(generatedStats["constitution"]));

    let rolledValue;

    do {
      rolledValue = rollDie(hitDie);
    } while (rolledValue <= conMod); // Reroll if ≤ CON mod


    setRolledHP(rolledValue);
    onHitPointsUpdate(rolledValue);
  };

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

  const evaluateFormula = (formula: string, values: Record<string, number>) => {
    return evaluate(formula, values);
  };

  return (
    <Container sx={{ mt: 2 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ pt: 1 }}>

          <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: "column", md: "row" }, gap: 1, mb: 1 }}>
            {classes.length > 0 && <FormControl fullWidth sx={{ maxWidth: { xs: '100%', md: '200px' } }} >
              <InputLabel>Class</InputLabel>
              <Select
                label="Class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  onClassSelect(e.target.value);
                }}
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
            <FormControl sx={{ maxWidth: { xs: '100%', md: '100px' } }} >
              <InputLabel>Level</InputLabel>
              <Select
                label="Level"
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value as number);
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((level, i) => (
                  <MenuItem key={`${level}_${i}`} value={level}>
                    {level}
                  </MenuItem>
                ))
                }
              </Select>
            </FormControl>
            <FormControl >
              <TextField
                id="name"
                name="name"
                label="Mouse Name"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(event) => {
                  console.log("name value on change event", event)
                  setName(event.target.value);
                  onNameUpdate(event.target.value)
                }}
              />
            </FormControl>
            <Box sx={{ display: "inline-flex", alignItems: 'center', gap: '1rem' }}>
              <Typography variant="h6">
                Hit Die: {getHitDie()}
              </Typography>
              <Button variant="contained" onClick={handleRollHP} disabled={!selectedClass}>
                Roll HP
              </Button>
            </Box>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: "column", md: "row" }, gap: 1 }}>
            <TableContainer component={Paper} sx={{ maxWidth: 150 }}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Stat</TableCell>
                    <TableCell align="right">Mod</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.sort((a, b) => a.order - b.order).map((stat) => (
                    <TableRow
                      key={stat.id}
                    >
                      <TableCell component="th" scope="row">
                        {stat.abbreviation}
                      </TableCell>
                      <TableCell align="right">{calculateModifier(generatedStats[stat.id])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedClass && defensiveStats.length > 0 &&
              <TableContainer component={Paper} sx={{ maxWidth: 200, height: 'fit-content' }}>
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
                          <TableCell align="right">{getDerivedStatValue(stat)}</TableCell>
                        </TableRow>
                      )
                    }
                    )}
                    <TableRow>
                      <TableCell>Willpower</TableCell>
                      <TableCell align="right">{
                        calculateWillpower(
                          calculateBaseWillpower(generatedStats),
                          selectedClass,
                          1,
                          classes
                        )
                      }</TableCell>
                    </TableRow>
                    {rolledHP !== null && (<TableRow>
                      <TableCell>HP</TableCell>
                      <TableCell align="right">{rolledHP}</TableCell>
                    </TableRow>)}
                  </TableBody>
                </Table>
              </TableContainer>
            }
            {selectedClass && offensiveStats.length > 0 &&
              <TableContainer component={Paper} sx={{ maxWidth: 250, height: 'fit-content' }}>
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
                          <TableCell align="right">{getNonCalculatedStatValue(stat)}</TableCell>
                        </TableRow>
                      )
                    }
                    )}
                    <TableRow>
                      <TableCell>Initiative</TableCell>
                      <TableCell align="right">{getInitiative()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            }
          </Box>
        </Box>
      )}
    </Container>
  )
}

export default ClassBasedStats