const Restaurant = require('../models/Restaurant');
const { AppError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all restaurants with optional search and filters
 * @route   GET /api/restaurants
 * @access  Public
 */
/**
 * @desc    Lấy danh sách nhà hàng (có hỗ trợ tìm kiếm và lọc)
 * @route   GET /api/restaurants
 * @access  Public
 */
exports.getRestaurants = async (req, res, next) => {
  try {
    // 1. Validate request (kiểm tra đầu vào nếu có rule validate)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    // 2. Lấy tham số từ URL Query String
    // q: Từ khóa tìm kiếm (tên, mô tả)
    // categoryId: Lọc theo danh mục
    // limit: Số lượng bản ghi tối đa (mặc định 20)
    // offset: Vị trí bắt đầu lấy (dùng cho phân trang)
    const { q, categoryId, limit = 20, offset = 0 } = req.query;
    
    // 3. Gọi Model để truy vấn Database
    const restaurants = await Restaurant.findAll({
      q,
      categoryId,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 4. Trả về kết quả JSON chuẩn
    res.status(200).json({
      success: true,
      data: {
        restaurants,
        count: restaurants.length, // Số lượng bản ghi trả về trong request này
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error); // Chuyển lỗi sang middleware xử lý lỗi chung
  }
};

/**
 * @desc    Get single restaurant by ID
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
exports.getRestaurantById = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new restaurant
 * @route   POST /api/restaurants
 * @access  Private/Admin
 */
exports.createRestaurant = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { name, description, address, phone, cover_url, is_open } = req.body;

    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      phone,
      cover_url,
      is_open,
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update restaurant
 * @route   PUT /api/restaurants/:id
 * @access  Private/Admin
 */
exports.updateRestaurant = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    
    // Check if restaurant exists
    const existingRestaurant = await Restaurant.findById(id);
    if (!existingRestaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    const { name, description, address, phone, cover_url, is_open } = req.body;

    const restaurant = await Restaurant.update(id, {
      name,
      description,
      address,
      phone,
      cover_url,
      is_open,
    });

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/restaurants/:id
 * @access  Private/Admin
 */
exports.deleteRestaurant = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    await Restaurant.delete(id);

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
