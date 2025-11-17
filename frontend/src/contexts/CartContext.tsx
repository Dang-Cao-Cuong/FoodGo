import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from '../services/menuItemService';
import { Restaurant } from '../services/restaurantService';

const CART_STORAGE_KEY = '@foodgo_cart';

export interface CartItem {
  id: string; // Unique cart item ID (menuItemId-restaurantId)
  menuItem: MenuItem;
  restaurant: Restaurant;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  restaurantId: number | null;
  addToCart: (menuItem: MenuItem, restaurant: Restaurant, quantity?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  isInCart: (menuItemId: number) => boolean;
  getCartItem: (menuItemId: number) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  // Tax rate (7%)
  const TAX_RATE = 0.07;

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCart();
  }, [cartItems]);

  // Load cart from AsyncStorage
  const loadCart = async () => {
    try {
      const cartJson = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartJson) {
        const savedCart = JSON.parse(cartJson);
        setCartItems(savedCart.items || []);
        setRestaurantId(savedCart.restaurantId || null);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Save cart to AsyncStorage
  const saveCart = async () => {
    try {
      const cartData = {
        items: cartItems,
        restaurantId,
      };
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.menuItem.discounted_price || item.menuItem.price;
    return sum + price * item.quantity;
  }, 0);

  // Calculate tax
  const tax = subtotal * TAX_RATE;

  // Get delivery fee from restaurant
  const deliveryFee = cartItems.length > 0 && cartItems[0].restaurant
    ? 0 // Default to 0 since restaurant model doesn't have delivery_fee
    : 0;

  // Calculate total
  const total = subtotal + tax + deliveryFee;

  // Get total item count
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  const addToCart = (
    menuItem: MenuItem,
    restaurant: Restaurant,
    quantity: number = 1,
    notes?: string
  ) => {
    // Check if cart is empty or from same restaurant
    if (cartItems.length > 0 && restaurantId !== restaurant.id) {
      // Alert user that cart will be cleared
      // In a real app, you'd use a modal/alert
      console.warn('Cart contains items from a different restaurant. Clearing cart...');
      clearCart();
    }

    const itemId = `${menuItem.id}-${restaurant.id}`;
    const existingItemIndex = cartItems.findIndex(item => item.id === itemId);

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += quantity;
      if (notes) {
        updatedItems[existingItemIndex].notes = notes;
      }
      setCartItems(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: itemId,
        menuItem,
        restaurant,
        quantity,
        notes,
      };
      setCartItems([...cartItems, newItem]);
      setRestaurantId(restaurant.id);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    
    // Clear restaurant ID if cart is empty
    if (updatedItems.length === 0) {
      setRestaurantId(null);
    }
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
  };

  // Update item notes
  const updateNotes = (itemId: string, notes: string) => {
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, notes } : item
    );
    setCartItems(updatedItems);
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  // Check if item is in cart
  const isInCart = (menuItemId: number): boolean => {
    return cartItems.some(item => item.menuItem.id === menuItemId);
  };

  // Get cart item by menu item ID
  const getCartItem = (menuItemId: number): CartItem | undefined => {
    return cartItems.find(item => item.menuItem.id === menuItemId);
  };

  const value: CartContextType = {
    cartItems,
    itemCount,
    subtotal,
    tax,
    deliveryFee,
    total,
    restaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    isInCart,
    getCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
