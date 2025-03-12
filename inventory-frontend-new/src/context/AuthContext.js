import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const user = AuthService.getCurrentUser();
      console.log("Auth context - checking current user:", user ? "User logged in" : "No user");
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    checkUser();
    
    // Add a listener for storage events to handle logout in other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);
      console.log("Login successful:", response);
      setCurrentUser(response);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logout called");
    AuthService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await AuthService.register(name, email, password, role);
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const isAuthenticated = () => {
    return !!currentUser;
  };

  const isAdmin = () => {
    return currentUser && currentUser.roles && currentUser.roles.includes('ADMIN');
  };

  const isManager = () => {
    return currentUser && currentUser.roles && 
      (currentUser.roles.includes('MANAGER') || currentUser.roles.includes('ADMIN'));
  };

  const refreshAuthState = () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    isAuthenticated,
    isAdmin,
    isManager,
    refreshAuthState,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};