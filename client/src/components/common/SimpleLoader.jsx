import React from 'react';
import { motion } from 'framer-motion';

const SimpleLoader = ({ text = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        width: '100%',
        minHeight: '200px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          boxShadow: '0 4px 18px rgba(11, 76, 163, 0.14)',
          marginBottom: '1rem',
          margin: '0 auto 1rem auto',
          padding: '6px',
        }}
      >
        <img
          src="/logo-nobg.png"
          alt="Disha For India"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }}
        />
      </motion.div>
      {text && (
        <span
          style={{
            color: 'var(--color-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            letterSpacing: '0.01em',
            textAlign: 'center',
            display: 'block',
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default SimpleLoader;
