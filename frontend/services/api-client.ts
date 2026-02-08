// services/api-client.ts
import axios from 'axios';
import { AuthService } from './auth-service';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and validate payloads
apiClient.interceptors.request.use(
  async (config) => {
    const token = AuthService.getAccessToken();
    
    // Validate payload to prevent legacy field usage
    if (config.data) {
      // Warn if using legacy instructor_name field
      if (config.data.instructor_name) {
        console.warn('❌ DEPRECATED: instructor_name should not be in payload. Use instructor (UUID) instead.');
        delete config.data.instructor_name;
      }
      
      // Warn if using numeric IDs instead of UUIDs
      if (typeof config.data.instructor_id === 'number') {
        console.warn('❌ DEPRECATED: instructor_id should be UUID string, not number.');
      }
      
      // Ensure instructor field is either UUID string or null
      if (config.data.instructor && typeof config.data.instructor !== 'string') {
        console.warn('❌ ERROR: instructor must be UUID string or null, got:', typeof config.data.instructor);
      }
    }
    
    // If token is expired, try to refresh it
    if (token && AuthService.isTokenExpired()) {
      const newToken = await AuthService.refreshToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
      } else {
        // Token refresh failed - will trigger 401 in response interceptor
        delete config.headers.Authorization;
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const newToken = await AuthService.refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } else {
        // Refresh failed - logout user
        AuthService.logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };