const handlebars = require('handlebars');

const welcomeTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Lakshmi Services</h1>
        </div>
        <div class="content">
            <h2>Hello {{name}},</h2>
            <p>Welcome to Lakshmi Services! We're thrilled to have you as a member of our community.</p>
            <p>With your account, you can:</p>
            <ul>
                <li>Browse our extensive product catalog</li>
                <li>Track your orders</li>
                <li>Save your favorite items</li>
                <li>Get exclusive offers and updates</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
            <p>© {{year}} Lakshmi Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const orderConfirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; }
        .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        <div class="content">
            <h2>Thank you for your order, {{name}}!</h2>
            <p>Your order #{{orderId}} has been confirmed and is being processed.</p>
            
            <div class="order-details">
                <h3>Order Details:</h3>
                {{#each products}}
                <div class="product-item">
                    <p>{{this.name}} - Quantity: {{this.quantity}} - Price: ${{this.price}}</p>
                </div>
                {{/each}}
                <h4>Total Amount: ${{totalAmount}}</h4>
            </div>

            <div class="shipping-info">
                <h3>Shipping Address:</h3>
                <p>{{shippingAddress.address}}</p>
                <p>{{shippingAddress.city}}, {{shippingAddress.postalCode}}</p>
                <p>{{shippingAddress.country}}</p>
            </div>
        </div>
        <div class="footer">
            <p>© {{year}} Lakshmi Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const shippingUpdateTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .status { background-color: #f9f9f9; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Shipping Update</h1>
        </div>
        <div class="content">
            <h2>Hello {{name}},</h2>
            <p>We have an update regarding your order #{{orderId}}.</p>
            
            <div class="status">
                <h3>Order Status: {{status}}</h3>
                <p>{{statusMessage}}</p>
            </div>

            <p>You can track your order using the following link:</p>
            <p><a href="{{trackingLink}}">Track Your Order</a></p>
        </div>
        <div class="footer">
            <p>© {{year}} Lakshmi Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const cartReminderTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .cart-items { background-color: #f9f9f9; padding: 15px; margin: 15px 0; }
        .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .cta-button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Don't Forget Your Cart Items!</h1>
        </div>
        <div class="content">
            <h2>Hello {{name}},</h2>
            <p>We noticed you left some items in your cart. Here's what you have waiting:</p>
            
            <div class="cart-items">
                {{#each products}}
                <div class="product-item">
                    <p>{{this.name}} - Quantity: {{this.quantity}} - Price: ${{this.price}}</p>
                </div>
                {{/each}}
            </div>

            <p>Complete your purchase now and don't miss out on these items!</p>
            <p><a href="{{cartUrl}}" class="cta-button">Complete Your Purchase</a></p>
        </div>
        <div class="footer">
            <p>© {{year}} Lakshmi Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Compile templates
const templates = {
    welcome: handlebars.compile(welcomeTemplate),
    orderConfirmation: handlebars.compile(orderConfirmationTemplate),
    shippingUpdate: handlebars.compile(shippingUpdateTemplate),
    cartReminder: handlebars.compile(cartReminderTemplate)
};

module.exports = templates;
