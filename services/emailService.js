const transporter = require('../config/emailConfig');
const templates = require('../utils/emailTemplates');

class EmailService {
    constructor() {
        const defaultFrom = process.env.MAIL_FROM || process.env.GMAIL_USER || 'noreply@example.com';
        this.from = `"Lakshmi Services" <${defaultFrom}>`;
    }

    async sendEmail(to, subject, html) {
        try {
            await transporter.sendMail({
                from: this.from,
                to,
                subject,
                html
            });
            console.log(`Email sent successfully to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(user) {
        const html = templates.welcome({
            name: user.name,
            year: new Date().getFullYear()
        });

        await this.sendEmail(
            user.email,
            'Welcome to Lakshmi Services!',
            html
        );
    }

    async sendOrderConfirmationEmail(user, order) {
        const html = templates.orderConfirmation({
            name: user.name,
            orderId: order._id,
            products: order.products,
            totalAmount: order.totalAmount,
            shippingAddress: order.shippingAddress,
            year: new Date().getFullYear()
        });

        await this.sendEmail(
            user.email,
            'Order Confirmation - Lakshmi Services',
            html
        );
    }

    async sendShippingUpdateEmail(user, order) {
        const statusMessages = {
            'processing': 'Your order is being processed and will be shipped soon.',
            'shipped': 'Your order has been shipped and is on its way!',
            'delivered': 'Your order has been delivered. Enjoy!'
        };

        const html = templates.shippingUpdate({
            name: user.name,
            orderId: order._id,
            status: order.orderStatus,
            statusMessage: statusMessages[order.orderStatus],
            trackingLink: `https://lakshmiservices.com/track-order/${order._id}`,
            year: new Date().getFullYear()
        });

        await this.sendEmail(
            user.email,
            `Shipping Update: Order #${order._id}`,
            html
        );
    }

    async sendCartReminderEmail(user, cart) {
        const html = templates.cartReminder({
            name: user.name,
            products: cart.products,
            cartUrl: 'https://lakshmiservices.com/cart',
            year: new Date().getFullYear()
        });

        await this.sendEmail(
            user.email,
            'Complete Your Purchase at Lakshmi Services',
            html
        );
    }
}

module.exports = new EmailService();
