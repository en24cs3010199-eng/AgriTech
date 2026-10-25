const express = require('express');
const {
  getAdminMetrics,
  getAllUsers,
  updateUserStatus,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getAdminMetrics);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
