import { useGameData } from "@/context/GameDataContext";
import { Character } from "@/models/character.model";
import { PlayerHouse } from "@/models/player-house.model";
import { getCharactersByHouseId } from "@/services/firestore-service";
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CharactersProps {
  house: PlayerHouse | null;
}

const Characters = ({ house }: CharactersProps) => {
  const { classes, counties } = useGameData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    if (house) {
      setLoading(true)
      const fetchCharacters = async () => {
        const characterData = await getCharactersByHouseId(house.id);
        if (characterData && characterData.length > 0) {
          setCharacters(characterData)
        }
        console.log("character data", characterData)
        setLoading(false);
      };

      fetchCharacters();
    }
  }, []);

  const handleCharacterSelect = (characterId: string) => {
    navigate(`/characters/${characterId}`);
  };

  const handleCharacterCreateClick = () => {
    navigate(`/characters/create`);
  };

  const getClassName = (classId: string) => {
    const foundClass = classes.find((c) => c.id == classId)
    return foundClass?.name || 'Unknown Class'
  }

  const getCountyName = (countyId: string) => {
    const foundCounty = counties.find((c) => c.id == countyId)
    return foundCounty?.name || 'Unknown County'
  }

  const render = () => {
    let content;
    if (house == null) {
      content = <p>No house was found. Please create a house to create characters</p>;
    } else if (characters.length == 0) {
      content = <Container><span>No characters found for this house. Would you like to Create a Character?</span><Button size="small">Create a Character</Button></Container>;
    } else {
      content = <Box sx={{ minWidth: 275 }}>
        <Button size="large" onClick={handleCharacterCreateClick}>Create a Character</Button>
        {characters.map((character) => {
          return (<Card key={character.id} variant="outlined">
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {character.name}
              </Typography>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ color: 'text.secondary' }}
              >
                {getClassName(character.classId)}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>{getCountyName(character.countyId)}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>Level {character.level}</Typography>
            </CardContent>
            <CardActions>
              <Button onClick={() => handleCharacterSelect(character.id)}>More Details</Button>
            </CardActions>
          </Card>)
        })}
      </Box>
    }

    return <div>{content}</div>;
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      {loading ? <CircularProgress /> : render()}
    </Box>
  )
}

export default Characters