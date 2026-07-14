import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useRoutePrefetch = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Only prefetch if user is logged in
    if (!user) return;

    const prefetchRoutes = () => {
      // Eagerly trigger Webpack/Vite to download the JavaScript chunks for these routes.
      // We don't await or do anything with the result; simply invoking import() populates the browser cache.
      try {
        if (user.role && user.role.toUpperCase() === 'VOLUNTEER') {
          import('../pages/marketplace/Marketplace');
          import('../pages/Programs');
          import('../pages/certificates/Certificates');
          import('../pages/messages/Messages');
          import('../pages/contributions/MyContributions');
          import('../pages/profile/MyProfile');
        }
      } catch (error) {
        // Ignore prefetch errors (e.g. network drops during background fetch)
        console.warn('Route prefetch failed:', error);
      }
    };

    // Use requestIdleCallback to ensure this doesn't block the main thread during initial render
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => prefetchRoutes(), { timeout: 2000 });
    } else {
      setTimeout(prefetchRoutes, 1500);
    }
  }, [user]);
};
