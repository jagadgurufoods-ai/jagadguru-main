const { prisma } = require('./src/lib/prisma');

async function testQuery() {
    try {
        console.log('Testing prisma.user.findFirst()...');
        const user = await prisma.user.findFirst();
        console.log('Result:', user);
    } catch (err) {
        console.error('Prisma query failed:', err);
    } finally {
        // No disconnect needed if we use global prisma, but it's fine
    }
}

testQuery();
