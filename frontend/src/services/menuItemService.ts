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
export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  price: number;
  discounted_price?: number;
  category?: string;
  is_available: boolean;
  is_featured: boolean;
  preparation_time: number;
  calories?: number;
  ingredients?: string;
  allergens?: string;
  average_rating: number;
  total_reviews: number;
  created_at: string;
}

export interface MenuItemListParams {
  restaurantId?: number;    // Filter by restaurant
  category?: string;        // Filter by category
  q?: string;              // Search query
  isAvailable?: boolean;   // Filter by availability
  isFeatured?: boolean;    // Filter featured items
  limit?: number;          // Results per page
  offset?: number;         // Pagination offset
}

export interface MenuItemListResponse {
  success: boolean;
  data: {
    menuItems: MenuItem[];
    count: number;
    limit: number;
    offset: number;
  };
}

export interface MenuItemDetailResponse {
  success: boolean;
  data: MenuItem;
}

// Menu Item Service
class MenuItemService {
  /**
   * Get all menu items with optional filters
   */
  async getMenuItems(params: MenuItemListParams = {}): Promise<MenuItemListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.restaurantId) queryParams.append('restaurantId', params.restaurantId.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.q) queryParams.append('q', params.q);
      if (params.isAvailable !== undefined) queryParams.append('isAvailable', params.isAvailable.toString());
      if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString();
      const url = queryString ? `/menu-items?${queryString}` : '/menu-items';
      
      const response = await api.get<MenuItemListResponse>(url);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get menu item by ID
   */
  async getMenuItemById(id: number): Promise<MenuItem> {
    try {
      const response = await api.get<MenuItemDetailResponse>(`/menu-items/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to get menu item details');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get menu for a specific restaurant
   */
  async getRestaurantMenu(restaurantId: number, category?: string): Promise<MenuItem[]> {
    try {
      const params: MenuItemListParams = {
        restaurantId,
        isAvailable: true,
        limit: 100, // Get all available items
      };
      
      if (category) {
        params.category = category;
      }
      
      const response = await this.getMenuItems(params);
      return response.data.menuItems;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get featured menu items
   */
  async getFeaturedMenuItems(limit: number = 10): Promise<MenuItem[]> {
    try {
      const response = await this.getMenuItems({
        isFeatured: true,
        isAvailable: true,
        limit,
      });
      return response.data.menuItems;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Search menu items across all restaurants
   */
  async searchMenuItems(query: string, limit: number = 50): Promise<MenuItem[]> {
    try {
      const response = await this.getMenuItems({
        q: query,
        isAvailable: true,
        limit,
      });
      return response.data.menuItems;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get menu items by category
   */
  async getMenuItemsByCategory(category: string, limit: number = 50): Promise<MenuItem[]> {
    try {
      const response = await this.getMenuItems({
        category,
        isAvailable: true,
        limit,
      });
      return response.data.menuItems;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get paginated menu items
   */
  async getPaginatedMenuItems(
    page: number = 1,
    limit: number = 20,
    filters?: Omit<MenuItemListParams, 'limit' | 'offset'>
  ): Promise<MenuItemListResponse> {
    try {
      const offset = (page - 1) * limit;
      return await this.getMenuItems({ ...filters, limit, offset });
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

export default new MenuItemService();
