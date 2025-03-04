import { MouseEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, Tooltip } from "@mui/material";
import { useUser } from "@/context/UserDataProvider";
import MenuIcon from '@mui/icons-material/Menu';
import { NavigationLinks, UserMenuNavigationLinks } from "@/utils/navigation-links";

const Navbar = () => {
  const { user } = useUser();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const navLinks = NavigationLinks

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="a"
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
            cursor: "pointer"
          }}
          onClick={() => navigate("/")}
        >
          Dice Mice
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {navLinks.map((navLink) => (
              <MenuItem key={navLink.path} onClick={handleCloseNavMenu}>
                <Link to={navLink.path}>
                  <Typography sx={{ textAlign: 'center' }}>{navLink.label}</Typography>
                </Link>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Typography
          variant="h5"
          noWrap
          component="a"
          href="#app-bar-with-responsive-menu"
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'none' },
            flexGrow: 1,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Dice Mice
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {navLinks.map((navLink) => (
            <Link key={navLink.path} to={navLink.path}>
              <Button

                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {navLink.label}
              </Button>
            </Link>
          ))}
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          {user ?
            <Tooltip title={user.username}>
              <IconButton>
                <Avatar alt={user.username} src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} />
              </IconButton>
            </Tooltip>
            :
            <Tooltip title="Login with Discord">
              <a
                href={`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_DISCORD_REDIRECT_URI)}&response_type=code&scope=identify+email`}
              >
                <IconButton onClick={handleOpenUserMenu}>
                  <img
                    width="40px"
                    height="40px"
                    src="/discord-logo.svg"
                    alt="Discord Logo"
                    loading="lazy"
                  />
                </IconButton>
              </a>
            </Tooltip>}
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {UserMenuNavigationLinks.map((userMenuLink) => (
              <MenuItem key={userMenuLink.path} onClick={handleCloseUserMenu}>
                <Typography sx={{ textAlign: 'center' }}>{userMenuLink.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;