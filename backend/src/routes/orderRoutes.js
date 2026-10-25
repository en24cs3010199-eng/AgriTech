const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(authorize('admin'), updateOrderStatus);

router.route('/:id/cancel')
  .put(cancelOrder);

module.exports = router;
