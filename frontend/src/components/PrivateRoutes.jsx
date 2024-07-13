import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../providers/UserProvider";

const PrivateRoutes = ({ setIsLoggedIn }) => {
  const { setUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      axios
        .get(`${URL}/api/v1/users/me`)
        .then((response) => {
          setUser(response.data);
          setIsAuthenticated(true);
          setIsLoading(false);
        })
        .catch((error) => {
          if (
            error.response &&
            error.response.status === 401 &&
            error.response.data.detail === "Token wygasł"
          ) {
            axios
              .post(`${URL}/api/v1/refresh_token/`, { token: token })
              .then((response) => {
                const newToken = response.data.access_token;
                localStorage.setItem("token", newToken);
                axios.defaults.headers.common[
                  "Authorization"
                ] = `Bearer ${newToken}`;
                setIsAuthenticated(true);
                setIsLoading(false);
              })
              .catch((refreshError) => {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                setIsLoggedIn(false);
                setIsLoading(false);
              });
          } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setIsLoggedIn(false);
            setIsLoading(false);
          }
        });
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [URL, setIsLoggedIn, setUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
