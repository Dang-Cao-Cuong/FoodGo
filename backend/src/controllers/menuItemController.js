const { validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const { AppError } = require('../middleware/errorHandler');

// Get all menu items with optional filters
exports.getMenuItems = async (req, res, next) => {
  try {
    const { restaurantId, category, q, isAvailable, isFeatured, limit, offset } = req.query;
    const { id: restaurantIdFromParams } = req.params;

    const options = {
      restaurantId: restaurantIdFromParams ? parseInt(restaurantIdFromParams, 10) : (restaurantId ? parseInt(restaurantId, 10) : undefined),
      category,
      q,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    const { menuItems, count } = await MenuItem.findAll(options);

    res.json({
      success: true,
      data: {
        menuItems,
        count,
        limit: options.limit,
        offset: options.offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single menu item by ID
exports.getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return next(new AppError('Menu item not found', 404));
    }

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new menu item (admin only)
exports.createMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const {
      restaurant_id,
      name,
      description,
      image_url,
      price,
      discounted_price,
      category,
      is_available,
      is_featured,
      preparation_time,
      calories,
      ingredients,
      allergens,
    } = req.body;

    const menuItem = await MenuItem.create({
      restaurant_id,
      name,
      description,
      image_url,
      price,
      discounted_price,
      category,
      is_available,
      is_featured,
      preparation_time,
      calories,
      ingredients,
      allergens,
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Update a menu item (admin only)
exports.updateMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const { id } = req.params;

    // Check if menu item exists
    const existing = await MenuItem.findById(id);
    if (!existing) {
      return next(new AppError('Menu item not found', 404));
    }

    const {
      name,
      description,
      image_url,
      price,
      discounted_price,
      category,
      is_available,
      is_featured,
      preparation_time,
      calories,
      ingredients,
      allergens,
    } = req.body;

    const updatedMenuItem = await MenuItem.update(id, {
      name,
      description,
      image_url,
      price,
      discounted_price,
      category,
      is_available,
      is_featured,
      preparation_time,
      calories,
      ingredients,
      allergens,
    });

    res.json({
      success: true,
      data: updatedMenuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a menu item (admin only)
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if menu item exists
    const existing = await MenuItem.findById(id);
    if (!existing) {
      return next(new AppError('Menu item not found', 404));
    }

    await MenuItem.delete(id);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
