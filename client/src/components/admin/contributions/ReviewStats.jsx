import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Star, Timer } from 'lucide-react';

const ReviewStats = ({ stats = {} }) => {
  const items = [
    { label: 'Pending Reviews', value: stats.pending ?? 0, icon: Clock, color: 'var(--color-accent)' },
    { label: 'Under Review', value: stats.underReview ?? 0, icon: AlertCircle, color: 'var(--color-primary)' },
    { label: 'Approved Today', value: stats.approvedToday ?? 0, icon: CheckCircle, color: 'var(--color-success)' },
    { label: 'Rejected Today', value: stats.rejectedToday ?? 0, icon: XCircle, color: 'var(--color-error)' },
    { label: 'Needs Changes', value: stats.needsChanges ?? 0, icon: AlertCircle, color: 'var(--color-accent)' },
    { label: 'Featured', value: stats.featured ?? 0, icon: Star, color: 'var(--color-purple)' },
    { label: 'Avg Review Time', value: stats.avgReviewTime || 'N/A', icon: Timer, color: 'var(--color-secondary)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {items.map((item) => (
        <div
          key={item.label}
          className="card"
          style={{
            flex: '1 1 180px',
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1.25rem',
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '50%', background: `${item.color}20`, color: item.color, flexShrink: 0 }}>
            <item.icon size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-heading)' }}>{item.value}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewStats;
