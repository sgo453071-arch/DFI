import React from 'react';

const LoadingScreen = ({ message = 'Loading Disha for India...' }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg)',
      transition: 'var(--transition-normal)'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        {/* Pulsing Brand Logo */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 8px 30px rgba(11, 76, 163, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          animation: 'logoPulse 1.6s ease-in-out infinite'
        }}>
          <img
            src="/logo-nobg.png"
            alt="Disha For India Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>

      <p style={{
        color: 'var(--color-heading)',
        fontWeight: 500,
        animation: 'pulseText 2s ease-in-out infinite'
      }}>
        {message}
      </p>

      {/* Keyframe animations */}
      <style>{`
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 30px rgba(11, 76, 163, 0.18); }
          50% { transform: scale(1.12); box-shadow: 0 12px 40px rgba(37, 99, 235, 0.35); }
        }
        @keyframes pulseText {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
