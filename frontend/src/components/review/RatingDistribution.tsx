import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import RatingStars from '../common/RatingStars';

// RatingStats Interface
export interface RatingStats {
  average_rating: number;
  review_count: number;
  rating_distribution: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
}

interface RatingDistributionProps {
  stats: RatingStats;
}

const RatingDistribution: React.FC<RatingDistributionProps> = ({ stats }) => {
  // Safely extract values with proper type checking
  const average_rating = stats?.average_rating;
  const review_count = stats?.review_count;
  const rating_distribution = stats?.rating_distribution;

  // Handle cases where rating data might be incomplete
  const avgRating = typeof average_rating === 'number' ? average_rating : parseFloat(average_rating as any) || 0;
  const totalReviews = typeof review_count === 'number' ? review_count : parseInt(review_count as any) || 0;
  const distribution = rating_distribution || {
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0,
  };

  const renderDistributionBar = (stars: number, count: number) => {
    const percentage = totalReviews > 0 ? count / totalReviews : 0;

    return (
      <View key={stars} style={styles.barRow}>
        <Text variant="bodySmall" style={styles.starLabel}>
          {stars} ★
        </Text>
        <ProgressBar
          progress={percentage}
          color="#FFD700"
          style={styles.progressBar}
        />
        <Text variant="bodySmall" style={styles.count}>
          {count}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={styles.averageContainer}>
          <Text variant="displaySmall" style={styles.averageRating}>
            {avgRating.toFixed(1)}
          </Text>
          <RatingStars rating={avgRating} size={20} />
          <Text variant="bodySmall" style={styles.reviewCount}>
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        <View style={styles.distributionContainer}>
          {renderDistributionBar(5, distribution.five_star)}
          {renderDistributionBar(4, distribution.four_star)}
          {renderDistributionBar(3, distribution.three_star)}
          {renderDistributionBar(2, distribution.two_star)}
          {renderDistributionBar(1, distribution.one_star)}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  averageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    minWidth: 100,
  },
  averageRating: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reviewCount: {
    color: '#666',
    marginTop: 4,
  },
  distributionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  starLabel: {
    width: 30,
    color: '#666',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  count: {
    width: 30,
    textAlign: 'right',
    color: '#666',
  },
});

export default RatingDistribution;
