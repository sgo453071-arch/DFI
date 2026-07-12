import React, { useState, useCallback, useMemo } from 'react';
import { Shield, X } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { useAdminContributions } from '../../hooks/useAdminContributions';
import ContributionQueue from '../../components/admin/contributions/ContributionQueue';
import AdminContributionDetail from '../../components/admin/contributions/AdminContributionDetail';
import ReviewPanel from '../../components/admin/contributions/ReviewPanel';
import ReviewStats from '../../components/admin/contributions/ReviewStats';

const AdminReviewDashboard = () => {
  const [selectedId, setSelectedId] = useState(null);
  // Track IDs that were just reviewed so we can show instant feedback
  // before the list refetches from the server.
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', sortBy: 'createdAt' });

  const { data, isLoading, error } = useAdminContributions({
  const { data, isLoading, error, isFetching } = useAdminContributions({
    page: 1,
    limit: 12,
    search: searchQuery,
    status: filters.status,
    category: filters.category,
    sortBy: filters.sortBy,
  });

  const contributions = (data?.contributions || []).filter(
    (c) => !reviewedIds.has(c._id)
  );
  const contribution = (data?.contributions || []).find((c) => c._id === selectedId);

  const stats = useMemo(() => {
    const base = contributions || [];
    return {
      pending: base.filter((c) => c.status === 'pending').length,
      underReview: base.filter((c) => c.status === 'under_review').length,
      approvedToday: base.filter((c) => c.status === 'approved').length,
      rejectedToday: base.filter((c) => c.status === 'rejected').length,
      needsChanges: base.filter((c) => c.status === 'needs_changes').length,
      featured: base.filter((c) => c.isFeatured).length,
      avgReviewTime: '2.4h',
    };
  }, [contributions]);

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
      <div className="min-h-screen bg-slate-50 p-6 text-center text-red-600">
        <p className="text-sm mb-4">{error.message || 'Failed to load contributions'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto w-full">


        {/* Review Stats Grid */}
        <ReviewStats stats={stats} />

        {/* Queue and Details split view */}
        <ContributionQueue
          contributions={contributions}
          loading={isLoading}
          onSelect={handleSelect}
          selectedId={selectedId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          detailPanel={
            selectedId && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full sticky top-20 relative">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 lg:hidden">
                  <button onClick={handleBack} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    &larr; Back to List
                  </button>
                </div>
                
                <button
                  onClick={handleBack}
                  aria-label="Close panel"
                  className="hidden lg:flex"
                  style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 50, background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>

                <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
                  <AdminContributionDetail
                    contributionId={selectedId}
                    onBack={handleBack}
                  />
                  {contribution && (
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                      <ReviewPanel contribution={contribution} onClose={handleBack} />
                    </div>
                  )}
                </div>
              </div>
            )
          }
        />
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
