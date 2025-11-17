import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getOrderById, cancelOrder, Order } from '../../services/orderService';
import type { MainStackParamList } from '../../navigation/types';

type RouteParams = {
  OrderDetail: {
    orderId: number;
  };
};

type OrderDetailScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'OrderDetail'>;

interface OrderDetailScreenProps {
  navigation: OrderDetailScreenNavigationProp;
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: '#FFC107',
  confirmed: '#2196F3',
  preparing: '#9C27B0',
  ready: '#4CAF50',
  out_for_delivery: '#00BCD4',
  delivered: '#4CAF50',
  cancelled: '#F44336',
};

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_ICONS: Record<Order['status'], string> = {
  pending: 'clock-outline',
  confirmed: 'check-circle-outline',
  preparing: 'chef-hat',
  ready: 'food',
  out_for_delivery: 'truck-delivery',
  delivered: 'check-circle',
  cancelled: 'close-circle',
};

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ navigation }) => {
  const route = useRoute<RouteProp<RouteParams, 'OrderDetail'>>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrderDetails = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const orderData = await getOrderById(orderId);
      setOrder(orderData);
    } catch (err: any) {
      console.error('Error loading order details:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const updatedOrder = await cancelOrder(orderId);
              setOrder(updatedOrder);
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (err: any) {
              console.error('Error cancelling order:', err);
              Alert.alert('Error', err.message || 'Failed to cancel order');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error && !order) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => loadOrderDetails(true)} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) return null;

  const statusColor = STATUS_COLORS[order.status] || '#666666';
  const statusLabel = STATUS_LABELS[order.status] || 'Unknown';
  const statusIcon = STATUS_ICONS[order.status];
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const orderTime = new Date(order.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadOrderDetails(true)}
            colors={['#FF6B6B']}
          />
        }
      >
        {/* Order Status Section */}
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <Icon name={statusIcon} size={48} color={statusColor} />
            <View style={styles.statusInfo}>
              <Text style={styles.orderIdText}>Order #{order.id}</Text>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                textStyle={[styles.statusText, { color: statusColor }]}
              >
                {statusLabel}
              </Chip>
            </View>
          </View>
          <Text style={styles.orderDateTime}>
            {orderDate} at {orderTime}
          </Text>
        </View>

        {/* Restaurant Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <View style={styles.card}>
            <View style={styles.restaurantInfo}>
              <Icon name="store" size={24} color="#FF6B6B" />
              <View style={styles.restaurantDetails}>
                <Text style={styles.restaurantName}>{order.restaurant_name}</Text>
                {order.restaurant_address && (
                  <View style={styles.detailRow}>
                    <Icon name="map-marker" size={14} color="#666" />
                    <Text style={styles.detailText}>{order.restaurant_address}</Text>
                  </View>
                )}
                {order.restaurant_phone && (
                  <View style={styles.detailRow}>
                    <Icon name="phone" size={14} color="#666" />
                    <Text style={styles.detailText}>{order.restaurant_phone}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Order Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.card}>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.orderItem,
                    index !== order.items!.length - 1 && styles.orderItemBorder,
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.menu_item_name}</Text>
                      <Text style={styles.itemUnitPrice}>
                        ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'} each
                      </Text>
                      {item.notes && (
                        <View style={styles.itemNotes}>
                          <Icon name="note-text" size={12} color="#666" />
                          <Text style={styles.itemNotesText}>{item.notes}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.itemPrice}>
                    ${typeof item.price === 'number' ? (item.price * item.quantity).toFixed(2) : '0.00'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItems}>No items</Text>
            )}
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.card}>
            <View style={styles.addressContainer}>
              <Icon name="map-marker" size={20} color="#FF6B6B" />
              <Text style={styles.addressText}>{order.delivery_address}</Text>
            </View>
          </View>
        </View>

        {/* Order Notes Section */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.card}>
              <View style={styles.notesContainer}>
                <Icon name="note-text" size={20} color="#FF6B6B" />
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Price Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.card}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>
                ${typeof order.subtotal_amount === 'number' ? order.subtotal_amount.toFixed(2) : '0.00'}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>
                ${typeof order.tax_amount === 'number' ? order.tax_amount.toFixed(2) : '0.00'}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>
                {typeof order.delivery_fee === 'number' && order.delivery_fee === 0 
                  ? 'FREE' 
                  : `$${typeof order.delivery_fee === 'number' ? order.delivery_fee.toFixed(2) : '0.00'}`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${typeof order.total_amount === 'number' ? order.total_amount.toFixed(2) : '0.00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Cancel Button */}
        {canCancel && (
          <View style={styles.section}>
            <Button
              mode="outlined"
              onPress={handleCancelOrder}
              style={styles.cancelButton}
              buttonColor="transparent"
              textColor="#F44336"
              loading={cancelling}
              disabled={cancelling}
            >
              Cancel Order
            </Button>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  statusInfo: {
    flex: 1,
    gap: 8,
  },
  orderIdText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDateTime: {
    fontSize: 15,
    color: '#666',
  },
  restaurantInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  restaurantDetails: {
    flex: 1,
    gap: 6,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    minWidth: 30,
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemUnitPrice: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  itemNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  itemNotesText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noItems: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  notesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
    color: '#666',
  },
  priceValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  cancelButton: {
    borderRadius: 12,
    borderColor: '#F44336',
    borderWidth: 2,
  },
});

export default OrderDetailScreen;
