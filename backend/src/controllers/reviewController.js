const Review = require('../models/Review');

/**
 * Create a new review
 */
exports.createReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { restaurant_id, rating, comment } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: 'restaurant_id is required',
      });
    }

    const reviewData = {
      userId,
      restaurantId: restaurant_id,
      rating,
      comment,
    };

    const review = await Review.create(reviewData);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a restaurant
 */
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { rating, limit, offset } = req.query;

    const options = {
      rating: rating ? parseInt(rating) : undefined,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    };

    const reviews = await Review.findByRestaurantId(restaurantId, options);
    const ratingStats = await Review.getAverageRating(restaurantId);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        rating_stats: ratingStats,
        pagination: {
          limit: options.limit,
          offset: options.offset,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my reviews
 */
exports.getMyReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    };

    const reviews = await Review.findByUserId(userId, options);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          limit: options.limit,
          offset: options.offset,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 */
exports.updateReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const updateData = { rating, comment };

    const review = await Review.update(reviewId, userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    await Review.delete(reviewId, userId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get restaurant rating statistics
 */
exports.getRestaurantRatingStats = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const ratingStats = await Review.getAverageRating(restaurantId);

    res.status(200).json({
      success: true,
      data: ratingStats,
    });
  } catch (error) {
    next(error);
  }
};
