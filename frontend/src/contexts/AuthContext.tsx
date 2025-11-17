import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService, { 
  User, 
  RegisterData, 
  LoginData, 
  UpdateProfileData,
  ChangePasswordData 
} from '../services/authService';

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
      const storedUser = await authService.getStoredUser();
      const token = await authService.getToken();

      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // Optionally refresh profile from server
        try {
          const freshProfile = await authService.getProfile();
          setUser(freshProfile);
        } catch (error) {
          // If refresh fails, use stored user
          console.warn('Failed to refresh profile:', error);
        }
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
      const response = await authService.login(data);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
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
      const response = await authService.register(data);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
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
      await authService.logout();
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
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
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
      await authService.changePassword(data);
    } catch (error) {
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
      const freshProfile = await authService.getProfile();
      setUser(freshProfile);
    } catch (error) {
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
