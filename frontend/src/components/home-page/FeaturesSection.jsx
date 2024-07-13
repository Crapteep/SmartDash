import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';

const FeaturePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const FeaturesSection = () => {
  return (
    <Container id="features" sx={{ py: 8 }}>
      <Typography variant="h3" component="h2" gutterBottom align="center">
        Features
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <FeaturePaper>
            <Typography variant="h6" gutterBottom>
              Customizable Dashboards
            </Typography>
            <Typography>
              Create and customize your own dashboards with ease.
            </Typography>
          </FeaturePaper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FeaturePaper>
            <Typography variant="h6" gutterBottom>
              Real-time Data
            </Typography>
            <Typography>
              Monitor and control your devices in real-time.
            </Typography>
          </FeaturePaper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FeaturePaper>
            <Typography variant="h6" gutterBottom>
              Secure Connections
            </Typography>
            <Typography>
              Securely connect and manage your IoT devices.
            </Typography>
          </FeaturePaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FeaturesSection;