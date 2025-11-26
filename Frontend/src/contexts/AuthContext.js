import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios'; // 🛠️ Added for consistency

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setLoading(false);
  }, []);

  const validateTokenAndUserData = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser?.username) {
          console.error('Invalid user data found in local storage. Logging out.');
          logout();
          return;
        }

        // Use absolute backend URL to avoid proxy issues during validation
        const response = await axios.get('http://localhost:8080/api/auth/validate', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const freshUserData = response.data;
          setUser(freshUserData);
          // Refresh both stores to keep in sync with current persistence
          if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(freshUserData));
          }
          if (sessionStorage.getItem('token')) {
            sessionStorage.setItem('user', JSON.stringify(freshUserData));
          }
          setIsAuthenticated(true);
        } else {
          console.error('Token validation failed with status:', response.status);
          logout();
        }
      } catch (err) {
        console.error('Error during validation:', err);
        // Catch network errors and other issues, then log out
        logout();
      }
    } else {
      // No token or user data, ensure logged out state
      logout();
    }
    setLoading(false);
  }, [logout]);


  // ⭐ REVISED login function for direct update after successful API call from LoginPage
  const login = useCallback((token, userData) => {
    // Default to localStorage; callers may also have set sessionStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setLoading(false);
  }, []);

  const hasRole = useCallback((roleName) => {
    const roles = user?.roles;
    if (!roles || roles.length === 0) return false;
    const normalized = roles.map((r) =>
      typeof r === 'string' ? r : (r?.authority || r?.name || '')
    );
    if (normalized.includes(roleName)) return true;
    const plain = roleName.startsWith('ROLE_') ? roleName.substring(5) : roleName;
    return normalized.includes(plain) || normalized.includes(`ROLE_${plain}`);
  }, [user]);

  const getToken = useCallback(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }, []);

  useEffect(() => {
    validateTokenAndUserData();
  }, [validateTokenAndUserData]);


  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    hasRole,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};