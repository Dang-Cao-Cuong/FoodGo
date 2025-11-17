const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validate create order request
exports.validateCreateOrder = [
  body('restaurantId')
    .isInt({ min: 1 })
    .withMessage('Restaurant ID must be a positive integer'),

  body('deliveryAddress')
    .trim()
    .isLength({ min: 10, max: 255 })
    .withMessage('Delivery address must be between 10 and 255 characters'),

  body('subtotalAmount')
    .isFloat({ min: 0 })
    .withMessage('Subtotal amount must be a positive number'),

  body('taxAmount')
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a positive number'),

  body('deliveryFee')
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),

  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),

  body('items.*.menuItemId')
    .isInt({ min: 1 })
    .withMessage('Menu item ID must be a positive integer'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99'),

  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Item price must be a positive number'),

  body('items.*.notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Item notes must not exceed 200 characters'),

  // Custom validator to check if total matches calculation
  body('totalAmount').custom((totalAmount, { req }) => {
    const { subtotalAmount, taxAmount, deliveryFee } = req.body;
    const calculatedTotal = parseFloat(subtotalAmount) + parseFloat(taxAmount) + parseFloat(deliveryFee);
    const difference = Math.abs(calculatedTotal - parseFloat(totalAmount));
    
    // Allow small floating point differences (within 0.01)
    if (difference > 0.01) {
      throw new Error('Total amount does not match subtotal + tax + delivery fee');
    }
    return true;
  }),

  handleValidationErrors,
];

// Validate update order status request
exports.validateUpdateStatus = [
  param('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),

  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),

  handleValidationErrors,
];

// Validate order ID parameter
exports.validateOrderId = [
  param('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),

  handleValidationErrors,
];

// Validate restaurant ID parameter
exports.validateRestaurantId = [
  param('restaurantId')
    .isInt({ min: 1 })
    .withMessage('Restaurant ID must be a positive integer'),

  handleValidationErrors,
];
