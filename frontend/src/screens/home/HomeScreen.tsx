import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import restaurantService, { Restaurant } from '../../services/restaurantService';
import { MainStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load restaurants
  const loadRestaurants = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const response = await restaurantService.getRestaurants({ limit: 50 });
      setRestaurants(response.data.restaurants);
    } catch (err: any) {
      console.error('Error loading restaurants:', err);
      setError(err.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Search restaurants
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadRestaurants(false);
      return;
    }

    try {
      setLoading(true);
      const results = await restaurantService.searchRestaurants(query);
      setRestaurants(results);
    } catch (err: any) {
      console.error('Error searching restaurants:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery('');
    loadRestaurants(false);
  }, []);

  // Navigate to restaurant detail
  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate('RestaurantDetail', { restaurantId });
  };

  // Load data on mount
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Icon name="store-off" size={80} color="#ccc" />
        <Text style={styles.emptyText}>
          {searchQuery ? 'No restaurants found' : 'No restaurants available'}
        </Text>
        {searchQuery && (
          <Text style={styles.emptySubtext}>
            Try a different search term
          </Text>
        )}
      </View>
    );
  };

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" size={80} color="#F44336" />
      <Text style={styles.errorText}>{error}</Text>
      <Text style={styles.retryText} onPress={() => loadRestaurants()}>
        Tap to retry
      </Text>
    </View>
  );

  if (error && restaurants.length === 0) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search restaurants..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          icon="magnify"
          clearIcon="close"
        />
      </View>

      {/* Restaurant List */}
      {loading && restaurants.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => handleRestaurantPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF6B6B']}
            />
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 16,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default HomeScreen;
