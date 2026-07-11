import React, { useState, useCallback } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { useAdminContributions } from '../../hooks/useAdminContributions';
import ContributionQueue from '../../components/admin/contributions/ContributionQueue';
import AdminContributionDetail from '../../components/admin/contributions/AdminContributionDetail';
import ReviewPanel from '../../components/admin/contributions/ReviewPanel';

const AdminReviewDashboard = () => {
  const [selectedId, setSelectedId] = useState(null);
  // Track IDs that were just reviewed so we can show instant feedback
  // before the list refetches from the server.
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const { data, isLoading, error, isFetching } = useAdminContributions({
    page: 1,
    limit: 12,
  });

  const contributions = (data?.contributions || []).filter(
    (c) => !reviewedIds.has(c._id)
  );
  const contribution = (data?.contributions || []).find((c) => c._id === selectedId);

  const handleSelect = useCallback((contrib) => {
    setSelectedId(contrib._id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedId(null);
  }, []);

  // Called by ReviewPanel after a successful review action.
  // Immediately removes the item from the visible list (optimistic)
  // while the background refetch catches up.
  const handleReviewed = useCallback((id) => {
    setReviewedIds((prev) => new Set([...prev, id]));
    setSelectedId(null);
  }, []);

  // Once the list refetches and no longer contains the reviewed IDs,
  // clear them from the optimistic set so the set doesn't grow forever.
  React.useEffect(() => {
    if (!isFetching && data?.contributions) {
      const serverIds = new Set(data.contributions.map((c) => c._id));
      setReviewedIds((prev) => {
        const stillPresent = [...prev].filter((id) => serverIds.has(id));
        return stillPresent.length < prev.size ? new Set(stillPresent) : prev;
      });
    }
  }, [isFetching, data]);

  if (error) {
    return (
      <div className="page-container" style={{ padding: 'clamp(1rem, 3vw, 2rem)', color: 'var(--color-error)', textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>{error.message || 'Failed to load contributions'}</p>
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
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Panel</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Contribution Review</h1>
          <p style={{ color: 'var(--color-body)', margin: 0 }}>Review and manage volunteer contributions.</p>
        </div>
        {isFetching && !isLoading && (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-body)', opacity: 0.6 }}>Refreshing…</span>
        )}
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
                  <ReviewPanel
                    contribution={contribution}
                    onClose={handleBack}
                    onReviewed={handleReviewed}
                  />
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: 'clamp(2rem, 5vw, 4rem)', textAlign: 'center', color: 'var(--color-body)', background: 'var(--color-card)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
              {reviewedIds.size > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={32} style={{ color: 'var(--color-success, #16a34a)' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Review submitted successfully.</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>Select another contribution from the queue.</p>
                </div>
              ) : (
                'Select a contribution from the queue to review.'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewDashboard;
