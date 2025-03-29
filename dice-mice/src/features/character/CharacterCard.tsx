import { useGameData } from "@/context/GameDataContext"
import { Character } from "@/models/character.model"
import { Button, Card, CardActions, CardContent, Typography } from "@mui/material"
import { Link } from "react-router-dom"

interface CharacterCardProps {
  character: Character;
}

const CharacterCard = ({ character }: CharacterCardProps) => {
  const { counties, classes } = useGameData()

  const getCountyName = () => {
    return counties.find((county) => county.id == character.countyId)?.name || 'Unknown County'
  }

  const getClassName = () => {
    return classes.find((cls) => cls.id == character.classId)?.name || 'Unknown Class'
  }

  return (
    <Card>
      <CardContent sx={{ paddingBottom: 0 }}>
        <Typography variant="h5" gutterBottom>
          {character.name}
        </Typography>
        <Typography variant="subtitle1" component="div">
          Origin County: {getCountyName()} | Level: {character.level}
        </Typography>
        <Typography variant="body1" component="div" sx={{ color: 'text.secondary' }}>
          {getClassName()}
        </Typography>
      </CardContent>
      <CardActions>
        <Link to={`/characters/${character.id}`}>
          <Button size="small">More Details</Button>
        </Link>
      </CardActions>
    </Card>
  )
}

export default CharacterCard