const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Bypass SSL certificate validation for Supabase connection issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

module.exports = { prisma };
