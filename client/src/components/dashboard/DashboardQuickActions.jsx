/**
 * DashboardQuickActions.jsx
 * Section 8 – "Quick Actions"
 *
 * Full-width card with 4 quick action tiles aligned side-by-side in 1 single horizontal row.
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
  ChevronRight,
} from 'lucide-react';

/* ─── base actions ───────────────────────────────────────────────────────────── */

const BASE_ACTIONS = [
  {
    label: 'Explore Opportunities',
    description: 'Discover new programs',
    icon: Compass,
    path: '/opportunities',
    color: '#2563EB',
    bg: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  {
    label: 'Upload Contribution',
    description: 'Submit proof of work',
    icon: Upload,
    path: '/contributions/new',
    color: '#7C3AED',
    bg: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  {
    label: 'View Certificates',
    description: 'Access verified certificates',
    icon: Award,
    path: '/certificates',
    color: '#D97706',
    bg: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  {
    label: 'Open Messages',
    description: 'Connect with organizers',
    icon: MessageSquare,
    path: '/messages',
    color: '#059669',
    bg: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
];

/* ─── component ─────────────────────────────────────────────────────────────── */

const DashboardQuickActions = ({ profileCompletion }) => {
  let actions = [...BASE_ACTIONS];
  if (profileCompletion !== null && profileCompletion !== undefined && profileCompletion < 100) {
    actions[3] = {
      label: 'Complete Profile',
      description: 'Unlock all features',
      icon: UserCog,
      path: '/profile/setup',
      color: 'var(--primary-blue)',
      bg: '#FFF3ED',
      borderColor: '#FFD8C7',
    };
  }

  return (
    <div className="dashboard-card" style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{
          color: 'var(--color-heading)',
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: 700,
        }}>
          Quick Actions
        </h2>
      </div>

      <div className="quick-action-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.875rem',
        width: '100%',
      }}>
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.04 }}
              style={{ width: '100%' }}
            >
              <Link
                to={action.path}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  background: action.bg,
                  color: action.color,
                  textDecoration: 'none',
                  border: `1px solid ${action.borderColor}`,
                  transition: 'all 0.2s ease-in-out',
                  width: '100%',
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'white',
                  color: action.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{
                    color: 'var(--color-heading)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.1rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {action.label}
                  </div>
                  <div style={{
                    color: 'var(--color-body)',
                    fontSize: '0.725rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {action.description}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: action.color, flexShrink: 0, opacity: 0.8 }} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardQuickActions;
