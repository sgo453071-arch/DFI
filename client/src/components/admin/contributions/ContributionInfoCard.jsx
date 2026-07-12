import React from 'react';
import { FileText, Clock, Tag, FolderOpen, Calendar } from 'lucide-react';
import ContributionStatusBadge from '../../contributions/ContributionStatusBadge';

const ContributionInfoCard = ({ contribution }) => {
  if (!contribution) return null;

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={18} /> Contribution Information
      </h4>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '0.5rem' }}>{contribution.title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
          <ContributionStatusBadge status={contribution.status} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--color-bg)', color: 'var(--color-body)', border: '1px solid var(--color-border)' }}>
            <FolderOpen size={12} /> {contribution.category?.replace(/_/g, ' ')}
          </span>
          {contribution.createdAt && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--color-bg)', color: 'var(--color-body)', border: '1px solid var(--color-border)' }}>
              <Calendar size={12} /> Submitted {new Date(contribution.createdAt).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-body)', lineHeight: 1.7, marginBottom: '1rem' }}>{contribution.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-base)', color: 'var(--color-body)' }}>
            <Clock size={16} /> {contribution.hoursWorked || 0} hours
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-base)', color: 'var(--color-body)' }}>
            <Tag size={16} /> {(contribution.tags || []).length} tags
          </div>
        </div>
        {(contribution.skillsUsed?.length > 0 || contribution.tags?.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {contribution.skillsUsed?.map((skill) => (
              <span key={skill} style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', background: 'rgba(211, 84, 0, 0.10)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{skill}</span>
            ))}
            {contribution.tags?.map((tag) => (
              <span key={tag} style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', background: 'rgba(5, 150, 105, 0.10)', color: 'var(--color-secondary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributionInfoCard;
