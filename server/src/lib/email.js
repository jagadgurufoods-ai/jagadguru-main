const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    if (!process.env.SMTP_USER) {
        console.log(`[DEV] OTP for ${email}: ${otp}`);
        return;
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your Jagadguru Foods Login OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fdfaf5; border-radius: 16px;">
                <h2 style="color: #3a2212; margin-bottom: 8px;">Jagadguru Foods</h2>
                <p style="color: #705844; font-size: 14px;">Your One-Time Password for login:</p>
                <div style="background: #bf8345; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 16px 32px; border-radius: 12px; letter-spacing: 8px; margin: 24px 0;">
                    ${otp}
                </div>
                <p style="color: #705844; font-size: 13px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
            </div>
        `,
    });
};

const sendOrderConfirmationEmail = async (email, order, items) => {
    if (!process.env.SMTP_USER) {
        console.log(`[DEV] Order confirmation for ${email}: Order #${order.id}`);
        return;
    }

    const itemRows = items.map(item => `
        <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #f0e8dc;">${item.product?.name || 'Product'}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #f0e8dc; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #f0e8dc; text-align: right;">₹${item.price}</td>
        </tr>
    `).join('');

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `Order Confirmed! #${order.id} — Jagadguru Foods`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fdfaf5; border-radius: 16px;">
                <h2 style="color: #3a2212; margin-bottom: 4px;">Jagadguru Foods</h2>
                <p style="color: #15a31a; font-weight: bold; font-size: 18px;">Your order has been placed successfully! 🎉</p>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #f0e8dc;">
                    <p style="margin: 0 0 8px; color: #705844; font-size: 13px;"><strong>Order ID:</strong> #${order.id}</p>
                    <p style="margin: 0 0 8px; color: #705844; font-size: 13px;"><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>
                    <p style="margin: 0; color: #705844; font-size: 13px;"><strong>Status:</strong> ${order.orderStatus || 'Confirmed'}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #3a2212;">
                    <thead>
                        <tr style="background: #bf8345; color: white;">
                            <th style="padding: 10px 12px; text-align: left;">Item</th>
                            <th style="padding: 10px 12px; text-align: center;">Qty</th>
                            <th style="padding: 10px 12px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <div style="text-align: right; margin-top: 16px; font-size: 18px; font-weight: bold; color: #3a2212;">
                    Total: ₹${order.totalAmount}
                </div>
                <p style="color: #705844; font-size: 12px; margin-top: 24px;">Thank you for shopping with us! We will notify you when your order is shipped.</p>
            </div>
        `,
    });
};

module.exports = { sendOtpEmail, sendOrderConfirmationEmail };
