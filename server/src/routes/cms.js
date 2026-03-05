const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload, uploadToS3 } = require('../lib/s3');

// ==================== PUBLIC ====================

// Get home page data (Banners + Active Sections)
router.get('/home', async (req, res) => {
    try {
        const banners = await prisma.homeHeroBanner.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' }
        });

        const sections = await prisma.homeSection.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            include: {
                products: {
                    orderBy: { displayOrder: 'asc' },
                    include: { product: { include: { category: true } } }
                }
            }
        });

        res.json({ banners, sections });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ADMIN: BANNERS ====================

// List all banners (admin - includes inactive)
router.get('/banners', requireAuth, requireAdmin, async (req, res) => {
    try {
        const banners = await prisma.homeHeroBanner.findMany({
            orderBy: { displayOrder: 'asc' }
        });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create banner
router.post('/banners', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
    const { title, subtitle, ctaText, ctaLink, displayOrder } = req.body;
    try {
        let imageUrl = '';
        if (req.file) {
            imageUrl = await uploadToS3(req.file);
        }
        const banner = await prisma.homeHeroBanner.create({
            data: {
                title, subtitle, imageUrl, ctaText, ctaLink,
                displayOrder: displayOrder ? parseInt(displayOrder) : null
            }
        });
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update banner
router.put('/banners/:id', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
    const { title, subtitle, ctaText, ctaLink, displayOrder, isActive } = req.body;
    try {
        const data = {};
        if (title !== undefined) data.title = title;
        if (subtitle !== undefined) data.subtitle = subtitle;
        if (ctaText !== undefined) data.ctaText = ctaText;
        if (ctaLink !== undefined) data.ctaLink = ctaLink;
        if (displayOrder !== undefined) data.displayOrder = parseInt(displayOrder);
        if (isActive !== undefined) data.isActive = isActive === 'true' || isActive === true;
        if (req.file) {
            data.imageUrl = await uploadToS3(req.file);
        }
        const banner = await prisma.homeHeroBanner.update({
            where: { id: parseInt(req.params.id) },
            data
        });
        res.json(banner);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Toggle banner active/inactive
router.patch('/banners/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
    try {
        const banner = await prisma.homeHeroBanner.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!banner) return res.status(404).json({ error: 'Banner not found' });
        const updated = await prisma.homeHeroBanner.update({
            where: { id: parseInt(req.params.id) },
            data: { isActive: !banner.isActive }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete banner
router.delete('/banners/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        await prisma.homeHeroBanner.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== ADMIN: SECTIONS ====================

// List all sections (admin - includes inactive)
router.get('/sections', requireAuth, requireAdmin, async (req, res) => {
    try {
        const sections = await prisma.homeSection.findMany({
            orderBy: { displayOrder: 'asc' },
            include: {
                products: {
                    orderBy: { displayOrder: 'asc' },
                    include: { product: true }
                }
            }
        });
        res.json(sections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create section
router.post('/sections', requireAuth, requireAdmin, async (req, res) => {
    const { title, slug, displayOrder } = req.body;
    try {
        const section = await prisma.homeSection.create({
            data: {
                title,
                slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
                displayOrder: displayOrder ? parseInt(displayOrder) : null
            }
        });
        res.status(201).json(section);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update section
router.put('/sections/:id', requireAuth, requireAdmin, async (req, res) => {
    const { title, slug, displayOrder, isActive } = req.body;
    try {
        const data = {};
        if (title !== undefined) data.title = title;
        if (slug !== undefined) data.slug = slug;
        if (displayOrder !== undefined) data.displayOrder = parseInt(displayOrder);
        if (isActive !== undefined) data.isActive = isActive === 'true' || isActive === true;
        const section = await prisma.homeSection.update({
            where: { id: parseInt(req.params.id) },
            data
        });
        res.json(section);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Toggle section active/inactive
router.patch('/sections/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
    try {
        const section = await prisma.homeSection.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!section) return res.status(404).json({ error: 'Section not found' });
        const updated = await prisma.homeSection.update({
            where: { id: parseInt(req.params.id) },
            data: { isActive: !section.isActive }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete section
router.delete('/sections/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Delete section products first
        await prisma.homeSectionProduct.deleteMany({ where: { homeSectionId: parseInt(req.params.id) } });
        await prisma.homeSection.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Section deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add product to section
router.post('/sections/:id/products', requireAuth, requireAdmin, async (req, res) => {
    const { productId, displayOrder } = req.body;
    try {
        const item = await prisma.homeSectionProduct.create({
            data: {
                homeSectionId: parseInt(req.params.id),
                productId: parseInt(productId),
                displayOrder: displayOrder ? parseInt(displayOrder) : null
            },
            include: { product: true }
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove product from section
router.delete('/sections/:sectionId/products/:productId', requireAuth, requireAdmin, async (req, res) => {
    try {
        await prisma.homeSectionProduct.deleteMany({
            where: {
                homeSectionId: parseInt(req.params.sectionId),
                productId: parseInt(req.params.productId)
            }
        });
        res.json({ message: 'Product removed from section' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
