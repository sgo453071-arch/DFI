import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Shield } from 'lucide-react';
import ContributionQueueCard from './ContributionQueueCard';
import ContributionSkeleton from '../../contributions/ContributionSkeleton';
import FilterBar from './FilterBar';
import SearchBar from './SearchBar';

const ContributionQueue = ({ contributions, loading, onSelect, selectedId, detailPanel, searchQuery, setSearchQuery, filters, setFilters }) => {
  // Use contributions directly since they are now filtered by the backend
  const filtered = contributions || [];


  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div style={{ marginBottom: '1.5rem', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by volunteer, title, category..." />
            
            <button
              className="btn btn-secondary"
              onClick={() => setShowFilters((p) => !p)}
              style={{ display: 'flex', padding: '0 1rem', gap: '0.5rem', alignItems: 'center', height: '42px', position: 'relative' }}
              aria-expanded={showFilters}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <span className="hidden md:inline-flex">Filters</span>
              {(filters.status || filters.category || filters.sortBy !== 'createdAt') && (
                <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-primary)', position: 'absolute', top: 8, right: 12 }} />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end', paddingTop: '0.5rem' }}>
                  <FilterBar filters={filters} onChange={setFilters} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {loading ? (
        <ContributionSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          
          {/* List Column */}
          <div className={`lg:col-span-4 ${selectedId ? 'hidden lg:block' : 'block'}`}>
            {filtered.length > 0 ? (
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {filtered.map((contrib) => (
                    <ContributionQueueCard
                      key={contrib._id}
                      contribution={contrib}
                      onClick={onSelect}
                      isActive={selectedId === contrib._id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="mx-auto mb-4 opacity-40 flex justify-center"><Clock size={40} /></div>
                <h4 className="font-bold text-slate-800 text-lg mb-2">No contributions found</h4>
                <p className="text-slate-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

          {/* Detail Panel Column */}
          <div className={`lg:col-span-8 ${!selectedId ? 'hidden lg:block' : 'block'}`}>
            {detailPanel || (
              <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 min-h-[400px]">
                <Shield size={48} className="mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Review Panel</h3>
                <p>Select a contribution from the list to view its details and take action.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ContributionQueue;
