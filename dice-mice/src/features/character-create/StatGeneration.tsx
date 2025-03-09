import { useGameData } from "@/context/GameDataContext";
import { Stat } from "@/models/stat.model";
import { roll3d6, roll4d6DropLowest } from "@/utils/dice-rolls";
import { Box, Button, Container, FormControl, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { ChangeEvent, useEffect, useState } from "react";

interface StatGenerationProps {
  countyId: string;
  generatedStats?: Record<string, number>
  onStatsGenerated: (stats: Record<string, number>) => void
}

const StatGeneration = ({ generatedStats, countyId, onStatsGenerated }: StatGenerationProps) => {
  const { counties, stats } = useGameData();
  const [statValues, setStatValues] = useState<Record<string, number>>({});
  const [associatedStat, setAssociatedStat] = useState<string | null>(null);

  const sortedStats = stats.sort((a, b) => a.order - b.order)

  useEffect(() => {
    setStatValues({ ...generatedStats });
  }, [generatedStats, stats]);

  // Find associated stat when countyId changes
  useEffect(() => {
    const county = counties.find(c => c.id === countyId);
    setAssociatedStat(county ? county.associatedStatId : null);
  }, [countyId, counties]);

  // Check if all stats are filled
  const allStatsFilled = sortedStats.every(stat => statValues[stat.id] > 0);

  const handleInputStats = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, stat: Stat) => {
    setStatValues({ ...statValues, [stat.id]: Number(e.target.value) || 0 })
  }

  const handleRollStat = (statId: string) => {
    const newValue = statId === associatedStat ? roll4d6DropLowest() : roll3d6();
    setStatValues(prev => ({ ...prev, [statId]: newValue }));
  };

  return (
    <Container sx={{ pt: 2, pb: 2 }}>
      <form style={{ display: 'inline-flex', flexDirection: 'column', gap: '1rem' }}>
        <Box sx={{ display: 'inline-flex', flexDirection: 'column', width: '13rem', gap: '0.25rem' }}>
          {sortedStats.map((stat) => {
            const isAssociatedStat = stat.id === associatedStat;
            return (
              <Box key={stat.id} sx={{ display: 'inline-flex', width: '100%' }}>
                <Grid container spacing={2} columns={24}>
                  <Grid size={5} sx={{ alignSelf: 'center' }}>
                    <Typography variant="h6" sx={isAssociatedStat ? { color: 'blue', textDecoration: 'underline' } : null}>{stat.abbreviation}</Typography>
                  </Grid>
                  <Grid size={9}>
                    <FormControl size="small" sx={{ width: '70px' }}>
                      <TextField
                        id="outlined-number"
                        type="number"
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                          htmlInput: {
                            min: 0,
                          }
                        }}
                        value={statValues[stat.id] ?? 0}
                        onChange={(e) => handleInputStats(e, stat)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={10} sx={{ alignSelf: 'center' }}>
                    <Button variant="contained" onClick={() => handleRollStat(stat.id)}>Roll</Button>
                  </Grid>
                </Grid>
              </Box>
            )
          })}
        </Box>
        <Box sx={{ display: "inline-flex", flexDirection: 'column', gap: '0.5rem' }}>
          <Button variant="outlined" onClick={() => setStatValues({})}>Clear</Button>
          <Button variant="contained" disabled={!countyId || !allStatsFilled} onClick={() => onStatsGenerated({ ...statValues })}>Generate Mouse</Button>
        </Box>
      </form>
    </Container>
  )
}

export default StatGeneration