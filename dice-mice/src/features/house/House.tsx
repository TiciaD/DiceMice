import { PlayerHouse } from '@/models/player-house.model'
import { useEffect, useState } from 'react'
import HouseInfo from './HouseInfo'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { useGameData } from '@/context/GameDataContext'
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { useUser } from '@/context/UserDataProvider'
import { getHouseByPlayerId } from '@/services/firestore-service'
import Characters from '../character/Characters'

const House = () => {
  const { counties, loading } = useGameData();
  const { user, userRef, house, setHouse } = useUser();

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [currentHouse, setCurrentHouse] = useState<PlayerHouse | null>(house)
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

  useEffect(() => {
    if (!house) {
      fetchHouse();
    }
  }, [house, user]);

  const fetchHouse = async () => {
    setIsDataLoading(true);
    try {
      if (user) {
        const foundHouse = await getHouseByPlayerId(user.id)

        if (foundHouse) {
          setCurrentHouse(foundHouse);
          setHouse(foundHouse);
        } else {
          setCurrentHouse(null);
        }
      }
      setIsDataLoading(false)
    } catch (error) {
      console.error("Error fetching house:", error);
    }
  };

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
      console.log("user", user)

      if (user && userRef) {
        // Get reference to the current player
        const playerRef = doc(db, 'players', user.id);

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
          playerId: user.id,
        });
      }

      handleClose(); // Close the dialog
    } catch (error) {
      console.error('Error creating house:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ m: 2 }}>
      {(loading || isDataLoading) && <CircularProgress />}
      {currentHouse != null ?
        <Box>
          <Typography variant="h5" gutterBottom>House {currentHouse.name}</Typography>
          <HouseInfo house={currentHouse} setHouse={setCurrentHouse} />
          <Box sx={{ pt: 3 }}>
            <Typography variant="h5">{currentHouse.name} Mice</Typography>
            <Characters house={currentHouse} />
          </Box>
        </Box> :
        <Box>
          <Typography variant="subtitle1" gutterBottom>No House Found.</Typography>
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
        </Box>
      }
    </Box>
  )
}

export default House