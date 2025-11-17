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

export interface Review {
  id: number;
  user_id: number;
  restaurant_id?: number;
  menu_item_id?: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
  restaurant_name?: string;
  menu_item_name?: string;
  menu_item_image?: string;
}

export interface RatingStats {
  average_rating: number;
  review_count: number;
  rating_distribution: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    count: number;
    rating_stats?: RatingStats;
    pagination?: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface CreateReviewRequest {
  restaurant_id?: number;
  menu_item_id?: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

const reviewService = {
  /**
   * Create a new review
   */
  createReview: async (reviewData: CreateReviewRequest): Promise<Review> => {
    try {
      if (!reviewData.restaurant_id && !reviewData.menu_item_id) {
        throw new Error('Either restaurant_id or menu_item_id is required');
      }

      const response = await api.post('/reviews', reviewData);
      return response.data.data.review;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get reviews for a restaurant
   */
  getRestaurantReviews: async (
    restaurantId: number,
    options?: {
      rating?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<ReviewsResponse> => {
    try {
      const params: any = {};
      if (options?.rating) params.rating = options.rating;
      if (options?.limit) params.limit = options.limit;
      if (options?.offset) params.offset = options.offset;

      const response = await api.get(`/reviews/restaurant/${restaurantId}`, { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get reviews for a menu item
   */
  getMenuItemReviews: async (
    menuItemId: number,
    options?: {
      rating?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<ReviewsResponse> => {
    try {
      const params: any = {};
      if (options?.rating) params.rating = options.rating;
      if (options?.limit) params.limit = options.limit;
      if (options?.offset) params.offset = options.offset;

      const response = await api.get(`/reviews/menu-item/${menuItemId}`, { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get current user's reviews
   */
  getMyReviews: async (options?: {
    limit?: number;
    offset?: number;
  }): Promise<ReviewsResponse> => {
    try {
      const params: any = {};
      if (options?.limit) params.limit = options.limit;
      if (options?.offset) params.offset = options.offset;

      const response = await api.get('/reviews/my-reviews', { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Update a review
   */
  updateReview: async (reviewId: number, updateData: UpdateReviewRequest): Promise<Review> => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, updateData);
      return response.data.data.review;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: number): Promise<void> => {
    try {
      await api.delete(`/reviews/${reviewId}`);
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get rating statistics for a restaurant
   */
  getRestaurantRatingStats: async (restaurantId: number): Promise<RatingStats> => {
    try {
      const response = await api.get(`/reviews/restaurant/${restaurantId}/stats`);
      return response.data.data.rating_stats;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get rating statistics for a menu item
   */
  getMenuItemRatingStats: async (menuItemId: number): Promise<RatingStats> => {
    try {
      const response = await reviewService.getMenuItemReviews(menuItemId, { limit: 0 });
      return response.data.rating_stats || {
        average_rating: 0,
        review_count: 0,
        rating_distribution: {
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0,
        },
      };
    } catch (error: any) {
      throw error;
    }
  },
};

export default reviewService;
