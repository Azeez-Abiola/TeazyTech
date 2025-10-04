import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from "axios";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const getAuthAdmin = async () => {
      try {
        const response = await axios.get(`/api/admin/me`, { 
          withCredentials: true,
          signal: controller.signal
        });
        if (isMounted) {
          setUser(response.data);
          setIsAuthenticated(true); 
          setError(null);
        }
      } catch(error) {
        if (isMounted && !axios.isCancel(error)) {
          setUser(null);
          setIsAuthenticated(false);
          setError("");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    getAuthAdmin();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/admin/login`, 
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data);
      setIsAuthenticated(true); 
      setError(null);
      return true;
    } catch(error) {
      setError(error.response?.data?.error || "Login failed");
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`/api/admin/logout`, 
        {},
        { withCredentials: true }
      );
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch(error) {
      setError("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated, 
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};