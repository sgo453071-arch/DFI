import React, { useState, useCallback, useMemo } from 'react';
import { Shield, X } from 'lucide-react';
import { useAdminContributions } from '../../hooks/useAdminContributions';
import ContributionQueue from '../../components/admin/contributions/ContributionQueue';
import AdminContributionDetail from '../../components/admin/contributions/AdminContributionDetail';
import ReviewPanel from '../../components/admin/contributions/ReviewPanel';
import ReviewStats from '../../components/admin/contributions/ReviewStats';

const AdminReviewDashboard = () => {
  const [selectedId, setSelectedId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', sortBy: 'createdAt' });

  const { data, isLoading, error } = useAdminContributions({
    page: 1,
    limit: 12,
    search: searchQuery,
    status: filters.status,
    category: filters.category,
    sortBy: filters.sortBy,
  });

  const contributions = data?.contributions || [];
  const contribution = contributions.find((c) => c._id === selectedId);

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
      </div>
    </div>
  );
};

export default AdminReviewDashboard;
