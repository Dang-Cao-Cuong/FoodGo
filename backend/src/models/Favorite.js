const db = require('../config/database');

class Favorite {
  /**
   * Add a favorite (restaurant or menu item)
   */
  static async addFavorite(userId, favoriteType, favoriteId) {
    try {
      // Check if already favorited
      const existing = await this.isFavorite(userId, favoriteType, favoriteId);
      if (existing) {
        throw new Error('Already added to favorites');
      }

      // Validate type
      if (!['restaurant', 'menu_item'].includes(favoriteType)) {
        throw new Error('Invalid favorite type');
      }

      // Insert favorite
      const restaurantId = favoriteType === 'restaurant' ? favoriteId : null;
      const menuItemId = favoriteType === 'menu_item' ? favoriteId : null;

      const [result] = await db.pool.execute(
        `INSERT INTO favorites (user_id, restaurant_id, menu_item_id) VALUES (?, ?, ?)`,
        [userId, restaurantId, menuItemId]
      );

      return {
        id: result.insertId,
        user_id: userId,
        favorite_type: favoriteType,
        favorite_id: favoriteId,
        created_at: new Date(),
      };
    } catch (error) {
      throw new Error(`Error adding favorite: ${error.message}`);
    }
  }

  /**
   * Remove a favorite
   */
  static async removeFavorite(userId, favoriteId) {
    try {
      const [result] = await db.pool.execute(
        `DELETE FROM favorites WHERE id = ? AND user_id = ?`,
        [favoriteId, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Favorite not found');
      }

      return { message: 'Favorite removed successfully' };
    } catch (error) {
      throw new Error(`Error removing favorite: ${error.message}`);
    }
  }

  /**
   * Remove favorite by type and ID
   */
  static async removeFavoriteByTypeAndId(userId, favoriteType, favoriteId) {
    try {
      let query;
      if (favoriteType === 'restaurant') {
        query = `DELETE FROM favorites WHERE user_id = ? AND restaurant_id = ?`;
      } else if (favoriteType === 'menu_item') {
        query = `DELETE FROM favorites WHERE user_id = ? AND menu_item_id = ?`;
      } else {
        throw new Error('Invalid favorite type');
      }

      const [result] = await db.pool.execute(query, [userId, favoriteId]);

      if (result.affectedRows === 0) {
        throw new Error('Favorite not found');
      }

      return { message: 'Favorite removed successfully' };
    } catch (error) {
      throw new Error(`Error removing favorite: ${error.message}`);
    }
  }

  /**
   * Get all favorites for a user
   */
  static async getFavoritesByUserId(userId, options = {}) {
    const { favoriteType, limit = 50, offset = 0 } = options;

    try {
      let query = `
        SELECT 
          f.id,
          f.user_id,
          f.restaurant_id,
          f.menu_item_id,
          f.created_at,
          r.name as restaurant_name,
          r.description as restaurant_description,
          r.address as restaurant_address,
          r.cover_url as restaurant_cover_url,
          r.is_open as restaurant_is_open,
          m.name as menu_item_name,
          m.description as menu_item_description,
          m.price as menu_item_price,
          m.image_url as menu_item_image_url,
          m.is_available as menu_item_is_available,
          m.restaurant_id as menu_item_restaurant_id,
          mr.name as menu_item_restaurant_name
        FROM favorites f
        LEFT JOIN restaurants r ON f.restaurant_id = r.id
        LEFT JOIN menu_items m ON f.menu_item_id = m.id
        LEFT JOIN restaurants mr ON m.restaurant_id = mr.id
        WHERE f.user_id = ?
      `;

      const params = [userId];

      if (favoriteType === 'restaurant') {
        query += ' AND f.restaurant_id IS NOT NULL';
      } else if (favoriteType === 'menu_item') {
        query += ' AND f.menu_item_id IS NOT NULL';
      }

      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      query += ` ORDER BY f.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

      const [favorites] = await db.pool.execute(query, params);

      // Format the results
      return favorites.map((fav) => {
        if (fav.restaurant_id) {
          return {
            id: fav.id,
            user_id: fav.user_id,
            favorite_type: 'restaurant',
            favorite_id: fav.restaurant_id,
            created_at: fav.created_at,
            restaurant: {
              id: fav.restaurant_id,
              name: fav.restaurant_name,
              description: fav.restaurant_description,
              address: fav.restaurant_address,
              cover_url: fav.restaurant_cover_url,
              is_open: fav.restaurant_is_open,
            },
          };
        } else {
          return {
            id: fav.id,
            user_id: fav.user_id,
            favorite_type: 'menu_item',
            favorite_id: fav.menu_item_id,
            created_at: fav.created_at,
            menu_item: {
              id: fav.menu_item_id,
              name: fav.menu_item_name,
              description: fav.menu_item_description,
              price: fav.menu_item_price,
              image_url: fav.menu_item_image_url,
              is_available: fav.menu_item_is_available,
              restaurant_id: fav.menu_item_restaurant_id,
              restaurant_name: fav.menu_item_restaurant_name,
            },
          };
        }
      });
    } catch (error) {
      throw new Error(`Error getting favorites: ${error.message}`);
    }
  }

  /**
   * Check if item is favorited
   */
  static async isFavorite(userId, favoriteType, favoriteId) {
    try {
      let query;
      if (favoriteType === 'restaurant') {
        query = `SELECT id FROM favorites WHERE user_id = ? AND restaurant_id = ?`;
      } else if (favoriteType === 'menu_item') {
        query = `SELECT id FROM favorites WHERE user_id = ? AND menu_item_id = ?`;
      } else {
        throw new Error('Invalid favorite type');
      }

      const [favorites] = await db.pool.execute(query, [userId, favoriteId]);

      return favorites.length > 0;
    } catch (error) {
      throw new Error(`Error checking favorite: ${error.message}`);
    }
  }

  /**
   * Get restaurant favorites
   */
  static async getRestaurantFavorites(userId) {
    return this.getFavoritesByUserId(userId, { favoriteType: 'restaurant' });
  }

  /**
   * Get menu item favorites
   */
  static async getMenuItemFavorites(userId) {
    return this.getFavoritesByUserId(userId, { favoriteType: 'menu_item' });
  }

  /**
   * Get favorite count for user
   */
  static async getFavoriteCount(userId) {
    try {
      const [result] = await db.pool.execute(
        `SELECT COUNT(*) as count FROM favorites WHERE user_id = ?`,
        [userId]
      );

      return result[0].count;
    } catch (error) {
      throw new Error(`Error getting favorite count: ${error.message}`);
    }
  }
}

module.exports = Favorite;
