// backend/src/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';
import { createHash } from 'crypto';

export interface CacheMiddlewareOptions {
  ttl?: number;
  namespace?: string;
  tags?: string[];
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  skipIfAuthenticated?: boolean;
  varyBy?: string[]; // Vary cache by headers/query params
}

/**
 * Cache middleware for GET requests
 */
export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check condition if provided
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Skip if authenticated and option is set
    if (options.skipIfAuthenticated && req.headers.authorization) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(req)
        : generateDefaultCacheKey(req, options.varyBy);

      // Try to get from cache
      const cached = await cacheService.get(cacheKey, options.namespace);
      
      if (cached) {
        // Cache hit - return cached response
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cached);
      }

      // Cache miss - continue to handler
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);

      // Intercept the response to cache it
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cache the response
        cacheService.set(cacheKey, data, {
          ttl: options.ttl,
          namespace: options.namespace,
          tags: options.tags
        }).catch(error => {
          console.error('Cache set error in middleware:', error);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Generate default cache key based on request
 */
function generateDefaultCacheKey(req: Request, varyBy?: string[]): string {
  const parts = [
    req.method,
    req.path,
    JSON.stringify(req.query)
  ];

  // Add vary by headers/params
  if (varyBy) {
    for (const vary of varyBy) {
      if (vary.startsWith('header:')) {
        const header = vary.slice(7);
        parts.push(`h:${header}:${req.headers[header] || ''}`);
      } else if (vary.startsWith('query:')) {
        const param = vary.slice(6);
        parts.push(`q:${param}:${req.query[param] || ''}`);
      }
    }
  }

  const key = parts.join('|');
  
  // Hash if too long
  if (key.length > 200) {
    return createHash('sha256').update(key).digest('hex');
  }
  
  return key;
}

/**
 * Cache invalidation middleware
 */
export function invalidateCache(options: {
  tags?: string[];
  namespace?: string;
  keys?: string[];
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Set up post-response hook
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Invalidate by tags
          if (options.tags) {
            await cacheService.invalidateByTags(options.tags);
          }

          // Invalidate specific keys
          if (options.keys) {
            for (const key of options.keys) {
              await cacheService.delete(key, options.namespace);
            }
          }

          // Clear entire namespace
          if (options.namespace && !options.tags && !options.keys) {
            await cacheService.clearNamespace(options.namespace);
          }
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      }
    });

    next();
  };
}

/**
 * Conditional cache middleware
 */
export function conditionalCache(
  condition: (req: Request) => boolean,
  cacheOptions: CacheMiddlewareOptions
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      return cacheMiddleware(cacheOptions)(req, res, next);
    }
    next();
  };
}

/**
 * Cache warming middleware - preload cache
 */
export function warmCache(options: {
  keys: Array<{
    key: string;
    factory: () => Promise<any>;
    ttl?: number;
    namespace?: string;
  }>;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Warm cache in background
    setImmediate(async () => {
      for (const item of options.keys) {
        try {
          const exists = await cacheService.exists(item.key, item.namespace);
          if (!exists) {
            const data = await item.factory();
            await cacheService.set(item.key, data, {
              ttl: item.ttl,
              namespace: item.namespace
            });
          }
        } catch (error) {
          console.error(`Cache warming error for key ${item.key}:`, error);
        }
      }
    });

    next();
  };
}

/**
 * Cache statistics middleware
 */
export function cacheStats() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/cache/stats' && req.method === 'GET') {
      try {
        const stats = await cacheService.getStats();
        return res.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to get cache stats',
          timestamp: new Date().toISOString()
        });
      }
    }
    next();
  };
}

/**
 * Cache management endpoints
 */
export function cacheManagement() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    const method = req.method;

    // GET /cache/stats
    if (path === '/cache/stats' && method === 'GET') {
      try {
        const stats = await cacheService.getStats();
        return res.json({
          success: true,
          data: stats,
          message: 'Cache statistics retrieved successfully'
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to get cache stats'
        });
      }
    }

    // DELETE /cache/flush
    if (path === '/cache/flush' && method === 'DELETE') {
      try {
        await cacheService.flushAll();
        return res.json({
          success: true,
          message: 'Cache flushed successfully'
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to flush cache'
        });
      }
    }

    // DELETE /cache/namespace/:namespace
    if (path.startsWith('/cache/namespace/') && method === 'DELETE') {
      try {
        const namespace = path.split('/')[3];
        const deleted = await cacheService.clearNamespace(namespace);
        return res.json({
          success: true,
          message: `Cleared ${deleted} keys from namespace ${namespace}`
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to clear namespace'
        });
      }
    }

    // DELETE /cache/tags
    if (path === '/cache/tags' && method === 'DELETE') {
      try {
        const { tags } = req.body;
        if (!tags || !Array.isArray(tags)) {
          return res.status(400).json({
            success: false,
            error: 'Tags array required in request body'
          });
        }
        
        const deleted = await cacheService.invalidateByTags(tags);
        return res.json({
          success: true,
          message: `Invalidated ${deleted} keys with tags: ${tags.join(', ')}`
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to invalidate by tags'
        });
      }
    }

    next();
  };
}