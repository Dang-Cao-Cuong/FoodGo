const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./src/config/database');
const { errorHandler } = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'FoodGo API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./src/routes/auth');
const restaurantRoutes = require('./src/routes/restaurants');
const menuItemRoutes = require('./src/routes/menuItems');
const orderRoutes = require('./src/routes/orders');
const favoriteRoutes = require('./src/routes/favorites');
const reviewRoutes = require('./src/routes/reviews');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`FoodGo API Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test database connection
  await testConnection();
});

module.exports = app;
