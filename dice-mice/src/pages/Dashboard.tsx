import { useUser } from "@/context/UserDataProvider"
import CharacterCard from "@/features/character/CharacterCard"
import CreateHouseDialog from "@/features/house/CreateHouseDialog"
import HouseOverviewCard from "@/features/house/HouseOverviewCard"
import { Character } from "@/models/character.model"
import { getCharactersByHouseId, getHouseByPlayerId } from "@/services/firestore-service"
import { Box, Button, CircularProgress, Container, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Grid from '@mui/material/Grid2';

const Dashboard = () => {
  const { user, loading, loadingLoggedInUser, house, setHouse } = useUser()
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [openCreateHouseDialog, setOpenCreateHouseDialog] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    if (!house) {
      fetchData();
    } else {
      fetchCharacters()
    }
  }, [house, user]);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      if (user) {
        const foundHouse = await getHouseByPlayerId(user.id)

        if (foundHouse) {
          const foundCharacters = await getCharactersByHouseId(foundHouse.id)
          setHouse(foundHouse);

          if (foundCharacters) {
            setCharacters(foundCharacters)
          }
        }
      }
      setIsDataLoading(false)
    } catch (error) {
      console.error("Error fetching Data:", error);
    }
  };

  const fetchCharacters = async () => {
    setIsDataLoading(true);
    try {
      if (user && house) {
        const foundCharacters = await getCharactersByHouseId(house.id)

        if (foundCharacters) {
          setCharacters(foundCharacters)
        }
      }
      setIsDataLoading(false)
    } catch (error) {
      console.error("Error fetching Data:", error);
    }
  }

  return (
    <Container>
      {loading || loadingLoggedInUser || isDataLoading ?
        <CircularProgress />
        :
        <Box sx={{ padding: 2 }}>
          <Grid container spacing={2} columns={24}>
            <Grid size={{ xs: 24, md: 12 }}>
              <Typography variant="h5" gutterBottom sx={{ paddingBottom: '1rem' }}>My House</Typography>
              <HouseOverviewCard house={house} showBio setOpenDialog={setOpenCreateHouseDialog} />
              {user && <CreateHouseDialog user={user} setHouse={setHouse} openDialog={openCreateHouseDialog} setOpenDialog={setOpenCreateHouseDialog} />}
            </Grid>
            <Grid size={{ xs: 24, md: 12 }}>
              <Box sx={{ display: 'inline-flex', justifyContent: 'space-between', width: '100%', paddingBottom: '1rem' }}>
                <Typography variant="h5" gutterBottom>My Characters</Typography>
                <Link to='/characters/create'>
                  <Button variant="contained">Create a New Mouse</Button>
                </Link>
              </Box>
              <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                {characters.length > 0 && characters.map((character) => {
                  return <CharacterCard key={character.id} character={character} />
                })}
              </Box>
            </Grid>
          </Grid>

        </Box>
      }
    </Container>
  )
}

export default Dashboard