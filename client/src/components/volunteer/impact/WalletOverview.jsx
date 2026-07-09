import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const WalletOverview = ({ rewards, history }) => {
  const [showAll, setShowAll] = useState(false);
  if (!rewards && !history) return null;

  const transactions = history?.transactions || [];
  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);
  const currentBalance = rewards?.currentCoins ?? 0;
  const lifetimeCoins = rewards?.lifetimeCoins ?? currentBalance;
  const redeemedCoins = rewards?.redeemedCoins ?? 0;
  const pendingCoins = rewards?.pendingCoins ?? 0;

  const getTxnIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('earn') || t.includes('credit') || t.includes('award')) return <ArrowUpRight size={14} color="#059669" />;
    if (t.includes('redeem') || t.includes('debit') || t.includes('spend')) return <ArrowDownRight size={14} color="#DC2626" />;
    return <Clock size={14} color="var(--color-body)" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ background: 'white', borderRadius: 20, padding: '2rem', border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF3ED', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={20} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-heading)' }}>Wallet Overview</h3>
        </div>
        <Link to="/notifications" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Open Wallet <ExternalLink size={13} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Current Balance', value: currentBalance, color: 'var(--primary-blue)' },
          { label: 'Lifetime Coins', value: lifetimeCoins, color: '#059669' },
          { label: 'Coins Redeemed', value: redeemedCoins, color: '#BE185D' },
          { label: 'Pending Coins', value: pendingCoins, color: '#D97706' },
        ].map(item => (
          <div key={item.label} style={{ background: '#FDFBF7', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-body)', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: item.color, lineHeight: 1.1 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {transactions.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-heading)', margin: '0 0 0.75rem 0' }}>Recent Transactions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AnimatePresence>
              {displayTransactions.map((txn, i) => (
                <motion.div
                  key={txn._id || i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', background: '#FAFAF8', borderRadius: 10,
                    border: '1px solid #F0EDE8', fontSize: '0.82rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getTxnIcon(txn.type)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-heading)', lineHeight: 1.3 }}>{txn.reason || txn.type || 'Transaction'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-body)' }}>
                        {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: (txn.coins || 0) >= 0 ? '#059669' : '#DC2626' }}>
                    {(txn.coins || 0) >= 0 ? '+' : ''}{txn.coins || 0}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {transactions.length > 5 && (
            <button
              onClick={() => setShowAll(s => !s)}
              style={{
                marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--color-primary)',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', padding: '0.4rem 0',
              }}
            >
              {showAll ? 'Show Less' : `View All (${transactions.length})`}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default WalletOverview;
