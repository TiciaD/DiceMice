import { Button, Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";


const CharacterView = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();

  return (
    <Container>
      <Typography variant="h4">Character ID: {characterId}</Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Back to Home
      </Button>
    </Container>
  );
}

export default CharacterView