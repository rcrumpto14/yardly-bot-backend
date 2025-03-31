const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const agentRoutes = require('./agent.routes');
const userRoutes = require('./user.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/agents', agentRoutes);
router.use('/users', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Yardly Bot API',
    version: '1.0.0',
    description: 'Backend API for the Yardly Bot application',
    endpoints: [
      '/api/auth',
      '/api/agents',
      '/api/users',
    ],
  });
});

module.exports = router;