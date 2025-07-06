'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Explore Communities Alias Page
 * 
 * Esta página actúa como un alias/redirección hacia la página principal de comunidades.
 * Útil para URLs más semánticas y mejor SEO.
 * 
 * Redirige: /user/communities/explore → /user/communities
 */
export default function ExploreCommunitiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirección inmediata a la página principal de comunidades
    router.replace('/user/communities');
  }, [router]);

  // Loading state mientras se realiza la redirección
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to communities...</p>
      </div>
    </div>
  );
}
