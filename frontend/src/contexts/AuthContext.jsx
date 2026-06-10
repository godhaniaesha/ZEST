import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/';
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put(`/users/${user._id || user.id}`, data);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const updateProfileImage = async (formData) => {
    try {
      const res = await api.put(`/users/${user._id || user.id}`, formData);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Image upload failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, updateProfileImage, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
