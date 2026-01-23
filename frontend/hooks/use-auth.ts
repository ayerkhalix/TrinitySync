// hooks/use-auth.ts
'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth-service';
import type { User, LoginData, RegisterData } from '../types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      const user = await AuthService.login(data);
      setUser(user);
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await AuthService.register(data);
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};