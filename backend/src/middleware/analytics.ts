// backend/src/middleware/analytics.ts
import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsRequest extends Request {
  analytics?: {
    startTime: number;
    endpoint: string;
    method: string;
    userAgent?: string;
    ip?: string;
  };
}

/**
 * Middleware para tracking automático de analytics
 */
export function analyticsTracking(req: AnalyticsRequest, res: Response, next: NextFunction) {
  // Iniciar tracking
  req.analytics = {
    startTime: Date.now(),
    endpoint: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  };

  // Hook en la respuesta para capturar métricas
  const originalSend = res.send;
  res.send = function(data: any) {
    if (req.analytics) {
      const responseTime = Date.now() - req.analytics.startTime;
      
      // Enviar métricas de forma asíncrona (no bloquear respuesta)
      setImmediate(() => {
        recordAnalytics(req.analytics!, res.statusCode, responseTime, data);
      });
    }
    
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Registrar métricas de analytics
 */
async function recordAnalytics(
  analytics: NonNullable<AnalyticsRequest['analytics']>, 
  statusCode: number, 
  responseTime: number, 
  responseData: any
) {
  try {
    const metrics = {
      timestamp: new Date(),
      endpoint: analytics.endpoint,
      method: analytics.method,
      statusCode,
      responseTime,
      userAgent: analytics.userAgent,
      ip: analytics.ip,
      success: statusCode >= 200 && statusCode < 400
    };

    // Almacenar métricas en Redis para análisis
    await analyticsService.recordEndpointMetrics(metrics);
    
    // Actualizar contadores en tiempo real
    await analyticsService.updateRealTimeMetrics(analytics.endpoint, statusCode);

  } catch (error) {
    console.error('Error recording analytics:', error);
    // No propagamos el error para no afectar la respuesta del usuario
  }
}

/**
 * Middleware para tracking de eventos específicos
 */
export function trackEvent(eventType: string, eventData?: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Registrar evento específico
      await analyticsService.recordEvent({
        type: eventType,
        timestamp: new Date(),
        data: eventData || req.body,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
    
    next();
  };
}

/**
 * Middleware para análisis de performance de endpoints críticos
 */
export function performanceAnalytics(thresholdMs: number = 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', async () => {
      const responseTime = Date.now() - startTime;
      
      if (responseTime > thresholdMs) {
        try {
          await analyticsService.recordSlowEndpoint({
            endpoint: req.path,
            method: req.method,
            responseTime,
            timestamp: new Date(),
            statusCode: res.statusCode,
            threshold: thresholdMs
          });
        } catch (error) {
          console.error('Error recording slow endpoint:', error);
        }
      }
    });
    
    next();
  };
}

/**
 * Middleware para analytics de usuarios
 */
export function userAnalytics(req: Request, res: Response, next: NextFunction) {
  // Extraer información del usuario si está disponible
  const userId = req.headers['x-user-id'] as string || 
                 req.query.userId as string || 
                 req.body?.userId;
  
  if (userId) {
    // Registrar actividad del usuario de forma asíncrona
    setImmediate(async () => {
      try {
        await analyticsService.recordUserActivity({
          userId,
          action: `${req.method} ${req.path}`,
          timestamp: new Date(),
          metadata: {
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
          }
        });
      } catch (error) {
        console.error('Error recording user activity:', error);
      }
    });
  }
  
  next();
}
