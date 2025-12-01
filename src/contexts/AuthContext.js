import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Verify token validity on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Try to fetch current user with the stored token
          // This verifies the token is still valid
          const response = await authAPI.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          // Token is invalid or expired
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const register = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    toast.success(`Welcome, ${userData.name}! Your account has been created.`);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.info('You have been logged out.');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    toast.success('Profile updated successfully!');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

