const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isExpertReply: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const forumPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: 150
    },
    content: {
      type: String,
      required: [true, 'Post content is required']
    },
    cropTag: {
      type: String,
      default: 'General'
    },
    category: {
      type: String,
      enum: ['Pest & Disease', 'Fertilizer & Nutrition', 'Irrigation & Weather', 'Seed Quality', 'General Farming'],
      default: 'General Farming'
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    replies: [replySchema],
    isResolved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ForumPost', forumPostSchema);
