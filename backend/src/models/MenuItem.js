const { query } = require('../config/database');

class MenuItem {
  // Helper function to normalize menu item data (convert price strings to numbers)
  static normalizeMenuItem(item) {
    if (!item) return null;
    return {
      ...item,
      price: item.price ? parseFloat(item.price) : 0,
      discounted_price: item.discounted_price ? parseFloat(item.discounted_price) : null,
      average_rating: item.average_rating ? parseFloat(item.average_rating) : 0,
      is_available: Boolean(item.is_available),
      is_featured: Boolean(item.is_featured),
    };
  }

  // Create a new menu item
  static async create({ 
    restaurant_id, 
    name, 
    description = null, 
    image_url = null, 
    price, 
    discounted_price = null,
    category = null,
    is_available = true,
    is_featured = false,
    preparation_time = 15,
    calories = null,
    ingredients = null,
    allergens = null
  }) {
    const sql = `
      INSERT INTO menu_items
        (restaurant_id, name, slug, description, image_url, price, discounted_price, 
         category, is_available, is_featured, preparation_time, calories, ingredients, allergens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const params = [
      restaurant_id, name, slug, description, image_url, price, discounted_price,
      category, is_available ? 1 : 0, is_featured ? 1 : 0, preparation_time, 
      calories, ingredients, allergens
    ];
    
    const result = await query(sql, params);
    const insertId = result.insertId;
    const item = await this.findById(insertId);
    return this.normalizeMenuItem(item);
  }

  // Find menu item by id
  static async findById(id) {
    const sql = `
      SELECT id, restaurant_id, name, slug, description, image_url, price, discounted_price,
             category, is_available, is_featured, preparation_time, calories, ingredients, 
             allergens, average_rating, total_reviews, created_at
      FROM menu_items 
      WHERE id = ? 
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return this.normalizeMenuItem(rows[0]);
  }

  // List menu items with optional filters
  // options: { restaurantId, category, q, isAvailable, isFeatured, limit, offset }
  static async findAll(options = {}) {
    const { restaurantId, category, q, isAvailable, isFeatured } = options;
    
    // Ensure limit and offset are valid integers with default values
    let limit = options.limit !== undefined ? parseInt(options.limit, 10) : 50;
    let offset = options.offset !== undefined ? parseInt(options.offset, 10) : 0;
    
    // Fallback if parseInt returns NaN
    if (isNaN(limit) || limit < 1) limit = 50;
    if (isNaN(offset) || offset < 0) offset = 0;
    
    const where = [];
    const params = [];

    if (restaurantId) {
      where.push('restaurant_id = ?');
      params.push(parseInt(restaurantId, 10));
    }

    if (category) {
      where.push('category = ?');
      params.push(category);
    }

    if (q) {
      where.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    if (isAvailable !== undefined) {
      where.push('is_available = ?');
      params.push(isAvailable ? 1 : 0);
    }

    if (isFeatured !== undefined) {
      where.push('is_featured = ?');
      params.push(isFeatured ? 1 : 0);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT id, restaurant_id, name, slug, description, image_url, price, discounted_price,
             category, is_available, is_featured, preparation_time, calories, ingredients,
             allergens, average_rating, total_reviews, created_at
      FROM menu_items
      ${whereClause}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `
      SELECT COUNT(*) as count
      FROM menu_items
      ${whereClause}
    `;

    const [menuItems, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, params)
    ]);

    return {
      menuItems: menuItems.map(item => this.normalizeMenuItem(item)),
      count: countResult[0]?.count || 0
    };
  }

  // Update menu item (only update provided fields)
  static async update(id, updateData) {
    const fields = [];
    const params = [];

    if (updateData.name !== undefined) { fields.push('name = ?'); params.push(updateData.name); }
    if (updateData.description !== undefined) { fields.push('description = ?'); params.push(updateData.description); }
    if (updateData.image_url !== undefined) { fields.push('image_url = ?'); params.push(updateData.image_url); }
    if (updateData.price !== undefined) { fields.push('price = ?'); params.push(updateData.price); }
    if (updateData.discounted_price !== undefined) { fields.push('discounted_price = ?'); params.push(updateData.discounted_price); }
    if (updateData.category !== undefined) { fields.push('category = ?'); params.push(updateData.category); }
    if (updateData.is_available !== undefined) { fields.push('is_available = ?'); params.push(updateData.is_available ? 1 : 0); }
    if (updateData.is_featured !== undefined) { fields.push('is_featured = ?'); params.push(updateData.is_featured ? 1 : 0); }
    if (updateData.preparation_time !== undefined) { fields.push('preparation_time = ?'); params.push(updateData.preparation_time); }
    if (updateData.calories !== undefined) { fields.push('calories = ?'); params.push(updateData.calories); }
    if (updateData.ingredients !== undefined) { fields.push('ingredients = ?'); params.push(updateData.ingredients); }
    if (updateData.allergens !== undefined) { fields.push('allergens = ?'); params.push(updateData.allergens); }

    if (fields.length === 0) return await this.findById(id);

    params.push(id);
    const sql = `UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, params);
    const item = await this.findById(id);
    return this.normalizeMenuItem(item);
  }

  // Delete menu item
  static async delete(id) {
    const sql = 'DELETE FROM menu_items WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = MenuItem;
