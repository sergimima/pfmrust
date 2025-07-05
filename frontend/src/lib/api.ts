import axios from 'axios';
import type { ApiResponse } from '@/types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const apiClient = {
  // Health check
  health: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },

  // Users
  getUsers: async (params?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Communities
  getCommunities: async (params?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/communities', { params });
    return response.data;
  },

  getCommunity: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/communities/${id}`);
    return response.data;
  },

  // Votes
  getVotes: async (params?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/votes', { params });
    return response.data;
  },

  getVote: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/votes/${id}`);
    return response.data;
  },

  // Stats
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  getUserStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/stats/users');
    return response.data;
  },

  getCommunityStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/stats/communities');
    return response.data;
  },

  // Search
  search: async (query: string, type = 'all'): Promise<ApiResponse<any>> => {
    const response = await api.get('/search', { 
      params: { q: query, type } 
    });
    return response.data;
  },

  // Cache
  getCacheStats: async (): Promise<any> => {
    const response = await api.get('/cache/stats', {
      baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'
    });
    return response.data;
  },
};

export default api;
