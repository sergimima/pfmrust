// backend/src/middleware/cacheInvalidation.ts
import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';

/**
 * Middleware para invalidación automática de cache basada en cambios de datos
 */
export function autoInvalidateCache(config: {
  onSuccess?: {
    tags?: string[];
    namespaces?: string[];
    keys?: string[];
  };
  onModification?: {
    tags?: string[];
    namespaces?: string[];
    keys?: string[];
  };
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Hook después de que la respuesta es enviada
    res.on('finish', async () => {
      const statusCode = res.statusCode;
      
      try {
        // Solo invalidar en operaciones exitosas
        if (statusCode >= 200 && statusCode < 300) {
          
          // Invalidación en operaciones de modificación (POST, PUT, PATCH, DELETE)
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            if (config.onModification?.tags) {
              await cacheService.invalidateByTags(config.onModification.tags);
              console.log(`🗑️ Cache invalidated for tags: ${config.onModification.tags.join(', ')}`);
            }
            
            if (config.onModification?.namespaces) {
              for (const namespace of config.onModification.namespaces) {
                const deleted = await cacheService.clearNamespace(namespace);
                console.log(`🗑️ Cache namespace "${namespace}" cleared: ${deleted} keys`);
              }
            }
            
            if (config.onModification?.keys) {
              for (const key of config.onModification.keys) {
                await cacheService.delete(key);
                console.log(`🗑️ Cache key "${key}" deleted`);
              }
            }
          }
          
          // Invalidación en cualquier operación exitosa
          if (config.onSuccess?.tags) {
            await cacheService.invalidateByTags(config.onSuccess.tags);
            console.log(`🗑️ Cache invalidated for success tags: ${config.onSuccess.tags.join(', ')}`);
          }
          
          if (config.onSuccess?.namespaces) {
            for (const namespace of config.onSuccess.namespaces) {
              const deleted = await cacheService.clearNamespace(namespace);
              console.log(`🗑️ Success cache namespace "${namespace}" cleared: ${deleted} keys`);
            }
          }
          
          if (config.onSuccess?.keys) {
            for (const key of config.onSuccess.keys) {
              await cacheService.delete(key);
              console.log(`🗑️ Success cache key "${key}" deleted`);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in cache invalidation:', error);
        // No fallar la respuesta por errores de cache
      }
    });

    next();
  };
}

/**
 * Middleware específico para invalidación de communities
 */
export function invalidateCommunitiesCache() {
  return autoInvalidateCache({
    onModification: {
      tags: ['communities', 'listings', 'community-details'],
      namespaces: ['communities']
    }
  });
}

/**
 * Middleware específico para invalidación de votes
 */
export function invalidateVotesCache() {
  return autoInvalidateCache({
    onModification: {
      tags: ['votes', 'listings', 'vote-details'],
      namespaces: ['votes']
    }
  });
}

/**
 * Middleware específico para invalidación de users
 */
export function invalidateUsersCache() {
  return autoInvalidateCache({
    onModification: {
      tags: ['users', 'listings', 'user-details'],
      namespaces: ['users']
    }
  });
}

/**
 * Middleware específico para invalidación de stats
 */
export function invalidateStatsCache() {
  return autoInvalidateCache({
    onModification: {
      tags: ['stats', 'global', 'leaderboards'],
      namespaces: ['stats']
    }
  });
}

/**
 * Middleware inteligente que detecta el tipo de endpoint y aplica invalidación automática
 */
export function smartCacheInvalidation() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    
    // Detectar tipo de endpoint basado en la ruta
    let invalidationConfig: any = {};
    
    if (path.includes('/users')) {
      invalidationConfig = {
        onModification: {
          tags: ['users', 'listings', 'user-details', 'stats'],
          namespaces: ['users']
        }
      };
    } else if (path.includes('/communities')) {
      invalidationConfig = {
        onModification: {
          tags: ['communities', 'listings', 'community-details', 'stats'],
          namespaces: ['communities']
        }
      };
    } else if (path.includes('/votes')) {
      invalidationConfig = {
        onModification: {
          tags: ['votes', 'listings', 'vote-details', 'stats'],
          namespaces: ['votes']
        }
      };
    } else if (path.includes('/stats')) {
      invalidationConfig = {
        onModification: {
          tags: ['stats', 'global', 'leaderboards']
        }
      };
    }
    
    // Aplicar invalidación si hay configuración
    if (Object.keys(invalidationConfig).length > 0) {
      return autoInvalidateCache(invalidationConfig)(req, res, next);
    }
    
    next();
  };
}

/**
 * Middleware para cache warming después de invalidación
 */
export function cacheWarmingAfterInvalidation(warmupKeys: Array<{
  key: string;
  factory: () => Promise<any>;
  ttl?: number;
  namespace?: string;
  tags?: string[];
}>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      const statusCode = res.statusCode;
      
      // Solo warming después de operaciones exitosas de modificación
      if (statusCode >= 200 && statusCode < 300 && 
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        
        // Warming en background para no afectar respuesta
        setImmediate(async () => {
          try {
            console.log(`🔥 Starting cache warming after ${req.method} ${req.path}`);
            
            for (const item of warmupKeys) {
              try {
                await cacheService.getOrSet(item.key, item.factory, {
                  ttl: item.ttl,
                  namespace: item.namespace,
                  tags: item.tags
                });
                console.log(`🔥 Cache warmed: ${item.key}`);
              } catch (error) {
                console.error(`❌ Cache warming error for ${item.key}:`, error);
              }
            }
            
            console.log(`✅ Cache warming completed for ${warmupKeys.length} keys`);
          } catch (error) {
            console.error('❌ Cache warming error:', error);
          }
        });
      }
    });

    next();
  };
}
