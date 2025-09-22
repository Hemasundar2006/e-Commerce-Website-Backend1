# E-commerce Website Backend API

A RESTful API for an e-commerce website built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Role-based access control (Admin/User)
- Product management with reviews and ratings
- Shopping cart functionality
- Order management
- Payment processing with Stripe
- Input validation
- Error handling
- MongoDB integration

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Cash on Delivery (COD) supported; online payment optional and currently disabled

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe account for payments

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication

\`\`\`
POST /api/auth/register
- Register a new user
- Body: { name, email, password }

POST /api/auth/login
- Login user
- Body: { email, password }

GET /api/auth/me
- Get current user profile
- Protected route
\`\`\`

### Products

\`\`\`
GET /api/products
- Get all products
- Query params: category, minPrice, maxPrice, sort

GET /api/products/:id
- Get single product

POST /api/products
- Create new product
- Admin only
- Body: { name, description, price, category, stock, images }

PUT /api/products/:id
- Update product
- Admin only

DELETE /api/products/:id
- Delete product
- Admin only

POST /api/products/:id/reviews
- Add product review
- Protected route
- Body: { rating, comment }
\`\`\`

### Cart

\`\`\`
GET /api/cart
- Get user's cart
- Protected route

POST /api/cart
- Add item to cart
- Protected route
- Body: { productId, quantity }

PUT /api/cart/:productId
- Update cart item quantity
- Protected route
- Body: { quantity }

DELETE /api/cart/:productId
- Remove item from cart
- Protected route
\`\`\`

### Orders

\`\`\`
POST /api/orders
- Create new order
- Protected route
- Body: { shippingAddress }

GET /api/orders
- Get user's orders
- Protected route

GET /api/orders/:id
- Get single order
- Protected route

GET /api/orders/all
- Get all orders
- Admin only

PUT /api/orders/:id
- Update order status
- Admin only
- Body: { orderStatus }
\`\`\`

### Payments

Currently using Cash on Delivery (COD). Online payment endpoints are disabled.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes, include the JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Error Handling

The API returns consistent error responses in the following format:

\`\`\`json
{
  "success": false,
  "error": "Error message"
}
\`\`\`

## Models

### User
- name: String (required)
- email: String (required, unique)
- password: String (required, min length: 6)
- role: String (enum: ['user', 'admin'], default: 'user')
- createdAt: Date

### Product
- name: String (required)
- description: String (required)
- price: Number (required)
- category: String (required)
- stock: Number (required)
- images: [String] (required)
- ratings: Number
- reviews: [{
  user: ObjectId,
  rating: Number,
  comment: String,
  createdAt: Date
}]

### Cart
- userId: ObjectId (required)
- products: [{
  productId: ObjectId,
  quantity: Number
}]

### Order
- userId: ObjectId (required)
- products: [{
  productId: ObjectId,
  quantity: Number,
  price: Number
}]
- totalAmount: Number (required)
- shippingAddress: {
  address: String,
  city: String,
  postalCode: String,
  country: String
}
- paymentStatus: String (enum: ['pending', 'completed', 'failed'])
- orderStatus: String (enum: ['pending', 'processing', 'shipped', 'delivered'])
- paymentId: String
- createdAt: Date

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
