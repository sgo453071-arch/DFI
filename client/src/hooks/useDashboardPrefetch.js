import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getVolunteerDashboard, getVolunteerRank } from '../services/analyticsService';
import { getMyPrograms } from '../services/programsService';
import { getAttendanceDashboard } from '../services/attendanceService';
import { getMarketplaceCatalog, getFeaturedRewards } from '../services/marketplaceService';
import { getMyCertificates, getMyContributions } from '../services/volunteerImpactService';
import { getConversations } from '../services/conversationsService';

export const useDashboardPrefetch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only prefetch if user is a VOLUNTEER
    if (!user || (user.role && user.role.toUpperCase() !== 'VOLUNTEER')) {
      return;
    }

    const prefetchData = async () => {
      // Core Dashboard Data
      queryClient.prefetchQuery({
        queryKey: ['volunteer-dashboard'],
        queryFn: async () => {
          const res = await getVolunteerDashboard();
          if (res.success) return res.data?.volunteer || null;
          throw new Error(res.message || 'Failed to load dashboard');
        },
        staleTime: 5 * 60 * 1000,
      });

      // Rank
      queryClient.prefetchQuery({
        queryKey: ['volunteer-rank'],
        queryFn: async () => {
          const res = await getVolunteerRank();
          if (res.success) return res.data?.rank || 0;
          return 0;
        },
        staleTime: 5 * 60 * 1000,
      });

      // Programs
      queryClient.prefetchQuery({
        queryKey: ['my-programs'],
        queryFn: async () => {
          const res = await getMyPrograms();
          if (res.success) return res.data?.programs || res.programs || [];
          return [];
        },
        staleTime: 5 * 60 * 1000,
      });

      // Attendance
      queryClient.prefetchQuery({
        queryKey: ['attendance-dashboard'],
        queryFn: async () => {
          const res = await getAttendanceDashboard();
          if (res.success) return res.data || null;
          return null;
        },
        staleTime: 5 * 60 * 1000,
      });

      // Marketplace Catalog
      queryClient.prefetchQuery({
        queryKey: ['marketplace-catalog', 'All', '', 'newest', false, 'all'],
        queryFn: async () => {
          return getMarketplaceCatalog({ page: 1, limit: 24, sort: 'newest' });
        },
        staleTime: 5 * 60 * 1000,
      });

      // Featured Rewards
      queryClient.prefetchQuery({
        queryKey: ['featured-rewards'],
        queryFn: () => getFeaturedRewards(6),
        staleTime: 5 * 60 * 1000,
      });

      // Certificates
      queryClient.prefetchQuery({
        queryKey: ['my-certificates'],
        queryFn: async () => {
          return getMyCertificates({ page: 1, limit: 20 });
        },
        staleTime: 5 * 60 * 1000,
      });

      // Contributions
      queryClient.prefetchQuery({
        queryKey: ['my-contributions'],
        queryFn: async () => {
          return getMyContributions({ limit: 20 });
        },
        staleTime: 5 * 60 * 1000,
      });

      // Conversations
      queryClient.prefetchQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
          const res = await getConversations({ limit: 20 });
          return res.conversations || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    };

    // Use requestIdleCallback or setTimeout to not block the main thread
    const timer = setTimeout(() => {
      prefetchData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, queryClient]);
};
