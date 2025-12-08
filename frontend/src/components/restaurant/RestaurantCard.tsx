import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FavoriteButton from '../common/FavoriteButton';
import { getImageFromPath } from '../../assets/images';

interface Restaurant {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  cover_url?: string;
  is_open: boolean;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress }) => {
  // Load ảnh từ đường dẫn trong database
  const localImage = getImageFromPath(restaurant.cover_url || null);
  const imageSource = localImage 
    ? localImage 
    : { uri: restaurant.cover_url || 'https://via.placeholder.com/400x200?text=Restaurant' };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        {/* Restaurant Image */}
        <Image
          source={imageSource}
          style={styles.coverImage}
          resizeMode="cover"
        />

        {/* Status Badge */}
        <View style={[styles.statusBadge, restaurant.is_open ? styles.openBadge : styles.closedBadge]}>
          <Text style={styles.statusText}>
            {restaurant.is_open ? 'OPEN' : 'CLOSED'}
          </Text>
        </View>

        {/* Favorite Button */}
        <View style={styles.favoriteButton}>
          <FavoriteButton type="restaurant" id={restaurant.id} size={20} />
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          {/* Name */}
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>

          {/* Description */}
          {restaurant.description && (
            <Text style={styles.description} numberOfLines={2}>
              {restaurant.description}
            </Text>
          )}

          {/* Details Row */}
          <View style={styles.detailsRow}>
            {/* Address */}
            <View style={styles.detailItem}>
              <Icon name="map-marker" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {restaurant.address}
              </Text>
            </View>

            {/* Phone */}
            {restaurant.phone && (
              <View style={styles.detailItem}>
                <Icon name="phone" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {restaurant.phone}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  openBadge: {
    backgroundColor: '#4CAF50',
  },
  closedBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsRow: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
});

export default RestaurantCard;
