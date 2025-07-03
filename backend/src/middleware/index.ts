import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/helpers';

// Global error handler
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle different error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.status) {
    statusCode = error.status;
    message = error.message;
  }

  return errorResponse(res, message, statusCode);
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    console.log(`${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
  });
  
  next();
}

// Rate limiting (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [id, data] of requestCounts.entries()) {
      if (data.resetTime < windowStart) {
        requestCounts.delete(id);
      }
    }
    
    // Check current client
    const clientData = requestCounts.get(clientId);
    
    if (!clientData) {
      requestCounts.set(clientId, { count: 1, resetTime: now });
      next();
    } else if (clientData.count < maxRequests) {
      clientData.count++;
      next();
    } else {
      return errorResponse(res, 'Too many requests', 429);
    }
  };
}
