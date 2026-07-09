/**
 * DashboardUnifiedFeed.jsx
 * Section 7 – "Updates"
 *
 * Merges notifications, announcements, and collaboration activity into a single
 * chronological feed, grouped by relative day (Today / Yesterday / earlier dates).
 *
 * Rules:
 *  - Hidden entirely when there are no items across all three sources.
 *  - Items are sorted newest-first before grouping.
 *  - Shows a max of 12 items total to keep the feed concise.
 *  - Each item type gets a distinct icon and colour so the volunteer can scan at a glance.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell,
  Megaphone,
  Activity,
  ArrowRight,
} from 'lucide-react';

/* ─── helpers ───────────────────────────────────────────────────────────────── */

const MAX_ITEMS = 12;

/** Returns "Today", "Yesterday", or a locale date string. */
function relativeDay(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Earlier';
  const today = new Date();
  const diff = Math.floor((today - d) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  const days = Math.round(diff);
  if (days <= 6) return `${days} Days Ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Normalise heterogeneous sources into a common shape. */
function normalise(notifications, announcements, activities) {
  const items = [];

  (notifications || []).forEach((n) => {
    items.push({
      id: n._id || n.id,
      type: 'notification',
      title: n.title || 'Notification',
      body: n.message || '',
      date: n.createdAt || n.sentAt || new Date().toISOString(),
      unread: !n.read,
      link: '/notifications',
    });
  });

  (announcements || []).forEach((a) => {
    items.push({
      id: a._id || a.announcementId,
      type: 'announcement',
      title: a.title || 'Announcement',
      body: a.message || '',
      date: a.createdAt || new Date().toISOString(),
      unread: false,
      link: `/announcements/${a._id || a.announcementId}`,
    });
  });

  (activities || []).forEach((act) => {
    items.push({
      id: act._id || act.activityId,
      type: 'activity',
      title: act.action || act.title || 'Workspace Activity',
      body: act.workspaceName || '',
      date: act.createdAt || new Date().toISOString(),
      unread: false,
      link: '/collaboration/workspaces',
    });
  });

  // sort newest first, cap at MAX_ITEMS
  return items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_ITEMS);
}

/** Groups a flat sorted array into { dayLabel: [items] } */
function groupByDay(items) {
  const groups = [];
  const seen = new Map();
  items.forEach((item) => {
    const label = relativeDay(item.date);
    if (!seen.has(label)) {
      seen.set(label, []);
      groups.push({ label, items: seen.get(label) });
    }
    seen.get(label).push(item);
  });
  return groups;
}

/* ─── per-type config ────────────────────────────────────────────────────────── */

const TYPE_CONFIG = {
  notification: {
    Icon: Bell,
    color: '#2563EB',
    bg: '#DBEAFE',
    viewAll: '/notifications',
  },
  announcement: {
    Icon: Megaphone,
    color: '#D97706',
    bg: '#FEF3C7',
    viewAll: '/announcements',
  },
  activity: {
    Icon: Activity,
    color: 'var(--primary-blue)',
    bg: '#EDE9FE',
    viewAll: '/collaboration/workspaces',
  },
};

/* ─── single feed item ───────────────────────────────────────────────────────── */

const FeedItem = ({ item, delay }) => {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.notification;
  const Icon = cfg.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay }}
    >
      <Link
        to={item.link}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.75rem',
          borderRadius: 10,
          background: item.unread ? cfg.bg + 'AA' : '#FAFAF8',
          border: `1px solid ${item.unread ? cfg.color + '33' : '#F0EDE8'}`,
          textDecoration: 'none',
          transition: 'all 0.18s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = cfg.bg;
          e.currentTarget.style.borderColor = cfg.color + '55';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = item.unread ? cfg.bg + 'AA' : '#FAFAF8';
          e.currentTarget.style.borderColor = item.unread ? cfg.color + '33' : '#F0EDE8';
        }}
      >
        {/* Icon dot */}
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: cfg.bg,
          color: cfg.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}>
          <Icon size={14} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: '0.84rem',
            fontWeight: item.unread ? 700 : 500,
            color: 'var(--color-heading)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.35,
          }}>
            {item.title}
          </p>
          {item.body && (
            <p style={{
              margin: '0.15rem 0 0 0',
              fontSize: '0.75rem',
              color: 'var(--color-body)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {item.body}
            </p>
          )}
        </div>

        {/* Unread dot */}
        {item.unread && (
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: cfg.color,
            flexShrink: 0,
            marginTop: 6,
          }} />
        )}
      </Link>
    </motion.div>
  );
};

/* ─── main component ─────────────────────────────────────────────────────────── */

const DashboardUnifiedFeed = ({
  notifications,
  announcements,
  activities,
  loading,
}) => {
  const items = useMemo(
    () => normalise(notifications, announcements, activities),
    [notifications, announcements, activities]
  );

  const groups = useMemo(() => groupByDay(items), [items]);

  // While loading, show nothing (layout collapses)
  if (loading) return null;

  // Hidden when there is nothing to show
  if (items.length === 0) return null;

  let globalIndex = 0; // for staggered animation delays

  return (
    <div>
      {/* Section heading */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.875rem',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--color-heading)',
            margin: 0,
          }}>
            Updates
          </h2>
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--color-body)',
            margin: '0.2rem 0 0 0',
          }}>
            What's changed since your last visit.
          </p>
        </div>
        <Link
          to="/notifications"
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {/* Feed */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #F0EDE8',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {groups.map((group, gi) => (
          <div key={group.label}>
            {/* Day label */}
            <div style={{
              padding: '0.5rem 1rem',
              background: '#F8F7F4',
              borderBottom: '1px solid #F0EDE8',
              borderTop: gi > 0 ? '1px solid #F0EDE8' : 'none',
            }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-body)',
              }}>
                {group.label}
              </span>
            </div>

            {/* Items */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '0.75rem',
            }}>
              {group.items.map((item) => {
                const idx = globalIndex++;
                return (
                  <FeedItem
                    key={`${item.type}-${item.id || idx}`}
                    item={item}
                    delay={idx * 0.04}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardUnifiedFeed;
