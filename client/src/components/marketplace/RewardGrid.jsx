import React, { memo } from 'react';
import { Sparkles } from 'lucide-react';

const RewardGrid = React.memo(({ rewards, onViewDetails, onRedeem, userCoins }) => {
  if (!rewards || rewards.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {rewards.map((reward) => (
        <div
          key={reward._id || reward.id}
          style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'var(--transition-fast)',
            cursor: 'pointer',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}
          onClick={() => onViewDetails && onViewDetails(reward)}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${reward.name}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onViewDetails && onViewDetails(reward);
            }
          }}
        >
          {reward.isFeatured && (
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                zIndex: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={12} />
              Featured
            </div>
          )}

          <div
            style={{
              width: '100%',
              height: '180px',
              background: reward.image
                ? `url(${reward.image}) center/cover no-repeat`
                : 'linear-gradient(135deg, #F8F7F4, #EDE9FE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-body)',
              fontSize: '0.875rem',
              fontWeight: 600,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {!reward.image && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <Sparkles size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>No Image</span>
              </div>
            )}
            {reward.stock === 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    background: 'rgba(239,68,68,0.9)',
                    color: 'white',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Sold Out
                </span>
              </div>
            )}
          </div>

          <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--color-heading)',
                  margin: 0,
                  lineHeight: 1.3,
                  flex: 1,
                }}
              >
                {reward.name}
              </h3>
            </div>

            <span
              style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                background: 'rgba(37,99,235,0.08)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                marginBottom: '0.75rem',
                width: 'fit-content',
              }}
            >
              {reward.category}
            </span>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: '0.75rem',
                borderTop: '1px solid #F0EDE8',
              }}
            >
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: userCoins >= reward.coinCost ? 'var(--color-primary)' : 'var(--color-error)', fontFamily: 'var(--font-heading)' }}>
                  {reward.coinCost.toLocaleString()}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.25rem' }}>coins</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Stock</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: reward.stock > 10 ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {reward.stock === 0 ? '0' : reward.stock}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails && onViewDetails(reward);
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-heading)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                aria-label={`View details for ${reward.name}`}
              >
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (reward.stock > 0) onRedeem && onRedeem(reward);
                }}
                disabled={reward.stock === 0}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: reward.stock === 0 ? '#D1D5DB' : 'var(--color-primary)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: reward.stock === 0 ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                aria-label={`Redeem ${reward.name}`}
              >
                {reward.stock === 0 ? 'Sold Out' : 'Redeem'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

RewardGrid.displayName = 'RewardGrid';

export default RewardGrid;
