// frontend/src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  CACHE_TTL: 300000, // 5 minutos en ms
};

export const API_ENDPOINTS = {
  USERS: '/users',
  COMMUNITIES: '/communities',
  VOTES: '/votes',
  STATS: '/stats',
  SEARCH: '/search',
  WEBSOCKETS: '/websockets',
} as const;

// Headers comunes para todas las peticiones
export const getCommonHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Utilidad para construir URLs con parámetros
export const buildApiUrl = (endpoint: string, params?: Record<string, any>) => {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};