const { query } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Create a new user
  static async create({ email, password, full_name, phone }) {
    try {
      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const sql = `
        INSERT INTO users (email, password_hash, full_name, phone)
        VALUES (?, ?, ?, ?)
      `;

      const result = await query(sql, [email, password_hash, full_name, phone]);
      
      return {
        id: result.insertId,
        email,
        full_name,
        phone
      };
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const results = await query(sql, [email]);
    return results[0];
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT id, email, full_name, phone, avatar_url, is_verified, role, created_at FROM users WHERE id = ? AND is_active = TRUE';
    const results = await query(sql, [id]);
    return results[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update last login
  static async updateLastLogin(userId) {
    const sql = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [userId]);
  }

  // Update user profile
  static async update(userId, updateData) {
    const fields = [];
    const values = [];

    // Only update fields that are provided
    if (updateData.full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(updateData.full_name);
    }
    if (updateData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updateData.phone);
    }
    if (updateData.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updateData.avatar_url);
    }

    if (fields.length === 0) {
      return await this.findById(userId);
    }

    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    await query(sql, values);
    return await this.findById(userId);
  }

  // Change password
  static async changePassword(userId, newPassword) {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    await query(sql, [password_hash, userId]);
  }

  // Check if email exists
  static async emailExists(email) {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0].count > 0;
  }
}

module.exports = User;
