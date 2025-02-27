import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, MobileStepper, Select, Step, StepLabel, Stepper, Typography, useMediaQuery, useTheme } from "@mui/material";
import PlayerSelection from "@/features/character-create/PlayerSelection";
import CountySelection from "@/features/character-create/CountySelection";
import StatGeneration from "@/features/character-create/StatGeneration";

const CharacterCreate = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [generatedStats, setGeneratedStats] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Create Your Mouse</Typography>
      <form onSubmit={handleSubmit}>

        {/* Select Player */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Player</InputLabel>
          <Select onChange={handleSelectPlayer} value={selectedPlayerId} label="Select Player" name="playerId" required>
            {players.map(player => (
              <MenuItem key={player.id} value={player.id}>{player.username}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select County */}
        <Select
          required
          labelId="county-select-label"
          id="countyId"
          name="countyId"
          label="County"
          value={houseFormData.countyId}
          onChange={handleInputChange}
        >
          {loading ? (
            <MenuItem disabled>Loading...</MenuItem>
          ) : (
            counties.map(county => (
              <MenuItem key={county.id} value={county.id}>
                {county.name}
              </MenuItem>
            ))
          )}
        </Select>
      </form>


      {
        loading && <CircularProgress />
      }
      {/* Warning if County Changes */}

      {/* Stat Generation */}

      {/* Finalize Button */}
      {/* {generatedStats && (
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Finalize Character
      </Button>
    )} */}
    </Container>
  )
}

export default CharacterCreate