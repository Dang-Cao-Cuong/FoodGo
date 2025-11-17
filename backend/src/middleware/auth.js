const { verifyToken } = require('../config/jwt');
const { AppError } = require('./errorHandler');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.message === 'Invalid or expired token') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(new AppError('Authentication failed', 401));
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth
};
