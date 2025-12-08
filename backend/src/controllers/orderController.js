const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      restaurantId,
      deliveryAddress,
      totalAmount,
      deliveryFee,
      taxAmount,
      subtotalAmount,
      notes,
      items,
    } = req.body;

    // Validate items array
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Create order
    const order = await Order.create({
      userId,
      restaurantId,
      deliveryAddress,
      totalAmount,
      deliveryFee,
      taxAmount,
      subtotalAmount,
      notes,
      items,
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for the authenticated user
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset, status } = req.query;

    const options = {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    };

    if (status) {
      options.status = status;
    }

    const orders = await Order.findByUserId(userId, options);

    res.json({
      orders,
      pagination: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to order' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.updateStatus(orderId, status);

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.cancel(orderId, userId);

    res.json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get order statistics for the authenticated user
exports.getMyOrderStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await Order.getUserStats(userId);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// Get restaurant orders (for restaurant owners/admins)
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { limit, offset, status } = req.query;

    const options = {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    };

    if (status) {
      options.status = status;
    }

    const orders = await Order.findByRestaurantId(restaurantId, options);

    res.json({
      orders,
      pagination: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Pay for order
exports.payOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { action } = req.body; // 'deliver' or 'cancel'

    if (!action || !['deliver', 'cancel'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "deliver" or "cancel"' });
    }

    const order = await Order.payOrder(orderId, userId, action);

    res.json({
      message: `Order ${action === 'deliver' ? 'completed' : 'cancelled'} successfully`,
      order,
    });
  } catch (error) {
    next(error);
  }
};
