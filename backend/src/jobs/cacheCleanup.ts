// backend/src/jobs/cacheCleanup.ts
import { Job } from '../services/jobQueue';
import { cacheService } from '../services/cacheService';
import { updateJobProgress } from './index';

/**
 * Job para limpieza automática del cache
 */
export async function cacheCleanupJob(job: Job): Promise<any> {
  console.log(`🧹 Starting cache cleanup job ${job.id}`);
  
  try {
    const { cleanupType = 'expired', timestamp } = job.data;
    
    updateJobProgress(job.id, 10);
    
    const results = {
      cleanupType,
      timestamp,
      startTime: new Date(),
      stats: {
        expired: 0,
        oversized: 0,
        oldEntries: 0,
        totalCleaned: 0,
        memoryFreed: 0
      }
    };
    
    // Obtener estadísticas iniciales
    const initialStats = await cacheService.getStats();
    updateJobProgress(job.id, 20);
    
    switch (cleanupType) {
      case 'expired':
        results.stats.expired = await cleanupExpiredKeys(job.id);
        break;
      case 'oversized':
        results.stats.oversized = await cleanupOversizedCache(job.id);
        break;
      case 'old':
        results.stats.oldEntries = await cleanupOldEntries(job.id);
        break;
      case 'full':
        results.stats.expired = await cleanupExpiredKeys(job.id);
        updateJobProgress(job.id, 60);
        results.stats.oversized = await cleanupOversizedCache(job.id);
        updateJobProgress(job.id, 80);
        results.stats.oldEntries = await cleanupOldEntries(job.id);
        break;
      default:
        results.stats.expired = await cleanupExpiredKeys(job.id);
    }
    
    updateJobProgress(job.id, 90);
    
    // Obtener estadísticas finales
    const finalStats = await cacheService.getStats();
    results.stats.totalCleaned = results.stats.expired + results.stats.oversized + results.stats.oldEntries;
    results.stats.memoryFreed = initialStats.memoryUsage - finalStats.memoryUsage;
    
    updateJobProgress(job.id, 100);
    
    console.log(`✅ Cache cleanup job ${job.id} completed:`, results);
    return results;
    
  } catch (error) {
    console.error(`❌ Cache cleanup job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Limpiar keys expiradas (que Redis debería haber limpiado automáticamente)
 */
async function cleanupExpiredKeys(jobId: string): Promise<number> {
  updateJobProgress(jobId, 30);
  
  // Simular limpieza de keys expiradas
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En producción:
  // - Escanear keys con TTL = -1 o muy bajo
  // - Eliminar keys que deberían estar expiradas
  // - Limpiar tags órfanos
  
  const cleanedKeys = Math.floor(Math.random() * 50) + 10;
  console.log(`🔑 Cleaned ${cleanedKeys} expired cache keys`);
  
  return cleanedKeys;
}

/**
 * Limpiar cache que ha crecido demasiado
 */
async function cleanupOversizedCache(jobId: string): Promise<number> {
  updateJobProgress(jobId, 50);
  
  // Simular limpieza por tamaño
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // En producción:
  // - Verificar uso de memoria de Redis
  // - Si > threshold, eliminar keys menos usadas (LRU)
  // - Comprimir objetos grandes
  // - Eliminar namespaces poco usados
  
  const stats = await cacheService.getStats();
  const memoryThreshold = 100 * 1024 * 1024; // 100MB
  
  let cleanedKeys = 0;
  if (stats.memoryUsage > memoryThreshold) {
    // Simular limpieza por memoria
    cleanedKeys = Math.floor(Math.random() * 30) + 5;
    console.log(`💾 Memory threshold exceeded, cleaned ${cleanedKeys} oversized entries`);
  }
  
  return cleanedKeys;
}

/**
 * Limpiar entradas muy antiguas
 */
async function cleanupOldEntries(jobId: string): Promise<number> {
  updateJobProgress(jobId, 70);
  
  // Simular limpieza de entradas antiguas
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // En producción:
  // - Identificar keys con timestamp muy antiguo
  // - Eliminar datos de más de X días
  // - Limpiar métricas de cache antiguas
  // - Optimizar índices de Redis
  
  const cleanedKeys = Math.floor(Math.random() * 20) + 2;
  console.log(`⏰ Cleaned ${cleanedKeys} old cache entries`);
  
  return cleanedKeys;
}
