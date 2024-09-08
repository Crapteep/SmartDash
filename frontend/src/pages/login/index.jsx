import { useState } from "react";
import React from "react";
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
import { useNavigate } from "react-router-dom";

export default function Login({ setIsLoggedIn, onClose, switchToRegister }) {
  const URL = import.meta.env.VITE_APP_API_URL;
  const [loginDisplayError, setLoginDisplayError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    axios
      .post(`${URL}/token/`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => {
        localStorage.setItem("token", response.data.access_token);
        setIsLoggedIn(true);
        onClose();
        navigate("/dashboard");
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          setLoginDisplayError(error.response.data.detail);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
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
    if (loginDisplayError !== "") {
      setLoginDisplayError("");
    }
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
        Sign in
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Box>
          {loginDisplayError ? (
            <Typography variant="body1" color="error" gutterBottom>
              {loginDisplayError}
            </Typography>
          ) : (
            <div style={{ height: 25 }} />
          )}
        </Box>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          onChange={handleChange}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          onChange={handleChange}
          autoComplete="current-password"
        />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
        <Grid container>
          <Grid item xs>
            <Typography variant="body2" component="span">
              Forgot password?
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              variant="body2"
              component="span"
              onClick={switchToRegister}
              sx={{ cursor: "pointer", color: "primary.main" }}
            >
              {"Don't have an account? Sign Up"}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
