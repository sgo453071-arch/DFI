import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAdminContributionDetail } from '../../../hooks/useAdminContributions';
import VolunteerInfoCard from './VolunteerInfoCard';
import ContributionInfoCard from './ContributionInfoCard';
import ContributionFiles from './ContributionFiles';
import ReviewHistory from '../../contributions/ReviewHistory';
import VersionHistory from '../../contributions/VersionHistory';
import ActivityTimeline from './ActivityTimeline';
import ReviewPanel from './ReviewPanel';

const AdminContributionDetail = ({ contributionId, onBack, hideReviewPanel = false }) => {
  const { data, isLoading, error } = useAdminContributionDetail(contributionId);

  if (!contributionId) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-body)' }}>
        <p>Select a contribution from the queue to review.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (error || !data?.contribution) {
    return (
      <div style={{ textAlign: 'center', padding: 'clamp(2rem, 5vw, 4rem)', color: 'var(--color-error)' }}>
        <p style={{ fontSize: 'var(--text-base)', marginBottom: '1rem' }}>Failed to load contribution details.</p>
        <button onClick={() => window.location.reload()} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const contribution = data.contribution;
  const currentVersion = contribution.currentVersion || contribution.versions?.[0] || {};
  const files = currentVersion.files || [];
  const links = {
    githubUrl: currentVersion.githubUrl,
    figmaUrl: currentVersion.figmaUrl,
    canvaUrl: currentVersion.canvaUrl,
    googleDriveUrl: currentVersion.googleDriveUrl,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back to Queue
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <VolunteerInfoCard volunteer={contribution.submittedBy} />
          <ContributionInfoCard contribution={contribution} />
          <ContributionFiles files={files} links={links} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ActivityTimeline currentStatus={contribution.status} reviews={data.reviews || []} />
          <ReviewHistory reviews={data.reviews || []} />
          <VersionHistory versions={contribution.versions || []} />
        </div>
      </div>

      {!hideReviewPanel && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <ReviewPanel contribution={contribution} onClose={onBack} />
        </div>
      )}
    </div>
  );
};

export default AdminContributionDetail;
