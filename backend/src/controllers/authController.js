const User = require('../models/User');
const { generateAuthTokens } = require('../config/jwt');
const { AppError, catchAsync } = require('../middleware/errorHandler');

// Register new user
const register = catchAsync(async (req, res) => {
  const { email, password, full_name, phone } = req.body;

  // Check if email already exists
  const emailExists = await User.emailExists(email);
  if (emailExists) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Email already registered',
      error: {
        statusCode: 400,
        status: 'fail',
        isOperational: true
      }
    });
  }

  // Create user
  const user = await User.create({
    email,
    password,
    full_name,
    phone
  });

  // Generate tokens
  const tokens = generateAuthTokens(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone
      },
      ...tokens
    }
  });
});

// Login user
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await User.verifyPassword(password, user.password_hash);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update last login
  await User.updateLastLogin(user.id);

  // Generate tokens
  const tokens = generateAuthTokens(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role
      },
      ...tokens
    }
  });
});

// Get current user profile
const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// Update user profile
const updateProfile = catchAsync(async (req, res) => {
  const { full_name, phone, avatar_url } = req.body;

  const updatedUser = await User.update(req.user.id, {
    full_name,
    phone,
    avatar_url
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  });
});

// Change password
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findByEmail(req.user.email);

  // Verify current password
  const isPasswordValid = await User.verifyPassword(currentPassword, user.password_hash);
  
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  await User.changePassword(req.user.id, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Logout (client-side will remove token)
const logout = catchAsync(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
