import { Request, Response } from 'express';
import { ApiResponse } from '../types';

// Success response helper
export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

// Error response helper
export function errorResponse(
  res: Response,
  error: string,
  statusCode: number = 400
): Response {
  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

// Validation helpers
export function validateRequired(fields: Record<string, any>): string[] {
  const missingFields: string[] = [];
  
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      missingFields.push(key);
    }
  });
  
  return missingFields;
}

// Async handler wrapper
export function asyncHandler(
  fn: (req: Request, res: Response) => Promise<any>
) {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

// Pagination helpers
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPaginationParams(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API response helper with metadata
export function apiResponse<T>(
  data: T,
  message?: string,
  meta?: any,
  errorCode?: string
): any {
  if (errorCode) {
    return {
      success: false,
      error: message || 'An error occurred',
      errorCode,
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    success: true,
    data,
    message: message || 'Request successful',
    meta,
    timestamp: new Date().toISOString(),
  };
}

// Handle async middleware
export function handleAsync(
  fn: (req: Request, res: Response) => Promise<any>
) {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

// Validate pagination parameters
export function validatePagination(page: number, limit: number) {
  const validPage = Math.max(1, parseInt(page.toString()) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit.toString()) || 20));
  const skip = (validPage - 1) * validLimit;
  
  return {
    page: validPage,
    limit: validLimit,
    skip
  };
}
