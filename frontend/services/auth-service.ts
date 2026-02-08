// services/auth-service.ts
import { LoginData, RegisterData, User, AuthResponse } from '../types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class AuthService {
  // Store tokens in localStorage
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static USER_KEY = 'user';

  // Login with email (or username)
  static async login(data: LoginData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/accounts/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(this.getErrorMessage(errorData));
    }

    const authData: AuthResponse = await response.json();

    // Store tokens in localStorage (already existing)
    this.setTokens(authData.access, authData.refresh);
    this.setCurrentUser(authData.user);

    // ✅ ADD THIS — store access token in cookie for middleware
    document.cookie = `access_token=${authData.access}; path=/; SameSite=Lax`;

    return authData.user;

    
    // Store tokens and user data
    this.setTokens(authData.access, authData.refresh);
    this.setCurrentUser(authData.user);
    
    return authData.user;
  }

  // Register new user
  static async register(data: RegisterData): Promise<{ message: string; user?: User }> {
    const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(this.getErrorMessage(errorData));
    }

    const result = await response.json();
    
    // Auto-login after registration if backend returns tokens
    if (response.status === 201 && result.access) {
      this.setTokens(result.access, result.refresh);
      this.setCurrentUser(result.user);
      return { message: result.message, user: result.user };
    }
    
    return { message: result.message || 'Registration successful' };
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/accounts/auth/logout/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }

    // ✅ clear cookie for middleware
    document.cookie = 'access_token=; Max-Age=0; path=/;';

    // clear local storage
    this.clearTokens();
    this.clearCurrentUser();
  }


  // Get current user from localStorage
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Get current access token
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    return !!token && !!user;
  }

  // Refresh access token
  static async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem(this.ACCESS_TOKEN_KEY, data.access);
      return data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout(); // Force logout on refresh failure
      return null;
    }
  }

  // Get auth headers for API calls
  static getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  // Check if token is expired (client-side estimation)
  static isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  // Fetch user data from /me/ endpoint
  static async fetchCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/me/`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const user = await response.json();
        this.setCurrentUser(user);
        return user;
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry with new token
          return this.fetchCurrentUser();
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }

    return null;
  }

  // Private helper methods
  private static setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
  }

  private static setCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private static clearCurrentUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  private static getErrorMessage(errorData: any): string {
    if (typeof errorData === 'string') return errorData;
    
    if (errorData.email) return errorData.email;
    if (errorData.password) return errorData.password;
    if (errorData.detail) return errorData.detail;
    if (errorData.non_field_errors) {
      return Array.isArray(errorData.non_field_errors) 
        ? errorData.non_field_errors[0]
        : errorData.non_field_errors;
    }
    
    return 'An error occurred';
  }
}

export { AuthService };