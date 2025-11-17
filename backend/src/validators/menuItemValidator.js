const { body, param, query: queryValidator } = require('express-validator');

// Validation for creating a menu item
exports.createMenuItemValidator = [
  body('restaurant_id')
    .isInt({ min: 1 }).withMessage('Restaurant ID must be a valid integer'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('Menu item name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('image_url')
    .optional()
    .trim()
    .isURL().withMessage('Image URL must be a valid URL'),
  
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('discounted_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discounted price must be a positive number'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category cannot exceed 100 characters'),
  
  body('is_available')
    .optional()
    .isBoolean().withMessage('is_available must be a boolean'),
  
  body('is_featured')
    .optional()
    .isBoolean().withMessage('is_featured must be a boolean'),
  
  body('preparation_time')
    .optional()
    .isInt({ min: 0, max: 300 }).withMessage('Preparation time must be between 0-300 minutes'),
  
  body('calories')
    .optional()
    .isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  
  body('ingredients')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ingredients cannot exceed 1000 characters'),
  
  body('allergens')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Allergens cannot exceed 500 characters'),
];

// Validation for updating a menu item
exports.updateMenuItemValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid menu item ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('image_url')
    .optional()
    .trim()
    .isURL().withMessage('Image URL must be a valid URL'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('discounted_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discounted price must be a positive number'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category cannot exceed 100 characters'),
  
  body('is_available')
    .optional()
    .isBoolean().withMessage('is_available must be a boolean'),
  
  body('is_featured')
    .optional()
    .isBoolean().withMessage('is_featured must be a boolean'),
  
  body('preparation_time')
    .optional()
    .isInt({ min: 0, max: 300 }).withMessage('Preparation time must be between 0-300 minutes'),
  
  body('calories')
    .optional()
    .isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  
  body('ingredients')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ingredients cannot exceed 1000 characters'),
  
  body('allergens')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Allergens cannot exceed 500 characters'),
];

// Validation for getting a menu item by ID
exports.getMenuItemByIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid menu item ID'),
];

// Validation for deleting a menu item
exports.deleteMenuItemValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid menu item ID'),
];

// Validation for listing menu items with filters
exports.listMenuItemsValidator = [
  queryValidator('restaurantId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid restaurant ID'),
  
  queryValidator('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category too long'),
  
  queryValidator('q')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Search query too long'),
  
  queryValidator('isAvailable')
    .optional()
    .isBoolean().withMessage('isAvailable must be boolean'),
  
  queryValidator('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be boolean'),
  
  queryValidator('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  
  queryValidator('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be >= 0'),
];
