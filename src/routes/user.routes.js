const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update user profile
router.patch(
  '/me',
  [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
  ],
  validate,
  userController.updateCurrentUser
);

// Change password
router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
  ],
  validate,
  userController.changePassword
);

// Get user preferences
router.get('/preferences', userController.getUserPreferences);

// Update user preferences
router.patch(
  '/preferences',
  [
    body('preferences').isObject().withMessage('Preferences must be an object'),
  ],
  validate,
  userController.updateUserPreferences
);

module.exports = router;