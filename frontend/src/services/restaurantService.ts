import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
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

// Types
export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address: string;
  phone?: string;
  cover_url?: string;
  is_open: boolean;
  created_at: string;
}

export interface RestaurantListParams {
  q?: string;           // Search query
  categoryId?: number;  // Filter by category
  limit?: number;       // Results per page
  offset?: number;      // Pagination offset
}

export interface RestaurantListResponse {
  success: boolean;
  data: {
    restaurants: Restaurant[];
    count: number;
    limit: number;
    offset: number;
  };
}

export interface RestaurantDetailResponse {
  success: boolean;
  data: {
    restaurant: Restaurant;
  };
}

// Restaurant Service
class RestaurantService {
  /**
   * Get all restaurants with optional filters
   */
  async getRestaurants(params: RestaurantListParams = {}): Promise<RestaurantListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.q) queryParams.append('q', params.q);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString();
      const url = queryString ? `/restaurants?${queryString}` : '/restaurants';
      
      const response = await api.get<RestaurantListResponse>(url);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(id: number): Promise<Restaurant> {
    try {
      const response = await api.get<RestaurantDetailResponse>(`/restaurants/${id}`);
      
      if (response.data.success) {
        return response.data.data.restaurant;
      }
      
      throw new Error('Failed to get restaurant details');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Search restaurants by name or description
   */
  async searchRestaurants(query: string, limit: number = 20): Promise<Restaurant[]> {
    try {
      const response = await this.getRestaurants({ q: query, limit });
      return response.data.restaurants;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get restaurants by category
   */
  async getRestaurantsByCategory(categoryId: number, limit: number = 20): Promise<Restaurant[]> {
    try {
      const response = await this.getRestaurants({ categoryId, limit });
      return response.data.restaurants;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get paginated restaurants
   */
  async getPaginatedRestaurants(page: number = 1, limit: number = 20): Promise<RestaurantListResponse> {
    try {
      const offset = (page - 1) * limit;
      return await this.getRestaurants({ limit, offset });
    } catch (error: any) {
      throw this.handleError(error);
    }
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

export default new RestaurantService();
