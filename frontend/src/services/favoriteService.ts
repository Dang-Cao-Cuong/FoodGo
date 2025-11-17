import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
const TOKEN_KEY = '@foodgo_token'; // Sử dụng cùng key với authService

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export interface Favorite {
  id: number;
  user_id: number;
  favorite_type: 'restaurant' | 'menu_item';
  favorite_id: number;
  created_at: string;
  restaurant?: {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    cover_url: string;
    is_open: boolean;
    rating: number;
  };
  menu_item?: {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category_id: number;
    restaurant_id: number;
    is_available: boolean;
    rating: number;
  };
}

export interface FavoritesResponse {
  success: boolean;
  data: {
    favorites: Favorite[];
    count: number;
    pagination: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface AddFavoriteRequest {
  favorite_type: 'restaurant' | 'menu_item';
  favorite_id: number;
}

export interface CheckFavoriteResponse {
  success: boolean;
  data: {
    is_favorite: boolean;
  };
}

const favoriteService = {
  /**
   * Add a favorite (restaurant or menu item)
   */
  addFavorite: async (favoriteType: 'restaurant' | 'menu_item', favoriteId: number): Promise<Favorite> => {
    try {
      const response = await api.post('/favorites', {
        favorite_type: favoriteType,
        favorite_id: favoriteId,
      });
      return response.data.data.favorite;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Remove a favorite by ID
   */
  removeFavorite: async (favoriteId: number): Promise<void> => {
    try {
      await api.delete(`/favorites/${favoriteId}`);
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Remove a favorite by type and ID
   */
  removeFavoriteByTypeAndId: async (favoriteType: 'restaurant' | 'menu_item', favoriteId: number): Promise<void> => {
    try {
      await api.delete(`/favorites/${favoriteType}/${favoriteId}`);
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get all favorites for the current user
   */
  getMyFavorites: async (options?: {
    type?: 'restaurant' | 'menu_item';
    limit?: number;
    offset?: number;
  }): Promise<FavoritesResponse> => {
    try {
      const params: any = {};
      if (options?.type) params.type = options.type;
      if (options?.limit) params.limit = options.limit;
      if (options?.offset) params.offset = options.offset;

      const response = await api.get('/favorites/my-favorites', { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get restaurant favorites only
   */
  getRestaurantFavorites: async (): Promise<Favorite[]> => {
    try {
      const response = await api.get('/favorites/restaurants');
      return response.data.data.favorites;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get menu item favorites only
   */
  getMenuItemFavorites: async (): Promise<Favorite[]> => {
    try {
      const response = await api.get('/favorites/menu-items');
      return response.data.data.favorites;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Check if an item is favorited
   */
  checkFavoriteStatus: async (favoriteType: 'restaurant' | 'menu_item', favoriteId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/favorites/check/${favoriteType}/${favoriteId}`);
      return response.data.data.is_favorite;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Toggle favorite status (add if not favorited, remove if favorited)
   */
  toggleFavorite: async (favoriteType: 'restaurant' | 'menu_item', favoriteId: number): Promise<boolean> => {
    try {
      const isFavorited = await favoriteService.checkFavoriteStatus(favoriteType, favoriteId);
      
      if (isFavorited) {
        await favoriteService.removeFavoriteByTypeAndId(favoriteType, favoriteId);
        return false;
      } else {
        await favoriteService.addFavorite(favoriteType, favoriteId);
        return true;
      }
    } catch (error: any) {
      throw error;
    }
  },
};

export default favoriteService;
