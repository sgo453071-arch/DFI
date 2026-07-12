/**
 * DashboardContinueJourney.jsx
 * Section 3 – "Continue Your Journey"
 *
 * Evaluates the volunteer's current state and shows exactly ONE call-to-action,
 * in this priority order:
 *   1. Active program  → "Continue Program"
 *   2. Pending contribution  → "Upload Pending Contribution"
 *   3. Pending attendance check-in  → "Mark Attendance"
 *   4. Upcoming session (next active program)  → "View Upcoming Session"
 *   5. Incomplete profile  → "Complete Your Profile"
 *   6. Fallback  → "Explore Opportunities"
 *
 * Nothing is rendered when data is still loading (returns null so the layout
 * collapses gracefully).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  Upload,
  CalendarCheck,
  CalendarDays,
  UserCog,
  Compass,
  ArrowRight,
} from 'lucide-react';

/* ─── helpers ──────────────────────────────────────────────────────────────── */

const ACCENT = {
  program:     { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0' },
  contribution:{ color: 'var(--primary-blue)', bg: '#EDE9FE', border: '#C4B5FD' },
  attendance:  { color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE' },
  upcoming:    { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  profile:     { color: 'var(--primary-blue)', bg: '#FFF3ED', border: '#FED7AA' },
  explore:     { color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
};

/**
 * Determines what the volunteer should do next.
 * Returns { type, title, subtitle, icon, path, label, accent }
 */
function resolvePriority({
  activePrograms,
  pendingContributions,
  pendingAttendance,
  upcomingPrograms,
  profileCompletion,
}) {
  // 1. Active program
  const active = activePrograms?.[0];
  if (active) {
    return {
      type: 'program',
      title: active.title || active.programTitle || 'Your Active Program',
      subtitle: 'You have an active program. Keep the momentum going.',
      icon: PlayCircle,
      path: '/my-programs',
      label: 'Continue Program',
      accent: ACCENT.program,
    };
  }

  // 2. Pending contribution
  const contrib = pendingContributions?.[0];
  if (contrib) {
    return {
      type: 'contribution',
      title: contrib.title || 'Pending Contribution',
      subtitle: 'You have a contribution waiting to be submitted for review.',
      icon: Upload,
      path: '/my-contributions',
      label: 'Upload Pending Contribution',
      accent: ACCENT.contribution,
    };
  }

  // 3. Pending attendance
  if (pendingAttendance) {
    return {
      type: 'attendance',
      title: 'Mark Your Attendance',
      subtitle: 'You have an active session — check in to log your hours.',
      icon: CalendarCheck,
      path: '/attendance',
      label: 'Mark Attendance',
      accent: ACCENT.attendance,
    };
  }

  // 4. Upcoming session
  const upcoming = upcomingPrograms?.[0];
  if (upcoming) {
    return {
      type: 'upcoming',
      title: upcoming.title || upcoming.programTitle || 'Upcoming Session',
      subtitle: 'You have an upcoming program session on your schedule.',
      icon: CalendarDays,
      path: '/my-programs',
      label: 'View Upcoming Session',
      accent: ACCENT.upcoming,
    };
  }

  // 5. Incomplete profile
  if (profileCompletion !== null && profileCompletion !== undefined && profileCompletion < 100) {
    return {
      type: 'profile',
      title: 'Complete Your Profile',
      subtitle: `Your profile is ${profileCompletion}% complete. Finish it to unlock more opportunities.`,
      icon: UserCog,
      path: '/profile/setup',
      label: 'Complete Profile',
      accent: ACCENT.profile,
    };
  }

  // 6. Explore
  return {
    type: 'explore',
    title: 'Explore Opportunities',
    subtitle: 'Discover programs that match your skills and make an impact.',
    icon: Compass,
    path: '/opportunities',
    label: 'Explore Opportunities',
    accent: ACCENT.explore,
  };
}

/* ─── component ────────────────────────────────────────────────────────────── */

const DashboardContinueJourney = ({
  programs,           // all joined programs array
  contributions,      // my contributions array
  attendanceDashboard,// attendance dashboard data
  profileCompletion,  // number 0-100
  loading,
}) => {
  if (loading) return null;

  // Derive the state inputs the priority resolver needs
  const activePrograms = (programs || []).filter(
    (p) => p.status === 'active' || p.status === 'ongoing'
  );

  const pendingContributions = (contributions || []).filter(
    (c) => c.status === 'draft' || c.status === 'pending'
  );

  // pendingAttendance: volunteer has an active check-in OR an upcoming session
  // that hasn't been checked into yet — we derive from attendanceDashboard
  const hasPendingCheckIn =
    attendanceDashboard?.activeCheckIn === true ||
    attendanceDashboard?.pendingCheckIn === true ||
    false;

  const upcomingPrograms = (programs || []).filter(
    (p) => p.status === 'upcoming' || p.status === 'scheduled'
  );

  const item = resolvePriority({
    activePrograms,
    pendingContributions,
    pendingAttendance: hasPendingCheckIn,
    upcomingPrograms,
    profileCompletion,
  });

  const Icon = item.icon;

  return (
    <motion.div
      className="dashboard-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: 'white',
        borderRadius: 16,
        border: `1.5px solid ${item.accent.border}`,
        padding: '1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{
          textTransform: 'uppercase',
          color: item.accent.color,
          margin: '0 0 0.35rem 0' }}>
          Continue Your Journey
        </p>
        <h3 style={{
          color: 'var(--color-heading)',
          margin: 0 }}>
          {item.title}
        </h3>
      </div>

      {/* Body row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        borderRadius: 12,
        background: item.accent.bg,
        marginBottom: '1.25rem' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: item.accent.color + '22',
          color: item.accent.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0 }}>
          <Icon size={22} />
        </div>
        <p style={{
          margin: 0,
          color: 'var(--color-body)' }}>
          {item.subtitle}
        </p>
      </div>

      {/* CTA */}
      <Link
        to={item.path}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.25rem',
          borderRadius: 8,
          background: item.accent.color,
          color: 'white',
          textDecoration: 'none',
          transition: 'opacity 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        {item.label}
        <ArrowRight size={15} />
      </Link>
    </motion.div>
  );
};

export default DashboardContinueJourney;
