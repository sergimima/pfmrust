import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import configurations and middleware
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { testSolanaConnection } from './config/solana';
import { errorHandler, notFoundHandler, requestLogger, rateLimiter } from './middleware';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

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
    }
    
    // Test Solana connection
    const solanaConnected = await testSolanaConnection();
    if (!solanaConnected) {
      console.warn('⚠️ Solana connection failed - blockchain features disabled');
    }
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📍 API status: http://localhost:${PORT}/api/status`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await disconnectDatabase();
        await disconnectRedis();
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(async () => {
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

// Start the server
startServer();

export default app;
