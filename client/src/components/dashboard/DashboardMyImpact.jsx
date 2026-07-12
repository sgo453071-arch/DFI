/**
 * DashboardMyImpact.jsx
 * Section 4 – "My Impact"
 *
 * Shows the volunteer's personal impact summary using existing backend data.
 * Metrics shown: Hours Served, Programs Participated, Contributions Submitted,
 * Certificates Earned, plus Coins Earned and Badges if available.
 *
 * Hidden entirely when all values are zero (no impact yet).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Briefcase, FileText, Award, Coins, Star } from 'lucide-react';

/* ─── single metric tile ────────────────────────────────────────────────────── */

const ImpactTile = ({ icon: Icon, value, label, color, bg, delay }) => (
  <motion.div
    className="dashboard-card impact-card w-full lg:w-[260px] lg:min-h-[130px] lg:px-6 lg:py-5 lg:gap-5"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    style={{
      background: 'white',
      borderRadius: 14,
      padding: '1rem 1.25rem',
      border: '1px solid #F0EDE8',
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'all 0.22s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
      e.currentTarget.style.transform = 'none';
    }}
  >
    <div style={{
      borderRadius: 10,
      background: bg,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}
      className="w-[40px] h-[40px] lg:w-[56px] lg:h-[56px]">
      <Icon className="w-[18px] h-[18px] lg:w-7 lg:h-7" />
    </div>
    <div className="flex flex-col">
      <div style={{
        color: 'var(--color-heading)',
        marginBottom: '0.2rem'
      }}
        className="text-lg lg:text-2xl font-semibold lg:whitespace-nowrap">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{
        color: 'var(--color-body)'
      }}
        className="text-sm lg:text-base lg:whitespace-nowrap">
        {label}
      </div>
    </div>
  </motion.div>
);

/* ─── component ─────────────────────────────────────────────────────────────── */

const DashboardMyImpact = ({
  totalHours,
  programsJoined,
  contributionsCount,
  certificatesEarned,
  coinsEarned,
  badgesEarned,
  loading,
}) => {
  if (loading) return null;

  // Build the metric list — only include tiles that have real data (value > 0)
  const allMetrics = [
    {
      icon: Clock,
      value: totalHours ?? 0,
      label: 'Hours Served',
      color: '#059669',
      bg: '#D1FAE5',
    },
    {
      icon: Briefcase,
      value: programsJoined ?? 0,
      label: 'Programs Joined',
      color: 'var(--primary-blue)',
      bg: '#EDE9FE',
    },
    {
      icon: FileText,
      value: contributionsCount ?? 0,
      label: 'Contributions',
      color: '#2563EB',
      bg: '#DBEAFE',
    },
    {
      icon: Award,
      value: certificatesEarned ?? 0,
      label: 'Certificates',
      color: '#D97706',
      bg: '#FEF3C7',
    },
    {
      icon: Coins,
      value: coinsEarned ?? 0,
      label: 'Coins Earned',
      color: 'var(--primary-blue)',
      bg: '#FFF3ED',
    },
    {
      icon: Star,
      value: badgesEarned ?? 0,
      label: 'Badges Earned',
      color: '#4338CA',
      bg: '#EEF2FF',
    },
  ];

  // Only show tiles where the value is greater than zero
  const visibleMetrics = allMetrics.filter((m) => m.value > 0);

  // Hide the whole section if nothing to show
  if (visibleMetrics.length === 0) return null;

  return (
    <div>
      {/* Section heading */}
      <div style={{ marginBottom: '0.875rem' }}>
        <h2 style={{
          color: 'var(--color-heading)',
          margin: 0
        }}>
          My Impact
        </h2>
        <p style={{
          color: 'var(--color-body)',
          margin: '0.2rem 0 0 0'
        }}>
          Your contribution to Disha For India so far.
        </p>
      </div>

      {/* Tile grid */}
      <div className="impact-card-grid grid lg:flex lg:flex-wrap grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3.5 lg:gap-5">
        {visibleMetrics.map((m, i) => (
          <ImpactTile key={m.label} {...m} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
};

export default DashboardMyImpact;
