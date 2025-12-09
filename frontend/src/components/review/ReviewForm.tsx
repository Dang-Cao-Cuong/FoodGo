import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, Portal, Modal, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API Configuration
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getBaseURL();

interface CreateReviewRequest {
  rating: number;
  comment?: string;
  restaurant_id: number;
}

interface ReviewFormProps {
  visible: boolean;
  onDismiss: () => void;
  restaurantId?: number;
  restaurantName?: string;
  onSubmitSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  visible,
  onDismiss,
  restaurantId,
  restaurantName,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!restaurantId) {
      setError('Restaurant ID missing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('@foodgo_token');
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Your session has expired. Please login again.',
          [{ text: 'OK', onPress: handleCancel }]
        );
        return;
      }

      const reviewData: CreateReviewRequest = {
        rating,
        comment: comment.trim() || undefined,
        restaurant_id: restaurantId,
      };

      console.log('Submitting review:', reviewData);

      await axios.post(`${API_BASE_URL}/reviews`, reviewData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Review submitted successfully');

      // Reset form
      setRating(0);
      setComment('');

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      onDismiss();
    } catch (err: any) {
      console.error('Review submission error:', err.response?.data || err.message);

      // Handle specific authentication errors
      if (err.response?.status === 401) {
        Alert.alert(
          'Authentication Failed',
          'Your session has expired. Please login again.',
          [{ text: 'OK', onPress: handleCancel }]
        );
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    setError('');
    onDismiss();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
          >
            <IconButton
              icon={star <= rating ? 'star' : 'star-outline'}
              size={40}
              iconColor={star <= rating ? '#FFD700' : '#E0E0E0'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modal}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Write a Review
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={handleCancel}
            />
          </View>

          {(restaurantName || menuItemName) && (
            <Text variant="bodyMedium" style={styles.itemName}>
              {restaurantName || menuItemName}
            </Text>
          )}

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Rating *
            </Text>
            {renderStars()}
            {rating > 0 && (
              <Text variant="bodySmall" style={styles.ratingText}>
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Comment (Optional)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Share your experience..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={1000}
              style={styles.input}
            />
            <Text variant="bodySmall" style={styles.charCount}>
              {comment.length}/1000
            </Text>
          </View>

          {error && (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          )}

          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.button}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting || rating === 0}
            >
              Submit
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: '600',
  },
  itemName: {
    paddingHorizontal: 20,
    color: '#6200ea',
    fontWeight: '500',
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  ratingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#fff',
  },
  charCount: {
    textAlign: 'right',
    color: '#666',
    marginTop: 4,
  },
  error: {
    color: '#B00020',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default ReviewForm;
