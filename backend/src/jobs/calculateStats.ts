// backend/src/jobs/calculateStats.ts
import { Job } from '../services/jobQueue';
import { cacheService } from '../services/cacheService';
import { updateJobProgress } from './index';

/**
 * Job para calcular estadísticas del sistema
 */
export async function calculateStatsJob(job: Job): Promise<any> {
  console.log(`📊 Starting stats calculation job ${job.id}`);
  
  try {
    const { statsType = 'all', timestamp } = job.data;
    
    updateJobProgress(job.id, 10);
    
    const results = {
      statsType,
      timestamp,
      startTime: new Date(),
      stats: {
        users: {},
        communities: {},
        votes: {},
        cache: {},
        system: {}
      }
    };
    
    switch (statsType) {
      case 'users':
        results.stats.users = await calculateUserStats(job.id);
        break;
      case 'communities':
        results.stats.communities = await calculateCommunityStats(job.id);
        break;
      case 'votes':
        results.stats.votes = await calculateVoteStats(job.id);
        break;
      case 'cache':
        results.stats.cache = await calculateCacheStats(job.id);
        break;
      case 'system':
        results.stats.system = await calculateSystemStats(job.id);
        break;
      case 'all':
        results.stats.users = await calculateUserStats(job.id);
        updateJobProgress(job.id, 30);
        results.stats.communities = await calculateCommunityStats(job.id);
        updateJobProgress(job.id, 50);
        results.stats.votes = await calculateVoteStats(job.id);
        updateJobProgress(job.id, 70);
        results.stats.cache = await calculateCacheStats(job.id);
        updateJobProgress(job.id, 85);
        results.stats.system = await calculateSystemStats(job.id);
        break;
      default:
        results.stats.system = await calculateSystemStats(job.id);
    }
    
    updateJobProgress(job.id, 95);
    
    // Cache las estadísticas calculadas
    await cacheGlobalStats(results.stats);
    
    updateJobProgress(job.id, 100);
    
    console.log(`✅ Stats calculation job ${job.id} completed`);
    return results;
    
  } catch (error) {
    console.error(`❌ Stats calculation job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Calcular estadísticas de usuarios
 */
async function calculateUserStats(jobId: string): Promise<any> {
  updateJobProgress(jobId, 20);
  
  // Simular cálculo de stats de usuarios
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // En producción:
  // - Query PostgreSQL para contar usuarios activos
  // - Calcular distribución de reputación
  // - Usuarios más activos
  // - Crecimiento de usuarios por periodo
  
  const stats = {
    total: Math.floor(Math.random() * 5000) + 1000,
    active: Math.floor(Math.random() * 800) + 200,
    newToday: Math.floor(Math.random() * 50) + 10,
    newThisWeek: Math.floor(Math.random() * 200) + 50,
    newThisMonth: Math.floor(Math.random() * 800) + 200,
    averageReputation: Math.floor(Math.random() * 100) + 50,
    topUsers: [
      { wallet: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw', reputation: 1250, level: 12 },
      { wallet: 'ABC123def456ghi789jkl012mno345pqr678stu901vwx', reputation: 980, level: 9 },
      { wallet: 'XYZ789abc012def345ghi678jkl901mno234pqr567stu', reputation: 875, level: 8 }
    ],
    distributionByLevel: {
      1: 450,
      2: 320,
      3: 180,
      4: 120,
      5: 80,
      6: 50,
      7: 30,
      8: 20,
      9: 15,
      10: 10
    }
  };
  
  console.log(`👥 User stats calculated: ${stats.total} total, ${stats.active} active`);
  return stats;
}

/**
 * Calcular estadísticas de comunidades
 */
async function calculateCommunityStats(jobId: string): Promise<any> {
  updateJobProgress(jobId, 40);
  
  // Simular cálculo de stats de comunidades
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const stats = {
    total: Math.floor(Math.random() * 200) + 50,
    active: Math.floor(Math.random() * 150) + 30,
    newToday: Math.floor(Math.random() * 5) + 1,
    newThisWeek: Math.floor(Math.random() * 15) + 3,
    newThisMonth: Math.floor(Math.random() * 50) + 10,
    totalMembers: Math.floor(Math.random() * 10000) + 2000,
    averageMembersPerCommunity: 45,
    topCommunities: [
      { name: 'DeFi Enthusiasts', members: 1250, votes: 89, category: 'FINANCE' },
      { name: 'Solana Developers', members: 890, votes: 156, category: 'TECHNOLOGY' },
      { name: 'NFT Collectors', members: 675, votes: 67, category: 'ART' }
    ],
    distributionByCategory: {
      'TECHNOLOGY': 45,
      'FINANCE': 38,
      'ART': 25,
      'GAMING': 20,
      'EDUCATION': 15,
      'SPORTS': 12,
      'MUSIC': 10,
      'POLITICS': 8,
      'SCIENCE': 6,
      'GENERAL': 21
    }
  };
  
  console.log(`🏘️ Community stats calculated: ${stats.total} total, ${stats.active} active`);
  return stats;
}

/**
 * Calcular estadísticas de votaciones
 */
async function calculateVoteStats(jobId: string): Promise<any> {
  updateJobProgress(jobId, 60);
  
  // Simular cálculo de stats de votaciones
  await new Promise(resolve => setTimeout(resolve, 900));
  
  const stats = {
    total: Math.floor(Math.random() * 1500) + 300,
    active: Math.floor(Math.random() * 50) + 10,
    completed: Math.floor(Math.random() * 1200) + 250,
    failed: Math.floor(Math.random() * 30) + 5,
    totalParticipations: Math.floor(Math.random() * 8000) + 2000,
    averageParticipationRate: 65.4,
    completedToday: Math.floor(Math.random() * 15) + 3,
    createdToday: Math.floor(Math.random() * 20) + 5,
    topVotedQuestions: [
      { question: 'Should we implement tiered fees?', participants: 125, community: 'DeFi Enthusiasts' },
      { question: 'New governance model proposal', participants: 98, community: 'Solana Developers' },
      { question: 'NFT royalty standards update', participants: 87, community: 'NFT Collectors' }
    ],
    distributionByType: {
      'OPINION': Math.floor(Math.random() * 800) + 200,
      'KNOWLEDGE': Math.floor(Math.random() * 700) + 100
    },
    distributionByStatus: {
      'ACTIVE': Math.floor(Math.random() * 50) + 10,
      'COMPLETED': Math.floor(Math.random() * 1200) + 250,
      'FAILED': Math.floor(Math.random() * 30) + 5,
      'CANCELLED': Math.floor(Math.random() * 10) + 2
    }
  };
  
  console.log(`🗳️ Vote stats calculated: ${stats.total} total, ${stats.active} active`);
  return stats;
}

/**
 * Calcular estadísticas de cache
 */
async function calculateCacheStats(jobId: string): Promise<any> {
  updateJobProgress(jobId, 80);
  
  const cacheStats = await cacheService.getStats();
  
  const stats = {
    ...cacheStats,
    hitRatePercentage: cacheStats.hits + cacheStats.misses > 0 
      ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2)
      : '0.00',
    memoryUsageMB: (cacheStats.memoryUsage / 1024 / 1024).toFixed(2),
    averageResponseTime: Math.floor(Math.random() * 50) + 10, // Mock
    peakHourHitRate: Math.floor(Math.random() * 30) + 70 // Mock
  };
  
  console.log(`💾 Cache stats calculated: ${stats.hitRatePercentage}% hit rate, ${stats.memoryUsageMB}MB used`);
  return stats;
}

/**
 * Calcular estadísticas del sistema
 */
async function calculateSystemStats(jobId: string): Promise<any> {
  updateJobProgress(jobId, 90);
  
  // Simular cálculo de stats del sistema
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const stats = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    timestamp: new Date(),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    connections: {
      database: true, // Mock - verificar conexión real
      redis: true,    // Mock - verificar conexión real
      solana: true    // Mock - verificar conexión real
    },
    health: {
      database: 'healthy',
      redis: 'healthy',
      solana: 'healthy',
      overall: 'healthy'
    }
  };
  
  console.log(`⚙️ System stats calculated: ${(stats.uptime / 3600).toFixed(2)}h uptime`);
  return stats;
}

/**
 * Cachear estadísticas globales
 */
async function cacheGlobalStats(stats: any): Promise<void> {
  try {
    await cacheService.set('global:stats', stats, {
      namespace: 'stats',
      ttl: 600, // 10 minutos
      tags: ['stats', 'global'],
      compress: true
    });
    
    console.log('📊 Global stats cached successfully');
  } catch (error) {
    console.error('❌ Failed to cache global stats:', error);
  }
}
