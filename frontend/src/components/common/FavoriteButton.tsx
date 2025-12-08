import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Animated, Platform } from 'react-native';
import { IconButton } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

// API Configuration
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getBaseURL();

interface FavoriteStatusResponse {
  isFavorited: boolean;
}

interface FavoriteButtonProps {
  type: 'restaurant' | 'menu_item';
  id: number;
  initialFavorited?: boolean;
  size?: number;
  onToggle?: (isFavorited: boolean) => void;
  iconColor?: string;
  favoriteColor?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  type,
  id,
  initialFavorited = false,
  size = 24,
  onToggle,
  iconColor = '#666',
  favoriteColor = '#FF6B6B',
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Only load favorite status if user is authenticated
    if (user) {
      loadFavoriteStatus();
    }
  }, [user, id, type]);

  const loadFavoriteStatus = async () => {
    if (!user) {
      setIsFavorited(false);
      console.log('🔒 User not authenticated, skipping favorite status check');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('@foodgo_token');
      console.log('🔑 Loading favorite status - Token:', token ? 'exists' : 'missing', 'Type:', type, 'ID:', id);

      if (!token) {
        setIsFavorited(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/favorites/check/${type}/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Favorite status loaded:', response.data);
      // Backend returns { success: true, data: { is_favorite: boolean } }
      setIsFavorited(response.data.data?.is_favorite || false);
    } catch (error: any) {
      // Silently fail and set to false
      setIsFavorited(false);
      console.log('⚠️ Error loading favorite status:', error.response?.status, error.message);
      if (error.response?.status === 401) {
        console.log('Authentication required for favorites');
      } else if (error.response?.status !== 404) {
        console.error('Error checking favorite status:', error.response?.data?.message || error.message);
      }
    }
  };

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggle = async () => {
    if (isLoading) return;

    // Require authentication for favorites
    if (!user) {
      console.log('Please login to add favorites');
      // You might want to show a toast/snackbar here
      return;
    }

    setIsLoading(true);
    const previousState = isFavorited;

    try {
      const token = await AsyncStorage.getItem('@foodgo_token');
      console.log('🔑 Token retrieved:', token ? 'Token exists (length: ' + token.length + ')' : 'No token');

      if (!token) {
        console.log('No authentication token found');
        setIsLoading(false);
        return;
      }

      // Optimistic update
      setIsFavorited(!isFavorited);
      animateHeart();

      // Make API call
      console.log('🚀 Sending favorite toggle request:', {
        url: `${API_BASE_URL}/favorites/toggle`,
        type,
        item_id: id,
        hasAuth: !!token
      });

      const response = await axios.post<FavoriteStatusResponse>(
        `${API_BASE_URL}/favorites/toggle`,
        {
          type: type,
          item_id: id,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Update state with actual result
      console.log('✅ Favorite toggle response:', response.data);
      const newState = response.data.isFavorited;
      setIsFavorited(newState);

      // Call onToggle callback
      if (onToggle) {
        onToggle(newState);
      }
    } catch (error: any) {
      // Revert on error
      setIsFavorited(previousState);

      // Better error handling
      console.error('❌ Favorite toggle error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });

      if (error.response?.status === 401) {
        console.log('Authentication required. Please login again.');
      } else if (error.response?.status === 404) {
        console.log('Favorite endpoint not found. Please check backend server.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.log('Cannot connect to server. Please check if backend is running.');
      } else {
        console.error('Error toggling favorite:', error.response?.data?.message || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={isLoading}
      activeOpacity={0.7}
      style={styles.container}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={favoriteColor} />
      ) : (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <IconButton
            icon={isFavorited ? 'heart' : 'heart-outline'}
            size={size}
            iconColor={isFavorited ? favoriteColor : iconColor}
            style={styles.icon}
          />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    margin: 0,
  },
});

export default FavoriteButton;
