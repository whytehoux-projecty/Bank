import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                organization: true
            }
        });

        const orgs = await prisma.organization.findMany();

        return NextResponse.json({
            success: true,
            userCount: users.length,
            orgCount: orgs.length,
            users: users.map(u => ({
                email: u.email,
                name: u.name,
                role: u.role,
                status: u.status,
                hasPassword: !!u.password,
                passwordLength: u.password?.length,
                organization: u.organization?.name
            })),
            orgs
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
