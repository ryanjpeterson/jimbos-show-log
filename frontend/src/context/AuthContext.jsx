import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// 1. Fix: Move non-component exports to a separate file ideally, 
// but for now, we can keep this if we accept the warning or 
// ensure Fast Refresh can handle it. 
// The strict fix is splitting this file, but for this project size, 
// we will focus on the functional errors first.

export const useAuth = () => {
  return useContext(AuthContext);
};

// Helper to check if a token is expired
// Moved outside component to avoid recreation
const isTokenExpired = (tokenString) => {
  if (!tokenString) return true;
  try {
    const decoded = jwtDecode(tokenString);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    // 2. Fix: Removed unused 'error' variable
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  // Initialize state based on localStorage directly to avoid effect updates
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    // 3. Fix: Check expiration immediately during initialization
    if (storedToken && !isTokenExpired(storedToken)) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      return storedToken;
    }
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    return null;
  });

  // Derive isAuthenticated from token presence
  const isAuthenticated = !!token;

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const login = async (username, password) => {
    const { data } = await axios.post('/api/login', { username, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  // Effect: Periodic Check for Expiration
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        console.log("Token expired locally. Logging out.");
        logout();
        window.location.href = '/login'; 
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [token, logout]);

  // Effect: Axios Interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  const value = {
    token,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};