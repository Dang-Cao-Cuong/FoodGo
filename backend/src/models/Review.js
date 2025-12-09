const db = require('../config/database');

class Review {
  /**
   * Create a new review
   */
  static async create(reviewData) {
    const { userId, restaurantId, rating, comment } = reviewData;

    try {
      // Check if user already reviewed this restaurant
      const existing = await this.findByUserAndRestaurant(userId, restaurantId);
      if (existing) {
        throw new Error('You have already reviewed this restaurant');
      }

      const [result] = await db.pool.execute(
        `INSERT INTO reviews (user_id, restaurant_id, rating, comment) 
         VALUES (?, ?, ?, ?)`,
        [userId, restaurantId, rating, comment || null]
      );

      return this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }
  }

  /**
   * Find review by ID
   */
  static async findById(reviewId) {
    try {
      const [reviews] = await db.pool.execute(
        `SELECT 
          r.*,
          u.full_name as user_name,
          u.avatar_url as user_avatar,
          res.name as restaurant_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN restaurants res ON r.restaurant_id = res.id
        WHERE r.id = ?`,
        [reviewId]
      );

      return reviews.length > 0 ? reviews[0] : null;
    } catch (error) {
      throw new Error(`Error finding review: ${error.message}`);
    }
  }

  /**
   * Find review by user and restaurant
   */
  static async findByUserAndRestaurant(userId, restaurantId) {
    try {
      const db = require('../config/database');
      const [reviews] = await db.pool.execute(
        `SELECT * FROM reviews WHERE user_id = ? AND restaurant_id = ?`,
        [userId, restaurantId]
      );

      return reviews.length > 0 ? reviews[0] : null;
    } catch (error) {
      throw new Error(`Error finding review: ${error.message}`);
    }
  }

  /**
   * Get reviews by restaurant ID
   */
  static async findByRestaurantId(restaurantId, options = {}) {
    const { limit = 20, offset = 0, rating } = options;

    try {
      let query = `
        SELECT 
          r.*,
          u.full_name as user_name,
          u.avatar_url as user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.restaurant_id = ?
      `;

      const params = [restaurantId];

      if (rating) {
        query += ' AND r.rating = ?';
        params.push(rating);
      }

      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      query += ` ORDER BY r.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

      const [reviews] = await db.pool.execute(query, params);

      return reviews;
    } catch (error) {
      throw new Error(`Error getting restaurant reviews: ${error.message}`);
    }
  }

  /**
   * Get reviews by user ID
   */
  static async findByUserId(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;

    try {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      
      const [reviews] = await db.pool.execute(
        `SELECT 
          r.*,
          res.name as restaurant_name,
          res.cover_url as restaurant_cover_url
        FROM reviews r
        LEFT JOIN restaurants res ON r.restaurant_id = res.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT ${limitNum} OFFSET ${offsetNum}`,
        [userId]
      );

      return reviews;
    } catch (error) {
      throw new Error(`Error getting user reviews: ${error.message}`);
    }
  }

  /**
   * Update a review
   */
  static async update(reviewId, userId, updateData) {
    const { rating, comment } = updateData;

    try {
      // Check if review belongs to user
      const [reviews] = await db.pool.execute(
        'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
        [reviewId, userId]
      );

      if (reviews.length === 0) {
        throw new Error('Review not found or unauthorized');
      }

      const fields = [];
      const values = [];

      if (rating !== undefined) {
        fields.push('rating = ?');
        values.push(rating);
      }

      if (comment !== undefined) {
        fields.push('comment = ?');
        values.push(comment);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');

      if (fields.length === 1) {
        // Only updated_at
        throw new Error('No fields to update');
      }

      values.push(reviewId);

      const [result] = await db.pool.execute(
        `UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw new Error('Review not found');
      }

      return this.findById(reviewId);
    } catch (error) {
      throw new Error(`Error updating review: ${error.message}`);
    }
  }

  /**
   * Delete a review
   */
  static async delete(reviewId, userId) {
    try {
      const [result] = await db.pool.execute(
        'DELETE FROM reviews WHERE id = ? AND user_id = ?',
        [reviewId, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Review not found or unauthorized');
      }

      return { message: 'Review deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }
  }

  /**
   * Get average rating for restaurant
   */
  static async getAverageRating(restaurantId) {
    try {
      const [result] = await db.pool.execute(
        `SELECT 
          AVG(rating) as average_rating,
          COUNT(*) as review_count,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM reviews
        WHERE restaurant_id = ?`,
        [restaurantId]
      );

      const stats = result[0];

      return {
        average_rating: stats.average_rating ? parseFloat(stats.average_rating).toFixed(1) : 0,
        review_count: stats.review_count,
        rating_distribution: {
          five_star: stats.five_star,
          four_star: stats.four_star,
          three_star: stats.three_star,
          two_star: stats.two_star,
          one_star: stats.one_star,
        },
      };
    } catch (error) {
      throw new Error(`Error getting average rating: ${error.message}`);
    }
  }
}

module.exports = Review;
