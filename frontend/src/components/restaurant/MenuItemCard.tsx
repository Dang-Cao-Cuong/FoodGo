import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddToCartModal from '../cart/AddToCartModal';
import { useCart } from '../../contexts/CartContext';
import FavoriteButton from '../common/FavoriteButton';
import { getImageFromPath } from '../../assets/images';

interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  discounted_price?: number;
  image_url?: string;
  is_available: boolean;
  is_featured?: boolean;
  preparation_time?: number;
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
}

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address: string;
  phone?: string;
  cover_url?: string;
  logo_url?: string;
  is_open: boolean;
  rating?: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

interface MenuItemCardProps {
  menuItem: MenuItem;
  restaurant: Restaurant;
  onPress?: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ menuItem, restaurant, onPress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { addToCart } = useCart();

  // Load ảnh từ đường dẫn trong database
  const localImage = getImageFromPath(menuItem.image_url || null);
  const imageSource = localImage
    ? localImage
    : { uri: menuItem.image_url || 'https://via.placeholder.com/150x150?text=Menu+Item' };

  // Ensure price is a valid number
  const price = typeof menuItem.price === 'number' ? menuItem.price : 0;
  const discountedPrice = typeof menuItem.discounted_price === 'number' ? menuItem.discounted_price : 0;
  const hasDiscount = discountedPrice > 0 && discountedPrice < price;
  const displayPrice = hasDiscount ? discountedPrice : price;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      // If no custom onPress, open add to cart modal
      if (menuItem.is_available) {
        setModalVisible(true);
      }
    }
  };

  // Hàm xử lý khi bấm nút "Add to Cart"
  const handleAddToCart = (quantity: number, notes: string) => {
    // Gọi hàm addToCart từ Context
    const result = addToCart(menuItem, restaurant, quantity, notes);

    // Kiểm tra kết quả trả về
    if (!result.success && result.error === 'mismatch') {
      // Trường hợp 1: Giỏ hàng đang chứa món của nhà hàng khác
      // -> Hiện thông báo hỏi User có muốn xóa giỏ cũ để tạo đơn mới không
      Alert.alert(
        'Start new order?',
        `Your cart contains items from another restaurant. Do you want to clear your cart and start a new order from ${restaurant.name}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              // User chọn "Hủy" -> Giữ nguyên giỏ hàng cũ, không làm gì cả
            }
          },
          {
            text: 'New Order',
            style: 'destructive',
            onPress: () => {
              // User chọn "Tạo đơn mới" -> Gọi lại addToCart với cờ forceNewOrder=true
              addToCart(menuItem, restaurant, quantity, notes, true);
              setModalVisible(false); // Đóng modal chọn số lượng
            },
          },
        ]
      );
    } else {
      // Trường hợp 2: Thêm thành công (cùng nhà hàng hoặc giỏ rỗng)
      setModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            {/* Menu Item Image */}
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Menu Item Info */}
            <View style={styles.infoContainer}>
              {/* Name */}
              <Text style={styles.name} numberOfLines={2}>
                {menuItem.name}
              </Text>

              {/* Description */}
              {menuItem.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {menuItem.description}
                </Text>
              )}

              {/* Rating & Reviews */}
              {(menuItem.total_reviews || 0) > 0 && (menuItem.average_rating || 0) > 0 && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFC107" />
                  <Text style={styles.ratingText}>
                    {Number(menuItem.average_rating).toFixed(1)}
                  </Text>
                  <Text style={styles.reviewCount}>
                    ({Number(menuItem.total_reviews)})
                  </Text>
                </View>
              )}

              {/* Bottom Row: Price, Prep Time, Featured Badge */}
              <View style={styles.bottomRow}>
                {/* Price */}
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    ${String(displayPrice.toFixed(2))}
                  </Text>
                  {hasDiscount && (
                    <Text style={styles.originalPrice}>
                      ${String(price.toFixed(2))}
                    </Text>
                  )}
                </View>

                {/* Preparation Time */}
                {(menuItem.preparation_time || 0) > 0 && (
                  <View style={styles.prepTimeContainer}>
                    <Icon name="clock-outline" size={14} color="#666" />
                    <Text style={styles.prepTime}>
                      {String(menuItem.preparation_time)} min
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Badges */}
          {(menuItem.is_featured || !menuItem.is_available) && (
            <View style={styles.badgesContainer}>
              {menuItem.is_featured && (
                <View style={styles.featuredBadge}>
                  <Icon name="star" size={12} color="#fff" />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
              {!menuItem.is_available && (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableText}>Unavailable</Text>
                </View>
              )}
            </View>
          )}

          {/* Discount Badge */}
          {hasDiscount && price > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {String(Math.round(((price - displayPrice) / price) * 100))}% OFF
              </Text>
            </View>
          )}

          {/* Favorite Button */}
          <View style={styles.favoriteButton}>
            <FavoriteButton type="menu_item" id={menuItem.id} size={18} />
          </View>
        </Card>
      </TouchableOpacity>

      {/* Add to Cart Modal */}
      <AddToCartModal
        visible={modalVisible}
        menuItemName={menuItem.name}
        price={displayPrice}
        onClose={() => setModalVisible(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
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
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  prepTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  unavailableBadge: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
});

export default MenuItemCard;
