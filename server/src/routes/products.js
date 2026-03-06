const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const { upload, uploadToS3 } = require('../lib/s3');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
    try {
        const { search, categoryId } = req.query;

        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.categoryId = parseInt(categoryId);
        }

        const products = await prisma.product.findMany({
            where,
            include: { category: true }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: { category: true }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create product (Admin)
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
    const {
        name, description, price, originalPrice,
        stock, categoryId, quantity, grandmasSays,
        ingredients, pairsWellWith, tasteMeter
    } = req.body;

    let imageUrl = null;
    try {
        if (req.file) {
            imageUrl = await uploadToS3(req.file);
        }
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                stock: parseInt(stock),
                categoryId: parseInt(categoryId),
                quantity: quantity ? parseFloat(quantity) : null,
                grandmasSays,
                ingredients,
                imageUrl,
                pairsWellWith,
                tasteMeter: tasteMeter ? parseInt(tasteMeter) : null,
            }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update product (Admin)
router.put('/:id', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
    const {
        name, description, price, originalPrice,
        stock, categoryId, quantity, grandmasSays,
        ingredients, pairsWellWith, tasteMeter
    } = req.body;

    try {
        const data = {};
        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;
        if (price !== undefined) data.price = parseFloat(price);
        if (originalPrice !== undefined) data.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
        if (stock !== undefined) data.stock = parseInt(stock);
        if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
        if (quantity !== undefined) data.quantity = quantity ? parseFloat(quantity) : null;
        if (grandmasSays !== undefined) data.grandmasSays = grandmasSays;
        if (ingredients !== undefined) data.ingredients = ingredients;
        if (pairsWellWith !== undefined) data.pairsWellWith = pairsWellWith;
        if (tasteMeter !== undefined) data.tasteMeter = tasteMeter ? parseInt(tasteMeter) : null;
        if (req.file) {
            data.imageUrl = await uploadToS3(req.file);
        }

        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data,
            include: { category: true }
        });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete product (Admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Remove from sections first
        await prisma.homeSectionProduct.deleteMany({ where: { productId: parseInt(req.params.id) } });
        await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
