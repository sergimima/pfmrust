// backend/src/routes/cache.ts
import { Router, Request, Response } from 'express';
import { cacheService } from '../services/cacheService';
import { apiResponse, handleAsync } from '../utils/helpers';
import { cacheMetricsEndpoints, getCacheRecommendations } from '../middleware/cacheMonitoring';

const router = Router();
const metricsHandlers = cacheMetricsEndpoints();

/**
 * GET /cache/stats
 * Obtener estadísticas del cache
 */
router.get('/stats', handleAsync(async (req: Request, res: Response) => {
  try {
    const stats = await cacheService.getStats();
    res.json(apiResponse(stats, 'Cache statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json(apiResponse(null, 'Failed to get cache statistics', null, 'CACHE_ERROR'));
  }
}));

/**
 * DELETE /cache/flush
 * Limpiar todo el cache
 */
router.delete('/flush', handleAsync(async (req: Request, res: Response) => {
  try {
    const success = await cacheService.flushAll();
    if (success) {
      res.json(apiResponse(null, 'Cache flushed successfully'));
    } else {
      res.status(500).json(apiResponse(null, 'Failed to flush cache', null, 'CACHE_ERROR'));
    }
  } catch (error) {
    console.error('Error flushing cache:', error);
    res.status(500).json(apiResponse(null, 'Failed to flush cache', null, 'CACHE_ERROR'));
  }
}));

/**
 * DELETE /cache/namespace/:namespace
 * Limpiar namespace específico
 */
router.delete('/namespace/:namespace', handleAsync(async (req: Request, res: Response) => {
  try {
    const { namespace } = req.params;
    const deleted = await cacheService.clearNamespace(namespace);
    res.json(apiResponse(
      { deleted }, 
      `Cleared ${deleted} keys from namespace "${namespace}"`
    ));
  } catch (error) {
    console.error('Error clearing namespace:', error);
    res.status(500).json(apiResponse(null, 'Failed to clear namespace', null, 'CACHE_ERROR'));
  }
}));

/**
 * DELETE /cache/tags
 * Invalidar por tags
 */
router.delete('/tags', handleAsync(async (req: Request, res: Response) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json(apiResponse(
        null, 
        'Tags array required in request body', 
        null, 
        'VALIDATION_ERROR'
      ));
    }
    
    const deleted = await cacheService.invalidateByTags(tags);
    res.json(apiResponse(
      { deleted, tags }, 
      `Invalidated ${deleted} keys with tags: ${tags.join(', ')}`
    ));
  } catch (error) {
    console.error('Error invalidating by tags:', error);
    res.status(500).json(apiResponse(null, 'Failed to invalidate by tags', null, 'CACHE_ERROR'));
  }
}));

/**
 * POST /cache/warm
 * Pre-calentar cache con datos comunes
 */
router.post('/warm', handleAsync(async (req: Request, res: Response) => {
  try {
    // Precargar datos comunes en cache
    const warmupTasks = [
      // Calentar lista de comunidades más populares
      cacheService.getOrSet(
        'communities:popular',
        async () => {
          // Mock data - en producción sería query a DB
          return [
            { id: 1, name: 'DeFi Enthusiasts', totalMembers: 1250 },
            { id: 2, name: 'Solana Developers', totalMembers: 890 }
          ];
        },
        { namespace: 'communities', ttl: 300, tags: ['communities', 'popular'] }
      ),
      
      // Calentar votaciones activas
      cacheService.getOrSet(
        'votes:active',
        async () => {
          // Mock data - en producción sería query a DB
          return [
            { id: 1, question: 'Should we implement tiered fees?', status: 'ACTIVE' },
            { id: 2, question: 'Proposal for new governance model', status: 'ACTIVE' }
          ];
        },
        { namespace: 'votes', ttl: 180, tags: ['votes', 'active'] }
      ),
      
      // Calentar estadísticas globales
      cacheService.getOrSet(
        'stats:global',
        async () => {
          // Mock data - en producción sería query a DB
          return {
            totalUsers: 5420,
            totalCommunities: 89,
            totalVotes: 1234,
            totalParticipations: 8765
          };
        },
        { namespace: 'stats', ttl: 600, tags: ['stats', 'global'] }
      )
    ];
    
    await Promise.all(warmupTasks);
    
    res.json(apiResponse(
      { tasks: warmupTasks.length }, 
      'Cache warmed up successfully'
    ));
  } catch (error) {
    console.error('Error warming cache:', error);
    res.status(500).json(apiResponse(null, 'Failed to warm cache', null, 'CACHE_ERROR'));
  }
}));

/**
 * GET /cache/key/:key
 * Obtener valor específico del cache
 */
router.get('/key/:key', handleAsync(async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { namespace } = req.query;
    
    const value = await cacheService.get(key, namespace as string);
    
    if (value === null) {
      return res.status(404).json(apiResponse(null, 'Key not found in cache', null, 'NOT_FOUND'));
    }
    
    res.json(apiResponse(value, 'Cache value retrieved successfully'));
  } catch (error) {
    console.error('Error getting cache key:', error);
    res.status(500).json(apiResponse(null, 'Failed to get cache key', null, 'CACHE_ERROR'));
  }
}));

/**
 * DELETE /cache/key/:key
 * Eliminar key específica del cache
 */
router.delete('/key/:key', handleAsync(async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { namespace } = req.query;
    
    const deleted = await cacheService.delete(key, namespace as string);
    
    if (deleted) {
      res.json(apiResponse(null, `Key "${key}" deleted successfully`));
    } else {
      res.status(404).json(apiResponse(null, 'Key not found', null, 'NOT_FOUND'));
    }
  } catch (error) {
    console.error('Error deleting cache key:', error);
    res.status(500).json(apiResponse(null, 'Failed to delete cache key', null, 'CACHE_ERROR'));
  }
}));

/**
 * GET /cache/info/:key
 * Obtener información sobre una key específica (TTL, existencia, etc.)
 */
router.get('/info/:key', handleAsync(async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { namespace } = req.query;
    
    const [exists, ttl] = await Promise.all([
      cacheService.exists(key, namespace as string),
      cacheService.getTTL(key, namespace as string)
    ]);
    
    const info = {
      key,
      namespace: namespace || 'cache',
      exists,
      ttl,
      expiresAt: ttl > 0 ? new Date(Date.now() + ttl * 1000) : null
    };
    
    res.json(apiResponse(info, 'Cache key information retrieved successfully'));
  } catch (error) {
    console.error('Error getting cache key info:', error);
    res.status(500).json(apiResponse(null, 'Failed to get cache key info', null, 'CACHE_ERROR'));
  }
}));

/**
 * GET /cache/metrics
 * Obtener métricas de performance del cache
 */
router.get('/metrics', metricsHandlers.getMetrics);

/**
 * GET /cache/analytics
 * Obtener analytics agregados del cache
 */
router.get('/analytics', metricsHandlers.getAnalytics);

/**
 * POST /cache/metrics/reset
 * Resetear métricas del cache
 */
router.post('/metrics/reset', metricsHandlers.resetMetrics);

/**
 * GET /cache/recommendations
 * Obtener recomendaciones automáticas para optimización
 */
router.get('/recommendations', handleAsync(async (req: Request, res: Response) => {
  try {
    const recommendations = getCacheRecommendations();
    res.json(apiResponse(recommendations, 'Cache recommendations generated successfully'));
  } catch (error) {
    console.error('Error generating cache recommendations:', error);
    res.status(500).json(apiResponse(null, 'Failed to generate cache recommendations', null, 'CACHE_ERROR'));
  }
}));

export default router;
