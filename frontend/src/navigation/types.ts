import { NavigatorScreenParams } from '@react-navigation/native';

// Navigation Types for FoodGo App

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Favorites: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  RestaurantDetail: { restaurantId: number };
  Cart: undefined;
  Checkout: undefined;
  OrderHistory: undefined;
  OrderDetail: { orderId: number };
  // Add more screens as needed
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
