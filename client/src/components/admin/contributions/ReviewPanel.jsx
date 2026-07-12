import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowLeft, CheckCircle, XCircle, AlertCircle, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import ApproveForm from './ApproveForm';
import RejectForm from './RejectForm';
import NeedsChangesForm from './NeedsChangesForm';
import FeatureToggle from './FeatureToggle';
import ArchiveModal from './ArchiveModal';
import { useReviewContribution, useFeatureContribution, useArchiveContribution } from '../../../hooks/useAdminContributions';

const ReviewPanel = ({ contribution, onClose, onReviewed }) => {
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
      toast.success('Review submitted successfully');
      // onReviewed instantly removes the item from the queue (optimistic update)
      if (onReviewed) {
        onReviewed(contribution._id);
      } else {
        onClose?.();
      }
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
    <div style={{ padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeAction && (
            <button onClick={() => setActiveAction(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          {activeAction === 'approve' ? 'Approve Contribution' : 
           activeAction === 'reject' ? 'Reject Contribution' : 
           activeAction === 'needs_changes' ? 'Request Changes' : 'Admin Actions'}
        </h3>
      </div>

      {!activeAction && (
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => setActiveAction('approve')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <CheckCircle size={18} /> Approve
          </button>
          
          <button
            type="button"
            onClick={() => setActiveAction('needs_changes')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <AlertCircle size={18} /> Request Changes
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('reject')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <XCircle size={18} /> Reject
          </button>

          <div className="flex gap-3 mt-2">
            <div className="flex-1">
              <FeatureToggle
                isFeatured={contribution.isFeatured || false}
                onToggle={handleFeature}
                loading={featureMutation.isPending}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowArchiveModal(true)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <Archive size={16} /> Archive
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeAction === 'approve' && (
          <motion.div key="approve" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <ApproveForm onSubmit={handleReview} loading={reviewMutation.isPending} />
          </motion.div>
        )}
        {activeAction === 'reject' && (
          <motion.div key="reject" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <RejectForm onSubmit={handleReview} loading={reviewMutation.isPending} />
          </motion.div>
        )}
        {activeAction === 'needs_changes' && (
          <motion.div key="needs_changes" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <NeedsChangesForm onSubmit={handleReview} loading={reviewMutation.isPending} />
          </motion.div>
      <AnimatePresence>
        {activeAction && (
          <div
            className="modal-backdrop"
            onClick={() => setActiveAction(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal"
              style={{
                background: 'var(--color-card)',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                width: '95%',
                maxWidth: '520px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-2xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25))',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                  {activeAction === 'approve' && 'Approve Contribution'}
                  {activeAction === 'reject' && 'Reject Contribution'}
                  {activeAction === 'needs_changes' && 'Request Changes'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-body)',
                    padding: '0.25rem',
                    display: 'flex',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {activeAction === 'approve' && (
                <ApproveForm onSubmit={handleReview} loading={reviewMutation.isPending} />
              )}
              {activeAction === 'reject' && (
                <RejectForm onSubmit={handleReview} loading={reviewMutation.isPending} />
              )}
              {activeAction === 'needs_changes' && (
                <NeedsChangesForm onSubmit={handleReview} loading={reviewMutation.isPending} />
              )}
            </motion.div>
          </div>
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
