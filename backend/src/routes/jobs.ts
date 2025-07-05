// backend/src/routes/jobs.ts
import { Router, Request, Response } from 'express';
import { apiResponse, handleAsync } from '../utils/helpers';
import { 
  addJob, 
  getJobStats, 
  getJobs, 
  getJob, 
  removeJob, 
  cleanJobs, 
  pauseJobs, 
  resumeJobs,
  updateJobProgress,
  defaultQueue
} from '../jobs';

const router = Router();

/**
 * GET /jobs/stats
 * Obtener estadísticas de la cola de jobs
 */
router.get('/stats', handleAsync(async (req: Request, res: Response) => {
  try {
    const stats = getJobStats();
    res.json(apiResponse(stats, 'Job queue statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting job stats:', error);
    res.status(500).json(apiResponse(null, 'Failed to get job statistics', null, 'JOB_ERROR'));
  }
}));

/**
 * GET /jobs
 * Listar jobs con filtros opcionales
 */
router.get('/', handleAsync(async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let jobs = getJobs(status as any);
    
    // Paginación simple
    const total = jobs.length;
    const startIndex = Number(offset);
    const endIndex = startIndex + Number(limit);
    jobs = jobs.slice(startIndex, endIndex);
    
    const meta = {
      total,
      limit: Number(limit),
      offset: Number(offset),
      count: jobs.length,
      filters: { status }
    };
    
    res.json(apiResponse(jobs, 'Jobs retrieved successfully', meta));
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json(apiResponse(null, 'Failed to get jobs', null, 'JOB_ERROR'));
  }
}));

/**
 * GET /jobs/:jobId
 * Obtener job específico por ID
 */
router.get('/:jobId', handleAsync(async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId);
    
    if (!job) {
      return res.status(404).json(apiResponse(null, 'Job not found', null, 'NOT_FOUND'));
    }
    
    res.json(apiResponse(job, 'Job retrieved successfully'));
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json(apiResponse(null, 'Failed to get job', null, 'JOB_ERROR'));
  }
}));

/**
 * POST /jobs
 * Crear nuevo job
 */
router.post('/', handleAsync(async (req: Request, res: Response) => {
  try {
    const { type, data = {}, options = {} } = req.body;
    
    if (!type) {
      return res.status(400).json(apiResponse(null, 'Job type is required', null, 'VALIDATION_ERROR'));
    }
    
    // Validar tipos de jobs permitidos
    const allowedTypes = [
      'sync:blockchain',
      'cache:cleanup', 
      'stats:calculate',
      'notifications:send',
      'data:backup'
    ];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json(apiResponse(
        null, 
        `Invalid job type. Allowed types: ${allowedTypes.join(', ')}`, 
        null, 
        'VALIDATION_ERROR'
      ));
    }
    
    const jobId = await addJob(type, data, options);
    const job = getJob(jobId);
    
    res.status(201).json(apiResponse(job, 'Job created successfully'));
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json(apiResponse(null, 'Failed to create job', null, 'JOB_ERROR'));
  }
}));

/**
 * DELETE /jobs/:jobId
 * Eliminar job específico
 */
router.delete('/:jobId', handleAsync(async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const success = await removeJob(jobId);
    
    if (!success) {
      return res.status(404).json(apiResponse(null, 'Job not found', null, 'NOT_FOUND'));
    }
    
    res.json(apiResponse(null, 'Job removed successfully'));
  } catch (error) {
    console.error('Error removing job:', error);
    res.status(500).json(apiResponse(null, 'Failed to remove job', null, 'JOB_ERROR'));
  }
}));

/**
 * PUT /jobs/:jobId/progress
 * Actualizar progreso de job
 */
router.put('/:jobId/progress', handleAsync(async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json(apiResponse(
        null, 
        'Progress must be a number between 0 and 100', 
        null, 
        'VALIDATION_ERROR'
      ));
    }
    
    const job = getJob(jobId);
    if (!job) {
      return res.status(404).json(apiResponse(null, 'Job not found', null, 'NOT_FOUND'));
    }
    
    updateJobProgress(jobId, progress);
    const updatedJob = getJob(jobId);
    
    res.json(apiResponse(updatedJob, 'Job progress updated successfully'));
  } catch (error) {
    console.error('Error updating job progress:', error);
    res.status(500).json(apiResponse(null, 'Failed to update job progress', null, 'JOB_ERROR'));
  }
}));

/**
 * POST /jobs/clean
 * Limpiar jobs completados y fallidos
 */
router.post('/clean', handleAsync(async (req: Request, res: Response) => {
  try {
    const result = await cleanJobs();
    res.json(apiResponse(result, 'Jobs cleaned successfully'));
  } catch (error) {
    console.error('Error cleaning jobs:', error);
    res.status(500).json(apiResponse(null, 'Failed to clean jobs', null, 'JOB_ERROR'));
  }
}));

/**
 * POST /jobs/pause
 * Pausar procesamiento de jobs
 */
router.post('/pause', handleAsync(async (req: Request, res: Response) => {
  try {
    pauseJobs();
    res.json(apiResponse(null, 'Job processing paused successfully'));
  } catch (error) {
    console.error('Error pausing jobs:', error);
    res.status(500).json(apiResponse(null, 'Failed to pause jobs', null, 'JOB_ERROR'));
  }
}));

/**
 * POST /jobs/resume
 * Reanudar procesamiento de jobs
 */
router.post('/resume', handleAsync(async (req: Request, res: Response) => {
  try {
    resumeJobs();
    res.json(apiResponse(null, 'Job processing resumed successfully'));
  } catch (error) {
    console.error('Error resuming jobs:', error);
    res.status(500).json(apiResponse(null, 'Failed to resume jobs', null, 'JOB_ERROR'));
  }
}));

/**
 * POST /jobs/test
 * Crear jobs de prueba para testing
 */
router.post('/test', handleAsync(async (req: Request, res: Response) => {
  try {
    const { type = 'all' } = req.body;
    
    const testJobs = [];
    
    if (type === 'all' || type === 'sync') {
      const syncJobId = await addJob('sync:blockchain', {
        syncType: 'test',
        timestamp: new Date().toISOString()
      }, { priority: 1 });
      testJobs.push({ id: syncJobId, type: 'sync:blockchain' });
    }
    
    if (type === 'all' || type === 'cache') {
      const cacheJobId = await addJob('cache:cleanup', {
        cleanupType: 'test',
        timestamp: new Date().toISOString()
      }, { priority: 2 });
      testJobs.push({ id: cacheJobId, type: 'cache:cleanup' });
    }
    
    if (type === 'all' || type === 'stats') {
      const statsJobId = await addJob('stats:calculate', {
        statsType: 'test',
        timestamp: new Date().toISOString()
      }, { priority: 3 });
      testJobs.push({ id: statsJobId, type: 'stats:calculate' });
    }
    
    if (type === 'all' || type === 'notifications') {
      const notificationJobId = await addJob('notifications:send', {
        notificationType: 'test',
        recipients: ['test@example.com'],
        message: 'Test notification',
        timestamp: new Date().toISOString()
      }, { priority: 4 });
      testJobs.push({ id: notificationJobId, type: 'notifications:send' });
    }
    
    if (type === 'all' || type === 'backup') {
      const backupJobId = await addJob('data:backup', {
        backupType: 'test',
        destinations: ['local'],
        timestamp: new Date().toISOString()
      }, { priority: 5 });
      testJobs.push({ id: backupJobId, type: 'data:backup' });
    }
    
    res.json(apiResponse(testJobs, `Test jobs created successfully (${testJobs.length} jobs)`));
  } catch (error) {
    console.error('Error creating test jobs:', error);
    res.status(500).json(apiResponse(null, 'Failed to create test jobs', null, 'JOB_ERROR'));
  }
}));

/**
 * GET /jobs/types
 * Obtener tipos de jobs disponibles con descripción
 */
router.get('/types', handleAsync(async (req: Request, res: Response) => {
  try {
    const jobTypes = [
      {
        type: 'sync:blockchain',
        description: 'Synchronize blockchain data with database',
        defaultOptions: { priority: 10, attempts: 3, timeout: 60000 },
        dataFields: ['syncType', 'timestamp']
      },
      {
        type: 'cache:cleanup',
        description: 'Clean expired and oversized cache entries',
        defaultOptions: { priority: 5, attempts: 2, timeout: 30000 },
        dataFields: ['cleanupType', 'timestamp']
      },
      {
        type: 'stats:calculate',
        description: 'Calculate system statistics and metrics',
        defaultOptions: { priority: 3, attempts: 2, timeout: 120000 },
        dataFields: ['statsType', 'timestamp']
      },
      {
        type: 'notifications:send',
        description: 'Send notifications to users',
        defaultOptions: { priority: 7, attempts: 3, timeout: 45000 },
        dataFields: ['notificationType', 'recipients', 'message', 'data']
      },
      {
        type: 'data:backup',
        description: 'Backup system data to configured destinations',
        defaultOptions: { priority: 1, attempts: 3, timeout: 300000 },
        dataFields: ['backupType', 'destinations', 'includeCache']
      }
    ];
    
    res.json(apiResponse(jobTypes, 'Job types retrieved successfully'));
  } catch (error) {
    console.error('Error getting job types:', error);
    res.status(500).json(apiResponse(null, 'Failed to get job types', null, 'JOB_ERROR'));
  }
}));

export default router;
