const Favorite = require('../models/Favorite');

/**
 * Add a favorite
 */
exports.addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { favorite_type, favorite_id } = req.body;

    if (!favorite_type || !favorite_id) {
      return res.status(400).json({
        success: false,
        message: 'favorite_type and favorite_id are required',
      });
    }

    const favorite = await Favorite.addFavorite(userId, favorite_type, favorite_id);

    res.status(201).json({
      success: true,
      message: 'Added to favorites successfully',
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a favorite by ID
 */
exports.removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { favoriteId } = req.params;

    await Favorite.removeFavorite(userId, favoriteId);

    res.status(200).json({
      success: true,
      message: 'Removed from favorites successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a favorite by type and ID
 */
exports.removeFavoriteByTypeAndId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, id } = req.params;

    await Favorite.removeFavoriteByTypeAndId(userId, type, id);

    res.status(200).json({
      success: true,
      message: 'Removed from favorites successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my favorites
 */
exports.getMyFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, limit, offset } = req.query;

    const options = {
      favoriteType: type,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    };

    const favorites = await Favorite.getFavoritesByUserId(userId, options);
    const count = await Favorite.getFavoriteCount(userId);

    res.status(200).json({
      success: true,
      data: {
        favorites,
        count,
        pagination: {
          limit: options.limit,
          offset: options.offset,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if item is favorited
 */
exports.checkFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, id } = req.params;

    const isFavorite = await Favorite.isFavorite(userId, type, id);

    res.status(200).json({
      success: true,
      data: {
        is_favorite: isFavorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get restaurant favorites
 */
exports.getRestaurantFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.getRestaurantFavorites(userId);

    res.status(200).json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get menu item favorites
 */
exports.getMenuItemFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.getMenuItemFavorites(userId);

    res.status(200).json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    next(error);
  }
};
