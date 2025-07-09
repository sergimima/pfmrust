import { Router } from 'express';

const router = Router();

// Import basic routes
import healthRoutes from './health';
import cacheRoutes from './cache';
import jobRoutes from './jobs';

// Import API routes directly
import usersRouter from './api/users';
import communitiesRouter from './api/communities';
import votesRouter from './api/votes';
import statsRouter from './api/stats';
import searchRouter from './api/search';
import blockchainRouter from './api/blockchain';

// Mount basic routes
router.use('/', healthRoutes);
router.use('/cache', cacheRoutes);
router.use('/jobs', jobRoutes);

// Mount API routes directly (no /api prefix here because index.ts already adds it)
router.use('/users', usersRouter);
router.use('/communities', communitiesRouter);  
router.use('/votes', votesRouter);
router.use('/stats', statsRouter);
router.use('/search', searchRouter);
router.use('/blockchain', blockchainRouter);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Solana Voting System API v1.0',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      communities: '/api/communities',
      votes: '/api/votes',
      stats: '/api/stats',
      search: '/api/search',
      blockchain: '/api/blockchain'
    },
    status: 'operational'
  });
});

console.log('🚀 Routes mounted successfully: health, cache, jobs, users, communities, votes, stats, search, blockchain');

export default router;