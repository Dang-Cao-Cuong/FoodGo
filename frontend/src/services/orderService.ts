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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export interface OrderItem {
  menuItemId: number;
  quantity: number;
  price: number;
  notes?: string;
  menu_item_name?: string;
  menu_item_description?: string;
  menu_item_image?: string;
}

export interface CreateOrderData {
  restaurantId: number;
  deliveryAddress: string;
  totalAmount: number;
  deliveryFee: number;
  taxAmount: number;
  subtotalAmount: number;
  notes?: string;
  items: OrderItem[];
}

export interface Order {
  id: number;
  user_id: number;
  restaurant_id: number;
  delivery_address: string;
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  subtotal_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  restaurant_name?: string;
  restaurant_address?: string;
  restaurant_phone?: string;
  restaurant_image?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  items?: OrderItem[];
  item_count?: number;
}

export interface OrderStats {
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  active_orders: number;
  total_spent: number;
}

export interface OrderListParams {
  limit?: number;
  offset?: number;
  status?: string;
}

// Create a new order
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data.order;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

// Get current user's orders
export const getMyOrders = async (params?: OrderListParams): Promise<Order[]> => {
  try {
    const response = await api.get('/orders/my-orders', { params });
    return response.data.orders;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

// Get order by ID
export const getOrderById = async (orderId: number): Promise<Order> => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order details');
  }
};

// Cancel order
export const cancelOrder = async (orderId: number): Promise<Order> => {
  try {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data.order;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel order');
  }
};

// Get order statistics
export const getOrderStats = async (): Promise<OrderStats> => {
  try {
    const response = await api.get('/orders/my-orders/stats');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order stats');
  }
};

// Update order status (admin/restaurant owner)
export const updateOrderStatus = async (
  orderId: number,
  status: Order['status']
): Promise<Order> => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data.order;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderStats,
  updateOrderStatus,
};
