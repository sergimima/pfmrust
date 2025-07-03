import Redis from 'redis';

// Redis client instance
let redisClient: Redis.RedisClientType | null = null;

export async function connectRedis() {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return null;
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
    console.log('🔌 Redis disconnected');
  }
}

export function getRedisClient() {
  return redisClient;
}

// Cache helpers
export async function setCache(key: string, value: any, ttl: number = 3600) {
  if (!redisClient) return false;
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export async function getCache(key: string) {
  if (!redisClient) return null;
  
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function deleteCache(key: string) {
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}
