// NotFound.jsx
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const NotFound = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      backgroundColor: "#f0f0f0",
      padding: "20px",
    }}
  >
    <Typography variant="h1" component="h1" color="primary">
      404
    </Typography>
    <Typography variant="h5" component="h2" color="textSecondary">
      Page Not Found
    </Typography>
    <Typography variant="body1" component="p" color="textSecondary">
      The page you are looking for doesn't exist or has been moved.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      component={Link}
      to="/"
      sx={{
        marginTop: "20px",
        textDecoration: "none",
      }}
    >
      Go to Home
    </Button>
  </Box>
);

export default NotFound;
