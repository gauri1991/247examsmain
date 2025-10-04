"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, type LoginData, type RegisterData } from '@/lib/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  mobileLogin: (data: { phone: string; otp: string }) => Promise<void>;
  mobilePasswordLogin: (data: { phone: string; password: string }) => Promise<void>;
  mobileRegister: (data: { phone: string; otp: string; first_name?: string; last_name?: string }) => Promise<void>;
  mobilePasswordRegister: (data: { phone: string; otp: string; password: string; confirm_password: string; first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already logged in on app start
    const initAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const currentUser = apiService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await apiService.login(data);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await apiService.register(data);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mobileLogin = async (data: { phone: string; otp: string }) => {
    try {
      setLoading(true);
      const response = await apiService.mobileLogin(data);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mobilePasswordLogin = async (data: { phone: string; password: string }) => {
    try {
      setLoading(true);
      const response = await apiService.mobilePasswordLogin(data);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mobileRegister = async (data: { phone: string; otp: string; first_name?: string; last_name?: string }) => {
    try {
      setLoading(true);
      const response = await apiService.mobileRegister(data);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mobilePasswordRegister = async (data: { phone: string; otp: string; password: string; confirm_password: string; first_name?: string; last_name?: string }) => {
    try {
      setLoading(true);
      const response = await apiService.mobilePasswordRegister(data);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    mobileLogin,
    mobilePasswordLogin,
    mobileRegister,
    mobilePasswordRegister,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}