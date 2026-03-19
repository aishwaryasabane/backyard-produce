import React, { createContext, useContext, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState(null);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        avatar: res.user.avatar ?? null,
        neighborhood: res.user.neighborhood ?? null,
      });
    } catch (e) {
      setAuthError(e.detail || e.message || 'Login failed');
      throw e;
    }
  };

  const register = async (name, email, password, neighborhood) => {
    setAuthError(null);
    try {
      const res = await api.register({ name, email, password, neighborhood });
      setToken(res.access_token);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        avatar: res.user.avatar ?? null,
        neighborhood: res.user.neighborhood ?? null,
      });
    } catch (e) {
      setAuthError(e.detail || e.message || 'Registration failed');
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
