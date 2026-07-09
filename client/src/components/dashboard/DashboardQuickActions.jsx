/**
 * DashboardQuickActions.jsx
 * Section 8 – "Quick Actions"
 *
 * A compact grid of shortcut links. The "Complete Profile" shortcut is
 * conditionally included only when profileCompletion < 100.
 *
 * Actions are kept intentionally small — no more than 5 tiles at once.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Upload,
  Award,
  MessageSquare,
  UserCog,
} from 'lucide-react';

/* ─── base actions (always shown) ───────────────────────────────────────────── */

const BASE_ACTIONS = [
  {
    label: 'Explore Opportunities',
    icon: Compass,
    path: '/opportunities',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  {
    label: 'Upload Contribution',
    icon: Upload,
    path: '/contributions/new',
    color: 'var(--primary-blue)',
    bg: '#EDE9FE',
  },
  {
    label: 'View Certificates',
    icon: Award,
    path: '/certificates',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    label: 'Open Messages',
    icon: MessageSquare,
    path: '/messages',
    color: '#059669',
    bg: '#D1FAE5',
  },
];

/* ─── component ─────────────────────────────────────────────────────────────── */

const DashboardQuickActions = ({ profileCompletion }) => {
  // Append "Complete Profile" only when the profile is not 100% done
  const actions = [
    ...BASE_ACTIONS,
    ...(profileCompletion !== null &&
      profileCompletion !== undefined &&
      profileCompletion < 100
      ? [
          {
            label: 'Complete Profile',
            icon: UserCog,
            path: '/profile/setup',
            color: 'var(--primary-blue)',
            bg: '#FFF3ED',
          },
        ]
      : []),
  ];

  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.05rem',
        fontWeight: 700,
        color: 'var(--color-heading)',
        margin: '0 0 0.875rem 0',
      }}>
        Quick Actions
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))',
        gap: '0.75rem',
      }}>
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <Link
                to={action.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.1rem 0.75rem',
                  borderRadius: 14,
                  background: action.bg,
                  color: action.color,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  border: `1px solid ${action.color}20`,
                  transition: 'all 0.22s',
                  textAlign: 'center',
                  lineHeight: 1.35,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.09)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Icon size={20} />
                {action.label}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardQuickActions;
