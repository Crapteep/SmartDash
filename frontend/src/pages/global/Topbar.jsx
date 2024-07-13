import { Box, IconButton, useTheme, Menu, MenuItem, Tooltip } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Topbar = ({ setIsLoggedIn }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    axios.defaults.headers.common["Authorization"] = ``;
    navigate("/");
    setIsLoggedIn(false);
    localStorage.clear();
  };
  const handlePersonIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
      <Tooltip title="Toggle Dark/Light Mode">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        </Tooltip>

        <Tooltip title="Home">
        <IconButton onClick={handleNavigateHome}>
          <HomeOutlinedIcon />
        </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        </Tooltip>

        <Tooltip title="Profile">
        <IconButton onClick={handlePersonIconClick}>
          <PersonOutlinedIcon />
        </IconButton>
        </Tooltip>


        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
