import React, { useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, Clock, Activity, TrendingUp, Target } from 'lucide-react';
import { getAdminDashboard, getLeaderboard } from '../../services/analyticsService';
import { getNotifications } from '../../services/notificationsService';
import { getAllPrograms } from '../../services/programsService';
import DashboardSkeleton from '../../components/DashboardSkeleton';
import LeaderboardWidget from '../../components/LeaderboardWidget';
import NotificationWidget from '../../components/NotificationWidget';
import RecentAnnouncementsWidget from '../../components/announcements/RecentAnnouncementsWidget';

import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { on } = useSocket();

  // ── Socket subscriptions ─────────────────────────────────────────────────
  // Any program lifecycle event triggers an immediate refetch of all dashboard
  // queries so stat cards never show stale counts.
  useEffect(() => {
    const invalidateDashboard = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-programs-summary'] });
    };

    const unsubCreated = on('program-created', invalidateDashboard);
    const unsubPublished = on('program-published', invalidateDashboard);
    const unsubUpdated = on('program-updated', invalidateDashboard);
    const unsubDeleted = on('program-deleted', invalidateDashboard);
    const unsubArchived = on('program-archived', invalidateDashboard);
    const unsubStatus = on('program-status-updated', invalidateDashboard);

    return () => {
      unsubCreated();
      unsubPublished();
      unsubUpdated();
      unsubDeleted();
      unsubArchived();
      unsubStatus();
    };
  }, [on, queryClient]);

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await getAdminDashboard();
      if (res?.success) return res.data?.admin;
      throw new Error(res?.message || 'Failed to load dashboard');
    },
    staleTime: 60 * 1000,        // 1 min — was 5 min
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,  // refetch when admin returns to tab
    enabled: !!user,
  });

  const { data: programsData } = useQuery({
    queryKey: ['admin-programs-summary'],
    queryFn: async () => {
      const res = await getAllPrograms({ limit: 100 });
      return res?.programs || [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!user,
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['admin-leaderboard', { limit: 5 }],
    queryFn: async () => {
      const res = await getLeaderboard({ limit: 5 });
      if (res?.success) return res.data?.leaderboardAnalytics?.topVolunteers || [];
      return [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const res = await getNotifications({ limit: 5 });
      if (res?.success) return res.data?.notifications || [];
      return [];
    },
    staleTime: 30 * 1000,        // 30 s — was 2 min
    refetchInterval: 60 * 1000,  // poll every 60 s for new admin notifications
    refetchOnWindowFocus: true,
    enabled: !!user,
  });

  const stats = useMemo(() => {
    if (!dashboardData) return null;
    // Use backend-aggregated counts as primary source of truth; fall back to
    // client-side list counts only when the analytics endpoint hasn't loaded yet.
    const clientActive = (programsData || []).filter(
      (p) => ['published', 'ongoing', 'registration_closed'].includes(p.status)
    ).length;
    return {
      totalVolunteers: dashboardData?.users?.totalVolunteers || 0,
      activeVolunteers: dashboardData?.users?.activeVolunteers || 0,
      // Prefer backend program stats; fall back to client list
      totalPrograms: dashboardData?.programs?.totalPrograms || (programsData || []).length,
      activePrograms: dashboardData?.programs?.activePrograms ?? clientActive,
      draftPrograms: dashboardData?.programs?.draftPrograms || 0,
      completedPrograms: dashboardData?.programs?.completedPrograms || 0,
      totalHours: dashboardData?.attendance?.totalAttendance || 0,
      newThisMonth: dashboardData?.users?.newVolunteersThisMonth || 0,
      pendingApps: dashboardData?.applications?.pending || 0,
      certificates: dashboardData?.certificates?.generated || 0,
      coinsDistributed: dashboardData?.rewards?.coinsDistributed || 0,
      organizations: dashboardData?.organizations?.totalOrganizations || 0,
    };
  }, [dashboardData, programsData]);

  if (dashboardLoading) {
    return <div className="page-container" style={{ padding: '2rem' }}><DashboardSkeleton type="dashboard" /></div>;
  }

  if (dashboardError) {
    return <div className="page-container" style={{ padding: '2rem', color: '#dc2626' }}>{dashboardError.message}</div>;
  }

  const StatCard = ({ Icon, value, label, color = 'var(--color-primary)' }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '0.75rem', backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color, borderRadius: '50%' }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-heading)' }}>{value}</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', margin: '0 0 0.5rem 0', color: '#1f2937' }}>Admin Dashboard</h1>
        <p style={{ color: '#4b5563', margin: 0 }}>Platform overview and volunteer engagement analytics.</p>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
        <StatCard Icon={Users} value={stats?.totalVolunteers || 0} label="Total Volunteers" color="var(--color-primary)" />
        <StatCard Icon={Calendar} value={stats?.activePrograms || 0} label="Active Programs" color="var(--color-success)" />
        <StatCard Icon={Clock} value={stats?.totalHours || 0} label="Hours Volunteered" color="var(--color-warning)" />
        <StatCard Icon={TrendingUp} value={stats?.newThisMonth || 0} label="Signups This Month" color="var(--color-primary)" />
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
        <StatCard Icon={Calendar} value={stats?.totalPrograms || 0} label="Total Programs" color="var(--color-primary)" />
        <StatCard Icon={Calendar} value={stats?.draftPrograms || 0} label="Draft Programs" color="var(--color-warning)" />
        <StatCard Icon={Calendar} value={stats?.completedPrograms || 0} label="Completed Programs" color="var(--color-primary)" />
        <StatCard Icon={TrendingUp} value={stats?.pendingApps || 0} label="Pending Applications" color="var(--color-error)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--color-primary)' }} /> Platform Health
            </h3>
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: '#059669', fontWeight: 600, marginBottom: '0.5rem' }}>System is running smoothly. All services operational.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: 'var(--text-sm)' }}>
                <div><strong style={{ color: '#059669' }}>●</strong> Database: Connected</div>
                <div><strong style={{ color: '#059669' }}>●</strong> API: Online</div>
                <div><strong style={{ color: '#059669' }}>●</strong> Cache: Active</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} style={{ color: 'var(--color-primary)' }} /> Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/admin/programs'}>
                Manage Programs
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/admin/applications'}>
                Review Applications
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/admin/attendance'}>
                Mark Attendance
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = '/admin/insights'}>
                Insights & Trends
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <LeaderboardWidget
            topVolunteers={leaderboardData}
            loading={leaderboardLoading}
          />

          <NotificationWidget
            notifications={notificationsData}
            loading={notificationsLoading}
          />

          <RecentAnnouncementsWidget limit={4} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
