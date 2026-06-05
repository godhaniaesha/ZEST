import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, authAPI, setAuthCheckComplete } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const applyToken = useCallback((nextToken) => {
    if (nextToken) {
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      setAuthCheckComplete(false);
      const stored = localStorage.getItem('token');

      if (stored) {
        applyToken(stored);
        try {
          const res = await authAPI.getMe();
          if (!cancelled) {
            setUser(res.data);
            setToken(stored);
          }
        } catch (error) {
          console.error('[Auth] Session invalid:', error.response?.data?.message || error.message);
          if (!cancelled) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            applyToken(null);
          }
        }
      } else {
        applyToken(null);
      }

      if (!cancelled) {
        setLoading(false);
        setAuthCheckComplete(true);
      }
    };

    initAuth();
    return () => {
      cancelled = true;
    };
  }, [applyToken]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password }, { meta: { source: 'Auth.login' } });
      const newToken = res.data.token;
      setToken(newToken);
      setUser(res.data.user);
      localStorage.setItem('token', newToken);
      applyToken(newToken);
      return { success: true, user: res.data.user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role }, { meta: { source: 'Auth.register' } });
      const newToken = res.data.token;
      setToken(newToken);
      setUser(res.data.user);
      localStorage.setItem('token', newToken);
      applyToken(newToken);
      return { success: true, user: res.data.user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    applyToken(null);
  };

  const updateProfile = async (payload) => {
    const res = await authAPI.updateProfile(payload);
    setUser(res.data);
    return res.data;
  };

  const updateProfileImage = async (formData) => {
    const res = await authAPI.updateProfileImage(formData);
    setUser(res.data);
    return res.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await authAPI.changePassword({ currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateProfileImage,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
