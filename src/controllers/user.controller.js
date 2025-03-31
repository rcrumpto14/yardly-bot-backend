const bcrypt = require('bcryptjs');
const { ApiError } = require('../middleware/errorHandler');
const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Get current user profile
 * @route GET /api/users/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Error in getCurrentUser:', error);
    next(error);
  }
};

/**
 * Update current user profile
 * @route PATCH /api/users/me
 */
const updateCurrentUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Check if email is already in use
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new ApiError(400, 'Email is already in use');
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, email } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Error in updateCurrentUser:', error);
    next(error);
  }
};

/**
 * Change user password
 * @route POST /api/users/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    logger.error('Error in changePassword:', error);
    next(error);
  }
};

/**
 * Get user preferences
 * @route GET /api/users/preferences
 */
const getUserPreferences = async (req, res, next) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: user.preferences || {},
    });
  } catch (error) {
    logger.error('Error in getUserPreferences:', error);
    next(error);
  }
};

/**
 * Update user preferences
 * @route PATCH /api/users/preferences
 */
const updateUserPreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedUser.preferences,
    });
  } catch (error) {
    logger.error('Error in updateUserPreferences:', error);
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  getUserPreferences,
  updateUserPreferences,
};