import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import { styled } from '@mui/system';

const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  padding: theme.spacing(4, 0),
}));

const Footer = () => {
  return (
    <FooterContainer id="contact">
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="body1" align="center">
              Contact me at: crapteep@gmail.com
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" align="center">
              Follow me:
            </Typography>
            <Grid container justifyContent="center" spacing={2}>
              <Grid item>
                <a href="https://www.linkedin.com/in/michalgiera/" style={{ color: 'inherit' }}>LinkedIn</a>
              </Grid>
              <Grid item>
                <a href="https://github.com/Crapteep" style={{ color: 'inherit' }}>GitHub</a>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </FooterContainer>
  );
};

export default Footer;