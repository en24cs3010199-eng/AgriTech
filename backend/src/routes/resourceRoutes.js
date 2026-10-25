const express = require('express');
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getResources)
  .post(protect, authorize('admin'), createResource);

router.route('/:id')
  .get(getResourceById)
  .put(protect, authorize('admin'), updateResource)
  .delete(protect, authorize('admin'), deleteResource);

module.exports = router;
