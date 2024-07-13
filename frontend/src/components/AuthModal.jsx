import React, { useState } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import Login from '../pages/login';
import Register from '../pages/register';

function AuthModal({ open, onClose, setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        {isLogin ? (
          <Login 
            setIsLoggedIn={setIsLoggedIn} 
            onClose={onClose} 
            switchToRegister={switchToRegister} 
          />
        ) : (
          <Register 
            onClose={onClose} 
            switchToLogin={switchToLogin} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;