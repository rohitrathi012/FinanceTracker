import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user details if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success) {
            setUser(res.user);
            applyTheme(res.user.theme);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to load profile', error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (emailOrUsername, password) => {
    const data = await api.post('/auth/login', { emailOrUsername, password });
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      applyTheme(data.user.theme);
      return data.user;
    }
  };

  const register = async (username, email, password) => {
    const data = await api.post('/auth/register', { username, email, password });
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      applyTheme(data.user.theme);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const data = await api.put('/auth/profile', profileData);
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  const updateSettings = async (settingsData) => {
    const data = await api.put('/auth/settings', settingsData);
    if (data.success) {
      setUser(data.user);
      if (settingsData.theme) {
        applyTheme(settingsData.theme);
      }
    }
    return data;
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
