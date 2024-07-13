import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { BsFillPersonCheckFill } from "react-icons/bs";

export default function Register({ onClose, switchToLogin }) {
  const URL = import.meta.env.VITE_APP_API_URL;
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
        setOpenDialog(true);
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
    onClose();
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

  const handleLoginAfterRegistration = () => {
    setOpenDialog(false);
    switchToLogin();
  };

  return (
    <Box
      sx={{
        marginTop: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      onClick={handleMouseClick}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign up
      </Typography>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box>
              {emailDisplayError ? (
                <Typography variant="body1" color="error" gutterBottom>
                  {emailDisplayError}
                </Typography>
              ): (
                <div style={{ height: 25 }} />
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
              control={<Checkbox value="allowExtraEmails" color="primary" />}
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
            <Typography
              variant="body2"
              component="span"
              onClick={switchToLogin}
              sx={{ cursor: 'pointer', color: 'primary.main' }}
            >
              {"Already have an account? Sign in"}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      {/* Success Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Success
          <BsFillPersonCheckFill className="ms-2" />
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            The account has been successfully created!
          </Typography>
        </DialogContent>
        <DialogActions>
        <Button onClick={handleLoginAfterRegistration} color="primary">
            Log in
          </Button>
          <Button onClick={handleDialogClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}