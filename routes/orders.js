const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getUserOrders)
  .post(createOrder);

router.route('/all')
  .get(authorize('admin'), getAllOrders);

router.route('/:id')
  .get(getOrder)
  .put(authorize('admin'), updateOrderStatus);

module.exports = router;
