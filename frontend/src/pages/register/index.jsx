import React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { BsFillPersonCheckFill } from "react-icons/bs";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const defaultTheme = createTheme();

export default function Register() {
  const URL = import.meta.env.VITE_APP_API_URL;
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [emailDisplayError, setEmailDisplayError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${URL}/api/v1/signup/`, {
        ...formData,
      })
      .then((response) => {
        setRedirectToLogin(true);
        setOpenDialog(true);
        resetForm();
      })
      .catch((error) => {
        if (error.response && error.response.status === 409) {
          setEmailDisplayError(error.response.data.detail);
        }
        if (error.response && error.response.status === 422) {
          setEmailDisplayError("Please enter the correct email or password.");
        }
      });
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      username: "",
      password: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleMouseClick = () => {
    if (emailDisplayError !== "") {
      setEmailDisplayError("");
    }
  };

  if (redirectToLogin) {
    return <Navigate to="/login" />;
  } else
    return (
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs" onClick={handleMouseClick}>
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box>
                    {/* Display information */}
                    {emailDisplayError && (
                      <Typography variant="body1" color="error" gutterBottom>
                        {emailDisplayError}
                      </Typography>
                    )}
                  </Box>
                  <TextField
                    autoComplete="username"
                    name="username"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    onChange={handleChange}
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox value="allowExtraEmails" color="primary" />
                    }
                    label="I want to receive inspiration, marketing promotions and updates via email."
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link to="/login" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          {/* Success Dialog */}
          <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogTitle className>
              Success
              <BsFillPersonCheckFill
                icon="fa-solid fa-check"
                className="ms-2"
              />
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                The account has been successfully added!
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </ThemeProvider>
    );
}
