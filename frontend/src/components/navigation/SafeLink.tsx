'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent } from 'react';

interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  fallbackRoute?: string;
  showError?: boolean;
}

/**
 * SafeLink Component
 * 
 * Un wrapper alrededor del componente Link de Next.js que valida
 * que las rutas existan antes de navegar.
 */
export default function SafeLink({ 
  href, 
  children, 
  className, 
  fallbackRoute = '/user',
  showError = true 
}: SafeLinkProps) {
  const router = useRouter();

  // Rutas válidas conocidas en la aplicación
  const validRoutes = [
    '/user',
    '/user/profile',
    '/user/communities',
    '/user/communities/create',
    '/user/communities/explore',
    '/user/voting',
    '/user/voting/create',
    '/admin'
  ];

  // Patrones de rutas dinámicas válidas
  const dynamicRoutePatterns = [
    /^\/user\/communities\/\d+$/,  // /user/communities/[id]
    /^\/user\/voting\/\d+$/,       // /user/voting/[id]
  ];

  const validateRoute = (path: string): boolean => {
    // Verificar rutas estáticas
    if (validRoutes.includes(path)) {
      return true;
    }

    // Verificar rutas dinámicas
    return dynamicRoutePatterns.some(pattern => pattern.test(path));
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!validateRoute(href)) {
      event.preventDefault();
      
      console.warn(`🚨 SafeLink: Ruta inválida bloqueada: ${href}`);
      
      if (showError) {
        alert(`La página "${href}" no está disponible. Serás redirigido a ${fallbackRoute}.`);
      }
      
      router.push(fallbackRoute);
    }
  };

  // Si la ruta es válida, usar Link normal
  if (validateRoute(href)) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  // Si la ruta es inválida, crear un enlace que redirige al fallback
  return (
    <button
      onClick={() => {
        if (showError) {
          alert(`La página "${href}" no está disponible. Serás redirigido a ${fallbackRoute}.`);
        }
        router.push(fallbackRoute);
      }}
      className={className}
    >
      {children}
    </button>
  );
}

/**
 * Hook para validar rutas
 */
export function useRouteValidation() {
  const validRoutes = [
    '/user',
    '/user/profile',
    '/user/communities',
    '/user/communities/create',
    '/user/communities/explore',
    '/user/voting',
    '/user/voting/create',
    '/admin'
  ];

  const dynamicRoutePatterns = [
    /^\/user\/communities\/\d+$/,
    /^\/user\/voting\/\d+$/,
  ];

  const validateRoute = (path: string): boolean => {
    if (validRoutes.includes(path)) {
      return true;
    }
    return dynamicRoutePatterns.some(pattern => pattern.test(path));
  };

  const getValidRoutes = () => validRoutes;
  
  const getDynamicRoutePatterns = () => dynamicRoutePatterns;

  return {
    validateRoute,
    getValidRoutes,
    getDynamicRoutePatterns
  };
}

/**
 * Función utilitaria para generar rutas dinámicas seguras
 */
export const generateSafeRoute = {
  communityDetail: (id: string | number) => `/user/communities/${id}`,
  votingDetail: (id: string | number) => `/user/voting/${id}`,
  userProfile: () => '/user/profile',
  userDashboard: () => '/user',
  createCommunity: () => '/user/communities/create',
  createVoting: () => '/user/voting/create',
  exploreCommunities: () => '/user/communities/explore',
  allVotings: () => '/user/voting',
  allCommunities: () => '/user/communities'
};
