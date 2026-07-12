import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Tag, FolderOpen, Clock, AlertTriangle, FileText, Calendar } from 'lucide-react';
import ContributionStatusBadge from '../../contributions/ContributionStatusBadge';

const getPriority = (contribution) => {
  const daysPending = contribution.createdAt
    ? Math.max(0, Math.ceil((Date.now() - new Date(contribution.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const status = (contribution.status || '').toUpperCase();
  if (status === 'PENDING' && daysPending > 3) return { label: 'Urgent', color: 'var(--color-error)' };
  if (status === 'UNDER_REVIEW') return { label: 'In Progress', color: 'var(--color-info)' };
  if (status === 'PENDING' && daysPending > 1) return { label: 'High', color: 'var(--color-accent)' };
  if (status === 'PENDING' && daysPending > 0) return { label: 'Pending', color: 'var(--color-accent)' };
  if (status === 'NEEDS_CHANGES') return { label: 'Follow-up', color: 'var(--color-orange)' };
  return { label: 'Normal', color: 'var(--color-body)' };
};

const ContributionQueueCard = ({ contribution, onClick }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due Today';
    if (diff === 1) return 'Due Tomorrow';
    return `${diff} days left`;
  };

  const volunteer = contribution.submittedBy || {};
  const volunteerName = volunteer.name || 'Unknown Volunteer';
  const volunteerInitials = (volunteerName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const filesCount = contribution.currentVersion?.files?.length || contribution.files?.length || 0;
  const versionCount = contribution.currentVersion?.versionNumber || (contribution.versions?.length || 0);
  const priority = getPriority(contribution);
  const deadlineStr = formatDeadline(contribution.reviewDeadline);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
      }}
      onClick={() => onClick?.(contribution)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(contribution); } }}
      tabIndex={0}
      role="button"
      aria-label={`Review contribution: ${contribution.title}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '0.5rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {contribution.title}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <ContributionStatusBadge status={contribution.status} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: 'var(--text-xs)', fontWeight: 600, background: `${priority.color}15`, color: priority.color, border: `1px solid ${priority.color}40` }}>
              <AlertTriangle size={12} /> {priority.label}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--color-bg)', color: 'var(--color-body)', border: '1px solid var(--color-border)' }}>
              <FolderOpen size={12} /> {contribution.category?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, flexShrink: 0 }}>
          {volunteerInitials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{volunteerName}</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-body)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} /> Submitted {formatDate(contribution.createdAt)}
            </span>
            {deadlineStr && (
              <span style={{ fontSize: 'var(--text-xs)', color: deadlineStr === 'Overdue' ? 'var(--color-error)' : 'var(--color-body)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {deadlineStr}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {(contribution.tags || []).slice(0, 3).map((tag) => (
          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(5, 150, 105, 0.08)', color: 'var(--color-secondary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            <Tag size={10} /> {tag}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileText size={12} /> {filesCount} file{filesCount !== 1 ? 's' : ''}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Version {versionCount}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {contribution.hoursWorked || 0} hrs
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClick?.(contribution); }}
          style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--text-sm)', fontWeight: 600 }}
        >
          <Eye size={14} /> Review
        </button>
      </div>
    </motion.div>
  );
};

export default ContributionQueueCard;
