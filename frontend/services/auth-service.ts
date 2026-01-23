// services/auth-service.ts
import { api } from './api-client';
import { LoginData, RegisterData, User } from '@/types/user';

export class AuthService {
  static async login(data: LoginData) {
    const response = await api.post('/auth/login/', data);
    const { access, refresh, user } = response.data;
    
    // Store tokens and user data
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }
  
  static async register(data: RegisterData) {
    const response = await api.post('/auth/register/', data);
    return response.data;
  }
  
  static async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }
  
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }
}