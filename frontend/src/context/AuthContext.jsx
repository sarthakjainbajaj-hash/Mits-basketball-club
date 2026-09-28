import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('hoopscore_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('hoopscore_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('hoopscore_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('hoopscore_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Auth token verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res?.data) {
      const { token: receivedToken, ...userData } = res.data;
      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('hoopscore_token', receivedToken);
      localStorage.setItem('hoopscore_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Invalid response from login server');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res?.data) {
      const { token: receivedToken, ...userObj } = res.data;
      setToken(receivedToken);
      setUser(userObj);
      localStorage.setItem('hoopscore_token', receivedToken);
      localStorage.setItem('hoopscore_user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error('Invalid response from registration server');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hoopscore_token');
    localStorage.removeItem('hoopscore_user');
  };

  const isAdmin = user?.role === 'admin';
  const isScorer = user?.role === 'scorer' || user?.role === 'admin';
  const isViewer = user?.role === 'viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isScorer,
        isViewer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
