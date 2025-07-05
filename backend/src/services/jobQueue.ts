// backend/src/services/jobQueue.ts
import { EventEmitter } from 'events';

export interface JobData {
  [key: string]: any;
}

export interface JobOptions {
  priority?: number;          // Higher number = higher priority
  attempts?: number;          // Number of retry attempts
  delay?: number;            // Delay before processing (ms)
  backoff?: 'fixed' | 'exponential';
  backoffDelay?: number;     // Base delay for backoff
  timeout?: number;          // Job timeout in ms
  removeOnComplete?: number; // Keep only N completed jobs
  removeOnFail?: number;     // Keep only N failed jobs
}

export interface Job {
  id: string;
  type: string;
  data: JobData;
  options: Required<JobOptions>;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'stuck';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  attempts: number;
  nextRunAt?: Date;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  stuck: number;
}

/**
 * In-memory job queue with Redis-like functionality
 * En producción se reemplazaría por Bull/BullMQ con Redis
 */
export class JobQueue extends EventEmitter {
  private jobs = new Map<string, Job>();
  private queues = new Map<string, Job[]>();
  private activeJobs = new Map<string, Job>();
  private completedJobs: Job[] = [];
  private failedJobs: Job[] = [];
  private delayedJobs: Job[] = [];
  private processing = false;
  private processors = new Map<string, (job: Job) => Promise<any>>();
  private maxConcurrency = 5;
  private currentConcurrency = 0;
  private defaultOptions: Required<JobOptions> = {
    priority: 0,
    attempts: 3,
    delay: 0,
    backoff: 'exponential',
    backoffDelay: 1000,
    timeout: 30000,
    removeOnComplete: 50,
    removeOnFail: 50
  };

  constructor(name: string = 'default') {
    super();
    this.queues.set(name, []);
    this.startProcessing();
  }

  /**
   * Add a job to the queue
   */
  async add(type: string, data: JobData = {}, options: JobOptions = {}): Promise<string> {
    const jobId = this.generateJobId();
    const job: Job = {
      id: jobId,
      type,
      data,
      options: { ...this.defaultOptions, ...options },
      status: options.delay && options.delay > 0 ? 'delayed' : 'waiting',
      progress: 0,
      createdAt: new Date(),
      attempts: 0,
      nextRunAt: options.delay ? new Date(Date.now() + options.delay) : new Date()
    };

    this.jobs.set(jobId, job);

    if (job.status === 'delayed') {
      this.delayedJobs.push(job);
      this.delayedJobs.sort((a, b) => (a.nextRunAt?.getTime() || 0) - (b.nextRunAt?.getTime() || 0));
    } else {
      this.addToQueue(job);
    }

    this.emit('job:added', job);
    console.log(`📋 Job ${jobId} (${type}) added to queue`);

    return jobId;
  }

  /**
   * Add job processor for specific job type
   */
  process(type: string, processor: (job: Job) => Promise<any>): void {
    this.processors.set(type, processor);
    console.log(`⚙️ Processor registered for job type: ${type}`);
  }

  /**
   * Process a single job manually
   */
  async processJob(jobId: string): Promise<any> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    return this.executeJob(job);
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get jobs by status
   */
  getJobs(status?: Job['status']): Job[] {
    if (!status) {
      return Array.from(this.jobs.values());
    }

    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const jobs = Array.from(this.jobs.values());
    return {
      waiting: jobs.filter(j => j.status === 'waiting').length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      delayed: jobs.filter(j => j.status === 'delayed').length,
      stuck: jobs.filter(j => j.status === 'stuck').length
    };
  }

  /**
   * Remove job from queue
   */
  async removeJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    // Remove from various arrays
    this.removeFromQueue(job);
    this.delayedJobs = this.delayedJobs.filter(j => j.id !== jobId);
    this.completedJobs = this.completedJobs.filter(j => j.id !== jobId);
    this.failedJobs = this.failedJobs.filter(j => j.id !== jobId);
    this.activeJobs.delete(jobId);
    this.jobs.delete(jobId);

    this.emit('job:removed', job);
    return true;
  }

  /**
   * Clean completed and failed jobs
   */
  async clean(): Promise<{ completed: number; failed: number }> {
    let completedCleaned = 0;
    let failedCleaned = 0;

    // Clean completed jobs
    if (this.completedJobs.length > this.defaultOptions.removeOnComplete) {
      const toRemove = this.completedJobs.length - this.defaultOptions.removeOnComplete;
      const removed = this.completedJobs.splice(0, toRemove);
      removed.forEach(job => this.jobs.delete(job.id));
      completedCleaned = removed.length;
    }

    // Clean failed jobs
    if (this.failedJobs.length > this.defaultOptions.removeOnFail) {
      const toRemove = this.failedJobs.length - this.defaultOptions.removeOnFail;
      const removed = this.failedJobs.splice(0, toRemove);
      removed.forEach(job => this.jobs.delete(job.id));
      failedCleaned = removed.length;
    }

    console.log(`🧹 Cleaned ${completedCleaned} completed and ${failedCleaned} failed jobs`);
    return { completed: completedCleaned, failed: failedCleaned };
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.processing = false;
    console.log('⏸️ Queue processing paused');
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.processing = true;
    console.log('▶️ Queue processing resumed');
    this.processNextJobs();
  }

  /**
   * Update job progress
   */
  updateProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = Math.max(0, Math.min(100, progress));
      this.emit('job:progress', job);
    }
  }

  /**
   * Private methods
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToQueue(job: Job): void {
    const queueName = 'default';
    const queue = this.queues.get(queueName) || [];
    
    // Insert based on priority
    const insertIndex = queue.findIndex(j => j.options.priority < job.options.priority);
    if (insertIndex === -1) {
      queue.push(job);
    } else {
      queue.splice(insertIndex, 0, job);
    }
    
    this.queues.set(queueName, queue);
  }

  private removeFromQueue(job: Job): void {
    const queueName = 'default';
    const queue = this.queues.get(queueName) || [];
    const filtered = queue.filter(j => j.id !== job.id);
    this.queues.set(queueName, filtered);
  }

  private startProcessing(): void {
    this.processing = true;
    
    // Process delayed jobs every second
    setInterval(() => {
      this.processDelayedJobs();
    }, 1000);

    // Main processing loop
    setInterval(() => {
      if (this.processing) {
        this.processNextJobs();
      }
    }, 100);

    // Clean jobs every 5 minutes
    setInterval(() => {
      this.clean();
    }, 5 * 60 * 1000);

    console.log('🚀 Job queue processing started');
  }

  private processDelayedJobs(): void {
    const now = new Date();
    const readyJobs = this.delayedJobs.filter(job => 
      job.nextRunAt && job.nextRunAt <= now
    );

    readyJobs.forEach(job => {
      job.status = 'waiting';
      this.addToQueue(job);
      this.delayedJobs = this.delayedJobs.filter(j => j.id !== job.id);
    });
  }

  private async processNextJobs(): Promise<void> {
    const queue = this.queues.get('default') || [];
    
    while (this.currentConcurrency < this.maxConcurrency && queue.length > 0) {
      const job = queue.shift();
      if (!job) break;

      this.currentConcurrency++;
      this.executeJob(job).finally(() => {
        this.currentConcurrency--;
      });
    }
  }

  private async executeJob(job: Job): Promise<any> {
    job.status = 'active';
    job.processedAt = new Date();
    job.attempts++;
    this.activeJobs.set(job.id, job);

    this.emit('job:active', job);
    console.log(`⚙️ Processing job ${job.id} (${job.type}) - Attempt ${job.attempts}`);

    const processor = this.processors.get(job.type);
    if (!processor) {
      const error = `No processor found for job type: ${job.type}`;
      await this.failJob(job, error);
      throw new Error(error);
    }

    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), job.options.timeout);
      });

      const result = await Promise.race([
        processor(job),
        timeoutPromise
      ]);

      await this.completeJob(job, result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.failJob(job, errorMessage);
      throw error;
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  private async completeJob(job: Job, result: any): Promise<void> {
    job.status = 'completed';
    job.result = result;
    job.completedAt = new Date();
    job.progress = 100;

    this.completedJobs.push(job);
    this.emit('job:completed', job);
    console.log(`✅ Job ${job.id} (${job.type}) completed successfully`);
  }

  private async failJob(job: Job, error: string): Promise<void> {
    job.error = error;
    job.failedAt = new Date();

    if (job.attempts < job.options.attempts) {
      // Retry with backoff
      const delay = this.calculateBackoffDelay(job);
      job.status = 'delayed';
      job.nextRunAt = new Date(Date.now() + delay);
      
      this.delayedJobs.push(job);
      this.delayedJobs.sort((a, b) => (a.nextRunAt?.getTime() || 0) - (b.nextRunAt?.getTime() || 0));
      
      this.emit('job:retrying', job);
      console.log(`🔄 Job ${job.id} (${job.type}) will retry in ${delay}ms (Attempt ${job.attempts}/${job.options.attempts})`);
    } else {
      job.status = 'failed';
      this.failedJobs.push(job);
      this.emit('job:failed', job);
      console.log(`❌ Job ${job.id} (${job.type}) failed permanently: ${error}`);
    }
  }

  private calculateBackoffDelay(job: Job): number {
    const baseDelay = job.options.backoffDelay;
    
    if (job.options.backoff === 'fixed') {
      return baseDelay;
    } else {
      // Exponential backoff
      return baseDelay * Math.pow(2, job.attempts - 1);
    }
  }
}

// Global job queue instance
export const defaultQueue = new JobQueue('default');
