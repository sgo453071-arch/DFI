import React from 'react';
import { User, Mail, Briefcase, Calendar } from 'lucide-react';

const VolunteerInfoCard = ({ volunteer }) => {
  if (!volunteer) return null;

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <User size={18} /> Volunteer Information
      </h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
          {(volunteer.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-heading)' }}>{volunteer.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-body)' }}>{volunteer.role?.replace(/_/g, ' ')}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {volunteer.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-body)' }}>
            <Mail size={16} /> {volunteer.email}
          </div>
        )}
        {volunteer.createdAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-body)' }}>
            <Calendar size={16} /> Joined {new Date(volunteer.createdAt).toLocaleDateString('en-IN')}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerInfoCard;
