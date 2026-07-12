import React from 'react';

const NotificationSkeleton = ({ count = 5, compact = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.5rem' : '0.75rem' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{
            display: 'flex',
            gap: '0.875rem',
            padding: compact ? '0.75rem' : '1rem',
            borderRadius: 'var(--radius-md)',
            height: compact ? 60 : 80 }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: 'var(--color-border)',
            flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              height: 10,
              width: '65%',
              borderRadius: 6,
              backgroundColor: 'var(--color-border)' }} />
            <div style={{
              height: 10,
              width: '100%',
              borderRadius: 6,
              backgroundColor: 'var(--color-border)' }} />
            {!compact && (
              <div style={{
                height: 10,
                width: '40%',
                borderRadius: 6,
                backgroundColor: 'var(--color-border)' }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
