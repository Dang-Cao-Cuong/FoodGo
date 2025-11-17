import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { RatingStats } from '../../services/reviewService';
import RatingStars from '../common/RatingStars';

interface RatingDistributionProps {
  stats: RatingStats;
}

const RatingDistribution: React.FC<RatingDistributionProps> = ({ stats }) => {
  const { average_rating, review_count, rating_distribution } = stats;

  const renderDistributionBar = (stars: number, count: number) => {
    const percentage = review_count > 0 ? count / review_count : 0;

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
            {average_rating.toFixed(1)}
          </Text>
          <RatingStars rating={average_rating} size={20} />
          <Text variant="bodySmall" style={styles.reviewCount}>
            {review_count} {review_count === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        <View style={styles.distributionContainer}>
          {renderDistributionBar(5, rating_distribution.five_star)}
          {renderDistributionBar(4, rating_distribution.four_star)}
          {renderDistributionBar(3, rating_distribution.three_star)}
          {renderDistributionBar(2, rating_distribution.two_star)}
          {renderDistributionBar(1, rating_distribution.one_star)}
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
