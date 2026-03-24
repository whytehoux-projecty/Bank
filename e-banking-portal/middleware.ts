import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = new Set(['/login', '/unavailable', '/']);

// Prefixes that are always public (static assets, Next.js internals, local API routes)
const PUBLIC_PREFIXES = ['/_next', '/static', '/images', '/api', '/favicon'];

function isPublicPath(pathname: string): boolean {
    if (PUBLIC_PATHS.has(pathname)) return true;
    return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always allow public paths through
    if (isPublicPath(pathname)) {
        // If the user is already authenticated and hits /login, send them to the dashboard
        const isAuthenticated = request.cookies.has('hv_auth');
        if (pathname === '/login' && isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Protected route — require the hv_auth cookie
    const isAuthenticated = request.cookies.has('hv_auth');

    if (!isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        // Preserve the intended destination so login can redirect back after auth
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except Next.js internals and static files.
         * The isPublicPath() check inside the function handles fine-grained exclusions.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
