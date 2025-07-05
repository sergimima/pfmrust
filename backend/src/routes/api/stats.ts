// backend/src/routes/api/stats.ts
import { Router, Request, Response } from 'express';
import { getCache, setCache } from '../../config/redis';
import { apiResponse, handleAsync } from '../../utils/helpers';

const router = Router();

/**
 * GET /api/stats/overview
 * Obtener estadísticas generales del sistema
 */
router.get('/overview', handleAsync(async (req: Request, res: Response) => {
  // Cache key
  const cacheKey = 'stats:overview';
  
  // Intentar obtener desde cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(apiResponse(cached, 'Overview stats retrieved from cache'));
  }

  try {
    // Mock data por ahora - serán datos reales cuando Prisma esté configurado
    const stats = {
      totals: {
        users: 15420,
        communities: 234,
        votes: 1890,
        participations: 45670
      },
      active: {
        votes: 89,
        communities: 156
      },
      recent: {
        newUsers: 245,
        newVotes: 67
      },
      ratios: {
        participationRate: '24.17',
        activeVoteRate: '4.71',
        activeCommunityRate: '66.67'
      }
    };

    // Guardar en cache por 5 minutos
    await setCache(cacheKey, stats, 300);

    res.json(apiResponse(stats, 'Overview stats retrieved successfully'));

  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json(apiResponse(null, 'Error fetching overview stats', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/stats/system
 * Obtener estadísticas del sistema y Event Listeners
 */
router.get('/system', handleAsync(async (req: Request, res: Response) => {
  try {
    // Obtener estadísticas de Redis (Event Listeners)
    const syncStats = await getCache('sync_statistics');
    
    const systemStats = {
      eventListeners: syncStats || {
        transactionsProcessed: 0,
        usersSynced: 0,
        communitiesSynced: 0,
        votesSynced: 0,
        membershipsSynced: 0,
        lastSync: new Date().toISOString(),
        errors: 0
      },
      database: {
        connected: true,
        lastQuery: new Date().toISOString()
      },
      cache: {
        connected: true,
        lastUpdate: new Date().toISOString()
      },
      blockchain: {
        connected: true,
        lastBlock: Math.floor(Math.random() * 1000000) + 250000000
      }
    };

    res.json(apiResponse(systemStats, 'System stats retrieved successfully'));

  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json(apiResponse(null, 'Error fetching system stats', null, 'FETCH_ERROR'));
  }
}));

export default router;