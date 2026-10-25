const ForumPost = require('../models/ForumPost');

// @desc    Get all community forum posts
// @route   GET /api/forum
// @access  Public / Private
const getPosts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { cropTag: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'name role avatar')
      .populate('replies.author', 'name role avatar isVerifiedExpert')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single forum post by ID
// @route   GET /api/forum/:id
// @access  Public / Private
const getPostById = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role avatar')
      .populate('replies.author', 'name role avatar isVerifiedExpert');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new community discussion
// @route   POST /api/forum
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, content, cropTag, category } = req.body;

    const post = await ForumPost.create({
      author: req.user.id,
      title,
      content,
      cropTag: cropTag || 'General',
      category: category || 'General Farming'
    });

    const populated = await post.populate('author', 'name role avatar');

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      post: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote / remove upvote from a post
// @route   PUT /api/forum/:id/upvote
// @access  Private
const toggleUpvote = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const index = post.upvotes.indexOf(req.user.id);
    if (index === -1) {
      post.upvotes.push(req.user.id);
    } else {
      post.upvotes.splice(index, 1);
    }

    await post.save();

    res.status(200).json({
      success: true,
      upvotesCount: post.upvotes.length,
      isUpvoted: index === -1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a community discussion
// @route   POST /api/forum/:id/reply
// @access  Private
const addReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply content cannot be empty'
      });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isExpertReply = req.user.role === 'expert' || req.user.role === 'admin';

    post.replies.push({
      author: req.user.id,
      content,
      isExpertReply,
      createdAt: new Date()
    });

    await post.save();

    const updated = await ForumPost.findById(req.params.id)
      .populate('author', 'name role avatar')
      .populate('replies.author', 'name role avatar isVerifiedExpert');

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      post: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forum/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  toggleUpvote,
  addReply,
  deletePost
};
