import { batchUpdateCharacter, updateCharacterField } from "@/services/firestore-service";
import { Alert, Button, DialogActions, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";

interface EditLevelDialogFormProps {
  characterId: string;
  defaultValue: string;
  handleClose: () => void
}
const EditLevelDialogForm = ({ characterId, defaultValue, handleClose }: EditLevelDialogFormProps) => {
  const [selectedLevel, setSelectedLevel] = useState(defaultValue)

  const handleSubmit = async () => {
    console.log("submit level", selectedLevel)
    console.log("defaultValue", defaultValue)
    if (selectedLevel < defaultValue) {
      const updates = {
        level: selectedLevel,
        chosenClassSkills: [],
        skills: [],
      }

      await batchUpdateCharacter(characterId, updates)
    } else {
      await updateCharacterField(characterId, 'level', selectedLevel)
    }
    handleClose()
  }

  return (
    <>
      <Alert severity="warning" sx={{ marginBottom: 2 }}>Lowering Your Character's Level Will Reset Skills.</Alert>
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Level</InputLabel>
        <Select
          required
          labelId="level-select-label"
          id="levelId"
          name="levelId"
          label="Level"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
        >
          {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
            <MenuItem key={lvl} value={lvl}>
              {lvl.toString()}
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

export default EditLevelDialogForm