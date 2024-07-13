import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import Header from '../../components/home-page/Header';
import HeroSection from '../../components/home-page/HeroSection';
import FeaturesSection from '../../components/home-page/FeaturesSection';
import DeviceIntegrationSection from '../../components/home-page/DeviceIntegrationSection';
import DashboardSection from '../../components/home-page/DashboardPaper';
import Footer from '../../components/home-page/Footer';
import AuthModal from '../../components/AuthModal';

function Home({setIsLoggedIn}) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <Header>
        <Box>
          <Button color="inherit" onClick={handleOpenAuthModal}>Login</Button>
        </Box>
      </Header>
      <HeroSection openAuthModal={handleOpenAuthModal}/>
      <FeaturesSection />
      <DeviceIntegrationSection />
      <DashboardSection />
      <Footer />
      <AuthModal open={isAuthModalOpen} onClose={handleCloseAuthModal} setIsLoggedIn={setIsLoggedIn} />
    </>
  );
}

export default Home;