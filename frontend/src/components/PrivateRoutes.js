import { Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from 'axios';

const PrivateRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      console.log(localStorage.getItem('token'));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      axios.get(`${URL}/users/me`)
        .then(response => {
          setIsAuthenticated(true);
          setIsLoading(false);
        })
        .catch(error => {
          // Tutaj sprawdzamy czy błąd to wygasły token
          if (error.response && error.response.status === 401 && error.response.data.detail === "Token wygasł") {
            // Jeśli token wygasł, próbujemy odświeżyć go
            axios.post(`${URL}/refresh_token/`, { token: token })
              .then(response => {
                const newToken = response.data.access_token;
                localStorage.setItem('token', newToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                setIsAuthenticated(true);
                setIsLoading(false);
              })
              .catch(refreshError => {
                // Jeśli odświeżanie się nie powiodło, wylogowujemy użytkownika
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setIsLoading(false);
              });
          } else {
            // Jeśli błąd nie jest związany z wygaśnięciem tokenu, wylogowujemy użytkownika
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        });
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [URL]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    isAuthenticated ? <Outlet /> : <Navigate to="/login" />
  );
}

export default PrivateRoutes;
