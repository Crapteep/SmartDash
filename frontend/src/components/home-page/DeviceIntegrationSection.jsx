import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';
import rpi from '../../assets/rpi.jpg';
import arduino from '../../assets/arduino.jpg'
import stm32 from '../../assets/stm32.jpg'


const DevicePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));


const ResponsiveImage = styled('img')({
  width: '100%',
  height: 'auto',
  flexGrow: 1,
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '16px',
});

const DeviceIntegrationSection = () => {
  return (
    <Container id="devices" sx={{ py: 5 }}>
      <Typography variant="h3" component="h2" gutterBottom align="center">
        Device Integrations
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <DevicePaper>
            <ResponsiveImage src={rpi} alt="Raspberry Pi" />
            <div>
              <Typography variant="h6" gutterBottom>
                Raspberry Pi
              </Typography>
              <Typography>
                Integrate your Raspberry Pi with our platform.
              </Typography>
            </div>
          </DevicePaper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DevicePaper>
            <ResponsiveImage src={arduino} alt="Arduino" />
            <div>
              <Typography variant="h6" gutterBottom>
                Arduino
              </Typography>
              <Typography>
                Connect your Arduino boards and control them remotely.
              </Typography>
            </div>
          </DevicePaper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DevicePaper>
            <ResponsiveImage src={stm32} alt="STM32" />
            <div>
              <Typography variant="h6" gutterBottom>
                STM32
              </Typography>
              <Typography>
                Manage your STM32 devices with our easy-to-use dashboard.
              </Typography>
            </div>
          </DevicePaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DeviceIntegrationSection;
