import { useUser } from "@/context/UserDataProvider";
import { Box, CircularProgress, Container, IconButton, Tooltip, Typography } from "@mui/material";

const Home = () => {
  const { user, loading } = useUser()

  return (
    <Container>
      {!loading ? <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Dice Mice {user ? ` ${user.username}` : ''}!
        </Typography>

        {!user &&
          <Box>
            <Typography variant="h6" gutterBottom>
              Please Login to view more info on Dice Mice, create your own mouse and more!
            </Typography>
            <Box sx={{ alignItems: 'center' }}>
              <a
                href={`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_DISCORD_REDIRECT_URI)}&response_type=code&scope=identify+email`}
              >
                <Tooltip title="Login with Discord">
                  <IconButton>
                    <img
                      width="40px"
                      height="40px"
                      src="/discord-logo.svg"
                      alt="Discord Logo"
                      loading="lazy"
                    />
                  </IconButton>
                </Tooltip>
                <Typography variant="button">Sign In With Discord</Typography>
              </a>
            </Box>
          </Box>
        }
      </Box> :
        <Box sx={{ width: "100%", maxWidth: 600 }}>
          <CircularProgress />
        </Box>
      }
    </Container>
  )
}

export default Home