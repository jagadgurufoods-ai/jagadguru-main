const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');

// Get approved reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await prisma.productReview.findMany({
            where: { productId: parseInt(req.params.productId), isApproved: true },
            include: { user: { select: { username: true } } }
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit a review
router.post('/', async (req, res) => {
    const { productId, userId, rating, reviewText } = req.body;
    try {
        const review = await prisma.productReview.create({
            data: {
                productId: parseInt(productId),
                userId: parseInt(userId),
                rating: parseInt(rating),
                reviewText
            }
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin: Approve review
router.patch('/approve/:id', async (req, res) => {
    const { adminId, showOnHomepage } = req.body;
    try {
        const review = await prisma.productReview.update({
            where: { id: parseInt(req.params.id) },
            data: {
                isApproved: true,
                showOnHomepage: showOnHomepage || false,
                approvedAt: new Date(),
                approvedById: parseInt(adminId)
            }
        });
        res.json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
