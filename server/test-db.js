const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
async function main() {
    try {
        const user = await prisma.user.findFirst();
        console.log('Connected! First user:', user?.name || 'none');
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
