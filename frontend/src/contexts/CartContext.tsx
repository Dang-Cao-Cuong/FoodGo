import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@foodgo_cart';

// MenuItem Interface: Định nghĩa cấu trúc dữ liệu của một món ăn
export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  discounted_price?: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Restaurant Interface: Định nghĩa thông tin nhà hàng
export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address: string;
  phone?: string;
  cover_url?: string;
  logo_url?: string;
  is_open: boolean;
  rating?: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

// CartItem Interface: Một món ăn đã được thêm vào giỏ (kèm số lượng, ghi chú)
export interface CartItem {
  id: string; // ID duy nhất trong giỏ = menuItemId + restaurantId
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
  addToCart: (menuItem: MenuItem, restaurant: Restaurant, quantity?: number, notes?: string, forceNewOrder?: boolean) => { success: boolean; error?: 'mismatch' };
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

  // --- Tính toán tiền nong ---

  // Tính tổng tiền hàng (Subtotal)
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.menuItem.discounted_price || item.menuItem.price;
    return sum + price * item.quantity;
  }, 0);

  // Tính thuế
  const tax = subtotal * TAX_RATE;

  // Phí vận chuyển (Hiện tại hardcode = 0, sau này có thể tính theo khoảng cách)
  const deliveryFee = cartItems.length > 0 && cartItems[0].restaurant
    ? 0
    : 0;

  // Tổng thanh toán
  const total = subtotal + tax + deliveryFee;

  // Tổng số item hiển thị trên badge
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // --- Logic thêm vào giỏ hàng ---
  // addToCart trả về object { success, error } để UI xử lý hiển thị popup nếu cần
  const addToCart = (
    menuItem: MenuItem,
    restaurant: Restaurant,
    quantity: number = 1,
    notes?: string,
    forceNewOrder: boolean = false
  ): { success: boolean; error?: 'mismatch' } => {
    // 1. Kiểm tra nhà hàng: FoodGo chỉ cho phép đặt món từ 1 nhà hàng cùng lúc
    if (cartItems.length > 0 && restaurantId !== restaurant.id) {
      if (forceNewOrder) {
        // Nếu user đồng ý tạo đơn mới -> Xóa hết giỏ cũ
        clearCart();
        // (Lưu ý: State update là bất đồng bộ, nên ta cần xử lý logic thêm mới cẩn thận ở dưới)
      } else {
        return { success: false, error: 'mismatch' };
      }
    }

    const itemId = `${menuItem.id}-${restaurant.id}`;
    const existingItemIndex = cartItems.findIndex(item => item.id === itemId);

    // If we are forcing a new order, we know cartItems will be empty effectively, 
    // but React state updates are batched. 
    // If NOT forcing, we use existing cartItems.
    // If forcing, we should treat it as empty.

    let currentItems = forceNewOrder ? [] : [...cartItems];

    if (!forceNewOrder && existingItemIndex >= 0) {
      // Update quantity of existing item
      currentItems[existingItemIndex].quantity += quantity;
      if (notes) {
        currentItems[existingItemIndex].notes = notes;
      }
      setCartItems(currentItems);
    } else {
      // 2B. Nếu item mới -> Thêm object mới vào mảng
      const newItem: CartItem = {
        id: itemId,
        menuItem,
        restaurant,
        quantity,
        notes,
      };
      // Nếu forceNewOrder -> Reset giỏ chỉ còn item mới
      // Nếu không -> Nối vào giỏ cũ
      if (forceNewOrder) {
        setCartItems([newItem]);
      } else {
        setCartItems([...currentItems, newItem]);
      }
      setRestaurantId(restaurant.id); // Cập nhật ID nhà hàng hiện tại
    }

    return { success: true };
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
