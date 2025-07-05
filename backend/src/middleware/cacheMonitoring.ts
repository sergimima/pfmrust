// backend/src/middleware/cacheMonitoring.ts
import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';

interface CacheMetrics {
  endpoint: string;
  method: string;
  cacheStatus: 'HIT' | 'MISS' | 'DISABLED';
  responseTime: number;
  timestamp: Date;
  cacheKey?: string;
  namespace?: string;
  ttl?: number;
}

// In-memory metrics storage (en producción usar Redis o DB)
const cacheMetrics: CacheMetrics[] = [];
const MAX_METRICS = 1000; // Limitar memoria

/**
 * Middleware para monitorear performance del cache
 */
export function cachePerformanceMonitoring() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const endpoint = req.path;
    const method = req.method;
    
    // Interceptar headers de cache
    const originalSetHeader = res.setHeader;
    let cacheStatus: 'HIT' | 'MISS' | 'DISABLED' = 'DISABLED';
    let cacheKey: string | undefined;
    
    res.setHeader = function(name: string, value: any) {
      if (name === 'X-Cache') {
        cacheStatus = value as 'HIT' | 'MISS';
      }
      if (name === 'X-Cache-Key') {
        cacheKey = value as string;
      }
      return originalSetHeader.call(this, name, value);
    };
    
    // Al finalizar respuesta, registrar métricas
    res.on('finish', async () => {
      try {
        const responseTime = Date.now() - startTime;
        
        const metric: CacheMetrics = {
          endpoint,
          method,
          cacheStatus,
          responseTime,
          timestamp: new Date(),
          cacheKey
        };
        
        // Añadir a métricas en memoria
        cacheMetrics.push(metric);
        
        // Mantener solo las últimas MAX_METRICS métricas
        if (cacheMetrics.length > MAX_METRICS) {
          cacheMetrics.splice(0, cacheMetrics.length - MAX_METRICS);
        }
        
        // Log para endpoints lentos o con muchos MISS
        if (responseTime > 1000 || (cacheStatus === 'MISS' && responseTime > 500)) {
          console.log(`⚠️ Slow response: ${method} ${endpoint} - ${responseTime}ms (Cache: ${cacheStatus})`);
        }
        
      } catch (error) {
        console.error('❌ Error recording cache metrics:', error);
      }
    });

    next();
  };
}

/**
 * Obtener métricas de performance del cache
 */
export function getCacheMetrics(filters?: {
  endpoint?: string;
  method?: string;
  cacheStatus?: 'HIT' | 'MISS' | 'DISABLED';
  timeRange?: { start: Date; end: Date };
  limit?: number;
}) {
  let filtered = [...cacheMetrics];
  
  if (filters?.endpoint) {
    filtered = filtered.filter(m => m.endpoint.includes(filters.endpoint!));
  }
  
  if (filters?.method) {
    filtered = filtered.filter(m => m.method === filters.method);
  }
  
  if (filters?.cacheStatus) {
    filtered = filtered.filter(m => m.cacheStatus === filters.cacheStatus);
  }
  
  if (filters?.timeRange) {
    filtered = filtered.filter(m => 
      m.timestamp >= filters.timeRange!.start && 
      m.timestamp <= filters.timeRange!.end
    );
  }
  
  // Ordenar por timestamp descendente
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  return filtered;
}

/**
 * Obtener estadísticas agregadas de cache
 */
export function getCacheAnalytics(timeRange?: { start: Date; end: Date }) {
  let metrics = cacheMetrics;
  
  if (timeRange) {
    metrics = metrics.filter(m => 
      m.timestamp >= timeRange.start && 
      m.timestamp <= timeRange.end
    );
  }
  
  const totalRequests = metrics.length;
  const hits = metrics.filter(m => m.cacheStatus === 'HIT').length;
  const misses = metrics.filter(m => m.cacheStatus === 'MISS').length;
  const disabled = metrics.filter(m => m.cacheStatus === 'DISABLED').length;
  
  const hitRate = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;
  
  // Performance por endpoint
  const endpointStats = metrics.reduce((acc, metric) => {
    const key = `${metric.method} ${metric.endpoint}`;
    if (!acc[key]) {
      acc[key] = {
        count: 0,
        totalTime: 0,
        hits: 0,
        misses: 0,
        avgResponseTime: 0,
        hitRate: 0
      };
    }
    
    acc[key].count++;
    acc[key].totalTime += metric.responseTime;
    if (metric.cacheStatus === 'HIT') acc[key].hits++;
    if (metric.cacheStatus === 'MISS') acc[key].misses++;
    
    acc[key].avgResponseTime = acc[key].totalTime / acc[key].count;
    acc[key].hitRate = acc[key].count > 0 ? (acc[key].hits / acc[key].count) * 100 : 0;
    
    return acc;
  }, {} as Record<string, any>);
  
  // Top endpoints más lentos
  const slowestEndpoints = Object.entries(endpointStats)
    .sort(([,a], [,b]) => b.avgResponseTime - a.avgResponseTime)
    .slice(0, 10)
    .map(([endpoint, stats]) => ({ endpoint, ...stats }));
  
  // Top endpoints con peor hit rate
  const worstHitRates = Object.entries(endpointStats)
    .filter(([,stats]) => stats.count >= 5) // Solo endpoints con suficientes requests
    .sort(([,a], [,b]) => a.hitRate - b.hitRate)
    .slice(0, 10)
    .map(([endpoint, stats]) => ({ endpoint, ...stats }));
  
  const avgResponseTime = totalRequests > 0 
    ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests 
    : 0;
  
  return {
    summary: {
      totalRequests,
      hits,
      misses,
      disabled,
      hitRate: Math.round(hitRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100
    },
    endpointStats,
    slowestEndpoints,
    worstHitRates,
    timeRange: timeRange || { start: new Date(0), end: new Date() }
  };
}

/**
 * Middleware para endpoints de métricas de cache
 */
export function cacheMetricsEndpoints() {
  return {
    // GET /cache/metrics
    getMetrics: async (req: Request, res: Response) => {
      try {
        const { endpoint, method, status, limit = 100, hours = 24 } = req.query;
        
        const timeRange = {
          start: new Date(Date.now() - Number(hours) * 60 * 60 * 1000),
          end: new Date()
        };
        
        const metrics = getCacheMetrics({
          endpoint: endpoint as string,
          method: method as string,
          cacheStatus: status as 'HIT' | 'MISS' | 'DISABLED',
          timeRange,
          limit: Number(limit)
        });
        
        res.json({
          success: true,
          data: metrics,
          meta: {
            total: metrics.length,
            filters: { endpoint, method, status, hours },
            timeRange
          }
        });
      } catch (error) {
        console.error('Error getting cache metrics:', error);
        res.status(500).json({ success: false, error: 'Failed to get cache metrics' });
      }
    },
    
    // GET /cache/analytics
    getAnalytics: async (req: Request, res: Response) => {
      try {
        const { hours = 24 } = req.query;
        
        const timeRange = {
          start: new Date(Date.now() - Number(hours) * 60 * 60 * 1000),
          end: new Date()
        };
        
        const analytics = getCacheAnalytics(timeRange);
        
        res.json({
          success: true,
          data: analytics,
          message: 'Cache analytics retrieved successfully'
        });
      } catch (error) {
        console.error('Error getting cache analytics:', error);
        res.status(500).json({ success: false, error: 'Failed to get cache analytics' });
      }
    },
    
    // POST /cache/metrics/reset
    resetMetrics: async (req: Request, res: Response) => {
      try {
        const currentLength = cacheMetrics.length;
        cacheMetrics.length = 0; // Clear array
        
        res.json({
          success: true,
          message: `Cache metrics reset successfully. Cleared ${currentLength} entries.`
        });
      } catch (error) {
        console.error('Error resetting cache metrics:', error);
        res.status(500).json({ success: false, error: 'Failed to reset cache metrics' });
      }
    }
  };
}

/**
 * Alertas automáticas para problemas de cache
 */
export function cacheAlerting() {
  const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
  const ALERT_THRESHOLDS = {
    lowHitRate: 30, // % hit rate mínimo
    highResponseTime: 2000, // ms tiempo respuesta máximo
    minRequests: 10 // mínimo requests para evaluar
  };
  
  setInterval(() => {
    try {
      const last5Minutes = {
        start: new Date(Date.now() - 5 * 60 * 1000),
        end: new Date()
      };
      
      const analytics = getCacheAnalytics(last5Minutes);
      
      // Alert: Hit rate bajo
      if (analytics.summary.totalRequests >= ALERT_THRESHOLDS.minRequests &&
          analytics.summary.hitRate < ALERT_THRESHOLDS.lowHitRate) {
        console.warn(`🚨 CACHE ALERT: Low hit rate ${analytics.summary.hitRate}% (last 5min)`);
      }
      
      // Alert: Tiempo de respuesta alto
      if (analytics.summary.avgResponseTime > ALERT_THRESHOLDS.highResponseTime) {
        console.warn(`🚨 CACHE ALERT: High response time ${analytics.summary.avgResponseTime}ms (last 5min)`);
      }
      
      // Alert: Endpoints problemáticos
      analytics.worstHitRates.slice(0, 3).forEach(endpoint => {
        if (endpoint.count >= ALERT_THRESHOLDS.minRequests && 
            endpoint.hitRate < ALERT_THRESHOLDS.lowHitRate) {
          console.warn(`🚨 ENDPOINT ALERT: ${endpoint.endpoint} hit rate ${endpoint.hitRate}%`);
        }
      });
      
    } catch (error) {
      console.error('❌ Error in cache alerting:', error);
    }
  }, CHECK_INTERVAL);
  
  console.log('🔔 Cache alerting system started');
}

/**
 * Recomendaciones automáticas para optimización de cache
 */
export function getCacheRecommendations() {
  const analytics = getCacheAnalytics({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date()
  });
  
  const recommendations: string[] = [];
  
  // Recomendación: Hit rate general bajo
  if (analytics.summary.hitRate < 50) {
    recommendations.push(`Increase cache TTL or improve cache key strategy. Current hit rate: ${analytics.summary.hitRate}%`);
  }
  
  // Recomendación: Endpoints específicos
  analytics.worstHitRates.slice(0, 5).forEach(endpoint => {
    if (endpoint.hitRate < 30 && endpoint.count >= 10) {
      recommendations.push(`Optimize caching for ${endpoint.endpoint} (${endpoint.hitRate}% hit rate)`);
    }
  });
  
  // Recomendación: Performance
  analytics.slowestEndpoints.slice(0, 3).forEach(endpoint => {
    if (endpoint.avgResponseTime > 1000) {
      recommendations.push(`Improve performance for ${endpoint.endpoint} (${Math.round(endpoint.avgResponseTime)}ms avg)`);
    }
  });
  
  // Recomendación: Cache warming
  if (analytics.summary.misses > analytics.summary.hits) {
    recommendations.push('Consider implementing cache warming strategies for frequently accessed data');
  }
  
  return {
    recommendations,
    analytics: analytics.summary,
    generatedAt: new Date()
  };
}
