const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const { generateToken } = require('../middleware/auth');
const { requireAuth } = require('../middleware/auth');
const { sendOtpEmail } = require('../lib/email');

// Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { email, phone } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ error: 'Email or phone is required' });
    }

    try {
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Invalidate old OTPs for this email/phone
        if (email) {
            await prisma.otp.updateMany({
                where: { email, used: false },
                data: { used: true }
            });
        }
        if (phone) {
            await prisma.otp.updateMany({
                where: { phone, used: false },
                data: { used: true }
            });
        }

        // Create new OTP
        await prisma.otp.create({
            data: { email: email || null, phone: phone || null, code: otp, expiresAt }
        });

        // Send OTP via email
        if (email) {
            await sendOtpEmail(email, otp);
        } else {
            // For phone OTP, log it in dev (swap with SMS provider in production)
            console.log(`[DEV] OTP for ${phone}: ${otp}`);
        }

        res.json({ message: 'OTP sent successfully', ...(email ? { email } : { phone }) });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP and login/register
router.post('/verify-otp', async (req, res) => {
    const { email, phone, otp, name } = req.body;

    if (!otp) {
        return res.status(400).json({ error: 'OTP is required' });
    }
    if (!email && !phone) {
        return res.status(400).json({ error: 'Email or phone is required' });
    }

    try {
        // Find valid OTP
        const where = { code: otp, used: false };
        if (email) where.email = email;
        if (phone) where.phone = phone;

        const otpRecord = await prisma.otp.findFirst({
            where,
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Mark OTP as used
        await prisma.otp.update({
            where: { id: otpRecord.id },
            data: { used: true }
        });

        // Find or create user
        let user;
        if (email) {
            user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.user.create({
                    data: { email, name: name || email.split('@')[0] }
                });
            }
        } else if (phone) {
            user = await prisma.user.findUnique({ where: { phone } });
            if (!user) {
                user = await prisma.user.create({
                    data: { phone, name: name || 'User' }
                });
            }
        }

        // Update name if provided and different
        if (name && user.name !== name) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { name }
            });
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dedicated admin login with hardcoded credentials
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (email === 'jagadgurufoods@gmail.com' && password === 'jagad@999') {
        try {
            // Find or create the admin user
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name: 'Admin',
                        role: 'admin'
                    }
                });
            } else if (user.role !== 'admin') {
                // Ensure existing user has admin role
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'admin' }
                });
            }

            const token = generateToken(user);
            return res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Admin login error:', error);
            return res.status(500).json({ error: 'Failed to complete admin login' });
        }
    }

    return res.status(401).json({ error: 'Invalid admin credentials' });
});

module.exports = router;
