import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Header({ children, isLoggedIn }) {
    const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
          SmartDash
        </Typography>
        <Box>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleDashboardClick}>Dashboard</Button>
          ) : (
            children
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;