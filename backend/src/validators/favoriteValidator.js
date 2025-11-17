const { body, validationResult } = require('express-validator');

// Validation rules for adding favorite
exports.addFavoriteValidator = [
  body('favorite_type')
    .notEmpty()
    .withMessage('Favorite type is required')
    .isIn(['restaurant', 'menu_item'])
    .withMessage('Invalid favorite type. Must be "restaurant" or "menu_item"'),
  body('favorite_id')
    .notEmpty()
    .withMessage('Favorite ID is required')
    .isInt({ min: 1 })
    .withMessage('Favorite ID must be a valid positive integer'),
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
