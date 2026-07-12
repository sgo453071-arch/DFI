import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import ContributionQueueCard from './ContributionQueueCard';
import ContributionSkeleton from '../../contributions/ContributionSkeleton';
import ContributionEmptyState from '../../contributions/ContributionEmptyState';
import ReviewStats from './ReviewStats';
import FilterBar from './FilterBar';
import SearchBar from './SearchBar';

const ContributionQueue = ({ contributions, loading, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', sortBy: 'createdAt' });

  const filtered = useMemo(() => {
    let result = [...contributions];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.submittedBy?.name || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters.category) {
      result = result.filter((c) => c.category === filters.category);
    }
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case '-createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'createdAt':
        default:
          return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });
    return result;
  }, [contributions, searchQuery, filters]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ReviewStats stats={stats} />
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by volunteer, title, category, or tags..." />
        <FilterBar filters={filters} onChange={setFilters} />
      </div>
      {loading ? (
        <ContributionSkeleton count={6} />
      ) : filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {filtered.map((contrib) => (
              <ContributionQueueCard
                key={contrib._id}
                contribution={contrib}
                onClick={onSelect}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{ padding: 'clamp(2rem, 5vw, 4rem)', textAlign: 'center', color: 'var(--color-body)', background: 'var(--color-card)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
          <div style={{ margin: '0 auto 1rem', opacity: 0.4 }}><Clock size={40} /></div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '0.5rem' }}>No contributions found</h4>
          <p style={{ fontSize: 'var(--text-base)', maxWidth: '400px', margin: '0 auto' }}>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ContributionQueue;
