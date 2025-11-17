import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { createOrder, CreateOrderData } from '../../services/orderService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Checkout'>;

interface CheckoutScreenProps {
  navigation: CheckoutScreenNavigationProp;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { cartItems, subtotal, tax, deliveryFee, total, clearCart, restaurantId } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    // Validate delivery address
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter a delivery address');
      return;
    }

    if (deliveryAddress.trim().length < 10) {
      Alert.alert('Error', 'Delivery address must be at least 10 characters');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Error', 'No restaurant selected');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      setLoading(true);

      // Prepare order data
      const orderData: CreateOrderData = {
        restaurantId,
        deliveryAddress: deliveryAddress.trim(),
        totalAmount: total,
        deliveryFee,
        taxAmount: tax,
        subtotalAmount: subtotal,
        notes: orderNotes.trim() || undefined,
        items: cartItems.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: item.menuItem.discounted_price || item.menuItem.price,
          notes: item.notes || undefined,
        })),
      };

      // Create order
      const order = await createOrder(orderData);

      // Clear cart
      clearCart();

      // Show success message
      Alert.alert(
        'Order Placed!',
        `Your order #${order.id} has been placed successfully.`,
        [
          {
            text: 'View Order',
            onPress: () => navigation.replace('OrderDetail', { orderId: order.id }),
          },
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="cart-off" size={100} color="#ccc" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items to your cart before checking out
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.browseButton}
            buttonColor="#FF6B6B"
          >
            Browse Restaurants
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.itemCount}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Text>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {item.quantity}x {item.menuItem.name}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  ${((item.menuItem.discounted_price || item.menuItem.price) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.inputContainer}>
            <Icon name="map-marker" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your delivery address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Order Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          <View style={styles.inputContainer}>
            <Icon name="note-text" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Add any special instructions"
              value={orderNotes}
              onChangeText={setOrderNotes}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'cash' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Icon
                name="cash"
                size={24}
                color={paymentMethod === 'cash' ? '#FF6B6B' : '#666'}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'cash' && styles.paymentMethodTextActive,
                ]}
              >
                Cash on Delivery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'card' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Icon
                name="credit-card"
                size={24}
                color={paymentMethod === 'card' ? '#FF6B6B' : '#666'}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'card' && styles.paymentMethodTextActive,
                ]}
              >
                Credit/Debit Card
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (7%)</Text>
              <Text style={styles.priceValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>
                {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          style={styles.placeOrderButton}
          buttonColor="#FF6B6B"
          contentStyle={styles.placeOrderButtonContent}
          labelStyle={styles.placeOrderButtonLabel}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            `Place Order • $${total.toFixed(2)}`
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    marginBottom: 24,
  },
  browseButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    minHeight: 60,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  paymentMethodActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  paymentMethodTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
  },
  placeOrderButton: {
    borderRadius: 12,
    elevation: 0,
  },
  placeOrderButtonContent: {
    paddingVertical: 8,
  },
  placeOrderButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
