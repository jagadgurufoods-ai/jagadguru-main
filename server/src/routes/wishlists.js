const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// Get user wishlist
router.get('/', requireAuth, async (req, res) => {
    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: req.user.id },
            include: { product: { include: { category: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle wishlist (add/remove)
router.post('/toggle', requireAuth, async (req, res) => {
    const { productId } = req.body;
    try {
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: parseInt(productId)
                }
            }
        });

        if (existing) {
            await prisma.wishlist.delete({ where: { id: existing.id } });
            return res.json({ action: 'removed', message: 'Removed from wishlist' });
        }

        const item = await prisma.wishlist.create({
            data: {
                userId: req.user.id,
                productId: parseInt(productId)
            },
            include: { product: true }
        });
        res.status(201).json({ action: 'added', item });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Check if product is wishlisted
router.get('/check/:productId', requireAuth, async (req, res) => {
    try {
        const item = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: parseInt(req.params.productId)
                }
            }
        });
        res.json({ isWishlisted: !!item });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove from wishlist by ID
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await prisma.wishlist.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
