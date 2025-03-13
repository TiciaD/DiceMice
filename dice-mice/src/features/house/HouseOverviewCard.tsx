import { useGameData } from "@/context/GameDataContext"
import { PlayerHouse } from "@/models/player-house.model"
import { Box, Button, Card, CardActions, CardContent, Typography } from "@mui/material"
import { Link } from "react-router-dom";

interface HouseOverviewCardProps {
  house: PlayerHouse | null
  showBio: boolean;
  setOpenDialog: (isOpen: boolean) => void;
}

const HouseOverviewCard = ({ house, showBio = true, setOpenDialog }: HouseOverviewCardProps) => {
  const { counties } = useGameData()

  const handleOpen = () => setOpenDialog(true);

  const getCountyName = () => {
    console.log("house info", house)
    if (house) {
      return counties.find((county) => county.id == house.countyId)?.name || 'Unknown County'
    } else {
      "Unable to find county for unknown house"
    }
  }

  return (
    <Box>
      {house ?
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {house.name}
            </Typography>
            <Typography variant="subtitle1" component="div">
              Origin County: {getCountyName()}
            </Typography>
            <Typography variant="subtitle1" component="div" sx={{ color: 'text.secondary', mb: 1.5 }}>
              {/* {house.motto} */}
              Actions Bring Results
            </Typography>
            {showBio && <Typography variant="body1">
              {/* {house.bio} */}
              This house if more of a neighborhood with many different personalities that all have love/hate for each other
            </Typography>}
          </CardContent>
          <CardActions>
            <Link to='/house'>
              <Button size="small">More Details</Button>
            </Link>
          </CardActions>
        </Card>
        :
        <Card>
          <CardContent>
            <Typography variant="body1" component="p">
              No House Found.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="medium" variant="contained" onClick={handleOpen}>Create House</Button>
          </CardActions>
        </Card>
      }
    </Box>
  )
}

export default HouseOverviewCard