const { body, param, query: queryValidator } = require('express-validator');

// Validation for creating a restaurant
exports.createRestaurantValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Restaurant name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/).withMessage('Phone must be 10-11 digits'),
  
  body('cover_url')
    .optional()
    .trim()
    .isURL().withMessage('Cover URL must be a valid URL'),
  
  body('is_open')
    .optional()
    .isBoolean().withMessage('is_open must be a boolean'),
];

// Validation for updating a restaurant
exports.updateRestaurantValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid restaurant ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/).withMessage('Phone must be 10-11 digits'),
  
  body('cover_url')
    .optional()
    .trim()
    .isURL().withMessage('Cover URL must be a valid URL'),
  
  body('is_open')
    .optional()
    .isBoolean().withMessage('is_open must be a boolean'),
];

// Validation for getting a restaurant by ID
exports.getRestaurantByIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid restaurant ID'),
];

// Validation for deleting a restaurant
exports.deleteRestaurantValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid restaurant ID'),
];

// Validation for listing restaurants with filters
exports.listRestaurantsValidator = [
  queryValidator('q')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Search query too long'),
  
  queryValidator('categoryId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid category ID'),
  
  queryValidator('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  
  queryValidator('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be >= 0'),
];
