import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import { MainStackParamList } from '../../navigation/types';

// API Configuration: Tự động chọn URL dựa trên môi trường (Android Emulator hay iOS/Web)
const getBaseURL = () => {
  if (__DEV__) {
    // Android Emulator dùng 10.0.2.2 để gọi localhost của máy tính
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
    // iOS Simulator và Web dùng localhost
    return 'http://localhost:3000/api';
  }
  // URL cho môi trường Production (khi build app thật)
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getBaseURL();

// Restaurant Interface: Interface cho dữ liệu nhà hàng nhận từ API
interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  cover_url: string;
  logo_url: string;
  is_open: boolean;
  rating: number;
  category: string;
  created_at: string;
  updated_at: string;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Hàm gọi API lấy danh sách nhà hàng (Mặc định show loading)
  const fetchRestaurants = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true); // Hiện spinner quay tròn
      setError(null);

      // Lấy token đăng nhập (nếu có) để server biết user là ai
      const token = await AsyncStorage.getItem('@foodgo_token');

      // Gửi GET request tới backend
      const response = await axios.get(`${API_BASE_URL}/restaurants`, {
        params: { limit: 50 }, // Lấy tối đa 50 quán
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Backend trả về: { success: true, data: { restaurants: [...] } }
      // Lưu danh sách quán vào state để hiển thị
      setRestaurants(response.data.data.restaurants || []);
      console.log('Loaded restaurants:', response.data.data.restaurants?.length || 0);
    } catch (err: any) {
      console.error('Error loading restaurants:', err);
      // Lấy message lỗi từ backend (nếu có) hoặc hiển thị lỗi mặc định
      setError(err.response?.data?.message || 'Failed to load restaurants');
    } finally {
      setLoading(false); // Tắt spinner
      setRefreshing(false); // Tắt trạng thái pull-to-refresh
    }
  };

  // Hàm tìm kiếm nhà hàng
  const searchRestaurants = async (query: string) => {
    setSearchQuery(query); // Cập nhật text liên tục khi user gõ

    // Nếu keyword rỗng -> Load lại toàn bộ danh sách
    if (!query.trim()) {
      fetchRestaurants(false);
      return;
    }

    try {
      setLoading(true); // Hiện loading khi đang tìm
      const token = await AsyncStorage.getItem('@foodgo_token');

      // Gọi API search với tham số ?q=keyword
      const response = await axios.get(`${API_BASE_URL}/restaurants`, {
        params: { q: query, limit: 50 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Cập nhật kết quả tìm kiếm
      setRestaurants(response.data.data.restaurants || []);
      console.log('Search results:', response.data.data.restaurants?.length || 0);
    } catch (err: any) {
      console.error('Error searching restaurants:', err);
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery('');
    fetchRestaurants(false);
  }, []);

  // Navigate to restaurant detail
  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate('RestaurantDetail', { restaurantId });
  };

  // Load data on mount
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRestaurants().catch(err => {
        console.error('Error in focus listener:', err);
      });
    });
    return unsubscribe;
  }, [navigation]);

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
      <Text style={styles.retryText} onPress={() => fetchRestaurants()}>
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
          onChangeText={searchRestaurants}
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
