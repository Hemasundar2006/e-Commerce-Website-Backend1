const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const emailService = require('../services/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('products.productId');

    if (!cart || cart.products.length === 0) {
      return next(new ErrorResponse('No items in cart', 400));
    }

    // Calculate total and create order items
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of cart.products) {
      const product = item.productId;
      
      // Check if product is in stock
      if (product.stock < item.quantity) {
        return next(new ErrorResponse(`${product.name} is out of stock`, 400));
      }

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      // Add to order products
      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });

      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      paymentMethod: paymentMethod === 'online' ? 'online' : 'cod',
      shippingAddress,
      // For COD, mark payment pending; system can flip to completed on delivery if needed
      paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
      orderStatus: 'pending'
    });

    // Clear cart
    await Cart.findOneAndDelete({ userId: req.user._id });

    // Send order confirmation email
    const user = await User.findById(req.user._id);
    await emailService.sendOrderConfirmationEmail(user, order);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId', 'name price images');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId', 'name price images');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Make sure user owns order or is admin
    if (order.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to access this order', 403));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId', 'name price');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    order.orderStatus = orderStatus;
    await order.save();

    // Send shipping update email
    const user = await User.findById(order.userId);
    await emailService.sendShippingUpdateEmail(user, order);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};
