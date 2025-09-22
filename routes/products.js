const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), upload.array('images', 5), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/reviews')
  .post(protect, addReview);

module.exports = router;
