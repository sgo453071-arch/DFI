import React from 'react';

export const VolunteerDashboardSkeleton = () => {
  return (
    <div className="volunteer-dashboard-page" style={{
      minHeight: '100vh',
      background: '#F8F7F4',
      padding: '0 clamp(1rem, 4vw, 2rem)'
    }}>
      <div className="dashboard-content-wrapper" style={{
        maxWidth: 1200, margin: '0 auto', padding: '1rem 0 2rem 0',
        display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        {/* SECTION 1: Welcome & Progress Hero */}
        <div style={{ height: '140px', background: 'var(--color-border)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />

        {/* SECTION 2: My Progress (5 stat cards) */}
        <div className="stat-card-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
          gap: '1rem'
        }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: '94px', background: 'var(--color-border)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>

        {/* SECTION 3: Continue Journey */}
        <div style={{ height: '220px', background: 'var(--color-border)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />

        <div className="dashboard-two-column-impact">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* SECTION 4: My Impact */}
            <div style={{ height: '360px', background: 'var(--color-border)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
            
            {/* SECTION 8: Quick Actions */}
            <div style={{ height: '180px', background: 'var(--color-border)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
            {/* SECTION 5: Recommended Opportunities */}
            <div style={{ height: '540px', background: 'var(--color-border)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>

        {/* SECTION 6: Upcoming Events */}
        <div style={{ height: '100px', background: 'var(--color-border)', borderRadius: 16, animation: 'pulse 1.5s infinite', marginTop: '1rem' }} />
      </div>
    </div>
  );
};

export const AdminDashboardSkeleton = () => {
  return (
    <div className="admin-dashboard-page" style={{ width: '100%' }}>
      {/* Primary stats row (4 cards) */}
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: '90px', background: 'var(--color-border)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>

      {/* Secondary stats row (4 cards) */}
      <div className="stats-grid secondary-stats" style={{ marginTop: '1.25rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: '90px', background: 'var(--color-border)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>

      {/* Attendance stats (2 cards) */}
      <div className="stats-grid secondary-stats" style={{ marginTop: '1.25rem' }}>
        {[1, 2].map(i => (
          <div key={i} style={{ height: '90px', background: 'var(--color-border)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>

      <div className="dashboard-main-grid" style={{ marginTop: '1.5rem' }}>
        <div className="dashboard-column left-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Health Card */}
          <div style={{ height: '160px', background: 'var(--color-border)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
          {/* Quick Actions Card */}
          <div style={{ height: '200px', background: 'var(--color-border)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
        </div>

        <div className="dashboard-column right-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Leaderboard */}
          <div style={{ height: '350px', background: 'var(--color-border)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
          {/* Notifications */}
          <div style={{ height: '280px', background: 'var(--color-border)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
          {/* Announcements */}
          <div style={{ height: '300px', background: 'var(--color-border)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton = ({ type = 'volunteer' }) => {
  if (type === 'admin') return <AdminDashboardSkeleton />;
  return <VolunteerDashboardSkeleton />;
};

export default DashboardSkeleton;