const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const favoriteController = require('../controllers/favoriteController');
const { addFavoriteValidator, validate } = require('../validators/favoriteValidator');

// All routes require authentication
router.use(authenticate);

// Add favorite
router.post('/', addFavoriteValidator, validate, favoriteController.addFavorite);

// Get my favorites
router.get('/my-favorites', favoriteController.getMyFavorites);

// Get restaurant favorites
router.get('/restaurants', favoriteController.getRestaurantFavorites);

// Get menu item favorites
router.get('/menu-items', favoriteController.getMenuItemFavorites);

// Check if item is favorited
router.get('/check/:type/:id', favoriteController.checkFavorite);

// Remove favorite by ID
router.delete('/:favoriteId', favoriteController.removeFavorite);

// Remove favorite by type and ID
router.delete('/:type/:id', favoriteController.removeFavoriteByTypeAndId);

module.exports = router;
