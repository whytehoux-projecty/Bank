import { CacheService } from '../../services/cacheService';
import { createClient } from 'redis';

// Mock redis
const mRedisClient = {
    connect: jest.fn(),
    on: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    flushAll: jest.fn(),
    dbSize: jest.fn(),
    quit: jest.fn(),
    isOpen: true,
};

jest.mock('redis', () => ({
    createClient: jest.fn(() => mRedisClient),
}));

jest.mock('../config/environment', () => ({
    NODE_ENV: 'production', // Force enable cache
    REDIS_URL: 'redis://localhost:6379'
}));

describe('CacheService', () => {
    let cacheService: CacheService;

    beforeEach(async () => {
        jest.clearAllMocks();
        // Reset instance to ensure clean initialization
        (CacheService as any).instance = null;
        cacheService = CacheService.getInstance();
        // Force initialization wait
        await new Promise(process.nextTick);
    });

    describe('initialize', () => {
        it('should create client and connect', async () => {
            expect(createClient).toHaveBeenCalled();
            expect(mRedisClient.connect).toHaveBeenCalled();
        });

        it('should setup error handlers', () => {
            const errorCallback = mRedisClient.on.mock.calls.find(call => call[0] === 'error')[1];
            expect(errorCallback).toBeDefined();
        });
    });

    describe('get', () => {
        it('should return null if disabled', async () => {
            (cacheService as any).isEnabled = false;
            const result = await cacheService.get('key');
            expect(result).toBeNull();
        });

        it('should return parsed value if hit', async () => {
            (cacheService as any).isEnabled = true;
            (cacheService as any).client = mRedisClient;
            mRedisClient.get.mockResolvedValue(JSON.stringify({ data: 'test' }));

            const result = await cacheService.get('key');
            expect(result).toEqual({ data: 'test' });
        });

        it('should return null if miss', async () => {
            (cacheService as any).isEnabled = true;
            (cacheService as any).client = mRedisClient;
            mRedisClient.get.mockResolvedValue(null);

            const result = await cacheService.get('key');
            expect(result).toBeNull();
        });
    });

    describe('set', () => {
        it('should set value with TTL', async () => {
            (cacheService as any).isEnabled = true;
            (cacheService as any).client = mRedisClient;

            await cacheService.set('key', { data: 'test' }, 60);
            expect(mRedisClient.setEx).toHaveBeenCalledWith('key', 60, JSON.stringify({ data: 'test' }));
        });
    });

    describe('deletePattern', () => {
        it('should delete matching keys', async () => {
            (cacheService as any).isEnabled = true;
            (cacheService as any).client = mRedisClient;

            mRedisClient.keys.mockResolvedValue(['key1', 'key2']);

            await cacheService.deletePattern('key*');
            expect(mRedisClient.del).toHaveBeenCalledWith(['key1', 'key2']);
        });
    });
});
