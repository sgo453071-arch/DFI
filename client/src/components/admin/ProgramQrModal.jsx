import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { generateQrToken } from '../../services/programsService';

const ProgramQrModal = ({ isOpen, onClose, programId, programTitle }) => {
  const [qrType, setQrType] = useState('checkin');
  const [qrCodeDataUri, setQrCodeDataUri] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('');

  const fetchToken = useCallback(async (type) => {
    if (!programId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateQrToken(programId, type);
      if (res?.success && res.data) {
        setQrCodeDataUri(res.data.qrCodeDataUri);
        setExpiresIn(res.data.expiresIn || 30);
        setMethod(res.data.verificationMethod || 'static');
      } else {
        throw new Error(res?.message || 'Failed to generate QR token');
      }
    } catch (err) {
      console.error('[ProgramQrModal] Error fetching QR:', err);
      setError(err?.message || 'Failed to load QR code');
      toast.error('Failed to generate attendance QR code');
    } finally {
      setLoading(false);
    }
  }, [programId]);

  // Fetch token when modal opens or tab changes
  useEffect(() => {
    if (isOpen && programId) {
      fetchToken(qrType);
    }
  }, [isOpen, qrType, programId, fetchToken]);

  // Countdown timer and auto-refresh
  useEffect(() => {
    if (!isOpen || expiresIn <= 0 || loading) return;

    const timer = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger a silent reload of the token
          fetchToken(qrType);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, expiresIn, qrType, loading, fetchToken]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div 
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode className="text-primary" size={20} />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-heading)', margin: 0 }}>
                Attendance QR Code
              </h3>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-body)', opacity: 0.7, padding: '0.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)', margin: '0 0 1.25rem' }}>
              {programTitle}
            </h4>

            {/* Toggle Tabs */}
            <div 
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                background: 'var(--color-bg)', padding: '0.25rem',
                borderRadius: 10, border: '1px solid var(--color-border)',
                marginBottom: '1.5rem',
              }}
            >
              <button
                onClick={() => setQrType('checkin')}
                disabled={loading}
                style={{
                  padding: '0.5rem', borderRadius: 8, border: 'none',
                  fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                  background: qrType === 'checkin' ? 'var(--color-card)' : 'transparent',
                  color: qrType === 'checkin' ? 'var(--color-primary)' : 'var(--color-body)',
                  boxShadow: qrType === 'checkin' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Check-In QR
              </button>
              <button
                onClick={() => setQrType('checkout')}
                disabled={loading}
                style={{
                  padding: '0.5rem', borderRadius: 8, border: 'none',
                  fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                  background: qrType === 'checkout' ? 'var(--color-card)' : 'transparent',
                  color: qrType === 'checkout' ? 'var(--color-primary)' : 'var(--color-body)',
                  boxShadow: qrType === 'checkout' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Check-Out QR
              </button>
            </div>

            {/* QR display screen */}
            <div 
              style={{
                width: 240, height: 240, margin: '0 auto 1.5rem',
                background: 'var(--color-bg)', borderRadius: 16,
                border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              {loading && !qrCodeDataUri ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw className="animate-spin text-primary" size={24} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-body)' }}>Generating...</span>
                </div>
              ) : error ? (
                <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', padding: '1rem' }}>
                  {error}
                </div>
              ) : qrCodeDataUri ? (
                <img 
                  src={qrCodeDataUri} 
                  alt="Attendance Code"
                  style={{
                    width: 220, height: 220, objectFit: 'contain',
                    filter: loading ? 'blur(2px) grayscale(50%)' : 'none',
                    transition: 'filter 0.2s ease',
                  }} 
                />
              ) : (
                <HelpCircle size={32} style={{ opacity: 0.3 }} />
              )}
            </div>

            {/* Rotation Countdown Bar */}
            {qrCodeDataUri && !error && (
              <div style={{ marginBottom: '1rem' }}>
                <div 
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    color: 'var(--color-body)', marginBottom: '0.4rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={12} className="text-success" />
                    {method === 'qr_and_gps' ? 'Dynamic Geofenced Token' : 'Static Token'}
                  </span>
                  <span>
                    Rotates in {expiresIn}s
                  </span>
                </div>
                <div 
                  style={{
                    width: '100%', height: 4, background: 'var(--color-bg)',
                    borderRadius: 99, overflow: 'hidden',
                  }}
                >
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(expiresIn / 30) * 100}%` }}
                    transition={{ ease: 'linear', duration: 1 }}
                    key={expiresIn}
                    style={{
                      height: '100%',
                      background: expiresIn > 10 ? 'var(--color-primary)' : 'var(--color-error)',
                    }}
                  />
                </div>
              </div>
            )}

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-body)', margin: 0, lineHeight: 1.5 }}>
              Instruct volunteers to scan this QR code using their checked-in session screen on the app.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProgramQrModal;
