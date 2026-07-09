import React from 'react';
import { GraduationCap, Users, Target } from 'lucide-react';

const AuthLeftColumn = () => {
  return (
    <div className="auth-left-section">
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <img src="/icons.svg" alt="Disha For India Logo" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0B3B91', letterSpacing: '-0.02em' }}>
            DISHA For India
          </span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2, color: '#24344D' }}>
          Empowering India's Youth Through <span style={{ color: '#0B3B91' }}>Skills</span>, Education and <span style={{ color: '#0B3B91' }}>Opportunities</span>
        </h1>
        
        <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.5, marginBottom: '2rem' }}>
          Building brighter futures through mentorship, learning programs, and meaningful opportunities.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(11, 59, 145, 0.05)', flexShrink: 0 }}>
              <GraduationCap size={20} color="#0B3B91" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#24344D', marginBottom: '0.15rem' }}>Student Growth Programs</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.4 }}>Access learning opportunities, mentorship, and skill development programs.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(11, 59, 145, 0.05)', flexShrink: 0 }}>
              <Users size={20} color="#0B3B91" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#24344D', marginBottom: '0.15rem' }}>Community & Mentorship</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.4 }}>Connect with mentors and a supportive learning community.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(11, 59, 145, 0.05)', flexShrink: 0 }}>
              <Target size={20} color="#0B3B91" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#24344D', marginBottom: '0.15rem' }}>Career Opportunities</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.4 }}>Discover opportunities that help students build successful futures.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthLeftColumn;
