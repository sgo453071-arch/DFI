import SimpleLoader from './common/SimpleLoader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardTransition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleComplete = () => {
    // Navigate based on role
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'COORDINATOR'];
    if (adminRoles.includes(user?.role?.toUpperCase())) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#ffffff', zIndex: 9999 }}>
      <SimpleLoader onReveal={() => { }} onComplete={handleComplete} />
    </div>
  );
};

export default DashboardTransition;
