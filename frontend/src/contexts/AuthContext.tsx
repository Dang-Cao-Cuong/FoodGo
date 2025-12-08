import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// ==================== API CONFIGURATION ====================
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
    return 'http://localhost:3000/api';
  }
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getBaseURL();

// ==================== INTERFACES ====================
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Context Types
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  /**
   * Load user from AsyncStorage
   */
  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      console.log('Loading stored user...');

      const token = await AsyncStorage.getItem('@foodgo_token');
      const storedUserStr = await AsyncStorage.getItem('@foodgo_user');

      if (storedUserStr && token) {
        const storedUser = JSON.parse(storedUserStr);
        setUser(storedUser);
        setIsAuthenticated(true);
        console.log('Stored user loaded:', storedUser.email);

        // Optionally refresh profile from server
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Backend returns: { success, data: { user } }
          const freshUser = response.data.data?.user;
          if (freshUser) {
            setUser(freshUser);
            await AsyncStorage.setItem('@foodgo_user', JSON.stringify(freshUser));
            console.log('Profile refreshed from server');
          }
        } catch (error) {
          // If refresh fails, use stored user
          console.warn('Failed to refresh profile:', error);
        }
      } else {
        console.log('No stored user found');
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      console.log('Logging in:', data.email);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, data);

      // Backend returns: { success, message, data: { user, accessToken, expiresIn } }
      const { user, accessToken } = response.data.data;

      // Validate token and user exist
      if (!accessToken || !user) {
        console.error('Response data:', response.data);
        throw new Error('Invalid response: missing token or user data');
      }

      console.log('🔑 Storing token and user:', {
        token: accessToken.substring(0, 20) + '...',
        userEmail: user.email
      });

      // Store token and user
      await AsyncStorage.setItem('@foodgo_token', accessToken);
      await AsyncStorage.setItem('@foodgo_user', JSON.stringify(user));

      console.log('✅ Token and user stored successfully');

      setUser(user);
      setIsAuthenticated(true);
      console.log('Login successful:', user.email);
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);

      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', errorMessage);

      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      console.log('Registering user:', data.email);

      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);

      console.log('Registration response:', JSON.stringify(response.data, null, 2));

      // Backend returns: { success, message, data: { user, accessToken, expiresIn } }
      const responseData = response.data?.data;

      if (!responseData) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response: missing data object');
      }

      const { user, accessToken } = responseData;

      // Validate token and user exist
      if (!accessToken || !user) {
        console.error('Missing required fields:', { hasToken: !!accessToken, hasUser: !!user });
        throw new Error('Invalid response: missing token or user data');
      }

      // Store token and user
      await AsyncStorage.setItem('@foodgo_token', accessToken);
      await AsyncStorage.setItem('@foodgo_user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      console.log('Registration successful:', user.email);
    } catch (error: any) {
      console.error('Registration error:', JSON.stringify(error.response?.data || error.message, null, 2));
      if (error.response?.data) {
        console.error('Full error response:', error.response.data);
      }
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('Logging out...');

      // Clear stored data
      await AsyncStorage.removeItem('@foodgo_token');
      await AsyncStorage.removeItem('@foodgo_user');

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      console.log('Updating profile...');

      const token = await AsyncStorage.getItem('@foodgo_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`${API_BASE_URL}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend returns: { success, message, data: { user } }
      const updatedUser = response.data.data?.user;
      if (updatedUser) {
        await AsyncStorage.setItem('@foodgo_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change password
   */
  const changePassword = async (data: ChangePasswordData) => {
    try {
      setIsLoading(true);
      console.log('Changing password...');

      const token = await AsyncStorage.getItem('@foodgo_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(`${API_BASE_URL}/auth/change-password`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Password changed successfully');
    } catch (error: any) {
      console.error('Change password error:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh profile from server
   */
  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      console.log('Refreshing profile...');

      const token = await AsyncStorage.getItem('@foodgo_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend returns: { success, data: { user } }
      const freshProfile = response.data.data?.user;
      if (freshProfile) {
        await AsyncStorage.setItem('@foodgo_user', JSON.stringify(freshProfile));
        setUser(freshProfile);
        console.log('Profile refreshed successfully');
      }
    } catch (error: any) {
      console.error('Refresh profile error:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
