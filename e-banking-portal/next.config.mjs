import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // 'standalone' is only needed for Docker/Render self-hosted deployments.
    // Netlify uses its own SSR plugin and does not use the standalone server.
    // Set DOCKER_BUILD=1 in Dockerfile.prod / render.yaml to enable it.
    ...(process.env.DOCKER_BUILD === '1' && { output: 'standalone' }),
    images: {
        unoptimized: true,
    },
};

export default withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
})(nextConfig);
