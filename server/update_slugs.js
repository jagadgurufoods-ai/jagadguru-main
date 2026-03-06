const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany();
    for (const cat of categories) {
        const slug = cat.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await prisma.category.update({
            where: { id: cat.id },
            data: { slug }
        });
        console.log(`Updated ${cat.title} -> ${slug}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
