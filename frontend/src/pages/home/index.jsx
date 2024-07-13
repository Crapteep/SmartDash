import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import Header from '../../components/home-page/Header';
import HeroSection from '../../components/home-page/HeroSection';
import FeaturesSection from '../../components/home-page/FeaturesSection';
import DeviceIntegrationSection from '../../components/home-page/DeviceIntegrationSection';
import DashboardSection from '../../components/home-page/DashboardPaper';
import Footer from '../../components/home-page/Footer';
import AuthModal from '../../components/AuthModal';
import { useNavigate } from 'react-router-dom';

function Home({ isLoggedIn, setIsLoggedIn }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn}>
  <Button color="inherit" onClick={handleOpenAuthModal}>Login</Button>
</Header>
      <HeroSection openAuthModal={handleOpenAuthModal} isLoggedIn={isLoggedIn}/>
      <FeaturesSection />
      <DeviceIntegrationSection />
      <DashboardSection />
      <Footer />
      <AuthModal open={isAuthModalOpen} onClose={handleCloseAuthModal} setIsLoggedIn={setIsLoggedIn} />
    </>
  );
}

export default Home;
