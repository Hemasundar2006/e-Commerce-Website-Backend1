const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const emailService = require('../services/emailService');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('products.productId', 'name price images');

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { products: [] }
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Check if quantity is available
    if (product.stock < quantity) {
      return next(new ErrorResponse('Product out of stock', 400));
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = await Cart.create({
        userId: req.user._id,
        products: [{ productId, quantity }]
      });
    } else {
      // Update existing cart
      const productIndex = cart.products.findIndex(
        p => p.productId.toString() === productId
      );

      if (productIndex > -1) {
        // Product exists in cart, update quantity
        cart.products[productIndex].quantity = quantity;
      } else {
        // Product does not exist in cart, add new item
        cart.products.push({ productId, quantity });
      }

      await cart.save();
    }

    // Schedule a reminder email after 24 hours if cart is not empty
    setTimeout(async () => {
      const currentCart = await Cart.findOne({ userId: req.user._id })
        .populate('products.productId', 'name price');
      
      if (currentCart && currentCart.products.length > 0) {
        const user = await User.findById(req.user._id);
        await emailService.sendCartReminderEmail(user, currentCart);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    cart.products = cart.products.filter(
      item => item.productId.toString() !== req.params.productId
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    const productIndex = cart.products.findIndex(
      item => item.productId.toString() === req.params.productId
    );

    if (productIndex === -1) {
      return next(new ErrorResponse('Product not found in cart', 404));
    }

    // Check if product has enough stock
    const product = await Product.findById(req.params.productId);
    if (product.stock < quantity) {
      return next(new ErrorResponse('Product out of stock', 400));
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send cart reminder email manually
// @route   POST /api/cart/send-reminder
// @access  Private
exports.sendCartReminder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('products.productId', 'name price');

    if (!cart || cart.products.length === 0) {
      return next(new ErrorResponse('No items in cart', 400));
    }

    const user = await User.findById(req.user._id);
    await emailService.sendCartReminderEmail(user, cart);

    res.status(200).json({
      success: true,
      message: 'Cart reminder email sent successfully'
    });
  } catch (err) {
    next(err);
  }
};