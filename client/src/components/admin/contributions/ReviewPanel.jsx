import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import ApproveForm from './ApproveForm';
import RejectForm from './RejectForm';
import NeedsChangesForm from './NeedsChangesForm';
import FeatureToggle from './FeatureToggle';
import ArchiveModal from './ArchiveModal';
import { useReviewContribution, useFeatureContribution, useArchiveContribution } from '../../../hooks/useAdminContributions';

const ReviewPanel = ({ contribution, onClose }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const reviewMutation = useReviewContribution();
  const featureMutation = useFeatureContribution();
  const archiveMutation = useArchiveContribution();

  if (!contribution) return null;

  const handleReview = async (payload) => {
    try {
      await reviewMutation.mutateAsync({ id: contribution._id, payload });
      setActiveAction(null);
      onClose?.();
      toast.success('Review action completed');
    } catch (err) {
      toast.error(err?.message || 'Failed to complete review action');
    }
  };

  const handleFeature = async () => {
    try {
      await featureMutation.mutateAsync(contribution._id);
      onClose?.();
      toast.success(contribution.isFeatured ? 'Removed from featured' : 'Added to featured');
    } catch (err) {
      toast.error(err?.message || 'Failed to update featured status');
    }
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(contribution._id);
      setShowArchiveModal(false);
      onClose?.();
      toast.success('Contribution archived');
    } catch (err) {
      toast.error(err?.message || 'Failed to archive contribution');
    }
  };

  const isLoading = reviewMutation.isPending || featureMutation.isPending || archiveMutation.isPending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>Review Panel</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-body)', padding: '0.25rem', display: 'flex' }}>
          <X size={20} />
        </button>
      </div>

      {!activeAction && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setActiveAction('approve')}
            className="btn btn-primary"
            style={{ justifyContent: 'center' }}
            disabled={isLoading}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setActiveAction('needs_changes')}
            className="btn btn-secondary"
            style={{ justifyContent: 'center', color: 'var(--color-orange)', borderColor: 'var(--color-orange)' }}
            disabled={isLoading}
          >
            Request Changes
          </button>
          <button
            type="button"
            onClick={() => setActiveAction('reject')}
            className="btn btn-secondary"
            style={{ justifyContent: 'center', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            disabled={isLoading}
          >
            Reject
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <FeatureToggle
              isFeatured={contribution.isFeatured || false}
              onToggle={handleFeature}
              loading={featureMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowArchiveModal(true)}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', color: 'var(--color-body)' }}
              disabled={isLoading}
            >
              Archive
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeAction === 'approve' && (
          <ApproveForm onSubmit={handleReview} loading={reviewMutation.isPending} />
        )}
        {activeAction === 'reject' && (
          <RejectForm onSubmit={handleReview} loading={reviewMutation.isPending} />
        )}
        {activeAction === 'needs_changes' && (
          <NeedsChangesForm onSubmit={handleReview} loading={reviewMutation.isPending} />
        )}
      </AnimatePresence>

      <ArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchive}
        loading={archiveMutation.isPending}
      />
    </div>
  );
};

export default ReviewPanel;
