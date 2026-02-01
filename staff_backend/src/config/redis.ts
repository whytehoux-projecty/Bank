import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    // Don't crash the app if Redis is down, just log errors
    enableOfflineQueue: false, // If true, commands will be queued when Redis is down. If false, they will fail immediately.
    // We set it to false so we can fallback to DB if Redis is down, or implement logic to skip cache.
});

redis.on('connect', () => {
    logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

export const CACHE_TTL = {
    SHORT: 60 * 5, // 5 minutes
    MEDIUM: 60 * 30, // 30 minutes
    LONG: 60 * 60 * 24, // 1 day
};
