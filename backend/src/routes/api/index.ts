// backend/src/routes/api/index.ts
import { Router } from 'express';
import usersRouter from './users';
import communitiesRouter from './communities';
import votesRouter from './votes';
import statsRouter from './stats';
import searchRouter from './search';
import websocketsRouter from './websockets';
import blockchainRouter from './blockchain';

const router = Router();

// Montar todas las rutas API
router.use('/users', usersRouter);
router.use('/communities', communitiesRouter);
router.use('/votes', votesRouter);
router.use('/stats', statsRouter);
router.use('/search', searchRouter);
router.use('/websockets', websocketsRouter);
router.use('/blockchain', blockchainRouter); // Nueva ruta blockchain

// Ruta de información de la API
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
      websockets: '/api/websockets',
      blockchain: '/api/blockchain' // Nueva endpoint
    },
    realtime: {
      websocket: 'ws://localhost:3001',
      socketio: 'http://localhost:3001'
    },
    blockchain: {
      programId: '98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z',
      network: 'devnet',
      endpoints: {
        info: '/api/blockchain/info',
        userPda: '/api/blockchain/user-pda/:wallet',
        votePda: '/api/blockchain/vote-pda/:community/:creator',
        votingInfo: 'POST /api/blockchain/voting-info'
      }
    },
    documentation: '/api/docs',
    status: 'operational'
  });
});

console.log('🗺 API router created with routes');
export default router;