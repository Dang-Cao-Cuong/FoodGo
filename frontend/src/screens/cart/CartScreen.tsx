import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../../contexts/CartContext';
import CartItem from '../../components/cart/CartItem';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';

type CartScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Cart'>;

interface CartScreenProps {
  navigation: CartScreenNavigationProp;
}

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const {
    cartItems,
    subtotal,
    tax,
    deliveryFee,
    total,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  const handleClearCart = () => {
    clearCart();
  };

  const renderCartItem = ({ item }: { item: typeof cartItems[0] }) => (
    <CartItem
      item={item}
      onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
      onRemove={() => removeFromCart(item.id)}
    />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cart-outline" size={100} color="#ccc" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Add items from restaurants to get started
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        style={styles.browseButton}
        buttonColor="#FF6B6B"
      >
        Browse Restaurants
      </Button>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      {/* Summary Details */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (7%)</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>
            {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <Button
        mode="contained"
        onPress={handleCheckout}
        style={styles.checkoutButton}
        buttonColor="#FF6B6B"
        contentStyle={styles.checkoutButtonContent}
        labelStyle={styles.checkoutButtonLabel}
      >
        Proceed to Checkout
      </Button>

      {/* Clear Cart Button */}
      <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear Cart</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Cart</Text>
      <Text style={styles.headerSubtitle}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </Text>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderSummary}
        contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingBottom: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
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
  summaryContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  checkoutButton: {
    borderRadius: 12,
    elevation: 0,
  },
  checkoutButtonContent: {
    paddingVertical: 8,
  },
  checkoutButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
  },
});

export default CartScreen;
