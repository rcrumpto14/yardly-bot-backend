const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const Conversation = require('../models/conversation.model');
const { createMainAgent, createResearchAgent, createWritingAgent } = require('../utils/agentFactory');

/**
 * Chat with the main triage agent
 * @route POST /api/agents/chat
 */
const chatWithAgent = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        throw new ApiError(404, 'Conversation not found');
      }
    } else {
      conversation = new Conversation({
        userId,
        messages: [],
      });
      await conversation.save();
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });
    await conversation.save();

    // Create the main triage agent
    const mainAgent = createMainAgent();
    
    // Process the message through the agent
    const result = await mainAgent.runSync({
      messages: conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      workflow_name: `conversation_${conversation._id}`,
    });

    // Add assistant response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: result.final_output,
      timestamp: new Date(),
      trace_id: result.trace_id,
    });
    await conversation.save();

    // Return the response
    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        message: result.final_output,
        trace_id: result.trace_id,
      },
    });
  } catch (error) {
    logger.error('Error in chatWithAgent:', error);
    next(error);
  }
};

/**
 * Get all conversations for the current user
 * @route GET /api/agents/conversations
 */
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ userId })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    logger.error('Error in getConversations:', error);
    next(error);
  }
};

/**
 * Get a specific conversation
 * @route GET /api/agents/conversations/:conversationId
 */
const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    logger.error('Error in getConversation:', error);
    next(error);
  }
};

/**
 * Get agent trace for debugging
 * @route GET /api/agents/trace/:traceId
 */
const getAgentTrace = async (req, res, next) => {
  try {
    const { traceId } = req.params;
    
    // In a production environment, you would implement proper trace retrieval
    // This is a placeholder for demonstration purposes
    return res.status(200).json({
      success: true,
      message: 'Trace retrieval would be implemented here',
      trace_id: traceId,
    });
  } catch (error) {
    logger.error('Error in getAgentTrace:', error);
    next(error);
  }
};

module.exports = {
  chatWithAgent,
  getConversations,
  getConversation,
  getAgentTrace,
};