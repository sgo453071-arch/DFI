import React, { useState, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { useAdminContributions } from '../../hooks/useAdminContributions';
import ContributionQueue from '../../components/admin/contributions/ContributionQueue';
import AdminContributionDetail from '../../components/admin/contributions/AdminContributionDetail';
import ReviewPanel from '../../components/admin/contributions/ReviewPanel';

const AdminReviewDashboard = () => {
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading, error } = useAdminContributions({
    page: 1,
    limit: 12,
  });

  const contributions = data?.contributions || [];
  const contribution = contributions.find((c) => c._id === selectedId);

  const handleSelect = useCallback((contrib) => {
    setSelectedId(contrib._id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedId(null);
  }, []);

  if (error) {
    return (
      <div className="page-container" style={{ padding: 'clamp(1rem, 3vw, 2rem)', color: 'var(--color-error)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-base)', marginBottom: '1rem' }}>{error.message || 'Failed to load contributions'}</p>
        <button onClick={() => window.location.reload()} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={20} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Panel</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Contribution Review</h1>
          <p style={{ color: 'var(--color-body)', margin: 0 }}>Review and manage volunteer contributions.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <ContributionQueue
            contributions={contributions}
            loading={isLoading}
            onSelect={handleSelect}
          />
        </div>
        <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
          {selectedId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <button onClick={handleBack} className="btn btn-secondary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                &larr; Back to Queue
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                <AdminContributionDetail
                  contributionId={selectedId}
                  onBack={handleBack}
                  hideReviewPanel
                />
                {contribution && (
                  <ReviewPanel contribution={contribution} onClose={handleBack} />
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: 'clamp(2rem, 5vw, 4rem)', textAlign: 'center', color: 'var(--color-body)', background: 'var(--color-card)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
              Select a contribution from the queue to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewDashboard;
