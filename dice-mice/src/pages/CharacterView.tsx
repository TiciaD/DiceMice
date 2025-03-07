import { useGameData } from "@/context/GameDataContext";
import { useUser } from "@/context/UserDataProvider";
import CharacterSheet from "@/features/character/CharacterSheet";
import { Character } from "@/models/character.model";
import { PlayerHouse } from "@/models/player-house.model";
import { getHouseByPlayerId } from "@/services/firestore-service";
import { db } from "@/utils/firebase";
import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


const CharacterView = () => {
  const { characterId } = useParams();

  const { user, house, loading } = useUser();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [currentHouse, setCurrentHouse] = useState<PlayerHouse | null>(null)
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)

  useEffect(() => {
    setIsLoading(true)

    if (characterId) {
      fetchCharacter()
    }

    if (!house) {
      fetchHouse();
    } else {
      setCurrentHouse(house);
    }

  }, [user, house]);

  const fetchHouse = async () => {
    if (user) {
      const house = await getHouseByPlayerId(user.id);
      console.log("house", house)
      setCurrentHouse(house); // `house` will be null if not found
    }
    setIsLoading(false)
  };

  const fetchCharacter = async () => {
    if (user && characterId) {
      const characterDoc = await getDoc(doc(db, "characters", characterId));
      const character = { ...characterDoc.data() } as Character
      character.id = characterDoc.id;
      console.log("character", character)
      setCurrentCharacter(character);
    }
    setIsLoading(false)
  };

  return (
    <Container>
      {characterId && !loading ?
        <Box>
          <Typography variant="h4">Character ID: {characterId}</Typography>
          <CharacterSheet character={currentCharacter} />
        </Box>
        :
        <Typography variant="h4">No character found</Typography>

      }
      {(loading || isLoading) && <CircularProgress />}
      <Button variant="contained" onClick={() => navigate("/")}>
        Back to Home
      </Button>
    </Container>
  );
}

export default CharacterView