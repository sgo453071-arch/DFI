import React from 'react';

const FilterBar = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.status || filters.category || filters.sortBy !== 'createdAt';

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <select
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
        aria-label="Filter by status"
        className="form-control"
        style={{ minWidth: '140px' }}
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="under_review">Under Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="needs_changes">Needs Changes</option>
        <option value="archived">Archived</option>
      </select>

      <select
        value={filters.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
        aria-label="Filter by category"
        className="form-control"
        style={{ minWidth: '140px' }}
      >
        <option value="">All Categories</option>
        <option value="graphic_design">Graphic Design</option>
        <option value="content_writing">Content Writing</option>
        <option value="digital_marketing">Digital Marketing</option>
        <option value="photography">Photography</option>
        <option value="videography">Videography</option>
        <option value="teaching">Teaching</option>
        <option value="web_development">Web Development</option>
        <option value="ui_ux">UI/UX Design</option>
        <option value="event_management">Event Management</option>
        <option value="social_media">Social Media</option>
        <option value="research">Research</option>
        <option value="other">Other</option>
      </select>

      <select
        value={filters.sortBy || 'createdAt'}
        onChange={(e) => handleChange('sortBy', e.target.value)}
        aria-label="Sort contributions"
        className="form-control"
        style={{ minWidth: '160px' }}
      >
        <option value="createdAt">Newest First</option>
        <option value="-createdAt">Oldest First</option>
        <option value="-totalCoinsAwarded">Most Coins</option>
        <option value="-hoursWorked">Most Hours</option>
        <option value="title">Alphabetical</option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({ status: '', category: '', sortBy: 'createdAt' })}
          aria-label="Clear all filters"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-body)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
