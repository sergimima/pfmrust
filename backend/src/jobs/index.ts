// backend/src/jobs/index.ts
import { defaultQueue, Job } from '../services/jobQueue';
import { syncBlockchainDataJob } from './syncBlockchainData';
import { cacheCleanupJob } from './cacheCleanup';
import { calculateStatsJob } from './calculateStats';
import { sendNotificationsJob } from './sendNotifications';
import { backupDataJob } from './backupData';

/**
 * Initialize all job processors
 */
export function initializeJobs(): void {
  console.log('🔧 Initializing job processors...');

  // Register job processors
  defaultQueue.process('sync:blockchain', syncBlockchainDataJob);
  defaultQueue.process('cache:cleanup', cacheCleanupJob);
  defaultQueue.process('stats:calculate', calculateStatsJob);
  defaultQueue.process('notifications:send', sendNotificationsJob);
  defaultQueue.process('data:backup', backupDataJob);

  console.log('✅ All job processors initialized');
}

/**
 * Schedule recurring jobs
 */
export function scheduleRecurringJobs(): void {
  console.log('📅 Scheduling recurring jobs...');

  // Schedule blockchain sync every 30 seconds
  setInterval(async () => {
    await defaultQueue.add('sync:blockchain', {
      syncType: 'incremental',
      timestamp: new Date().toISOString()
    }, {
      priority: 10,
      attempts: 3,
      timeout: 60000 // 1 minute
    });
  }, 30 * 1000);

  // Schedule cache cleanup every 5 minutes
  setInterval(async () => {
    await defaultQueue.add('cache:cleanup', {
      cleanupType: 'expired',
      timestamp: new Date().toISOString()
    }, {
      priority: 5,
      attempts: 2,
      timeout: 30000
    });
  }, 5 * 60 * 1000);

  // Schedule stats calculation every 10 minutes
  setInterval(async () => {
    await defaultQueue.add('stats:calculate', {
      statsType: 'all',
      timestamp: new Date().toISOString()
    }, {
      priority: 3,
      attempts: 2,
      timeout: 120000 // 2 minutes
    });
  }, 10 * 60 * 1000);

  // Schedule data backup every hour
  setInterval(async () => {
    await defaultQueue.add('data:backup', {
      backupType: 'incremental',
      timestamp: new Date().toISOString()
    }, {
      priority: 1,
      attempts: 3,
      timeout: 300000 // 5 minutes
    });
  }, 60 * 60 * 1000);

  console.log('✅ Recurring jobs scheduled');
}

/**
 * Add immediate job
 */
export async function addJob(type: string, data: any = {}, options: any = {}): Promise<string> {
  return await defaultQueue.add(type, data, options);
}

/**
 * Get job queue statistics
 */
export function getJobStats() {
  return defaultQueue.getStats();
}

/**
 * Get all jobs or jobs by status
 */
export function getJobs(status?: any) {
  return defaultQueue.getJobs(status);
}

/**
 * Get specific job
 */
export function getJob(jobId: string) {
  return defaultQueue.getJob(jobId);
}

/**
 * Remove job
 */
export async function removeJob(jobId: string): Promise<boolean> {
  return await defaultQueue.removeJob(jobId);
}

/**
 * Clean completed and failed jobs
 */
export async function cleanJobs() {
  return await defaultQueue.clean();
}

/**
 * Pause job processing
 */
export function pauseJobs(): void {
  defaultQueue.pause();
}

/**
 * Resume job processing
 */
export function resumeJobs(): void {
  defaultQueue.resume();
}

/**
 * Update job progress (for long-running jobs)
 */
export function updateJobProgress(jobId: string, progress: number): void {
  defaultQueue.updateProgress(jobId, progress);
}

export { defaultQueue };
