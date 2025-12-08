import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';

// ==================== API CONFIGURATION ====================
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
    return 'http://localhost:3000/api';
  }
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getBaseURL();

// ==================== INTERFACES ====================
interface Order {
  id: number;
  user_id: number;
  restaurant_id: number;
  restaurant_name: string;
  status: 'preparing' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  notes?: string;
  item_count: number;
  created_at: string;
  updated_at: string;
}

type OrderHistoryScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'OrderHistory'>;

interface OrderHistoryScreenProps {
  navigation: OrderHistoryScreenNavigationProp;
}

const STATUS_COLORS: Record<Order['status'], string> = {
  preparing: '#9C27B0',
  delivered: '#4CAF50',
  cancelled: '#F44336',
};

const STATUS_LABELS: Record<Order['status'], string> = {
  preparing: 'Preparing',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // ==================== API FUNCTIONS ====================
  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching orders with status:', selectedStatus || 'all');

      const token = await AsyncStorage.getItem('@foodgo_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params: any = {};
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend returns: { orders, pagination } (no nested data)
      console.log('Orders loaded:', response.data.orders?.length || 0);
      setOrders(response.data.orders || []);
    } catch (err: any) {
      console.error('Error loading orders:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  // ==================== EVENT HANDLERS ====================
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderPress = (orderId: number) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = STATUS_COLORS[item.status] || '#666666';
    const statusLabel = STATUS_LABELS[item.status] || 'Unknown';
    const orderDate = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const orderTime = new Date(item.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>
              {orderDate} • {orderTime}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
            textStyle={[styles.statusText, { color: statusColor }]}
          >
            {statusLabel}
          </Chip>
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Icon name="store" size={16} color="#666" />
          <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
        </View>

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Icon name="food" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.item_count} {item.item_count === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <Text style={styles.orderTotal}>
            ${typeof item.total_amount === 'number' ? item.total_amount.toFixed(2) : '0.00'}
          </Text>
        </View>

        {/* View Details Arrow */}
        <View style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Icon name="chevron-right" size={20} color="#FF6B6B" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="clipboard-text-outline" size={100} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {selectedStatus ? 'No orders found' : 'No orders yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {selectedStatus
          ? `You don't have any ${selectedStatus} orders`
          : 'Start ordering from your favorite restaurants'}
      </Text>
    </View>
  );

  const renderStatusFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      <TouchableOpacity
        style={[styles.filterChip, selectedStatus === null && styles.filterChipActive]}
        onPress={() => handleStatusFilter(null)}
      >
        <Text style={[styles.filterText, selectedStatus === null && styles.filterTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      {Object.entries(STATUS_LABELS).map(([status, label]) => (
        <TouchableOpacity
          key={status}
          style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
          onPress={() => handleStatusFilter(status)}
        >
          <Text style={[styles.filterText, selectedStatus === status && styles.filterTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchOrders(true)} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderStatusFilters}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            colors={['#FF6B6B']}
          />
        }
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  statusChip: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  restaurantName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;
