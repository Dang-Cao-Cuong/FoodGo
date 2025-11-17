import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CartItem as CartItemType } from '../../contexts/CartContext';
import { getImageFromPath } from '../../assets/images';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const { menuItem, quantity, notes } = item;
  
  // Load ảnh từ đường dẫn trong database
  const localImage = getImageFromPath(menuItem.image_url || null);
  const imageSource = localImage 
    ? localImage 
    : { uri: menuItem.image_url || 'https://via.placeholder.com/80x80?text=Item' };
    
  // Ensure price is a valid number
  const menuPrice = typeof menuItem.price === 'number' ? menuItem.price : 0;
  const discountedPrice = typeof menuItem.discounted_price === 'number' ? menuItem.discounted_price : 0;
  const price = discountedPrice > 0 && discountedPrice < menuPrice ? discountedPrice : menuPrice;
  const itemTotal = price * quantity;

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(quantity - 1);
    } else {
      onRemove();
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(quantity + 1);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        {/* Item Image */}
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Item Details */}
        <View style={styles.details}>
          {/* Name */}
          <Text style={styles.name} numberOfLines={2}>
            {menuItem.name}
          </Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
            {discountedPrice > 0 && discountedPrice < menuPrice && (
              <Text style={styles.originalPrice}>${menuPrice.toFixed(2)}</Text>
            )}
          </View>

          {/* Notes */}
          {notes && (
            <View style={styles.notesContainer}>
              <Icon name="note-text" size={14} color="#666" />
              <Text style={styles.notes} numberOfLines={2}>
                {notes}
              </Text>
            </View>
          )}

          {/* Quantity Controls and Total */}
          <View style={styles.bottomRow}>
            {/* Quantity Controls */}
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={handleDecrease}
                style={styles.quantityButton}
                activeOpacity={0.7}
              >
                <Icon
                  name={quantity === 1 ? 'delete' : 'minus'}
                  size={20}
                  color={quantity === 1 ? '#F44336' : '#666'}
                />
              </TouchableOpacity>

              <Text style={styles.quantity}>{quantity}</Text>

              <TouchableOpacity
                onPress={handleIncrease}
                style={styles.quantityButton}
                activeOpacity={0.7}
              >
                <Icon name="plus" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Item Total */}
            <Text style={styles.itemTotal}>${itemTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          activeOpacity={0.7}
        >
          <Icon name="close" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 6,
  },
  notes: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
});

export default CartItem;
