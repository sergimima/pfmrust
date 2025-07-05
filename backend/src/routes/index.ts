import { Router } from 'express';

const router = Router();

// Import all route modules
import healthRoutes from './health';
import cacheRoutes from './cache';
import jobRoutes from './jobs';

console.log('🔧 About to import API routes...');
try {
  const apiRoutes = require('./api');
  console.log('✅ API routes imported successfully');
  // Mount routes
  router.use('/', healthRoutes);
  router.use('/cache', cacheRoutes);
  router.use('/jobs', jobRoutes);
  router.use('/', apiRoutes.default || apiRoutes);
} catch (error) {
  console.error('❌ CRITICAL ERROR importing API routes:', error);
  // Mount only health routes
  router.use('/', healthRoutes);
  router.use('/cache', cacheRoutes);
  router.use('/jobs', jobRoutes);
}

export default router;
