import { useGameData } from '@/context/GameDataContext';
import { PlayerHouse } from '@/models/player-house.model';
import { db } from '@/utils/firebase';
import { Button, Card, CardActions, CardContent, TextField, Typography } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react'

interface HouseInfoProps {
  house: PlayerHouse;
  setHouse: (house: PlayerHouse) => void;
}

const HouseInfo = ({ house, setHouse }: HouseInfoProps) => {
  const { counties, loading } = useGameData();
  const [formData, setFormData] = useState({
    name: house.name,
    motto: house.motto,
    bio: house.bio,
    gold: house.gold,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const houseRef = doc(db, "houses", house.id);

      await updateDoc(houseRef, {
        name: formData.name,
        motto: formData.motto,
        bio: formData.bio,
        gold: Number(formData.gold),
      });

      // Update state after saving
      setHouse({ ...house, ...formData });

      console.log("House updated successfully");
    } catch (error) {
      console.error("Error updating house:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCountyName = () => {
    if (!loading) {
      return counties.find((county) => county.id == house.countyId)?.name || 'Unknown County'
    } else {
      "Unable to find county"
    }
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <TextField
          margin="dense"
          name="name"
          label="House Name"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleInputChange}
        />

        <TextField
          margin="dense"
          name="motto"
          label="House Motto"
          fullWidth
          variant="outlined"
          value={formData.motto}
          onChange={handleInputChange}
        />

        <TextField
          margin="dense"
          name="bio"
          label="House Bio"
          fullWidth
          multiline
          rows={5}
          variant="outlined"
          value={formData.bio}
          onChange={handleInputChange}
        />

        <TextField
          margin="dense"
          name="gold"
          label="Gold"
          type="number"
          fullWidth
          variant="outlined"
          value={formData.gold}
          onChange={handleInputChange}
        />

        {/* Read-Only Fields */}
        <Typography variant="h6" gutterBottom>
          Origin County
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {getCountyName()}
        </Typography>

      </CardContent>

      <CardActions>
        <Button onClick={handleSave} variant="contained" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardActions>
    </Card>
  );
}

export default HouseInfo