const { body, validationResult } = require('express-validator');

// Validation rules for creating a review
exports.createReviewValidator = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string')
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  body('restaurant_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Restaurant ID must be a valid positive integer'),
  body('menu_item_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Menu item ID must be a valid positive integer'),
];

// Validation rules for updating a review
exports.updateReviewValidator = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string')
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
];

// Middleware to check validation result
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};
