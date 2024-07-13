import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';
import temp from '../../assets/temp.png'

const DashboardPaper = styled(Paper)(({ theme }) => ({
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
  

const DashboardSection = () => {
  return (
    <Container id="dashboard" sx={{ py: 5 }}>
      <Typography variant="h3" component="h2" gutterBottom align="center">
        Custom Dashboards
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <DashboardPaper>
          <ResponsiveImage src={temp} alt="dashboard1" />
            <Typography variant="h6" gutterBottom>
              Temperature Monitoring
            </Typography>
            <Typography>
              Monitor and control the temperature of your devices.
            </Typography>
          </DashboardPaper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <DashboardPaper>
          <ResponsiveImage src={temp} alt="dashboard2" />
            <Typography variant="h6" gutterBottom>
              Home Automation
            </Typography>
            <Typography>
              Automate and control your home appliances.
            </Typography>
          </DashboardPaper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <DashboardPaper>
          <ResponsiveImage src={temp} alt="dashboard3" />
            <Typography variant="h6" gutterBottom>
              Energy Management
            </Typography>
            <Typography>
              Track and manage your energy consumption.
            </Typography>
          </DashboardPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardSection;