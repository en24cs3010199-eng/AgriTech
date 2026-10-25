const express = require('express');
const { body } = require('express-validator');
const {
  getPosts,
  getPostById,
  createPost,
  toggleUpvote,
  addReply,
  deletePost
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

const postValidation = [
  body('title').trim().notEmpty().withMessage('Post title is required'),
  body('content').trim().notEmpty().withMessage('Post content is required'),
  validate
];

router.route('/')
  .get(getPosts)
  .post(protect, postValidation, createPost);

router.route('/:id')
  .get(getPostById)
  .delete(protect, deletePost);

router.put('/:id/upvote', protect, toggleUpvote);
router.post('/:id/reply', protect, addReply);

module.exports = router;
