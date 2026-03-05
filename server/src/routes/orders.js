const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../lib/email');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// Place Order
router.post('/', requireAuth, async (req, res) => {
    const { items, totalAmount, addressId, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || !items.length) {
        return res.status(400).json({ error: 'No items in order' });
    }
    if (!paymentMethod || !['cod', 'razorpay'].includes(paymentMethod)) {
        return res.status(400).json({ error: 'Invalid payment method. Use "cod" or "razorpay"' });
    }

    try {
        if (paymentMethod === 'razorpay') {
            if (!razorpay) {
                return res.status(500).json({ error: 'Razorpay not configured. Please use COD.' });
            }

            // Create Razorpay order
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(parseFloat(totalAmount) * 100), // paise
                currency: 'INR',
                receipt: `order_${Date.now()}`,
            });

            // Create pending order in DB
            const order = await prisma.$transaction(async (tx) => {
                const ord = await tx.order.create({
                    data: {
                        userId,
                        totalAmount: parseFloat(totalAmount),
                        orderStatus: 'pending',
                        paymentMethod: 'razorpay',
                        paymentStatus: 'pending',
                        razorpayOrderId: razorpayOrder.id,
                        addressId: addressId ? parseInt(addressId) : null,
                        orderItems: {
                            create: items.map(item => ({
                                productId: parseInt(item.productId),
                                quantity: parseFloat(item.quantity),
                                price: parseFloat(item.price),
                            }))
                        }
                    }
                });
                return ord;
            });

            return res.status(201).json({
                order,
                razorpayOrder: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    key: process.env.RAZORPAY_KEY_ID,
                }
            });
        }

        // COD order
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount: parseFloat(totalAmount),
                    orderStatus: 'confirmed',
                    paymentMethod: 'cod',
                    paymentStatus: 'pending',
                    addressId: addressId ? parseInt(addressId) : null,
                    orderItems: {
                        create: items.map(item => ({
                            productId: parseInt(item.productId),
                            quantity: parseFloat(item.quantity),
                            price: parseFloat(item.price),
                        }))
                    }
                },
                include: {
                    orderItems: { include: { product: true } }
                }
            });

            // Update stocks
            for (const item of items) {
                await tx.product.update({
                    where: { id: parseInt(item.productId) },
                    data: { stock: { decrement: parseInt(item.quantity) } }
                });
            }

            // Clear cart
            await tx.cartItem.deleteMany({ where: { userId } });

            return order;
        });

        // Send confirmation email
        if (req.user.email) {
            sendOrderConfirmationEmail(req.user.email, result, result.orderItems).catch(err =>
                console.error('Failed to send order email:', err)
            );
        }

        res.status(201).json({ order: result });
    } catch (error) {
        console.error('Order error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Verify Razorpay payment
router.post('/verify-payment', requireAuth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    try {
        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        // Update order
        const order = await prisma.$transaction(async (tx) => {
            const ord = await tx.order.update({
                where: { id: parseInt(orderId) },
                data: {
                    orderStatus: 'confirmed',
                    paymentStatus: 'paid',
                    paymentId: razorpay_payment_id,
                },
                include: { orderItems: { include: { product: true } } }
            });

            // Update stocks
            for (const item of ord.orderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: parseInt(item.quantity) } }
                });
            }

            // Clear cart
            await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

            return ord;
        });

        // Send confirmation email
        if (req.user.email) {
            sendOrderConfirmationEmail(req.user.email, order, order.orderItems).catch(err =>
                console.error('Failed to send order email:', err)
            );
        }

        res.json({ message: 'Payment verified', order });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get current user's orders
router.get('/my-orders', requireAuth, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                orderItems: { include: { product: true } },
                address: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single order
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                orderItems: { include: { product: true } },
                address: true,
                user: { select: { name: true, email: true, phone: true } }
            }
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        // Only allow user to see their own order or admin
        if (order.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: List all orders
router.get('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { name: true, email: true } },
                orderItems: { include: { product: true } },
                address: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update order status
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
    const { orderStatus } = req.body;
    try {
        const order = await prisma.order.update({
            where: { id: parseInt(req.params.id) },
            data: { orderStatus }
        });
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create/save address
router.post('/address', requireAuth, async (req, res) => {
    const { name, phone, street, city, state, pincode, isDefault } = req.body;
    try {
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false }
            });
        }
        const address = await prisma.address.create({
            data: {
                userId: req.user.id,
                name, phone, street, city, state, pincode,
                isDefault: isDefault || false
            }
        });
        res.status(201).json(address);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's addresses
router.get('/addresses/list', requireAuth, async (req, res) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user.id },
            orderBy: { isDefault: 'desc' }
        });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
