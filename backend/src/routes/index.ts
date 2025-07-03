import { Router } from 'express';

const router = Router();

// Import all route modules
import healthRoutes from './health';

// Mount routes
router.use('/', healthRoutes);

// TODO: Add more route modules in 3.1.3
// router.use('/communities', communityRoutes);
// router.use('/votings', votingRoutes);
// router.use('/users', userRoutes);

export default router;
