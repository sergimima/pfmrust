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

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
