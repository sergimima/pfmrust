import { Router } from 'express';
import { successResponse, errorResponse, asyncHandler } from '../utils/helpers';

const router = Router();

// GET /api/health - Health check
router.get('/health', (req, res) => {
  successResponse(res, {
    status: 'OK',
    service: 'voting-system-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// GET /api/status - Service status
router.get('/status', (req, res) => {
  successResponse(res, {
    message: 'Solana Voting System Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      database: 'PostgreSQL + Prisma',
      cache: 'Redis',
      blockchain: 'Solana + Anchor',
      realtime: 'WebSockets',
    },
  });
});

export default router;
