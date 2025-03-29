import { useCharacterCreateContext } from '@/context/CharacterSheetContext';
import { useGameData } from '@/context/GameDataContext';
import { calculateModifier, calculateRetainerModifier } from '@/utils/stat-calculations';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

const StatModTable = () => {
  const { stats } = useGameData();
  const {
    generatedStats,
    selectedClass
  } = useCharacterCreateContext();

  const getStatAbbrieviation = (statId: string) => {
    const stat = stats.find(s => s.id === statId);
    return stat?.abbreviation ?? '__'
  }

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 150 }}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Stat</TableCell>
            <TableCell align="right">Mod</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(generatedStats).map(([key, value]) => (
            <TableRow
              key={key}
            >
              <TableCell component="th" scope="row">
                {getStatAbbrieviation(key)}
              </TableCell>
              <TableCell align="right">
                {selectedClass == 'retainer' ? calculateRetainerModifier(value) : calculateModifier(value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default StatModTable