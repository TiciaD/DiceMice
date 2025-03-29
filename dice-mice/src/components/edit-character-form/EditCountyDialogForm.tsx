import { useState } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { County } from "@/models/county.model";
import { updateCharacterField } from "@/services/firestore-service";

interface EditCountyDialogFormProps {
  characterId: string;
  defaultValue: string;
  counties: County[]
  handleClose: () => void
}
const EditCountyDialogForm = ({ characterId, counties, defaultValue, handleClose }: EditCountyDialogFormProps) => {
  const [selectedCounty, setSelectedCounty] = useState(defaultValue)

  const handleSubmit = async () => {
    console.log("submit county", selectedCounty)
    console.log("defaultValue", defaultValue)
    await updateCharacterField(characterId, 'countyId', selectedCounty)
    handleClose()
  }

  return (
    <>
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Origin County</InputLabel>
        <Select
          required
          labelId="county-select-label"
          id="countyId"
          name="countyId"
          label="Origin County"
          value={selectedCounty}
          onChange={(e) => setSelectedCounty(e.target.value)}
        >
          {counties.map(county => (
            <MenuItem key={county.id} value={county.id}>
              {county.name}
            </MenuItem>
          )
          )}
        </Select>
      </FormControl>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </>
  )
}

export default EditCountyDialogForm