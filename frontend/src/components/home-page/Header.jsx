import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

function Header({ children }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
          SmartDash
        </Typography>
        {children}
      </Toolbar>
    </AppBar>
  );
}

export default Header;