const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createMenuItemValidator,
  updateMenuItemValidator,
  getMenuItemByIdValidator,
  deleteMenuItemValidator,
  listMenuItemsValidator,
} = require('../validators/menuItemValidator');

// Public routes
router.get(
  '/',
  listMenuItemsValidator,
  menuItemController.getMenuItems
);

router.get(
  '/:id',
  getMenuItemByIdValidator,
  menuItemController.getMenuItemById
);

// Admin routes (protected)
router.post(
  '/',
  authenticate,
  requireAdmin,
  createMenuItemValidator,
  menuItemController.createMenuItem
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateMenuItemValidator,
  menuItemController.updateMenuItem
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteMenuItemValidator,
  menuItemController.deleteMenuItem
);

module.exports = router;
