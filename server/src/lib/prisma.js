const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

// Bypass SSL certificate validation for Supabase connection issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({ adapter });
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient({ adapter });
    }
    prisma = global.prisma;
}


module.exports = { prisma };
