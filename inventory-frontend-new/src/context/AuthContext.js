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
    if (!currentUser) return false;
    
    // Check if roles exist as an array
    if (Array.isArray(currentUser.roles)) {
      return currentUser.roles.includes('ADMIN') || currentUser.roles.includes('ROLE_ADMIN');
    }
    
    // Check if it's stored as a single string
    if (typeof currentUser.role === 'string') {
      return currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN';
    }
    
    // Try to decode the token manually to check its contents
    try {
      if (currentUser.token) {
        const payload = JSON.parse(atob(currentUser.token.split('.')[1]));
        console.log("JWT payload:", payload);
        
        // Check different possible structures in the token payload
        if (payload.auth && Array.isArray(payload.auth)) {
          return payload.auth.includes('ADMIN') || payload.auth.includes('ROLE_ADMIN');
        }
        
        if (payload.authorities && Array.isArray(payload.authorities)) {
          return payload.authorities.some(auth => 
            auth === 'ADMIN' || auth === 'ROLE_ADMIN' || 
            auth.authority === 'ADMIN' || auth.authority === 'ROLE_ADMIN');
        }
        
        if (payload.role) {
          return payload.role === 'ADMIN' || payload.role === 'ROLE_ADMIN';
        }
      }
    } catch (e) {
      console.error("Error parsing JWT token:", e);
    }
    
    return false;
  };

  const isManager = () => {
    if (!currentUser) return false;
    
    // Check if roles exist as an array
    if (Array.isArray(currentUser.roles)) {
      return currentUser.roles.some(role => 
        ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(role));
    }
    
    // Check if it's stored as a single string
    if (typeof currentUser.role === 'string') {
      return ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(currentUser.role);
    }
    
    // Try to decode the token manually to check its contents
    try {
      if (currentUser.token) {
        const payload = JSON.parse(atob(currentUser.token.split('.')[1]));
        
        // Check different possible structures in the token payload
        if (payload.auth && Array.isArray(payload.auth)) {
          return payload.auth.some(auth => 
            ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(auth));
        }
        
        if (payload.authorities && Array.isArray(payload.authorities)) {
          return payload.authorities.some(auth => {
            if (typeof auth === 'string') {
              return ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(auth);
            } else if (auth.authority) {
              return ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(auth.authority);
            }
            return false;
          });
        }
        
        if (payload.role) {
          return ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(payload.role);
        }
      }
    } catch (e) {
      console.error("Error parsing JWT token in isManager:", e);
    }
    
    return false;
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