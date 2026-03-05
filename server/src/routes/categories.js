const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create category (Admin)
router.post('/', async (req, res) => {
    const { title, description } = req.body;
    try {
        const category = await prisma.category.create({
            data: { title, description }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
