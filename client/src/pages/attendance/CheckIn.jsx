import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useVolunteer } from '../../context/VolunteerContext';
import CheckInButton from '../../components/volunteer/CheckInButton';

const CheckIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProgramId = searchParams.get('program');
  
  const { joinedPrograms, joinedProgramsLoading, fetchJoinedPrograms, performCheckIn, checkInStatus } = useVolunteer();
  const [selectedProgram, setSelectedProgram] = useState(preselectedProgramId || '');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (joinedPrograms.length === 0 && !joinedProgramsLoading) {
      fetchJoinedPrograms();
    }
  }, [joinedPrograms, joinedProgramsLoading, fetchJoinedPrograms]);

  useEffect(() => {
    if (checkInStatus.checkedIn) {
      navigate('/attendance/checkout', { replace: true });
    }
  }, [checkInStatus.checkedIn, navigate]);

  const activePrograms = joinedPrograms.filter(p => p.status === 'active');

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.error("Location error:", err);
          setError("Failed to get location. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleCheckIn = async () => {
    if (!selectedProgram) {
      setError("Please select a program");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await performCheckIn(selectedProgram);
      // Navigation is handled by the useEffect watching checkInStatus
    } catch (err) {
      setError(err.message || 'Failed to check in');
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/attendance')} 
          className="btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, backgroundColor: 'transparent', color: 'var(--color-body)' }}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card glow-card"
        style={{ width: '100%', maxWidth: '600px', padding: '3rem 2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Session Check-In</h1>
          <p style={{ color: 'var(--color-body)' }}>Select your program and confirm your location to begin.</p>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="form-group">
            <label className="form-label" >Select Program</label>
            <select 
              className="form-control" 
              style={{ padding: '1rem' }}
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">-- Choose an active program --</option>
              {activePrograms.map(p => (
                <option key={p.id || p._id} value={p.applicationId || p.id}>{p.programTitle}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" >Location Verification</label>
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: 'var(--color-bg)', 
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {location ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-success)' }}>
                  <CheckCircle2 size={24} /> Location Verified
                </div>
              ) : (
                <>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={24} />
                  </div>
                  <button onClick={handleGetLocation} className="btn btn-secondary">
                    Verify My Location
                  </button>
                  <span style={{ color: 'var(--color-body)' }}>Required for attendance tracking</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CheckInButton 
            onCheckIn={handleCheckIn}
            disabled={!selectedProgram || !location}
            loading={loading}
          />
        </div>

      </motion.div>
    </div>
  );
};

export default CheckIn;
