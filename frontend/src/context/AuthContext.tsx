import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'freelancer' | 'client';
  preferred_currency: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; role: string; preferred_currency: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('paylance_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('paylance_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const newToken = res.data.access_token;
    localStorage.setItem('paylance_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
  };

  const register = async (data: { email: string; password: string; full_name: string; role: string; preferred_currency: string }) => {
    const res = await api.post('/auth/register', data);
    const newToken = res.data.access_token;
    localStorage.setItem('paylance_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('paylance_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
