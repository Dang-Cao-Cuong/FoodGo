import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text, ActivityIndicator, Chip, Card, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import favoriteService, { Favorite } from '../../services/favoriteService';
import RatingStars from '../../components/common/RatingStars';
import { useAuth } from '../../contexts/AuthContext';

type FavoriteType = 'all' | 'restaurant' | 'menu_item';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FavoriteType>('all');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
      setError('Please login to view favorites');
    }
  }, [activeTab, user]);

  const loadFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const options = activeTab !== 'all' ? { type: activeTab } : undefined;
      const response = await favoriteService.getMyFavorites(options);
      setFavorites(response.data.favorites);
    } catch (err: any) {
      if (err.message?.includes('Authentication') || err.message?.includes('authentication')) {
        setError('Please login to view favorites');
      } else {
        setError(err.message || 'Failed to load favorites');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [activeTab]);

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      await favoriteService.removeFavorite(favoriteId);
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
    } catch (err: any) {
      console.error('Error removing favorite:', err);
    }
  };

  const handleFavoritePress = (favorite: Favorite) => {
    if (favorite.favorite_type === 'restaurant' && favorite.restaurant) {
      (navigation as any).navigate('RestaurantDetail', { restaurantId: favorite.restaurant.id });
    }
    // Add navigation for menu items if needed
  };

  const renderFavoriteCard = ({ item }: { item: Favorite }) => {
    const isRestaurant = item.favorite_type === 'restaurant';
    const data = isRestaurant ? item.restaurant : item.menu_item;

    if (!data) return null;

    return (
      <Card style={styles.card} mode="outlined">
        <TouchableOpacity onPress={() => handleFavoritePress(item)} activeOpacity={0.7}>
          <View style={styles.cardContent}>
            <Image
              source={{
                uri: isRestaurant
                  ? (data as any).cover_url || 'https://via.placeholder.com/100'
                  : (data as any).image_url || 'https://via.placeholder.com/100',
              }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
                {data.name}
              </Text>

              {data.description && (
                <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
                  {data.description}
                </Text>
              )}

              {isRestaurant ? (
                <>
                  <View style={styles.ratingRow}>
                    <RatingStars rating={(data as any).rating || 0} size={14} />
                    <Text variant="bodySmall" style={styles.ratingText}>
                      {((data as any).rating || 0).toFixed(1)}
                    </Text>
                  </View>
                  {(data as any).address && (
                    <Text variant="bodySmall" style={styles.address} numberOfLines={1}>
                      📍 {(data as any).address}
                    </Text>
                  )}
                </>
              ) : (
                <Text variant="titleMedium" style={styles.price}>
                  ${((data as any).price || 0).toFixed(2)}
                </Text>
              )}
            </View>

            <IconButton
              icon="heart"
              size={24}
              iconColor="#FF6B6B"
              onPress={() => handleRemoveFavorite(item.id)}
            />
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconButton icon="heart-outline" size={80} iconColor="#E0E0E0" />
      <Text variant="titleLarge" style={styles.emptyTitle}>
        No Favorites Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {activeTab === 'restaurant'
          ? 'Start adding your favorite restaurants!'
          : activeTab === 'menu_item'
          ? 'Start adding your favorite menu items!'
          : 'Start adding favorites to see them here!'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Chip
          selected={activeTab === 'all'}
          onPress={() => setActiveTab('all')}
          style={styles.chip}
          mode="outlined"
        >
          All
        </Chip>
        <Chip
          selected={activeTab === 'restaurant'}
          onPress={() => setActiveTab('restaurant')}
          style={styles.chip}
          mode="outlined"
        >
          Restaurants
        </Chip>
        <Chip
          selected={activeTab === 'menu_item'}
          onPress={() => setActiveTab('menu_item')}
          style={styles.chip}
          mode="outlined"
        >
          Menu Items
        </Chip>
      </View>

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
          <Button mode="contained" onPress={loadFavorites} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteCard}
          keyExtractor={(item) => `favorite-${item.id}`}
          contentContainerStyle={[
            styles.listContent,
            favorites.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ea']} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  chip: {
    marginRight: 0,
  },
  listContent: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#666',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
  },
  address: {
    color: '#666',
  },
  price: {
    color: '#6200ea',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
});

export default FavoritesScreen;
