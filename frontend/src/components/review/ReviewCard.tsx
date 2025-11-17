import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import RatingStars from '../common/RatingStars';
import { Review } from '../../services/reviewService';

interface ReviewCardProps {
  review: Review;
  showRestaurantName?: boolean;
  showMenuItemName?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showRestaurantName = false,
  showMenuItemName = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <Avatar.Text
            size={40}
            label={review.user_name?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text variant="bodyMedium" style={styles.userName}>
              {review.user_name || 'Anonymous'}
            </Text>
            <View style={styles.ratingRow}>
              <RatingStars rating={review.rating} size={14} />
              <Text variant="bodySmall" style={styles.date}>
                • {formatDate(review.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {showRestaurantName && review.restaurant_name && (
          <Text variant="bodySmall" style={styles.itemName}>
            {review.restaurant_name}
          </Text>
        )}

        {showMenuItemName && review.menu_item_name && (
          <Text variant="bodySmall" style={styles.itemName}>
            {review.menu_item_name}
          </Text>
        )}

        {review.comment && (
          <Text variant="bodyMedium" style={styles.comment}>
            {review.comment}
          </Text>
        )}

        {review.updated_at !== review.created_at && (
          <Text variant="bodySmall" style={styles.edited}>
            (Edited)
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: '#6200ea',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: '#666',
    marginLeft: 8,
  },
  itemName: {
    color: '#6200ea',
    marginBottom: 8,
    fontWeight: '500',
  },
  comment: {
    color: '#333',
    lineHeight: 20,
  },
  edited: {
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default ReviewCard;
