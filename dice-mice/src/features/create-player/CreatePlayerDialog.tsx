import { useState } from "react";
import { db } from "@/utils/firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";

interface CreatePlayerDialogProps {
  open: boolean;
  onClose: () => void;
  onPlayerCreated: () => void; // Callback to refresh the player list after creation
}

const CreatePlayerDialog = ({ open, onClose, onPlayerCreated }: CreatePlayerDialogProps) => {
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [errors, setErrors] = useState({ username: false, email: false });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Ensure username and email are filled
    const newErrors = {
      username: formData.username.trim() === "",
      email: formData.email.trim() === "",
    };

    setErrors(newErrors);

    if (newErrors.username || newErrors.email) {
      return; // Stop submission if errors exist
    }

    try {
      setSubmitting(true);

      // Add new player to Firestore
      await addDoc(collection(db, "players"), {
        username: formData.username,
        email: formData.email,
        createdAt: new Date(),
      });

      console.log("Player created successfully:", formData);

      // Reset form
      setFormData({ username: "", email: "" });

      onPlayerCreated(); // Refresh player list
      onClose(); // Close dialog
    } catch (error) {
      console.error("Error creating player:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create a Player</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter your details to create a new player profile.</DialogContentText>

          {/* Username */}
          <TextField
            required
            error={errors.username}
            helperText={errors.username ? "Username is required" : ""}
            margin="dense"
            id="username"
            name="username"
            label="Username"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleInputChange}
          />

          {/* Email */}
          <TextField
            required
            error={errors.email}
            helperText={errors.email ? "Email is required" : "Please use the email you used for Discord"}
            margin="dense"
            id="email"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : "Create Player"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreatePlayerDialog;
