import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchBar from '../../components/common/SearchBar';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import restaurantService, { Restaurant } from '../../services/restaurantService';

type NavigationProp = NativeStackNavigationProp<any>;

const RestaurantListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load restaurants
  const loadRestaurants = useCallback(async (isRefresh = false, searchTerm = searchQuery) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else if (page === 1) {
        setLoading(true);
      }
      
      setError(null);

      const response = await restaurantService.getRestaurants({
        q: searchTerm || undefined,
        limit: 20,
        offset: isRefresh ? 0 : (page - 1) * 20,
      });

      if (isRefresh || page === 1) {
        setRestaurants(response.data.restaurants);
      } else {
        setRestaurants(prev => [...prev, ...response.data.restaurants]);
      }

      setHasMore(response.data.restaurants.length === 20);
    } catch (err: any) {
      console.error('Error loading restaurants:', err);
      setError(err.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  // Initial load
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    setRestaurants([]);
    loadRestaurants(false, query);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setPage(1);
    loadRestaurants(true);
  }, [loadRestaurants]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore, loading]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      loadRestaurants();
    }
  }, [page]);

  // Handle restaurant press
  const handleRestaurantPress = useCallback((restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id });
  }, [navigation]);

  // Render restaurant item
  const renderRestaurant = useCallback(({ item }: { item: Restaurant }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
    />
  ), [handleRestaurantPress]);

  // Render footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF6B6B" />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery ? 'No restaurants found' : 'No restaurants available'}
        </Text>
        {searchQuery && (
          <Text style={styles.emptySubtext}>
            Try searching with different keywords
          </Text>
        )}
      </View>
    );
  };

  // Render error state
  if (error && !refreshing && restaurants.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={handleRefresh}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <SearchBar
        placeholder="Search restaurants..."
        onSearch={handleSearch}
        value={searchQuery}
        onClear={() => handleSearch('')}
      />

      {/* Restaurant List */}
      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B6B']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading overlay for initial load */}
      {loading && restaurants.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RestaurantListScreen;
