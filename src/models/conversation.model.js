const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    trace_id: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
    },
    messages: [messageSchema],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Generate title from first user message
conversationSchema.pre('save', function (next) {
  const conversation = this;
  
  // Only generate title for new conversations with at least one message
  if (conversation.isNew && conversation.messages.length > 0 && conversation.title === 'New Conversation') {
    const firstUserMessage = conversation.messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      // Create a title from the first few words of the first user message
      const words = firstUserMessage.content.split(' ');
      const titleWords = words.slice(0, 5);
      let title = titleWords.join(' ');
      
      // Add ellipsis if the message was truncated
      if (words.length > 5) {
        title += '...';
      }
      
      conversation.title = title;
    }
  }
  
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;