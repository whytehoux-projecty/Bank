import { PrismaClient } from '../src/generated/prisma/client';
// import { hash } from 'bcrypt'; 
// Using plain text check temporarily as per auth.ts development setup

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log('Seeding database...');

    // 1. Create Organization
    const org = await prisma.organization.upsert({
        where: { slug: 'global-relief' },
        update: {},
        create: {
            name: 'Global Relief Corps',
            slug: 'global-relief',
            country: 'International',
            description: 'Providing emergency aid worldwide.'
        },
    });

    // 2. Create Users
    const password = 'password123'; // In real app: await hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'user@uhi-portal.org' },
        update: {},
        create: {
            email: 'user@uhi-portal.org',
            name: 'John Doe',
            password: password,
            role: 'FIELD_STAFF',
            status: 'ACTIVE',
            organizationId: org.id
        },
    });

    const admin = await prisma.user.upsert({
        where: { email: 'admin@uhi-portal.org' },
        update: {},
        create: {
            email: 'admin@uhi-portal.org',
            name: 'Admin User',
            password: password,
            role: 'ORG_ADMIN',
            status: 'ACTIVE',
            organizationId: org.id
        },
    });

    console.log({ org, user, admin });
    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
