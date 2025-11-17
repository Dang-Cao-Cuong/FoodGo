import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-paper';
import MenuItemCard from '../../components/restaurant/MenuItemCard';
import FavoriteButton from '../../components/common/FavoriteButton';
import RatingDistribution from '../../components/review/RatingDistribution';
import ReviewCard from '../../components/review/ReviewCard';
import ReviewForm from '../../components/review/ReviewForm';
import restaurantService, { Restaurant } from '../../services/restaurantService';
import menuItemService, { MenuItem } from '../../services/menuItemService';
import reviewService, { Review, RatingStats } from '../../services/reviewService';
import { getImageFromPath } from '../../assets/images';
import { useAuth } from '../../contexts/AuthContext';

type RouteParams = {
  RestaurantDetail: {
    restaurantId: number;
  };
};

const RestaurantDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'RestaurantDetail'>>();
  const navigation = useNavigation();
  const { restaurantId } = route.params;
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Get unique categories from menu items
  const categories = Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)));

  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  // Handle write review with authentication check
  const handleWriteReview = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to write a review',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => (navigation as any).navigate('Login')
          }
        ]
      );
      return;
    }
    setReviewFormVisible(true);
  };

  // Load restaurant and menu
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);

      // Load restaurant details and menu items in parallel
      const [restaurantData, menuData] = await Promise.all([
        restaurantService.getRestaurantById(restaurantId),
        menuItemService.getRestaurantMenu(restaurantId),
      ]);

      setRestaurant(restaurantData);
      setMenuItems(menuData);

      // Load reviews and rating stats
      try {
        const [reviewsData, statsData] = await Promise.all([
          reviewService.getRestaurantReviews(restaurantId, { limit: 5 }),
          reviewService.getRestaurantRatingStats(restaurantId),
        ]);
        setReviews(reviewsData.data.reviews);
        setRatingStats(statsData);
      } catch (reviewErr) {
        console.error('Error loading reviews:', reviewErr);
        // Don't fail the whole page if reviews fail
      }
    } catch (err: any) {
      console.error('Error loading restaurant details:', err);
      setError(err.message || 'Failed to load restaurant details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle menu item press
  const handleMenuItemPress = useCallback((menuItem: MenuItem) => {
    // Menu item press is now handled directly by MenuItemCard
  }, []);

  // Handle category press
  const handleCategoryPress = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  // Render error state
  if (error && !refreshing && !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => loadData(true)} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render loading state
  if (loading && !restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!restaurant) return null;

  // Load ảnh từ đường dẫn trong database
  const localImage = getImageFromPath(restaurant.cover_url || null);
  const imageSource = localImage 
    ? localImage 
    : { uri: restaurant.cover_url || 'https://via.placeholder.com/400x200?text=Restaurant' };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
          colors={['#FF6B6B']}
        />
      }
    >
      {/* Restaurant Cover Image */}
      <Image
        source={imageSource}
        style={styles.coverImage}
        resizeMode="cover"
      />

      {/* Restaurant Info */}
      <View style={styles.infoContainer}>
        {/* Name and Status */}
        <View style={styles.headerRow}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <View style={styles.headerActions}>
            <FavoriteButton type="restaurant" id={restaurant.id} size={24} />
            <View style={[styles.statusBadge, restaurant.is_open ? styles.openBadge : styles.closedBadge]}>
              <Text style={styles.statusText}>
                {restaurant.is_open ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {restaurant.description && (
          <Text style={styles.description}>{restaurant.description}</Text>
        )}

        {/* Details */}
        <View style={styles.detailsContainer}>
          {/* Address */}
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={20} color="#666" />
            <Text style={styles.detailText}>{restaurant.address}</Text>
          </View>

          {/* Phone */}
          {restaurant.phone && (
            <View style={styles.detailRow}>
              <Icon name="phone" size={20} color="#666" />
              <Text style={styles.detailText}>{restaurant.phone}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
            onPress={() => handleCategoryPress(null)}
          >
            <Text style={[styles.categoryText, selectedCategory === null && styles.categoryTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
              onPress={() => handleCategoryPress(category!)}
            >
              <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Menu Items Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>
          Menu ({filteredMenuItems.length} items)
        </Text>

        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              menuItem={item}
              restaurant={restaurant}
            />
          ))
        ) : (
          <View style={styles.emptyMenu}>
            <Icon name="food-off" size={48} color="#999" />
            <Text style={styles.emptyText}>No menu items available</Text>
          </View>
        )}
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
          <Button
            mode="contained"
            onPress={handleWriteReview}
            compact
            style={styles.writeReviewButton}
          >
            Write Review
          </Button>
        </View>

        {/* Rating Stats */}
        {ratingStats && ratingStats.review_count > 0 && (
          <RatingDistribution stats={ratingStats} />
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <>
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            
            {reviews.length > 3 && (
              <Button
                mode="outlined"
                onPress={() => setShowAllReviews(!showAllReviews)}
                style={styles.showMoreButton}
              >
                {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
              </Button>
            )}
          </>
        ) : (
          <View style={styles.emptyReviews}>
            <Icon name="comment-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No reviews yet</Text>
            <Text style={styles.emptySubtext}>Be the first to review this restaurant!</Text>
          </View>
        )}
      </View>

      {/* Review Form Modal */}
      <ReviewForm
        visible={reviewFormVisible}
        onDismiss={() => setReviewFormVisible(false)}
        restaurantId={restaurantId}
        restaurantName={restaurant.name}
        onSubmitSuccess={() => loadData(true)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
  coverImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
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
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  menuSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyMenu: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  reviewsSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    borderRadius: 8,
  },
  showMoreButton: {
    marginTop: 12,
    marginBottom: 8,
  },
  emptyReviews: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default RestaurantDetailScreen;
