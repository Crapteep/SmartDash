import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import { Link, useNavigate } from 'react-router-dom';

const HeroContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f4f4f4',
  padding: theme.spacing(8, 0),
  textAlign: 'center',
}));

const HeroSection = ({ openAuthModal, isLoggedIn }) => {
    const navigate = useNavigate();
    const handleGetStarted = () => {
      if (isLoggedIn) {
        navigate('/dashboard')
      } else {
        openAuthModal();
      }
    };
  return (
    <HeroContainer>
      <Container>
        <Typography variant="h2" component="h1" gutterBottom>
          Manage Your IoT Devices with Ease
        </Typography>
        <Typography variant="h5" component="p" gutterBottom>
          Create customizable dashboards for your Raspberry Pi, Arduino, ESP32, and more.
        </Typography>
        <Button onClick={handleGetStarted} variant="contained" color="primary" size="large">
          Get Started
        </Button>
      </Container>
    </HeroContainer>
  );
};

export default HeroSection;