/**
 * Redis Cache Service
 * 
 * Provides caching functionality for frequently accessed data
 * to improve performance and reduce database load.
 */

import { createClient, RedisClientType } from 'redis';
import config from '../config/environment';

export class CacheService {
    private static instance: CacheService;
    private client: RedisClientType | null = null;
    private isEnabled: boolean = false;

    private constructor() {
        this.initialize();
    }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    private async initialize() {
        try {
            // Only enable cache in production or if explicitly requested
            if (config.NODE_ENV === 'production' || process.env['USE_REDIS'] === 'true') {
                this.client = createClient({
                    url: config.REDIS_URL,
                    socket: {
                        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
                    },
                });

                this.client.on('error', (err) => {
                    console.error('Redis Cache Error:', err);
                    this.isEnabled = false;
                });

                this.client.on('connect', () => {
                    console.log('✅ Redis cache connected');
                    this.isEnabled = true;
                });

                this.client.on('disconnect', () => {
                    console.warn('⚠️  Redis cache disconnected');
                    this.isEnabled = false;
                });

                await this.client.connect();
            } else {
                console.log('ℹ️  Redis cache disabled (development mode)');
            }
        } catch (error) {
            console.error('Failed to initialize Redis cache:', error);
            this.isEnabled = false;
        }
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.isEnabled || !this.client) return null;

        try {
            const value = await this.client.get(key);
            if (!value) return null;

            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache with TTL (time to live)
     */
    async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
        if (!this.isEnabled || !this.client) return false;

        try {
            await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete value from cache
     */
    async delete(key: string): Promise<boolean> {
        if (!this.isEnabled || !this.client) return false;

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete multiple keys matching pattern
     */
    async deletePattern(pattern: string): Promise<number> {
        if (!this.isEnabled || !this.client) return 0;

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length === 0) return 0;

            await this.client.del(keys);
            return keys.length;
        } catch (error) {
            console.error(`Cache delete pattern error for ${pattern}:`, error);
            return 0;
        }
    }

    /**
     * Get or set pattern - fetch from cache or execute function and cache result
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttlSeconds: number = 300
    ): Promise<T> {
        // Try to get from cache first
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // If not in cache, execute function
        const result = await fetchFn();

        // Cache the result
        await this.set(key, result, ttlSeconds);

        return result;
    }

    /**
     * Invalidate cache for a specific entity
     */
    async invalidateEntity(entityType: string, entityId: string): Promise<void> {
        const patterns = [
            `${entityType}:${entityId}:*`,
            `${entityType}:*:${entityId}`,
            `user:${entityId}:*`,
        ];

        for (const pattern of patterns) {
            await this.deletePattern(pattern);
        }
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<boolean> {
        if (!this.isEnabled || !this.client) return false;

        try {
            await this.client.flushAll();
            return true;
        } catch (error) {
            console.error('Cache clear error:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        enabled: boolean;
        connected: boolean;
        keys?: number;
    }> {
        if (!this.isEnabled || !this.client) {
            return { enabled: false, connected: false };
        }

        try {
            const keys = await this.client.dbSize();
            return {
                enabled: true,
                connected: this.client.isOpen,
                keys,
            };
        } catch (error) {
            return {
                enabled: this.isEnabled,
                connected: false,
            };
        }
    }

    /**
     * Disconnect from Redis
     */
    async disconnect(): Promise<void> {
        if (this.client && this.client.isOpen) {
            await this.client.quit();
            this.isEnabled = false;
        }
    }
}

// Export singleton instance
export const cache = CacheService.getInstance();

// Cache key builders for consistency
export const CacheKeys = {
    // Account caching
    accountBalance: (accountId: string) => `account:${accountId}:balance`,
    accountDetails: (accountId: string) => `account:${accountId}:details`,
    userAccounts: (userId: string) => `user:${userId}:accounts`,

    // Transaction caching
    accountTransactions: (accountId: string, page: number) =>
        `account:${accountId}:transactions:page:${page}`,
    userTransactions: (userId: string, page: number) =>
        `user:${userId}:transactions:page:${page}`,

    // KYC caching
    kycStatus: (userId: string) => `user:${userId}:kyc:status`,
    kycDocuments: (userId: string) => `user:${userId}:kyc:documents`,

    // User caching
    userProfile: (userId: string) => `user:${userId}:profile`,
    userSession: (sessionId: string) => `session:${sessionId}`,

    // Wire transfer caching
    wireTransferStats: (userId: string) => `user:${userId}:wiretransfer:stats`,
    wireTransferLimits: (accountId: string) => `account:${accountId}:wiretransfer:limits`,

    // System caching
    systemConfig: (key: string) => `system:config:${key}`,
    verificationThreshold: () => `system:verification:threshold`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 900, // 15 minutes
    HOUR: 3600, // 1 hour
    DAY: 86400, // 24 hours
};
