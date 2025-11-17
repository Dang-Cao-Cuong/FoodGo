import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { IconButton } from 'react-native-paper';
import favoriteService from '../../services/favoriteService';
import { useAuth } from '../../contexts/AuthContext';

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
  }, [user]);

  const loadFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const status = await favoriteService.checkFavoriteStatus(type, id);
      setIsFavorited(status);
    } catch (error: any) {
      // Silently fail if authentication error
      if (error.message?.includes('Authentication') || error.message?.includes('authentication')) {
        console.log('Authentication required for favorites');
      } else {
        console.error('Error checking favorite status:', error);
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
      // Optimistic update
      setIsFavorited(!isFavorited);
      animateHeart();

      // Make API call
      const newState = await favoriteService.toggleFavorite(type, id);
      
      // Update state with actual result
      setIsFavorited(newState);
      
      // Call onToggle callback
      if (onToggle) {
        onToggle(newState);
      }
    } catch (error: any) {
      // Revert on error
      setIsFavorited(previousState);
      console.error('Error toggling favorite:', error);
      // You might want to show a toast/snackbar here
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
