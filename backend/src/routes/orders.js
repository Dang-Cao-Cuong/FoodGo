const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const orderController = require('../controllers/orderController');
const { validateCreateOrder, validateUpdateStatus } = require('../validators/orderValidator');

// All routes require authentication
router.use(authenticate);

// Create a new order
router.post('/', validateCreateOrder, orderController.createOrder);

// Get current user's orders
router.get('/my-orders', orderController.getMyOrders);

// Get current user's order statistics
router.get('/my-orders/stats', orderController.getMyOrderStats);

// Get order by ID
router.get('/:orderId', orderController.getOrderById);

// Cancel order
router.post('/:orderId/cancel', orderController.cancelOrder);

// Pay for order (complete or cancel)
router.put('/:orderId/pay', orderController.payOrder);

// Update order status (for admins/restaurant owners)
router.patch('/:orderId/status', validateUpdateStatus, orderController.updateOrderStatus);

// Get restaurant orders (for restaurant owners/admins)
router.get('/restaurant/:restaurantId', orderController.getRestaurantOrders);

module.exports = router;
