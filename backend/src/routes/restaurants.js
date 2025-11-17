const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createRestaurantValidator,
  updateRestaurantValidator,
  getRestaurantByIdValidator,
  deleteRestaurantValidator,
  listRestaurantsValidator,
} = require('../validators/restaurantValidator');

/**
 * @route   GET /api/restaurants
 * @desc    Get all restaurants with optional filters
 * @access  Public
 */
router.get(
  '/',
  listRestaurantsValidator,
  restaurantController.getRestaurants
);

/**
 * @route   GET /api/restaurants/:id
 * @desc    Get restaurant by ID
 * @access  Public
 */
router.get(
  '/:id',
  getRestaurantByIdValidator,
  restaurantController.getRestaurantById
);

/**
 * @route   POST /api/restaurants
 * @desc    Create new restaurant
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  createRestaurantValidator,
  restaurantController.createRestaurant
);

/**
 * @route   PUT /api/restaurants/:id
 * @desc    Update restaurant
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateRestaurantValidator,
  restaurantController.updateRestaurant
);

/**
 * @route   DELETE /api/restaurants/:id
 * @desc    Delete restaurant
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteRestaurantValidator,
  restaurantController.deleteRestaurant
);

module.exports = router;
