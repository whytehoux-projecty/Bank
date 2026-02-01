import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '../db/prisma';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log('🔐 Auth attempt:', credentials);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    console.log('✅ Credentials parsed:', { email, passwordLength: password.length });

                    const user = await prisma.user.findUnique({ where: { email } });
                    console.log('👤 User found:', user ? { id: user.id, email: user.email, hasPassword: !!user.password } : 'null');

                    if (!user) {
                        console.log('❌ User not found');
                        return null;
                    }

                    // In a real app, use bcrypt.compare here
                    // const passwordsMatch = await bcrypt.compare(password, user.password);
                    const passwordsMatch = password === user.password; // Temporary for dev
                    console.log('🔑 Password match:', passwordsMatch, { provided: password, stored: user.password });

                    if (passwordsMatch) {
                        console.log('✅ Login successful');
                        return user;
                    }
                }

                console.log('❌ Invalid credentials');
                return null;
            },
        }),
    ],
});
