const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const agentController = require('../controllers/agent.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// All agent routes require authentication
router.use(authenticate);

// Send a message to the main triage agent
router.post(
  '/chat',
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('conversationId').optional(),
  ],
  validate,
  agentController.chatWithAgent
);

// Get conversation history
router.get('/conversations', agentController.getConversations);

// Get specific conversation
router.get('/conversations/:conversationId', agentController.getConversation);

// Get agent trace for debugging
router.get('/trace/:traceId', agentController.getAgentTrace);

module.exports = router;