import { useUser } from "@/context/UserDataProvider"
import { Box, Typography } from "@mui/material";
import { useEffect } from "react";

const Logout = () => {
  const { logout } = useUser();
  useEffect(() => {
    logout()
  }, [])

  return (
    <Box>
      <Typography variant="body1">You have been logged out.</Typography>
    </Box>
  )
}

export default Logout