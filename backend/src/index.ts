import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';

// Load environment variables
dotenv.config();

// Import configurations and middleware
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { testSolanaConnection, getSolanaConnection } from './config/solana';
import { errorHandler, notFoundHandler, requestLogger, rateLimiter } from './middleware';
import { cachePerformanceMonitoring, cacheAlerting } from './middleware/cacheMonitoring';
import { smartCacheInvalidation } from './middleware/cacheInvalidation';
import { initializeJobs, scheduleRecurringJobs } from './jobs';
import routes from './routes';
import EventListenerManager from './listeners';
import type { EventListenerConfig } from './listeners';
import { createServer } from 'http';
import { initializeWebSocketService } from './services/websocketService';

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Event Listener Manager
let eventListenerManager: EventListenerManager | null = null;
let websocketService: any = null;

// Global middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}
app.use(rateLimiter(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Cache middleware
app.use(cachePerformanceMonitoring());
app.use(smartCacheInvalidation());

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize connections and start server
async function startServer() {
  try {
    console.log('🚀 Starting Solana Voting System Backend...');
    
    // Initialize database
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Initialize Redis
    const redisClient = await connectRedis();
    if (!redisClient) {
      console.warn('⚠️ Redis connection failed - caching disabled');
    } else {
      // Initialize cache alerting system
      cacheAlerting();
      console.log('🔔 Cache monitoring and alerting system started');
      
      // Initialize job system
      initializeJobs();
      scheduleRecurringJobs();
      console.log('🚀 Job system initialized and scheduled');
    }
    
    // Initialize WebSocket service
    websocketService = initializeWebSocketService(server);
    console.log('🔌 WebSocket service initialized');
    
    // Test Solana connection
    const solanaConnected = await testSolanaConnection();
    if (!solanaConnected) {
      console.warn('⚠️ Solana connection failed - blockchain features disabled');
    } else {
      // Initialize Event Listeners if Solana is connected
      await initializeEventListeners();
    }
    
    // Start HTTP server with WebSocket support
    server.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📍 API status: http://localhost:${PORT}/api/status`);
      console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      if (websocketService) await websocketService.shutdown();
      server.close(async () => {
        await shutdownEventListeners();
        await disconnectDatabase();
        await disconnectRedis();
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      if (websocketService) await websocketService.shutdown();
      server.close(async () => {
        await shutdownEventListeners();
        await disconnectDatabase();
        await disconnectRedis();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Initialize Event Listeners for blockchain synchronization
 */
async function initializeEventListeners(): Promise<void> {
  try {
    console.log('🎧 Initializing Event Listeners...');
    
    const connection = getSolanaConnection();
    if (!connection) {
      console.warn('⚠️ No Solana connection available for Event Listeners');
      return;
    }
    
    // Get program ID from environment
    const programId = process.env.SOLANA_PROGRAM_ID;
    if (!programId) {
      console.warn('⚠️ SOLANA_PROGRAM_ID not set in environment variables');
      return;
    }
    
    // Event Listener configuration
    const config: EventListenerConfig = {
      connection,
      programId: new PublicKey(programId),
      program: null as any, // TODO: Load actual program IDL
      pollInterval: parseInt(process.env.EVENT_POLL_INTERVAL || '5000'), // 5 seconds
      maxRetries: parseInt(process.env.EVENT_MAX_RETRIES || '3'),
      batchSize: parseInt(process.env.EVENT_BATCH_SIZE || '10')
    };
    
    // Create and start Event Listener Manager
    eventListenerManager = new EventListenerManager(config);
    await eventListenerManager.start();
    
    console.log('✅ Event Listeners initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Event Listeners:', error);
    // Don't throw - let the server continue without event listeners
  }
}

/**
 * Shutdown Event Listeners gracefully
 */
async function shutdownEventListeners(): Promise<void> {
  if (eventListenerManager) {
    try {
      console.log('🛑 Shutting down Event Listeners...');
      await eventListenerManager.stop();
      eventListenerManager = null;
      console.log('✅ Event Listeners shut down successfully');
    } catch (error) {
      console.error('❌ Error shutting down Event Listeners:', error);
    }
  }
}

// Start the server
startServer();

export default app;
