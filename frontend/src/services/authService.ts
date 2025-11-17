import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
// For Android Emulator, use 10.0.2.2 instead of localhost
// For physical device, use your computer's IP address
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // If using physical device, use your computer's IP:
      return 'http://192.168.1.4:3000/api'; // Physical Device
      // If using emulator, use: 'http://10.0.2.2:3000/api'
      // real device 'http://192.168.1.4:3000/api'
    }
    return 'http://localhost:3000/api'; // iOS Simulator
  }
  return 'https://your-production-api.com/api'; // Production
};

const API_BASE_URL = getBaseURL();
const TOKEN_KEY = '@foodgo_token';
const USER_KEY = '@foodgo_user';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_verified: boolean;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    expiresIn: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Auth Service
class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      if (response.data.success) {
        // Save token and user data
        await AsyncStorage.setItem(TOKEN_KEY, response.data.data.accessToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      
      if (response.data.success) {
        // Save token and user data
        await AsyncStorage.setItem(TOKEN_KEY, response.data.data.accessToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<ProfileResponse>('/auth/profile');
      
      if (response.data.success) {
        // Update stored user data
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
        return response.data.data.user;
      }
      
      throw new Error('Failed to get profile');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put<ProfileResponse>('/auth/profile', data);
      
      if (response.data.success) {
        // Update stored user data
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
        return response.data.data.user;
      }
      
      throw new Error('Failed to update profile');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const response = await api.post('/auth/change-password', data);
      
      if (!response.data.success) {
        throw new Error('Failed to change password');
      }
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Get stored token
   */
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get stored user
   */
  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new AuthService();
