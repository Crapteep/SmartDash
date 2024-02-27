import { useState } from "react";
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
import axios from "axios";
import { Navigate } from "react-router-dom";


const defaultTheme = createTheme();

export default function Login() {
  const URL = import.meta.env.VITE_APP_API_URL;
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const [loginDisplayError, setLoginDisplayError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e) => {
    console.log(formData);
    e.preventDefault();
    
      axios
        .post(`${URL}/token/`, formData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then((response) => {
          localStorage.setItem("token", response.data.access_token);
          setRedirectToDashboard(true);
          resetForm();
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            setLoginDisplayError(error.response.data.detail);
          }
        });
    
  };

  const resetForm = () => {
    setFormData({
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
    if (loginDisplayError !== "") {
      setLoginDisplayError("");
    }
  };

  if (redirectToDashboard) {
    return <Navigate to="/" />;
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
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <Box>
                {/* Display information */}
                {loginDisplayError && (
                  <Typography variant="body1" color="error" gutterBottom>
                    {loginDisplayError}
                  </Typography>
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
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link to="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
}
