import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export const UserContext = createContext();

const refreshAuthToken = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (data.token) {
    localStorage.setItem('token', data.token);
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get("https://comptaonline.linkpc.net/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.log("Erreur lors de la récupération des données de l'utilisateur :", error);
      } finally {
        setLoading(false);
      }
    };

    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        // Si le token expire dans moins de 5 minutes
        if (decodedToken.exp - currentTime < 300) {
          refreshAuthToken();
        }
      }
    };

    fetchUserData();
    const interval = setInterval(checkTokenExpiration, 60000); // Vérifie toutes les minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
        <Box sx={{ display: 'flex' }}>
          <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw',
              }}
          >
            <CircularProgress />
          </div>
        </Box>
    );
  }

  return (
      <UserContext.Provider value={{ user, setUser, selectedClient, setSelectedClient }}>
        {children}
      </UserContext.Provider>
  );
};
