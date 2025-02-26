import { PlayerHouse } from '@/models/player-house.model'
import { useState } from 'react'
import HouseInfo from './HouseInfo'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { useGameData } from '@/context/GameDataContext'
import { addDoc, collection, doc } from 'firebase/firestore'
import { db } from '@/utils/firebase'

interface HouseProps {
  house: PlayerHouse | null;
  playerId: string;
}
const House = (props: HouseProps) => {
  const { counties, loading } = useGameData();

  const [currentHouse, setCurrentHouse] = useState<PlayerHouse | null>(props.house)
  const [openCreateHouseDialog, setOpenCreateHouseDialog] = useState(false)
  const [houseFormData, setHouseFormData] = useState({
    name: '',
    motto: '',
    countyId: '',
    bio: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    countyId: false,
  });

  const handleOpen = () => setOpenCreateHouseDialog(true);
  const handleClose = () => {
    setHouseFormData({ name: '', motto: '', countyId: '', bio: '' }); // Reset form
    setErrors({ name: false, countyId: false }); // Clear errors
    setOpenCreateHouseDialog(false);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setHouseFormData({ ...houseFormData, [name]: value });

    // Clear error when user types
    setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Check required fields
    const newErrors = {
      name: houseFormData.name.trim() === '',
      countyId: houseFormData.countyId === '',
    };

    setErrors(newErrors);

    if (newErrors.name || newErrors.countyId) {
      return; // Stop submission if errors exist
    }

    try {
      setSubmitting(true);

      // Get reference to the current player
      const playerRef = doc(db, 'players', props.playerId);

      // Save house to Firestore
      const newHouseRef = await addDoc(collection(db, 'houses'), {
        name: houseFormData.name,
        motto: houseFormData.motto,
        countyId: houseFormData.countyId,
        bio: houseFormData.bio,
        gold: 0,
        playerId: playerRef, // Store as Firestore reference
        createdAt: new Date(),
      });

      console.log('House created successfully:', newHouseRef.id);

      // Set new house in state
      setCurrentHouse({
        id: newHouseRef.id,
        name: houseFormData.name,
        motto: houseFormData.motto,
        countyId: houseFormData.countyId,
        bio: houseFormData.bio,
        gold: 0,
        playerId: playerRef.id,
      });

      handleClose(); // Close the dialog
    } catch (error) {
      console.error('Error creating house:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {currentHouse != null ?
        <div>
          <h3>House {currentHouse.name}</h3>
          <HouseInfo />
        </div> :
        <div>
          <p>No House Found for selected player</p>
          <Button variant="contained" onClick={handleOpen}>
            Create House
          </Button>
          <Dialog
            open={openCreateHouseDialog}
            onClose={handleClose}
          >
            <form onSubmit={handleSubmit}>
              <DialogTitle>Create a House</DialogTitle>
              <DialogContent>
                <DialogContentText>Define your house details below:</DialogContentText>

                {/* House Name */}
                <TextField
                  required
                  error={errors.name}
                  helperText={errors.name ? 'House name is required' : ''}
                  margin="dense"
                  id="name"
                  name="name"
                  label="House Name"
                  fullWidth
                  variant="outlined"
                  value={houseFormData.name}
                  onChange={handleInputChange}
                />

                {/* House Motto */}
                <TextField
                  margin="dense"
                  id="motto"
                  name="motto"
                  label="House Words"
                  fullWidth
                  variant="outlined"
                  value={houseFormData.motto}
                  onChange={handleInputChange}
                />

                {/* County Select */}
                <FormControl fullWidth margin="dense" error={errors.countyId}>
                  <InputLabel id="county-select-label">County</InputLabel>
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
                </FormControl>
                {errors.countyId && <p style={{ color: 'red', fontSize: '12px' }}>County selection is required</p>}

                {/* House Bio */}
                <TextField
                  margin="dense"
                  id="bio"
                  name="bio"
                  label="House Bio"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  value={houseFormData.bio}
                  onChange={handleInputChange}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} disabled={submitting} variant="outlined">Cancel</Button>
                <Button type="submit" onClick={handleSubmit} disabled={submitting} variant="contained">{submitting ? 'Saving...' : 'Save House'}</Button>
              </DialogActions>
            </form>
          </Dialog>
        </div>
      }
    </>
  )
}

export default House