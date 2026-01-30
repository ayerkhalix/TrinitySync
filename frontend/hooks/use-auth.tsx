// hooks/use-auth.ts
'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth-service';
import type { User, LoginData, RegisterData } from '../types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // First check localStorage
      const storedUser = AuthService.getCurrentUser();
      
      // If token might be expired, try to refresh and fetch fresh user data
      if (storedUser && AuthService.isTokenExpired()) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          const freshUser = await AuthService.fetchCurrentUser();
          setUser(freshUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(storedUser);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const user = await AuthService.login(data);
      setUser(user);
      return { success: true, user };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed. Check credentials and ensure backend is running.' 
      };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await AuthService.register(data);
      if (result.user) {
        setUser(result.user);
      }
      return { success: true, message: result.message, user: result.user };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const freshUser = await AuthService.fetchCurrentUser();
    if (freshUser) {
      setUser(freshUser);
    }
    return freshUser;
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };
};