// backend/src/services/cacheService.ts
import { getRedisClient } from '../config/redis';
import { createHash } from 'crypto';
import { promisify } from 'util';
import zlib from 'zlib';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface CacheOptions {
  ttl?: number;          // Time to live in seconds
  namespace?: string;    // Cache namespace for organization
  tags?: string[];       // Tags for bulk invalidation
  compress?: boolean;    // Enable compression for large objects
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  totalKeys: number;
  memoryUsage: number;
}

export class CacheService {
  private redis;
  private defaultTTL: number = 3600; // 1 hour
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    totalKeys: 0,
    memoryUsage: 0
  };

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Generate cache key with namespace and hash
   */
  private generateKey(key: string, namespace?: string): string {
    const prefix = namespace ? `${namespace}:` : 'cache:';
    // Hash long keys to avoid Redis key length limits
    if (key.length > 200) {
      const hash = createHash('sha256').update(key).digest('hex');
      return `${prefix}${hash}`;
    }
    return `${prefix}${key}`;
  }

  /**
   * Compress data if enabled
   */
  private async compressData(data: string, compress: boolean): Promise<string> {
    if (!compress || data.length < 1000) return data;
    
    try {
      const compressed = await gzip(Buffer.from(data));
      return `gzip:${compressed.toString('base64')}`;
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      return data;
    }
  }

  /**
   * Decompress data if needed
   */
  private async decompressData(data: string): Promise<string> {
    if (!data.startsWith('gzip:')) return data;
    
    try {
      const compressed = Buffer.from(data.slice(5), 'base64');
      const decompressed = await gunzip(compressed);
      return decompressed.toString();
    } catch (error) {
      console.error('Decompression failed:', error);
      throw error;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.redis) {
      console.warn('Redis not available, skipping cache set');
      return false;
    }

    try {
      const cacheKey = this.generateKey(key, options.namespace);
      const ttl = options.ttl || this.defaultTTL;
      
      // Serialize value
      let serialized = JSON.stringify(value);
      
      // Compress if enabled
      serialized = await this.compressData(serialized, options.compress || false);
      
      // Set in Redis with TTL
      await this.redis.setEx(cacheKey, ttl, serialized);
      
      // Handle tags for bulk invalidation
      if (options.tags) {
        await this.addToTags(cacheKey, options.tags);
      }
      
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, namespace?: string): Promise<T | null> {
    if (!this.redis) {
      console.warn('Redis not available, skipping cache get');
      return null;
    }

    try {
      const cacheKey = this.generateKey(key, namespace);
      const cached = await this.redis.get(cacheKey);
      
      if (!cached) {
        this.stats.misses++;
        return null;
      }
      
      // Decompress if needed
      const decompressed = await this.decompressData(cached);
      
      // Parse JSON
      const parsed = JSON.parse(decompressed);
      
      this.stats.hits++;
      return parsed;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, namespace?: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const cacheKey = this.generateKey(key, namespace);
      const result = await this.redis.del(cacheKey);
      
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, namespace?: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const cacheKey = this.generateKey(key, namespace);
      const result = await this.redis.exists(cacheKey);
      return Boolean(result);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async getTTL(key: string, namespace?: string): Promise<number> {
    if (!this.redis) return -1;

    try {
      const cacheKey = this.generateKey(key, namespace);
      return await this.redis.ttl(cacheKey);
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -1;
    }
  }

  /**
   * Extend TTL for a key
   */
  async extendTTL(key: string, ttl: number, namespace?: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const cacheKey = this.generateKey(key, namespace);
      const result = await this.redis.expire(cacheKey, ttl);
      return Boolean(result);
    } catch (error) {
      console.error('Cache extend TTL error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options.namespace);
    if (cached !== null) {
      return cached;
    }

    // Generate value and cache it
    try {
      const value = await factory();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      console.error('GetOrSet factory error:', error);
      throw error;
    }
  }

  /**
   * Bulk get multiple keys
   */
  async mget<T>(keys: string[], namespace?: string): Promise<(T | null)[]> {
    if (!this.redis) return keys.map(() => null);

    try {
      const cacheKeys = keys.map(key => this.generateKey(key, namespace));
      const results = await this.redis.mGet(cacheKeys);
      
      return await Promise.all(results.map(async (result) => {
        if (!result) {
          this.stats.misses++;
          return null;
        }
        
        try {
          const decompressed = await this.decompressData(result);
          this.stats.hits++;
          return JSON.parse(decompressed);
        } catch (error) {
          console.error('Bulk get parse error:', error);
          this.stats.errors++;
          return null;
        }
      }));
    } catch (error) {
      console.error('Bulk get error:', error);
      this.stats.errors++;
      return keys.map(() => null);
    }
  }

  /**
   * Bulk set multiple key-value pairs
   */
  async mset<T>(data: Record<string, T>, options: CacheOptions = {}): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const pipeline = this.redis.multi();
      const ttl = options.ttl || this.defaultTTL;
      
      for (const [key, value] of Object.entries(data)) {
        const cacheKey = this.generateKey(key, options.namespace);
        let serialized = JSON.stringify(value);
        serialized = await this.compressData(serialized, options.compress || false);
        
        pipeline.setEx(cacheKey, ttl, serialized);
        
        // Handle tags
        if (options.tags) {
          for (const tag of options.tags) {
            pipeline.sAdd(`tag:${tag}`, cacheKey);
            pipeline.expire(`tag:${tag}`, ttl + 300); // Tags live longer
          }
        }
      }
      
      await pipeline.exec();
      this.stats.sets += Object.keys(data).length;
      return true;
    } catch (error) {
      console.error('Bulk set error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Add key to tags for bulk invalidation
   */
  private async addToTags(cacheKey: string, tags: string[]): Promise<void> {
    if (!this.redis) return;

    try {
      const pipeline = this.redis.multi();
      for (const tag of tags) {
        pipeline.sAdd(`tag:${tag}`, cacheKey);
        pipeline.expire(`tag:${tag}`, this.defaultTTL + 300); // Tags live longer
      }
      await pipeline.exec();
    } catch (error) {
      console.error('Add to tags error:', error);
    }
  }

  /**
   * Invalidate all keys with specific tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    if (!this.redis) return 0;

    try {
      let totalDeleted = 0;
      
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const keys = await this.redis.sMembers(tagKey);
        
        if (keys.length > 0) {
          const deleted = await this.redis.del(keys);
          totalDeleted += deleted;
          
          // Clean up the tag set
          await this.redis.del(tagKey);
        }
      }
      
      this.stats.deletes += totalDeleted;
      return totalDeleted;
    } catch (error) {
      console.error('Invalidate by tags error:', error);
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Clear all cache in namespace
   */
  async clearNamespace(namespace: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const pattern = `${namespace}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) return 0;
      
      const deleted = await this.redis.del(keys);
      this.stats.deletes += deleted;
      return deleted;
    } catch (error) {
      console.error('Clear namespace error:', error);
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    if (!this.redis) return this.stats;

    try {
      // Get Redis info
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memory = memoryMatch ? parseInt(memoryMatch[1]) : 0;
      
      // Count total keys
      const totalKeys = await this.redis.dbSize();
      
      return {
        ...this.stats,
        totalKeys,
        memoryUsage: memory
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return this.stats;
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalKeys: 0,
      memoryUsage: 0
    };
  }

  /**
   * Flush all cache
   */
  async flushAll(): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.flushDb();
      this.resetStats();
      return true;
    } catch (error) {
      console.error('Flush all error:', error);
      return false;
    }
  }
}

// Global cache service instance
export const cacheService = new CacheService();