// backend/src/routes/api/websockets.ts
import { Router, Request, Response } from 'express';
import { apiResponse, handleAsync } from '../../utils/helpers';
import { websocketService } from '../../services/websocketService';
import type { RealTimeUpdate, NotificationData, VoteProgress } from '../../services/websocketService';

const router = Router();

/**
 * GET /api/websockets/stats
 * Obtener estadísticas de WebSockets
 */
router.get('/stats', handleAsync(async (req: Request, res: Response) => {
  try {
    if (!websocketService) {
      return res.status(503).json(apiResponse(null, 'WebSocket service not available', null, 'SERVICE_UNAVAILABLE'));
    }

    const stats = websocketService.getStats();
    res.json(apiResponse(stats, 'WebSocket stats retrieved successfully'));
  } catch (error) {
    console.error('Error getting WebSocket stats:', error);
    res.status(500).json(apiResponse(null, 'Error getting WebSocket stats', null, 'WEBSOCKET_ERROR'));
  }
}));

/**
 * POST /api/websockets/broadcast
 * Enviar broadcast a todos los clientes conectados
 */
router.post('/broadcast', handleAsync(async (req: Request, res: Response) => {
  try {
    if (!websocketService) {
      return res.status(503).json(apiResponse(null, 'WebSocket service not available', null, 'SERVICE_UNAVAILABLE'));
    }

    const { type, data, targetUsers, targetCommunities } = req.body;

    if (!type || !data) {
      return res.status(400).json(apiResponse(null, 'Type and data are required', null, 'VALIDATION_ERROR'));
    }

    const update: RealTimeUpdate = {
      type,
      data,
      timestamp: new Date(),
      targetUsers,
      targetCommunities
    };

    await websocketService.broadcastUpdate(update);

    res.json(apiResponse({ sent: true }, 'Broadcast sent successfully'));
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json(apiResponse(null, 'Error sending broadcast', null, 'WEBSOCKET_ERROR'));
  }
}));

/**
 * POST /api/websockets/notification
 * Enviar notificación a usuario específico
 */
router.post('/notification', handleAsync(async (req: Request, res: Response) => {
  try {
    if (!websocketService) {
      return res.status(503).json(apiResponse(null, 'WebSocket service not available', null, 'SERVICE_UNAVAILABLE'));
    }

    const { userId, type, title, message, communityId, voteId, actions } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json(apiResponse(null, 'Type, title, and message are required', null, 'VALIDATION_ERROR'));
    }

    const notification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      userId,
      communityId,
      voteId,
      timestamp: new Date(),
      read: false,
      actions
    };

    await websocketService.sendNotification(notification);

    res.json(apiResponse({ notificationId: notification.id }, 'Notification sent successfully'));
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json(apiResponse(null, 'Error sending notification', null, 'WEBSOCKET_ERROR'));
  }
}));

/**
 * POST /api/websockets/vote-progress
 * Enviar actualización de progreso de votación
 */
router.post('/vote-progress', handleAsync(async (req: Request, res: Response) => {
  try {
    if (!websocketService) {
      return res.status(503).json(apiResponse(null, 'WebSocket service not available', null, 'SERVICE_UNAVAILABLE'));
    }

    const { voteId, totalParticipants, results, participationRate, timeRemaining, quorumReached, status } = req.body;

    if (!voteId || totalParticipants === undefined || !results || !status) {
      return res.status(400).json(apiResponse(null, 'VoteId, totalParticipants, results, and status are required', null, 'VALIDATION_ERROR'));
    }

    const voteProgress: VoteProgress = {
      voteId,
      totalParticipants,
      results,
      participationRate: participationRate || 0,
      timeRemaining: timeRemaining || 0,
      quorumReached: quorumReached || false,
      status
    };

    await websocketService.sendVoteProgress(voteProgress);

    res.json(apiResponse({ sent: true }, 'Vote progress update sent successfully'));
  } catch (error) {
    console.error('Error sending vote progress:', error);
    res.status(500).json(apiResponse(null, 'Error sending vote progress', null, 'WEBSOCKET_ERROR'));
  }
}));

/**
 * GET /api/websockets/rooms
 * Obtener información de salas activas
 */
router.get('/rooms', handleAsync(async (req: Request, res: Response) => {
  try {
    if (!websocketService) {
      return res.status(503).json(apiResponse(null, 'WebSocket service not available', null, 'SERVICE_UNAVAILABLE'));
    }

    const rooms = websocketService.getActiveRooms();
    
    res.json(apiResponse(rooms, 'Active rooms retrieved successfully'));
  } catch (error) {
    console.error('Error getting active rooms:', error);
    res.status(500).json(apiResponse(null, 'Error getting active rooms', null, 'WEBSOCKET_ERROR'));
  }
}));

/**
 * POST /api/websockets/test
 * Enviar datos de prueba (solo desarrollo)
 */
router.post('/test', handleAsync(async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json(apiResponse(null, 'Test endpoint not available in production', null, 'FORBIDDEN'));
    }

    if (!websocketService) {
      return res.status(503).json(apiResponse(null, 'WebSocket service not available', null, 'SERVICE_UNAVAILABLE'));
    }

    const { testType = 'vote_progress' } = req.body;

    switch (testType) {
      case 'vote_progress':
        const testVoteProgress: VoteProgress = {
          voteId: `test_vote_${Date.now()}`,
          totalParticipants: Math.floor(Math.random() * 100) + 10,
          results: [
            Math.floor(Math.random() * 50),
            Math.floor(Math.random() * 30),
            Math.floor(Math.random() * 20)
          ],
          participationRate: Math.random() * 0.8 + 0.2,
          timeRemaining: Math.floor(Math.random() * 3600) + 300,
          quorumReached: Math.random() > 0.5,
          status: 'active'
        };
        await websocketService.sendVoteProgress(testVoteProgress);
        break;

      case 'notification':
        const testNotification: NotificationData = {
          id: `test_notif_${Date.now()}`,
          type: 'info',
          title: 'Test Notification',
          message: 'This is a test notification sent via WebSocket',
          timestamp: new Date(),
          read: false
        };
        await websocketService.sendNotification(testNotification);
        break;

      case 'broadcast':
        const testUpdate: RealTimeUpdate = {
          type: 'community_created',
          data: {
            communityId: `test_community_${Date.now()}`,
            name: 'Test Community',
            creator: 'test_user',
            timestamp: new Date()
          },
          timestamp: new Date()
        };
        await websocketService.broadcastUpdate(testUpdate);
        break;

      default:
        return res.status(400).json(apiResponse(null, 'Invalid test type', null, 'VALIDATION_ERROR'));
    }

    res.json(apiResponse({ testType, sent: true }, 'Test data sent successfully'));
  } catch (error) {
    console.error('Error sending test data:', error);
    res.status(500).json(apiResponse(null, 'Error sending test data', null, 'WEBSOCKET_ERROR'));
  }
}));

/**
 * GET /api/websockets/health
 * Health check del servicio WebSocket
 */
router.get('/health', handleAsync(async (req: Request, res: Response) => {
  try {
    const isHealthy = websocketService !== undefined;
    const stats = isHealthy ? websocketService.getStats() : null;

    res.json(apiResponse({
      healthy: isHealthy,
      service: 'WebSocket',
      timestamp: new Date(),
      ...stats
    }, isHealthy ? 'WebSocket service is healthy' : 'WebSocket service is not available'));
  } catch (error) {
    console.error('Error checking WebSocket health:', error);
    res.status(500).json(apiResponse(null, 'Error checking WebSocket health', null, 'HEALTH_CHECK_ERROR'));
  }
}));

export default router;
