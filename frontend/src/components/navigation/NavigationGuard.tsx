'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavigationGuardProps {
  children: React.ReactNode;
}

/**
 * NavigationGuard Component
 * 
 * Intercepta la navegación y valida que las rutas existan antes de navegar.
 * Proporciona feedback al usuario sobre rutas inválidas.
 */
export default function NavigationGuard({ children }: NavigationGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isValidRoute, setIsValidRoute] = useState(true);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const isValid = validateRoute(pathname);
    setIsValidRoute(isValid);

    if (!isValid) {
      console.warn(`🚨 NavigationGuard: Ruta inválida detectada: ${pathname}`);
      
      // Opcional: Redirigir a página de error o dashboard
      setTimeout(() => {
        router.replace('/user');
      }, 3000);
    }
  }, [pathname, router]);

  // Enhanced Link component para interceptar clics
  const handleLinkClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href) {
      const url = new URL(link.href);
      const path = url.pathname;
      
      if (path.startsWith('/user') && !validateRoute(path)) {
        event.preventDefault();
        console.warn(`🚨 NavigationGuard: Intento de navegación a ruta inválida: ${path}`);
        
        // Mostrar notificación al usuario
        alert(`La página "${path}" no existe. Serás redirigido al dashboard.`);
        router.push('/user');
      }
    }
  };

  useEffect(() => {
    // Interceptar todos los clics en enlaces
    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  // Si la ruta es inválida, mostrar mensaje de error
  if (!isValidRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
          <p className="text-gray-600 mb-6">
            La página <code className="bg-gray-100 px-2 py-1 rounded">{pathname}</code> no existe.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Serás redirigido automáticamente al dashboard en unos segundos...
          </p>
          <button
            onClick={() => router.push('/user')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
