const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// Get user's cart
router.get('/', requireAuth, async (req, res) => {
    try {
        const items = await prisma.cartItem.findMany({
            where: { userId: req.user.id },
            include: { product: { include: { category: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add to cart (or update qty if already exists)
router.post('/', requireAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const existing = await prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: parseInt(productId)
                }
            }
        });

        if (existing) {
            const updated = await prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: (quantity ? parseInt(quantity) : existing.quantity + 1) },
                include: { product: true }
            });
            return res.json(updated);
        }

        const item = await prisma.cartItem.create({
            data: {
                userId: req.user.id,
                productId: parseInt(productId),
                quantity: quantity ? parseInt(quantity) : 1
            },
            include: { product: true }
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update cart item quantity
router.put('/:id', requireAuth, async (req, res) => {
    const { quantity } = req.body;
    try {
        const item = await prisma.cartItem.update({
            where: { id: parseInt(req.params.id) },
            data: { quantity: parseInt(quantity) },
            include: { product: true }
        });
        res.json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove from cart
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await prisma.cartItem.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Removed from cart' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Clear cart
router.delete('/', requireAuth, async (req, res) => {
    try {
        await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
