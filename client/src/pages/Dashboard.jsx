/**
 * Dashboard.jsx  –  Volunteer Personal Homepage
 *
 * Eight sections, all conditionally rendered:
 *  1. Welcome & Progress  (hero)
 *  2. My Progress         (4 stat cards)
 *  3. Continue Journey    (single smart CTA)
 *  4. My Impact           (impact metrics grid)
 *  5. Recommended Opps    (hidden when empty)
 *  6. Upcoming Events     (hidden when empty)
 *  7. Updates             (unified feed)
 *  8. Quick Actions       (shortcut grid)
 */

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Clock, Briefcase, Award, FileText,
  TrendingUp, ChevronRight, ArrowUpRight, RotateCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { getVolunteerDashboard, getMyRank } from '../services/analyticsService';
import { getMyPrograms } from '../services/programsService';
import { getMyContributions } from '../services/volunteerImpactService';
import { getAttendanceDashboard } from '../services/attendanceService';
import { getProgramRecommendations } from '../services/matchingService';
const DashboardMyImpact = React.lazy(() => import('../components/dashboard/DashboardMyImpact'));
const DashboardContinueJourney = React.lazy(() => import('../components/dashboard/DashboardContinueJourney'));
const DashboardQuickActions = React.lazy(() => import('../components/dashboard/DashboardQuickActions'));
const RecommendationsWidget = React.lazy(() => import('../components/dashboard/RecommendationsWidget'));
import DashboardSkeleton from '../components/DashboardSkeleton';

// Lightweight fallback for lazy components
const WidgetFallback = () => (
  <div style={{ height: 200, background: '#e5e7eb', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
);

/* ─── greeting helper ─────────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/* ─── leaderboard standing helper ────────────────────────────────────────── */

/**
 * Given the volunteer's rank and the total leaderboard entries,
 * returns a motivational string like "You're ahead of 74% of volunteers".
 * Returns null when data is unavailable.
 */
function standingMessage(rank, totalOnLeaderboard) {
  if (!rank || !totalOnLeaderboard || totalOnLeaderboard < 2) return null;
  const pct = Math.round(((totalOnLeaderboard - rank) / totalOnLeaderboard) * 100);
  if (pct <= 0) return null;
  return `You're ahead of ${pct}% of volunteers this month.`;
}

/* ─── section wrapper ─────────────────────────────────────────────────────── */

const Section = ({ children, style }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    style={style}
  >
    {children}
  </motion.div>
);

/* ─── stat card ───────────────────────────────────────────────────────────── */

const StatCard = ({ label, value, icon, color, bg, note, onClick, loading }) => (
  <div
    className="dashboard-stat-card"
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    style={{
      background: 'white',
      borderRadius: 12,
      padding: '0.875rem 1rem',
      border: '1px solid #F0EDE8',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.22s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
      e.currentTarget.style.transform = 'none';
    }}
  >
    <div className="stat-card-icon-wrapper" style={{
      width: 40, height: 40, borderRadius: 10,
      background: bg, color, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--color-body)', marginBottom: '0.2rem' }}>
        {label}
      </div>
      <div style={{ color: 'var(--color-heading)', marginBottom: '0.15rem' }}>
        {loading ? (
          <div style={{
            height: 20, width: '60%', background: 'rgba(0,0,0,0.06)',
            borderRadius: 4, animation: 'pulse 1.5s infinite'
          }} />
        ) : (
          value
        )}
      </div>
      <div style={{ color }}>{note}</div>
    </div>
  </div>
);

/* ─── upcoming events section ─────────────────────────────────────────────── */

const UpcomingEvents = ({ programs }) => {
  const upcoming = (programs || []).filter(
    (p) => p.status === 'upcoming' || p.status === 'scheduled'
  ).slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <Section>
      <div style={{ marginBottom: '0.875rem' }}>
        <h2 style={{ color: 'var(--color-heading)', margin: 0 }}>
          Upcoming Events
        </h2>
        <p style={{ color: 'var(--color-body)', margin: '0.2rem 0 0 0' }}>
          Your next scheduled program sessions.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {upcoming.map((prog) => (
          <div
            key={prog._id || prog.id}
            className="dashboard-card"
            style={{
              background: 'white', borderRadius: 12, padding: '1rem 1.25rem',
              border: '1px solid #FDE68A', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
              <h4 style={{
                color: 'var(--color-heading)', margin: '0 0 0.25rem 0',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {prog.title || prog.programTitle}
              </h4>
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: 999,
                background: '#FEF3C7', color: '#D97706'
              }}>
                Upcoming
              </span>
            </div>
            <Link
              to="/my-programs"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)',
                textDecoration: 'none'
              }}
            >
              Details <ArrowUpRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ─── main component ──────────────────────────────────────────────────────── */

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!loading && user) {
      const adminRoles = ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'COORDINATOR'];
      if (adminRoles.includes(user?.role?.toUpperCase())) {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshDashboard = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setLastUpdated(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dashboard updated!');
    }, 400);
  };

  /* ── data fetching ────────────────────────────────────────────────────── */

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['volunteer-dashboard'],
    queryFn: async () => {
      const res = await getVolunteerDashboard();
      if (res.success) return res.data?.volunteer || null;
      throw new Error(res.message || 'Failed to load dashboard');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const { data: rankResponse, isLoading: rankLoading } = useQuery({
    queryKey: ['my-rank'],
    queryFn: async () => {
      const res = await getMyRank();
      if (res.success) return res.data || null;
      return null;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: !!user,
  });

  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ['my-programs'],
    queryFn: async () => {
      const res = await getMyPrograms();
      if (res.success) return res.data?.programs || res.programs || [];
      return [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: !!user,
  });

  const { data: contributionsData, isLoading: contribLoading } = useQuery({
    queryKey: ['my-contributions-dashboard'],
    queryFn: async () => {
      const items = await getMyContributions({ limit: 20 });
      return Array.isArray(items) ? items : [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: !!user,
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-dashboard'],
    queryFn: async () => {
      const res = await getAttendanceDashboard();
      if (res.success) return res.data || null;
      return null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: !!user,
  });

  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations-dashboard'],
    queryFn: async () => {
      const res = await getProgramRecommendations({ page: '1', limit: '3' });
      if (res.success) return res.data?.recommendations || [];
      return [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const rankData = rankResponse?.rank || null;
  const totalLeaderboard = rankResponse?.totalVolunteers || 0;
  const gamificationData = {
    points: dashboardData?.points || 0,
    level: dashboardData?.volunteerLevel || 'Beginner',
    xpToNext: null,
    badges: new Array(dashboardData?.badgesCount || 0), // Mock array just for length
    coins: dashboardData?.currentCoins || 0,
  };

  /* ── derived values ───────────────────────────────────────────────────── */

  const displayName = user?.name || 'Volunteer';
  const firstName = displayName.split(' ')[0];
  const profileCompletion = user?.profileCompletion ?? null;
  const points = gamificationData?.points || 0;
  const level = gamificationData?.level || 'Beginner';
  const xpToNext = gamificationData?.xpToNext ?? null;
  const badgesCount = (gamificationData?.badges || []).length;

  const stats = useMemo(() => {
    if (!dashboardData) return null;
    return {
      totalHours: dashboardData.totalHours ?? 0,
      programsJoined: dashboardData.totalProgramsJoined ?? 0,
      activePrograms: dashboardData.activePrograms ?? 0,
      certificates: dashboardData.certificatesEarned ?? 0,
      totalContributions: dashboardData.totalContributions,
    };
  }, [dashboardData]);

  const standing = standingMessage(rankData, totalLeaderboard);

  // Primary CTA in hero: if any active program, show "Continue Journey"; else "Explore Opportunities"
  const programs = programsData || [];
  const hasActiveProgram = programs.some((p) => p.status === 'active' || p.status === 'ongoing');
  const heroCta = hasActiveProgram
    ? { label: 'Continue Journey', to: '/my-programs' }
    : { label: 'Explore Opportunities', to: '/opportunities' };

  const contributions = contributionsData || [];
  const totalContributionsCount = stats?.totalContributions ?? contributions.length;
  const submittedContributions = contributions.filter(
    (c) => c.status === 'approved' || c.status === 'pending' || c.status === 'under_review'
  ).length;

  /* ── loading & error states ───────────────────────────────────────────── */

  const isDataLoading = dashboardLoading; // Only block the top level on the super-fast stats query

  if (isDataLoading) {
    return <DashboardSkeleton type="volunteer" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="volunteer-dashboard-page" style={{
        minHeight: '100vh',
        background: '#F8F7F4',
        padding: '0 clamp(1rem, 4vw, 2rem)',
      }}>
      <div className="dashboard-content-wrapper" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '1.75rem 0 3rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}>
        {dashboardError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Unable to sync latest dashboard data. Displaying cached view.</span>
            <button onClick={handleRefreshDashboard} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
              Retry Sync
            </button>
          </div>
        )}

        {/* ── SECTION 1: Welcome & Progress ─────────────────────────────── */}
        <Section>
          <div className="dashboard-hero-card" style={{
            background: 'var(--primary-blue)',
            borderRadius: 20,
            padding: '2rem 2.25rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 28px rgba(11, 59, 145, 0.18)'
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>

              {/* Greeting & Refresh Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.625rem' }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {getGreeting()}, {firstName}! 👋
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.18)', padding: '0.35rem 0.85rem', borderRadius: 999, fontWeight: 500 }}>
                    Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={handleRefreshDashboard}
                    disabled={isRefreshing}
                    style={{
                      background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                      borderRadius: 999, width: 32, height: 32, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    title="Refresh Dashboard"
                  >
                    <RotateCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                  </button>
                </div>
              </div>

              {/* Subtitle / Standing message */}
              <p style={{
                color: 'rgba(255,255,255,0.92)',
                margin: '0 0 1.5rem 0',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                fontWeight: 400
              }}>
                {standing ? (
                  <>
                    <TrendingUp size={16} />
                    {standing}
                  </>
                ) : (
                  'Welcome back! Discover opportunities and track your volunteer progress.'
                )}
              </p>

              {/* Primary CTA */}
              <div>
                <Link
                  to={heroCta.to}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '0.65rem 1.35rem', borderRadius: 10,
                    background: 'white', color: 'var(--color-primary)',
                    textDecoration: 'none', transition: 'all 0.2s',
                    fontSize: '0.9rem', fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                >
                  {heroCta.label} <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* decorative icon */}
            <div style={{
              position: 'absolute', right: '-10px', bottom: '-20px',
              opacity: 0.1, transform: 'rotate(-15deg)'
            }}>
              <Sparkles size={160} />
            </div>
          </div>
        </Section>

        {/* ── SECTION 2: My Progress (stat cards) ───────────────────────── */}
        <Section>
          <div className="stat-card-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
            gap: '1rem'
          }}>

            <StatCard
              label="XP Points" value={points}
              icon={<Sparkles size={18} />}
              color="var(--primary-blue)" bg="#FFF3ED" note="Earned"
              loading={dashboardLoading}
            />
            <StatCard
              label="Contributions" value={totalContributionsCount}
              icon={<FileText size={18} />}
              color="#059669" bg="#D1FAE5" note="Total Made"
              onClick={() => navigate('/my-contributions')}
              loading={dashboardLoading || contribLoading}
            />
            <StatCard
              label="Programs" value={stats?.programsJoined ?? 0}
              icon={<Briefcase size={18} />}
              color="var(--primary-blue)" bg="#EDE9FE"
              note={`${stats?.activePrograms ?? 0} Active`}
              onClick={() => navigate('/my-programs')}
              loading={dashboardLoading}
            />
            <StatCard
              label="Certificates" value={stats?.certificates ?? 0}
              icon={<Award size={18} />}
              color="#D97706" bg="#FEF3C7" note="Verified"
              onClick={() => navigate('/certificates')}
              loading={dashboardLoading}
            />
            <StatCard
              label="Profile" value={`${profileCompletion ?? 0}%`}
              icon={<Award size={18} />}
              color="#2563EB" bg="#DBEAFE" note="Completed"
              onClick={() => navigate('/profile/setup')}
              loading={dashboardLoading}
            />
          </div>
        </Section>

        {/* ── SECTION 3: Continue Journey ──────────────────────────────── */}
        <Section>
          <React.Suspense fallback={<WidgetFallback />}>
            <DashboardContinueJourney
              programs={programsData}
              contributions={contributionsData}
              attendanceDashboard={attendanceData}
              profileCompletion={profileCompletion}
              loading={programsLoading || contribLoading || attendanceLoading}
            />
          </React.Suspense>
        </Section>

        {/* ── SECTION 8: Quick Actions (Full Width) ────────────────────── */}
        <Section>
          <React.Suspense fallback={<WidgetFallback />}>
            <DashboardQuickActions profileCompletion={profileCompletion} />
          </React.Suspense>
        </Section>

        <div className="dashboard-two-column-impact">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* ── SECTION 4: My Impact ──────────────────────────────────────── */}
            <React.Suspense fallback={<WidgetFallback />}>
              <DashboardMyImpact
                totalHours={stats?.totalHours}
                programsJoined={stats?.programsJoined}
                contributionsCount={submittedContributions}
                certificatesEarned={stats?.certificates}
                coinsEarned={gamificationData?.coins}
                badgesEarned={badgesCount}
                loading={dashboardLoading || contribLoading}
              />
            </React.Suspense>
          </div>
        </div>

        {/* ── SECTION 6: Upcoming Events ─────────────────────────────────── */}
        {programsLoading ? (
          <Section>
            <div style={{ marginBottom: '0.875rem' }}>
              <div style={{ height: 24, width: 150, background: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
            </div>
            <WidgetFallback />
          </Section>
        ) : (
          <UpcomingEvents programs={programs} />
        )}

      </div>
    </motion.div>
  );
};

export default Dashboard;
