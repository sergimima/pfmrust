// backend/src/routes/api/stats.ts
import { Router, Request, Response } from 'express';
import { getCache, setCache } from '../../config/redis';
import { apiResponse, handleAsync } from '../../utils/helpers';
import { analyticsService } from '../../services/analyticsService';

const router = Router();

/**
 * GET /api/stats/overview
 * Obtener estadísticas generales del sistema
 */
router.get('/overview', handleAsync(async (req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getSystemAnalytics();
    
    if (!stats) {
      return res.status(500).json(apiResponse(null, 'Error fetching system analytics', null, 'ANALYTICS_ERROR'));
    }

    res.json(apiResponse(stats, 'Overview stats retrieved successfully'));
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json(apiResponse(null, 'Error fetching overview stats', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/stats/user/:userId
 * Obtener estadísticas específicas de un usuario
 */
router.get('/user/:userId', handleAsync(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userStats = await analyticsService.getUserAnalytics(userId);
    
    if (!userStats) {
      return res.status(404).json(apiResponse(null, 'User analytics not found', null, 'USER_NOT_FOUND'));
    }

    res.json(apiResponse(userStats, 'User analytics retrieved successfully'));
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json(apiResponse(null, 'Error fetching user stats', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/stats/community/:communityId
 * Obtener estadísticas específicas de una comunidad
 */
router.get('/community/:communityId', handleAsync(async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const communityStats = await analyticsService.getCommunityAnalytics(communityId);
    
    if (!communityStats) {
      return res.status(404).json(apiResponse(null, 'Community analytics not found', null, 'COMMUNITY_NOT_FOUND'));
    }

    res.json(apiResponse(communityStats, 'Community analytics retrieved successfully'));
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json(apiResponse(null, 'Error fetching community stats', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/stats/vote/:voteId
 * Obtener estadísticas específicas de una votación
 */
router.get('/vote/:voteId', handleAsync(async (req: Request, res: Response) => {
  try {
    const { voteId } = req.params;
    const voteStats = await analyticsService.getVoteAnalytics(voteId);
    
    if (!voteStats) {
      return res.status(404).json(apiResponse(null, 'Vote analytics not found', null, 'VOTE_NOT_FOUND'));
    }

    res.json(apiResponse(voteStats, 'Vote analytics retrieved successfully'));
  } catch (error) {
    console.error('Error fetching vote stats:', error);
    res.status(500).json(apiResponse(null, 'Error fetching vote stats', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/stats/engagement
 * Obtener métricas de engagement con series temporales
 */
router.get('/engagement', handleAsync(async (req: Request, res: Response) => {
  try {
    const { period = 'daily' } = req.query;
    const engagementMetrics = await analyticsService.getEngagementMetrics(period as 'daily' | 'weekly' | 'monthly');
    
    if (!engagementMetrics) {
      return res.status(500).json(apiResponse(null, 'Error fetching engagement metrics', null, 'ANALYTICS_ERROR'));
    }

    res.json(apiResponse(engagementMetrics, 'Engagement metrics retrieved successfully'));
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json(apiResponse(null, 'Error fetching engagement metrics', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/stats/leaderboard
 * Obtener leaderboard analytics
 */
router.get('/leaderboard', handleAsync(async (req: Request, res: Response) => {
  try {
    const { type = 'global', communityId } = req.query;
    const leaderboard = await analyticsService.getLeaderboardAnalytics(type as 'global' | 'community', communityId as string);

    res.json(apiResponse(leaderboard, 'Leaderboard analytics retrieved successfully'));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json(apiResponse(null, 'Error fetching leaderboard', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/stats/categories
 * Obtener analytics por categorías
 */
router.get('/categories', handleAsync(async (req: Request, res: Response) => {
  try {
    const categoryAnalytics = await analyticsService.getCategoryAnalytics();

    res.json(apiResponse(categoryAnalytics, 'Category analytics retrieved successfully'));
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json(apiResponse(null, 'Error fetching category analytics', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/stats/realtime
 * Obtener métricas en tiempo real
 */
router.get('/realtime', handleAsync(async (req: Request, res: Response) => {
  try {
    const realTimeMetrics = await analyticsService.getRealTimeMetrics();

    res.json(apiResponse(realTimeMetrics, 'Real-time metrics retrieved successfully'));
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    res.status(500).json(apiResponse(null, 'Error fetching real-time metrics', null, 'FETCH_ERROR'));
  }
}));

/**
 * POST /api/stats/reports
 * Generar reportes personalizados
 */
router.post('/reports', handleAsync(async (req: Request, res: Response) => {
  try {
    const { type, filters = {}, timeRange } = req.body;
    
    if (!type || !timeRange) {
      return res.status(400).json(apiResponse(null, 'Type and timeRange are required', null, 'VALIDATION_ERROR'));
    }

    const report = await analyticsService.generateReport(type, filters, timeRange);
    
    if (!report) {
      return res.status(500).json(apiResponse(null, 'Error generating report', null, 'REPORT_ERROR'));
    }

    res.json(apiResponse(report, 'Report generated successfully'));
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json(apiResponse(null, 'Error generating report', null, 'REPORT_ERROR'));
  }
}));

/**
 * DELETE /api/stats/cache
 * Limpiar cache de analytics
 */
router.delete('/cache', handleAsync(async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const success = await analyticsService.clearAnalyticsCache(type as string);
    
    if (success) {
      res.json(apiResponse({ cleared: true }, 'Analytics cache cleared successfully'));
    } else {
      res.status(500).json(apiResponse(null, 'Error clearing analytics cache', null, 'CACHE_ERROR'));
    }
  } catch (error) {
    console.error('Error clearing analytics cache:', error);
    res.status(500).json(apiResponse(null, 'Error clearing analytics cache', null, 'CACHE_ERROR'));
  }
}));

/**
 * GET /api/stats/system
 * Obtener estadísticas del sistema y Event Listeners (mantenido para compatibilidad)
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
