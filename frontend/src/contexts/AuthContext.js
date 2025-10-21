import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, users } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await users.getMe();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const register = async (data) => {
    const response = await auth.register(data);
    localStorage.setItem('token', response.data.token);
    // Fetch full user data including partner info
    await checkAuth();
    return response.data;
  };

  const login = async (data) => {
    const response = await auth.login(data);
    localStorage.setItem('token', response.data.token);
    // Fetch full user data including partner info
    await checkAuth();
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    refreshUser: checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};