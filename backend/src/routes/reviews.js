const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');
const { createReviewValidator, updateReviewValidator, validate } = require('../validators/reviewValidator');

// Public routes
// Get restaurant reviews
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

// Get menu item reviews
router.get('/menu-item/:menuItemId', reviewController.getMenuItemReviews);

// Get restaurant rating stats
router.get('/restaurant/:restaurantId/stats', reviewController.getRestaurantRatingStats);

// Protected routes (require authentication)
router.use(authenticate);

// Create review
router.post('/', createReviewValidator, validate, reviewController.createReview);

// Get my reviews
router.get('/my-reviews', reviewController.getMyReviews);

// Update review
router.put('/:reviewId', updateReviewValidator, validate, reviewController.updateReview);

// Delete review
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
