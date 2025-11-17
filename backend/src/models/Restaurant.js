const { query } = require('../config/database');

class Restaurant {
  // Create a new restaurant
  static async create({ name, description = null, address = null, phone = null, cover_url = null, is_open = true }) {
    const sql = `
      INSERT INTO restaurants
        (name, slug, description, address, phone, cover_url, is_open)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const params = [name, slug, description, address, phone, cover_url, is_open ? 1 : 0];
    const result = await query(sql, params);
    const insertId = result.insertId;
    return await this.findById(insertId);
  }

  // Find restaurant by id
  static async findById(id) {
    const sql = `SELECT id, name, slug, description, address, phone, cover_url, is_open, created_at FROM restaurants WHERE id = ? LIMIT 1`;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  // List restaurants with optional search, category filter and pagination
  // options: { q, categoryId, limit, offset }
  static async findAll(options = {}) {
    const { q, categoryId } = options;
    
    // Ensure limit and offset are valid integers with default values
    let limit = options.limit !== undefined ? parseInt(options.limit, 10) : 20;
    let offset = options.offset !== undefined ? parseInt(options.offset, 10) : 0;
    
    // Fallback if parseInt returns NaN
    if (isNaN(limit) || limit < 1) limit = 20;
    if (isNaN(offset) || offset < 0) offset = 0;
    
    const where = [];
    const params = [];

    if (q) {
      where.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }

    if (categoryId) {
      where.push('category_id = ?');
      params.push(parseInt(categoryId, 10));
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT r.id, r.name, r.slug, r.description, r.address, r.phone, r.cover_url, r.is_open, r.created_at
      FROM restaurants r
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const rows = await query(sql, params);
    return rows;
  }

  // Update restaurant (only update provided fields)
  static async update(id, updateData) {
    const fields = [];
    const params = [];

    if (updateData.name !== undefined) { fields.push('name = ?'); params.push(updateData.name); }
    if (updateData.description !== undefined) { fields.push('description = ?'); params.push(updateData.description); }
    if (updateData.address !== undefined) { fields.push('address = ?'); params.push(updateData.address); }
    if (updateData.phone !== undefined) { fields.push('phone = ?'); params.push(updateData.phone); }
    if (updateData.cover_url !== undefined) { fields.push('cover_url = ?'); params.push(updateData.cover_url); }
    if (updateData.is_open !== undefined) { fields.push('is_open = ?'); params.push(updateData.is_open ? 1 : 0); }

    if (fields.length === 0) return await this.findById(id);

    params.push(id);
    const sql = `UPDATE restaurants SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, params);
    return await this.findById(id);
  }

  // Delete restaurant
  static async delete(id) {
    const sql = 'DELETE FROM restaurants WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = Restaurant;
