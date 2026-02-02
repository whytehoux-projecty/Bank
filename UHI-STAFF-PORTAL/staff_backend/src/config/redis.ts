import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Make Redis optional - if REDIS_URL is not set or connection fails, app continues
let redis: Redis | null = null;

try {
    // Only attempt connection if REDIS_URL is explicitly set
    if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379') {
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 10) {
                    logger.warn('Redis connection failed after 10 retries, disabling Redis');
                    return null; // Stop retrying
                }
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            enableOfflineQueue: false, // Don't queue commands if Redis is down
            lazyConnect: true, // Don't connect immediately
        });

        redis.on('connect', () => {
            logger.info('Redis connected successfully');
        });

        redis.on('error', (err) => {
            logger.warn('Redis connection error (continuing without Redis):', err.message);
        });

        // Attempt to connect
        redis.connect().catch((err) => {
            logger.warn('Failed to connect to Redis, continuing without cache:', err.message);
            redis = null;
        });
    } else {
        logger.info('Redis not configured, running without cache');
    }
} catch (err) {
    logger.warn('Redis initialization failed, continuing without cache:', err);
    redis = null;
}

export { redis };

export const CACHE_TTL = {
    SHORT: 60 * 5, // 5 minutes
    MEDIUM: 60 * 30, // 30 minutes
    LONG: 60 * 60 * 24, // 1 day
};
