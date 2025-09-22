const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  sendCartReminder
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

router.post('/send-reminder', sendCartReminder);

module.exports = router;
