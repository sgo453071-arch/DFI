import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: 'Are you sure?',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // 'danger' | 'warning' | 'info'
    resolve: null,
  });

  const confirm = useCallback(({
    title = 'Are you sure?',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        resolve,
      });
    });
  }, []);

  const handleClose = (result) => {
    if (modalState.resolve) {
      modalState.resolve(result);
    }
    setModalState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const getIcon = () => {
    switch (modalState.type) {
      case 'warning':
        return <AlertTriangle size={24} style={{ color: '#D97706' }} />;
      case 'info':
        return <Info size={24} style={{ color: '#2563EB' }} />;
      case 'danger':
      default:
        return <Trash2 size={24} style={{ color: '#DC2626' }} />;
    }
  };

  const getIconBg = () => {
    switch (modalState.type) {
      case 'warning':
        return '#FEF3C7';
      case 'info':
        return '#EFF6FF';
      case 'danger':
      default:
        return '#FEF2F2';
    }
  };

  const getConfirmButtonStyles = () => {
    switch (modalState.type) {
      case 'warning':
        return { background: '#D97706', color: '#FFFFFF' };
      case 'info':
        return { background: '#2563EB', color: '#FFFFFF' };
      case 'danger':
      default:
        return { background: '#DC2626', color: '#FFFFFF' };
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {modalState.isOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(4px)',
              }}
            />

            {/* Modal Card Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 440,
                background: 'var(--color-card, #FFFFFF)',
                borderRadius: 16,
                padding: '1.75rem',
                border: '1px solid var(--color-border, #E2E8F0)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                zIndex: 10000,
              }}
            >
              {/* Close Icon Button */}
              <button
                onClick={() => handleClose(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-body, #64748B)',
                  padding: 4,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                }}
              >
                <X size={18} />
              </button>

              {/* Icon Header */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: getIconBg(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                {getIcon()}
              </div>

              {/* Content */}
              <h3
                style={{
                  fontSize: 'var(--text-lg, 1.125rem)',
                  fontWeight: 700,
                  color: 'var(--color-heading, #0F172A)',
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.3,
                }}
              >
                {modalState.title}
              </h3>
              <p
                style={{
                  fontSize: 'var(--text-base, 0.925rem)',
                  color: 'var(--color-body, #475569)',
                  margin: '0 0 1.5rem 0',
                  lineHeight: 1.55,
                }}
              >
                {modalState.message}
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  style={{
                    padding: '0.6rem 1.15rem',
                    borderRadius: 10,
                    border: '1px solid var(--color-border, #CBD5E1)',
                    background: 'var(--color-card, #FFFFFF)',
                    color: 'var(--color-heading, #334155)',
                    fontSize: 'var(--text-sm, 0.875rem)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {modalState.cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: 10,
                    border: 'none',
                    ...getConfirmButtonStyles(),
                    fontSize: 'var(--text-sm, 0.875rem)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {modalState.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
