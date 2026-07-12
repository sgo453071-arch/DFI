import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationCard from './NotificationCard';
import NotificationSkeleton from './NotificationSkeleton';
import NotificationEmptyState from './NotificationEmptyState';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: '100%', opacity: 0.8 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '100%', opacity: 0.8, transition: { duration: 0.2 } },
};

const NotificationDrawer = React.memo(({
  open,
  onClose,
  notifications = [],
  unreadCount = 0,
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onViewAll,
  error,
}) => {
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      closeButtonRef.current?.focus();
    } else {
      previousFocusRef.current?.focus?.();
    }
  }, [open]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const hasNotifications = useMemo(() => notifications?.length > 0, [notifications?.length]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15,23,42,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 190 }}
            aria-hidden="true"
          />

          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(420px, 100vw)',
              backgroundColor: 'var(--color-card)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-heading)' }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span style={{ color: 'var(--color-body)' }}>
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    title="Mark all as read"
                    aria-label="Mark all notifications as read"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '0.4rem 0.75rem',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-primary)',
                      cursor: 'pointer' }}
                  >
                    <CheckCheck size={14} aria-hidden="true" /> Read all
                  </button>
                )}
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  aria-label="Close notifications drawer"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-heading)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center' }}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} role="list" aria-label="Notifications list">
              {error && (
                <div style={{
                  padding: '1rem',
                  borderRadius: 10,
                  backgroundColor: '#FEE2E2',
                  color: '#991B1B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem' }} role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  {error}
                </div>
              )}

              {loading && <NotificationSkeleton count={5} compact />}

              {!loading && !error && !hasNotifications && (
                <NotificationEmptyState message="No notifications yet" description="You're all caught up!" />
              )}

              {!loading && notifications?.map((notification) => (
                <NotificationCard
                  key={notification._id || notification.id}
                  notification={notification}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                  onClick={() => {
                    onClose();
                    if (!notification.isRead) onMarkRead?.(notification._id);
                    if (notification.actionUrl) navigate(notification.actionUrl);
                  }}
                  compact
                />
              ))}
            </div>

            {hasNotifications && onViewAll && (
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={onViewAll}
                  aria-label="View all notifications"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '0.625rem',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    cursor: 'pointer' }}
                >
                  View All Notifications <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

NotificationDrawer.displayName = 'NotificationDrawer';

export default NotificationDrawer;

