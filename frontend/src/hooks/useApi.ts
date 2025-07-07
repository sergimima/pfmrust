// frontend/src/hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  meta?: ApiResponse<T>['meta'];
}

interface UseApiOptions {
  immediate?: boolean;
  params?: Record<string, string | number | boolean>;
}

// Hook genérico para hacer peticiones API
export function useApi<T>(
  endpoint: string, 
  options: UseApiOptions = { immediate: true }
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      
      // Añadir parámetros de query si existen
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (result.success) {
        setState({
          data: result.data,
          loading: false,
          error: null,
          meta: result.meta
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || result.message || 'Unknown error'
        }));
      }
    } catch (error) {
      console.error('API Error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Network error'
      }));
    }
  }, [endpoint, options.params]);

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  return {
    ...state,
    refetch: fetchData
  };
}

// Hook específico para usuarios
export function useUsers(params?: { page?: number; limit?: number; sortBy?: string; order?: string }) {
  return useApi<any[]>('/users', { params });
}

// Hook específico para un usuario por wallet
export function useUser(wallet: string) {
  return useApi<any>(`/users/${wallet}`, { 
    immediate: !!wallet 
  });
}

// Hook específico para comunidades
export function useCommunities(params?: { 
  page?: number; 
  limit?: number; 
  category?: string; 
  sortBy?: string; 
  order?: string;
  search?: string;
  isActive?: boolean;
}) {
  return useApi<any[]>('/communities', { params });
}

// Hook específico para una comunidad por ID
export function useCommunity(id: string | number) {
  return useApi<any>(`/communities/${id}`, { 
    immediate: !!id 
  });
}

// Hook específico para votaciones
export function useVotes(params?: {
  page?: number;
  limit?: number;
  status?: string;
  voteType?: string;
  communityId?: number;
  creator?: string;
  sortBy?: string;
  order?: string;
  search?: string;
}) {
  return useApi<any[]>('/votes', { params });
}

// Hook específico para una votación por ID
export function useVote(id: string | number) {
  return useApi<any>(`/votes/${id}`, { 
    immediate: !!id 
  });
}

// Hook para estadísticas
export function useStats() {
  return useApi<any>('/stats');
}

// Hook para búsqueda
export function useSearch(query: string, type?: 'all' | 'communities' | 'votes') {
  return useApi<any>('/search', { 
    params: { q: query, type: type || 'all' },
    immediate: !!query 
  });
}