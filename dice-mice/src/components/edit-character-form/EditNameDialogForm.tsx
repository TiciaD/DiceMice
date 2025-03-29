import { updateCharacterField } from '@/services/firestore-service';
import { Button, DialogActions, TextField } from '@mui/material';
import { useState } from 'react';

interface EditNameDialogFormProps {
  characterId: string;
  defaultValue: string;
  handleClose: () => void
}

const EditNameDialogForm = ({ characterId, defaultValue, handleClose }: EditNameDialogFormProps) => {
  const [name, setName] = useState(defaultValue)

  const handleSubmit = async () => {
    console.log("submit", name)
    console.log("defaultValue", defaultValue)
    await updateCharacterField(characterId, 'name', name)
    handleClose()
  }
  return (
    <>
      <TextField
        autoFocus
        required
        margin="dense"
        id="name"
        name="name"
        label="Mouse Name"
        type="text"
        fullWidth
        value={name}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setName(event.target.value);
        }}
        variant="outlined"
      />
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </>
  )
}

export default EditNameDialogForm