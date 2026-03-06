const { PrismaClient } = require('@prisma/client');
const url = "postgresql://postgres.wszftimrhtxnyqlatzcj:X2JnBgYKPAfY40yz@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: url
        }
    }
});
async function main() {
    try {
        console.log('Testing pooler connection...');
        const user = await prisma.user.findFirst();
        console.log('Pooler Connected! First user:', user?.name || 'none');
    } catch (e) {
        console.error('Pooler Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
