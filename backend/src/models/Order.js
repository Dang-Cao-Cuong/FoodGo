const db = require('../config/database');

class Order {
  // Helper function to normalize order data (convert price strings to numbers)
  static normalizeOrder(order) {
    if (!order) return null;
    return {
      ...order,
      subtotal: order.subtotal ? parseFloat(order.subtotal) : 0,
      subtotal_amount: order.subtotal_amount ? parseFloat(order.subtotal_amount) : 0,
      delivery_fee: order.delivery_fee ? parseFloat(order.delivery_fee) : 0,
      tax_amount: order.tax_amount ? parseFloat(order.tax_amount) : 0,
      discount_amount: order.discount_amount ? parseFloat(order.discount_amount) : 0,
      total_amount: order.total_amount ? parseFloat(order.total_amount) : 0,
      items: order.items ? order.items.map(item => ({
        ...item,
        item_price: item.item_price ? parseFloat(item.item_price) : 0,
        price: item.price ? parseFloat(item.price) : (item.item_price ? parseFloat(item.item_price) : 0),
        subtotal: item.subtotal ? parseFloat(item.subtotal) : 0,
      })) : undefined,
    };
  }

  // Generate unique order number
  static generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  // Create a new order
  static async create(orderData) {
    const {
      userId,
      restaurantId,
      deliveryAddress,
      deliveryPhone = '',
      deliveryNotes = null,
      totalAmount,
      deliveryFee = 0,
      taxAmount = 0,
      subtotalAmount,
      paymentMethod = 'cash',
      items,
    } = orderData;

    try {
      // Start transaction
      const connection = await db.pool.getConnection();
      await connection.beginTransaction();

      try {
        const orderNumber = this.generateOrderNumber();

        // Insert order with 'preparing' status
        const [orderResult] = await connection.execute(
          `INSERT INTO orders (
            order_number, user_id, restaurant_id, delivery_address, 
            delivery_phone, delivery_notes, subtotal, delivery_fee, 
            tax_amount, total_amount, 
            payment_method, order_status, payment_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderNumber,
            userId,
            restaurantId,
            deliveryAddress,
            deliveryPhone,
            deliveryNotes,
            subtotalAmount,
            deliveryFee,
            taxAmount,
            totalAmount,
            paymentMethod,
            'preparing',
            'pending',
          ]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        if (items && items.length > 0) {
          const itemValues = items.map((item) => [
            orderId,
            item.menuItemId,
            item.name || 'Unknown Item',
            item.price,
            item.quantity,
            item.price * item.quantity,
            item.notes || null,
          ]);

          await connection.query(
            `INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity, subtotal, special_instructions) VALUES ?`,
            [itemValues]
          );
        }

        // Commit transaction
        await connection.commit();
        connection.release();

        const order = await this.findById(orderId);
        return this.normalizeOrder(order);
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  // Find order by ID with items
  static async findById(orderId) {
    try {
      // Get order details
      const [orders] = await db.pool.execute(
        `SELECT 
          o.*,
          r.name as restaurant_name,
          r.address as restaurant_address,
          r.phone as restaurant_phone,
          u.full_name as user_name,
          u.email as user_email,
          u.phone as user_phone
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?`,
        [orderId]
      );

      if (orders.length === 0) {
        return null;
      }

      const order = orders[0];

      // Get order items with menu item details
      const [items] = await db.pool.execute(
        `SELECT 
          oi.*,
          mi.name as menu_item_name,
          mi.description as menu_item_description,
          mi.image_url as menu_item_image
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?`,
        [orderId]
      );

      order.items = items;
      
      // Map order_status to status for API consistency
      order.status = order.order_status;

      return this.normalizeOrder(order);
    } catch (error) {
      throw new Error(`Error finding order: ${error.message}`);
    }
  }

  // Find all orders for a user
  static async findByUserId(userId, options = {}) {
    const { limit = 20, offset = 0, status } = options;

    try {
      let query = `
        SELECT 
          o.*,
          r.name as restaurant_name,
          r.cover_url as restaurant_image,
          COUNT(oi.id) as item_count
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
      `;

      const params = [userId];

      if (status) {
        query += ' AND o.order_status = ?';
        params.push(status);
      }

      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

      const [orders] = await db.pool.execute(query, params);
      
      // Map order_status to status for API consistency and normalize prices
      const mappedOrders = orders.map(order => this.normalizeOrder({
        ...order,
        status: order.order_status
      }));

      return mappedOrders;
    } catch (error) {
      throw new Error(`Error finding user orders: ${error.message}`);
    }
  }

  // Find all orders for a restaurant
  static async findByRestaurantId(restaurantId, options = {}) {
    const { limit = 20, offset = 0, status } = options;

    try {
      let query = `
        SELECT 
          o.*,
          u.full_name as user_name,
          u.phone as user_phone,
          COUNT(oi.id) as item_count
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.restaurant_id = ?
      `;

      const params = [restaurantId];

      if (status) {
        query += ' AND o.order_status = ?';
        params.push(status);
      }

      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

      const [orders] = await db.pool.execute(query, params);
      
      // Map order_status to status for API consistency and normalize prices
      const mappedOrders = orders.map(order => this.normalizeOrder({
        ...order,
        status: order.order_status
      }));

      return mappedOrders;
    } catch (error) {
      throw new Error(`Error finding restaurant orders: ${error.message}`);
    }
  }

  // Update order status
  static async updateStatus(orderId, status, userId = null) {
    try {
      // Validate status
      const validStatuses = ['preparing', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      // If userId is provided, verify order belongs to user
      if (userId) {
        const [orders] = await db.pool.execute(
          'SELECT id FROM orders WHERE id = ? AND user_id = ?',
          [orderId, userId]
        );

        if (orders.length === 0) {
          throw new Error('Order not found or unauthorized');
        }
      }

      const [result] = await db.pool.execute(
        'UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, orderId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Order not found');
      }

      const order = await this.findById(orderId);
      return this.normalizeOrder(order);
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  // Cancel order
  static async cancel(orderId, userId) {
    try {
      // Check if order can be cancelled (only placed or confirmed orders)
      const [orders] = await db.pool.execute(
        'SELECT order_status FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId]
      );

      if (orders.length === 0) {
        throw new Error('Order not found');
      }

      const order = orders[0];
      if (order.order_status !== 'preparing') {
        throw new Error('Order cannot be cancelled');
      }

      return this.updateStatus(orderId, 'cancelled', userId);
    } catch (error) {
      throw new Error(`Error cancelling order: ${error.message}`);
    }
  }

  // Get order statistics for a user
  static async getUserStats(userId) {
    try {
      const [stats] = await db.pool.execute(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          SUM(CASE WHEN order_status = 'preparing' THEN 1 ELSE 0 END) as active_orders,
          COALESCE(SUM(CASE WHEN order_status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_spent
        FROM orders
        WHERE user_id = ?`,
        [userId]
      );

      return stats[0];
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  // Pay for order and update status
  static async payOrder(orderId, userId, action) {
    try {
      // Verify order belongs to user and is in preparing status
      const [orders] = await db.pool.execute(
        'SELECT order_status, payment_status FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId]
      );

      if (orders.length === 0) {
        throw new Error('Order not found');
      }

      const order = orders[0];
      if (order.order_status !== 'preparing') {
        throw new Error('Order cannot be paid - invalid status');
      }

      if (order.payment_status !== 'pending') {
        throw new Error('Order has already been paid');
      }

      // Determine new status based on action
      let newStatus = 'delivered';
      let paymentStatus = 'paid';
      
      if (action === 'cancel') {
        newStatus = 'cancelled';
        paymentStatus = 'failed';
      }

      // Update order
      const [result] = await db.pool.execute(
        `UPDATE orders 
         SET order_status = ?, 
             payment_status = ?, 
             delivered_at = ?, 
             cancelled_at = ?,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          newStatus,
          paymentStatus,
          action === 'deliver' ? new Date() : null,
          action === 'cancel' ? new Date() : null,
          orderId,
        ]
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to update order');
      }

      const updatedOrder = await this.findById(orderId);
      return this.normalizeOrder(updatedOrder);
    } catch (error) {
      throw new Error(`Error paying for order: ${error.message}`);
    }
  }
}

module.exports = Order;
