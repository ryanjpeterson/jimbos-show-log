import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// This is a custom hook to easily access auth state
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set the token in axios defaults
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const login = async (username, password) => {
    const { data } = await axios.post('/api/login', { username, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // This interceptor handles the "stale token" requirement
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout(); // Token is bad, log the user out
      }
      return Promise.reject(error);
    }
  );

  const value = {
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};