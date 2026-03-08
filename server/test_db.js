const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
    try {
        const categories = await prisma.category.findMany({
            include: { products: true }
        });

        console.log('Categories found:', categories.length);
        categories.forEach(cat => {
            console.log(`- Category: "${cat.title}", Slug: "${cat.slug}", Products: ${cat.products.length}`);
            if (cat.products.length > 0) {
                cat.products.forEach(p => {
                    console.log(`  * Product: "${p.name}", CategoryId: ${p.categoryId}`);
                });
            }
        });

        const orphanProducts = await prisma.product.findMany({
            where: { categoryId: { equals: 0 } }
        });
        console.log('\nProducts with categoryId 0:', orphanProducts.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDB();
