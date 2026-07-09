import React from 'react';
import { Wallet, TrendingUp, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const WalletSummary = ({ rewards, history, loading }) => {
  if (loading) {
    return (
      <div style={{ background: 'var(--primary-blue)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', color: 'white' }}>
        <div className="skeleton" style={{ height: '20px', width: '40%', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '36px', width: '60%', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '14px', width: '50%', borderRadius: '4px', background: 'rgba(255,255,255,0.15)' }} />
      </div>
    );
  }

  const currentCoins = rewards?.currentCoins ?? 0;
  const lifetimeCoins = rewards?.totalCoinsEarned ?? (rewards?.totalCoins ?? currentCoins);
  const redeemedCoins = rewards?.redeemedCoins ?? 0;
  const pendingCoins = rewards?.pendingCoins ?? 0;

  const stats = [
    { label: 'Current Coins', value: currentCoins.toLocaleString(), icon: <Wallet size={20} />, color: '#FEF3C7', textColor: '#F59E0B' },
    { label: 'Lifetime Earned', value: lifetimeCoins.toLocaleString(), icon: <TrendingUp size={20} />, color: '#D1FAE5', textColor: '#059669' },
    { label: 'Redeemed', value: redeemedCoins.toLocaleString(), icon: <Star size={20} />, color: '#EDE9FE', textColor: 'var(--primary-blue)' },
    { label: 'Pending', value: pendingCoins.toLocaleString(), icon: <Clock size={20} />, color: '#FEE2E2', textColor: '#DC2626' },
  ];

  return (
    <div
      style={{
        background: 'var(--primary-blue)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', opacity: 0.1 }}>
        <Wallet size={140} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', opacity: 0.9 }}>
          Your Coin Wallet
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.icon}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletSummary;
