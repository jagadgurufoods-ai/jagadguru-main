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
            include: { category: true, variants: true, ingredients: true }
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
            include: { category: true, variants: true, ingredients: true }
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
router.post('/', requireAuth, requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'heritageMap', maxCount: 1 }]), async (req, res) => {
    const {
        name, description, price, originalPrice,
        stock, categoryId, quantity, grandmasSays,
        ingredientsText, pairsWellWith, tasteMeter, heritageMapUrl: bodyHeritageMapUrl,
        spiceLevel, sourLevel, tangyLevel, sweetLevel,
        variants, ingredients
    } = req.body;

    let imageUrl = null;
    let heritageMapUrl = bodyHeritageMapUrl || null;
    try {
        if (req.files) {
            if (req.files.image) {
                imageUrl = await uploadToS3(req.files.image[0]);
            }
            if (req.files.heritageMap) {
                heritageMapUrl = await uploadToS3(req.files.heritageMap[0]);
            }
        }

        const parsedVariants = variants ? JSON.parse(variants) : [];

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price || 0),
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                stock: parseInt(stock || 0),
                categoryId: parseInt(categoryId),
                quantity: quantity ? parseFloat(quantity) : null,
                grandmasSays,
                ingredientsText,
                imageUrl,
                pairsWellWith,
                tasteMeter: tasteMeter ? parseInt(tasteMeter) : null,
                spiceLevel: spiceLevel ? parseInt(spiceLevel) : null,
                sourLevel: sourLevel ? parseInt(sourLevel) : null,
                tangyLevel: tangyLevel ? parseInt(tangyLevel) : null,
                sweetLevel: sweetLevel ? parseInt(sweetLevel) : null,
                heritageMapUrl,
                variants: {
                    create: parsedVariants.map(v => ({
                        weight: v.weight,
                        price: parseFloat(v.price),
                        originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
                        stock: parseInt(v.stock)
                    }))
                },
                ingredients: {
                    create: ingredients ? JSON.parse(ingredients).map(i => ({
                        name: i.name,
                        originState: i.originState || '',
                        history: i.history,
                        imageUrl: i.imageUrl,
                        mapImageUrl: i.mapImageUrl,
                        mapImageCaption: i.mapImageCaption,
                        mapX: i.mapX ? parseFloat(i.mapX) : null,
                        mapY: i.mapY ? parseFloat(i.mapY) : null
                    })) : []
                }
            },
            include: { variants: true, ingredients: true }
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update product (Admin)
router.put('/:id', requireAuth, requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'heritageMap', maxCount: 1 }]), async (req, res) => {
    const {
        name, description, price, originalPrice,
        stock, categoryId, quantity, grandmasSays,
        ingredientsText, pairsWellWith, tasteMeter, heritageMapUrl: bodyHeritageMapUrl,
        spiceLevel, sourLevel, tangyLevel, sweetLevel,
        variants, ingredients
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
        if (ingredientsText !== undefined) data.ingredientsText = ingredientsText;
        if (pairsWellWith !== undefined) data.pairsWellWith = pairsWellWith;
        if (tasteMeter !== undefined) data.tasteMeter = tasteMeter ? parseInt(tasteMeter) : null;
        if (spiceLevel !== undefined) data.spiceLevel = spiceLevel ? parseInt(spiceLevel) : null;
        if (sourLevel !== undefined) data.sourLevel = sourLevel ? parseInt(sourLevel) : null;
        if (tangyLevel !== undefined) data.tangyLevel = tangyLevel ? parseInt(tangyLevel) : null;
        if (sweetLevel !== undefined) data.sweetLevel = sweetLevel ? parseInt(sweetLevel) : null;
        if (bodyHeritageMapUrl !== undefined) data.heritageMapUrl = bodyHeritageMapUrl;

        if (req.files) {
            if (req.files.image) {
                data.imageUrl = await uploadToS3(req.files.image[0]);
            }
            if (req.files.heritageMap) {
                data.heritageMapUrl = await uploadToS3(req.files.heritageMap[0]);
            }
        }

        if (variants) {
            const parsedVariants = JSON.parse(variants);
            data.variants = {
                deleteMany: {},
                create: parsedVariants.map(v => ({
                    weight: v.weight,
                    price: parseFloat(v.price),
                    originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
                    stock: parseInt(v.stock)
                }))
            };
        }

        if (ingredients) {
            const parsedIngredients = JSON.parse(ingredients);
            data.ingredients = {
                deleteMany: {},
                create: parsedIngredients.map(i => ({
                    name: i.name,
                    originState: i.originState || '',
                    history: i.history,
                    imageUrl: i.imageUrl,
                    mapImageUrl: i.mapImageUrl,
                    mapImageCaption: i.mapImageCaption,
                    mapX: i.mapX ? parseFloat(i.mapX) : null,
                    mapY: i.mapY ? parseFloat(i.mapY) : null
                }))
            };
        }

        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data,
            include: { category: true, variants: true, ingredients: true }
        });
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
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
