import { AllowedStats, Character } from "@/models/character.model"
import { Stat } from "@/models/stat.model"
import { Alert, Box, Button, DialogActions, IconButton, Typography } from "@mui/material"
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Class } from "@/models/class.model";
import { useMemo, useState } from "react";
import { updateCharacterField } from "@/services/firestore-service";
import { throttle } from "lodash";

interface EditStatsDialogFormProps {
  character: Character
  stats: Stat[]
  currentClass: Class
  handleClose: () => void
}

const EditStatsDialogForm = ({ character, stats, currentClass, handleClose }: EditStatsDialogFormProps) => {
  const [generatedStats, setGeneratedStats] = useState({
    ...character.current_base_stats
  });

  const getStatAbbrieviation = (statId: string) => {
    const stat = stats.find(s => s.id === statId);
    return stat?.abbreviation ?? '__'
  }

  const isGoingBelowPrerequisite = (statId: string, currentValue: number) => {
    const statPrereq = currentClass.prerequisites.find((prereq) => prereq.stat == statId)

    if (statPrereq) {
      const isCurrentValueMinPrereq = currentValue === statPrereq.min
      return isCurrentValueMinPrereq
    } else {
      return false
    }
  }

  const handleStatIncrement = useMemo(() =>
    throttle((statId: string) => {
      setGeneratedStats(prevStats => ({
        ...prevStats,
        [statId]: Math.min(prevStats[statId as AllowedStats] + 1, 24),
      }));
    }, 300), []
  );

  const handleStatDecrement = useMemo(() =>
    throttle((statId: string) => {
      setGeneratedStats(prevStats => {
        const prereq = currentClass.prerequisites.find(p => p.stat === statId);
        const minValue = prereq ? prereq.min : 0;
        return {
          ...prevStats,
          [statId]: Math.max(prevStats[statId as AllowedStats] - 1, minValue),
        };
      });
    }, 300), [currentClass]
  );

  const handleSubmit = async () => {
    console.log("submit generatedStats", generatedStats)
    console.log("defaultValue", character.current_base_stats)
    await updateCharacterField(character.id, 'current_base_stats', generatedStats)
    handleClose()
  }

  return (
    <Box>
      <Alert severity="warning" sx={{ marginBottom: 2 }}>You Cannot Update Stats To Be Below Your Class Prerequisites Minimum.</Alert>
      {Object.entries(generatedStats).map(([key, value]) => {
        return (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ width: '50px' }}>{getStatAbbrieviation(key)}: </Typography>
            <Typography variant="h6" sx={{ pl: 1, pr: 0.5, fontWeight: 400, width: '35px' }}>{value}</Typography>
            <IconButton aria-label="increment stat up" onClick={() => handleStatIncrement(key)} disabled={value >= 24} color="primary">
              <KeyboardArrowUpIcon />
            </IconButton>
            <IconButton aria-label="decrement stat down" onClick={() => handleStatDecrement(key)} disabled={isGoingBelowPrerequisite(key, value)} color="primary">
              <KeyboardArrowDownIcon />
            </IconButton>
          </Box>
        )
      })
      }
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Box>
  )
}

export default EditStatsDialogForm