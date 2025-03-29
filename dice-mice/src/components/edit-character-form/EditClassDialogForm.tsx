import { Class } from "@/models/class.model";
import { batchUpdateCharacter } from "@/services/firestore-service";
import { Alert, Button, DialogActions, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useState } from "react";

interface EditClassDialogFormProps {
  characterId: string;
  defaultValue: string;
  eligibleClasses: Class[]
  handleClose: () => void
}
const EditClassDialogForm = ({ characterId, eligibleClasses, defaultValue, handleClose }: EditClassDialogFormProps) => {
  const [selectedClass, setSelectedClass] = useState(defaultValue)

  const handleSubmit = async () => {
    console.log("submit class", selectedClass)
    console.log("defaultValue", defaultValue)

    // Remove all skills and chosenClassSkills
    // Reset all Base Stats for current_base_stats
    const updates = {
      classId: selectedClass,
      chosenClassSkills: [],
      skills: [],
    }

    await batchUpdateCharacter(characterId, updates)
    handleClose()
  }

  const handleClassSelect = (e: SelectChangeEvent<string>) => {
    setSelectedClass(e.target.value);
  }

  return (
    <>
      <Alert severity="warning" sx={{ marginBottom: 2 }}>Changing Class will reset skills.</Alert>
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Class</InputLabel>
        <Select
          label="Class"
          value={selectedClass}
          onChange={handleClassSelect}
          disabled={!eligibleClasses.length}
        >
          {eligibleClasses.map(cls => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name}
            </MenuItem>
          ))}
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

export default EditClassDialogForm