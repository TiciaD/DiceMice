import { useUser } from "@/context/UserDataProvider"
import CreateHouseDialog from "@/features/house/CreateHouseDialog"
import HouseOverviewCard from "@/features/house/HouseOverviewCard"
import { getHouseByPlayerId } from "@/services/firestore-service"
import { CircularProgress, Container } from "@mui/material"
import { useEffect, useState } from "react"

const Dashboard = () => {
  const { user, loading, loadingLoggedInUser, house, setHouse } = useUser()
  const [isHouseLoading, setIsHouseLoading] = useState(false);
  const [openCreateHouseDialog, setOpenCreateHouseDialog] = useState(false)

  useEffect(() => {
    if (!house) {
      fetchHouse();
    }
  }, [house, user]);

  const fetchHouse = async () => {
    setIsHouseLoading(true);
    try {
      if (user) {
        const foundHouse = await getHouseByPlayerId(user.id)

        if (foundHouse) {
          setHouse(foundHouse);
        }
      }
      setIsHouseLoading(false)
    } catch (error) {
      console.error("Error fetching house:", error);
    }
  };

  return (
    <Container>
      {loading || loadingLoggedInUser || isHouseLoading ?
        <CircularProgress />
        :
        <div>
          <h3>Dashboard</h3>
          <p>{user?.username}</p>
          <HouseOverviewCard house={house} showBio setOpenDialog={setOpenCreateHouseDialog} />
          {user && <CreateHouseDialog user={user} setHouse={setHouse} openDialog={openCreateHouseDialog} setOpenDialog={setOpenCreateHouseDialog} />}
        </div>
      }
    </Container>
  )
}

export default Dashboard