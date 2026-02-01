import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        // Create Organization
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

        // Create Users
        const password = 'password123'; // Plain text for dev

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

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            data: { org, user, admin }
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
