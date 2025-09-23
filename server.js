require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Allowed origins list
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://e-commerce-gilt-xi.vercel.app'
];

// Debug log for request origins
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  next();
});

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight automatically
app.options('*', cors());

// Middleware
app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    nodeEnv: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
// Payments disabled for now (using Cash on Delivery)
// app.use('/api/payment', require('./routes/payment'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
