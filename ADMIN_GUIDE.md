# Admin Product Management Guide

This guide explains how admins can add products with images and set prices using the Lakshmi Services API.

## Admin Authentication

First, login as an admin user:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@lakshmiservices.com",
  "password": "your_admin_password"
}
```

Use the returned JWT token in all subsequent requests:
```
Authorization: Bearer your_jwt_token
```

## Method 1: Create Product with Image URLs

### Create Product
```bash
POST /api/products
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "name": "Smartphone XYZ",
  "description": "Latest smartphone with advanced features",
  "price": 599.99,
  "category": "Electronics",
  "stock": 50,
  "images": [
    "https://example.com/phone-front.jpg",
    "https://example.com/phone-back.jpg"
  ]
}
```

### Update Product (Price/Images)
```bash
PUT /api/products/product_id_here
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "price": 499.99,
  "images": [
    "https://example.com/new-phone-image.jpg"
  ],
  "stock": 30
}
```

## Method 2: Create Product with File Upload

### Create Product with Image Files
```bash
POST /api/products
Authorization: Bearer your_jwt_token
Content-Type: multipart/form-data

Form fields:
- name: "Laptop ABC"
- description: "High-performance laptop"
- price: 999.99
- category: "Electronics"
- stock: 25
- images: [file1.jpg, file2.jpg, file3.jpg] (up to 5 files)
```

### Update Product with New Images
```bash
PUT /api/products/product_id_here
Authorization: Bearer your_jwt_token
Content-Type: multipart/form-data

Form fields:
- price: 899.99
- stock: 20
- images: [new-image1.jpg, new-image2.jpg]
```

## Using Postman/Frontend

### For File Uploads:
1. Set method to POST/PUT
2. Add Authorization header with Bearer token
3. Select "form-data" in Body tab
4. Add text fields: name, description, price, category, stock
5. Add file fields: select "File" type and choose image files for "images" key
6. Can upload multiple images (max 5)

### File Restrictions:
- Only image files allowed (jpg, png, gif, etc.)
- Maximum file size: 5MB per image
- Maximum 5 images per product

## Image Access

Uploaded images are accessible at:
```
http://localhost:5000/uploads/products/filename.jpg
```

## Admin Operations

### Get All Products
```bash
GET /api/products
```

### Get Single Product
```bash
GET /api/products/product_id
```

### Delete Product
```bash
DELETE /api/products/product_id
Authorization: Bearer your_jwt_token
```

### Get All Orders (Admin only)
```bash
GET /api/orders/all
Authorization: Bearer your_jwt_token
```

### Update Order Status
```bash
PUT /api/orders/order_id
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "orderStatus": "shipped"
}
```

Available order statuses: `pending`, `processing`, `shipped`, `delivered`

## Frontend Integration

For React frontend, you can create forms like:

```jsx
// Create product form
const [formData, setFormData] = useState({
  name: '',
  description: '',
  price: '',
  category: '',
  stock: ''
});
const [images, setImages] = useState([]);

const handleSubmit = async (e) => {
  e.preventDefault();
  const form = new FormData();
  
  Object.keys(formData).forEach(key => {
    form.append(key, formData[key]);
  });
  
  images.forEach(image => {
    form.append('images', image);
  });
  
  await axios.post('/api/products', form, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};
```

## Summary

Admins can:
1. **Add products** with images and prices via API
2. **Upload image files** directly or use image URLs
3. **Update prices** and product details anytime
4. **Manage inventory** by updating stock levels
5. **View and manage** all orders
6. **Update order status** to track fulfillment

The system supports both file uploads and URL-based images for maximum flexibility.
