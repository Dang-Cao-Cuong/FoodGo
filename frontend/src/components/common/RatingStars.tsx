import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  showHalfStars?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 16,
  color = '#FFD700',
  emptyColor = '#E0E0E0',
  showHalfStars = true,
}) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = showHalfStars && rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon
          key={`star-${i}`}
          source="star"
          size={size}
          color={color}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <Icon
          key="star-half"
          source="star-half-full"
          size={size}
          color={color}
        />
      );
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          source="star-outline"
          size={size}
          color={emptyColor}
        />
      );
    }

    return stars;
  };

  return <View style={styles.container}>{renderStars()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RatingStars;
