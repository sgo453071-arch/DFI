import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Save, Loader2, Key, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

// Reusable toggle switch component
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    style={{
      position: 'relative',
      display: 'inline-flex',
      height: '24px',
      width: '44px',
      flexShrink: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      borderRadius: '9999px',
      border: '2px solid transparent',
      transition: 'background-color 200ms ease-in-out',
      backgroundColor: checked ? 'var(--color-primary)' : '#E5E7EB',
      outline: 'none',
      opacity: disabled ? 0.6 : 1
    }}
  >
    <span
      style={{
        pointerEvents: 'none',
        display: 'inline-block',
        height: '20px',
        width: '20px',
        transform: checked ? 'translateX(20px)' : 'translateX(0)',
        borderRadius: '9999px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'transform 200ms ease-in-out'
      }}
    />
  </button>
);

const MyProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [isSaving, setIsSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);

  // Global Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      dashboardNotifs: user?.notificationPreferences?.platformNotifications ?? true
    }
  });

  const dashboardNotifs = watch('dashboardNotifs');
  const newPassword = watch('newPassword');
  const currentPassword = watch('currentPassword');

  // Handlers
  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setPhotoUploading(true);
      const formData = new FormData();
      formData.append('profilePhoto', file);

      await api.patch('/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await refreshUser();
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      let requiresRefresh = false;

      // 1. Process Password Update if fields are filled
      if (data.newPassword) {
        if (!data.currentPassword) {
          throw new Error('Current password is required to change password.');
        }
        
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: data.currentPassword,
        });

        if (signInError) {
          throw new Error('Current password is incorrect');
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: data.newPassword
        });

        if (updateError) throw updateError;
        toast.success('Password updated successfully');
        
        // Clear password fields after success
        setValue('currentPassword', '');
        setValue('newPassword', '');
        setValue('confirmPassword', '');
      }

      // 2. Process Profile & Notifications Update
      const profilePayload = {
        name: data.name,
        phone: data.phone,
        notificationPreferences: {
          ...user?.notificationPreferences,
          platformNotifications: data.dashboardNotifs
        }
      };

      await api.put('/users/me', profilePayload);
      requiresRefresh = true;

      if (requiresRefresh) {
        await refreshUser();
        toast.success('Settings saved successfully');
        
        // Reset form dirty state with new values
        reset({
          name: data.name,
          phone: data.phone,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          dashboardNotifs: data.dashboardNotifs
        });
      }

    } catch (error) {
      toast.error(error.message || error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    navigate(-1); // Or back to dashboard
  };

  return (
    <div style={{ padding: '0.5rem 0 3rem' }}>
      
      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 className="page-title" style={{ color: 'var(--color-heading)', margin: 0 }}>
              My Profile
            </h1>
            <p className="page-description" style={{ color: 'var(--color-body)', margin: '0.3rem 0 0' }}>
              View and manage your personal information and account settings.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
        
        {/* 1. Profile Information Card */}
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)', borderColor: 'var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', margin: 0, fontWeight: '700', color: 'var(--color-heading)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '2.5rem' }}>
            Profile Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="form-control"
                  placeholder="John Doe"
                />
                {errors.name && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', display: 'block' }}>{errors.name.message}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  {...register('phone')}
                  className="form-control"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="form-control"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--color-body)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      width: '72px', 
                      height: '72px', 
                      borderRadius: 'var(--radius-lg)', 
                      overflow: 'hidden', 
                      backgroundColor: 'var(--color-primary)', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 'var(--text-3xl)', 
                      fontWeight: 'bold', 
                      boxShadow: 'var(--shadow-md)' 
                    }}>
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user?.name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photoUploading}
                      style={{
                        position: 'absolute',
                        bottom: '-6px',
                        right: '-6px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-body)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-body)'}
                    >
                      {photoUploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={14} />}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)', margin: 0, lineHeight: 1.4 }}>
                      Upload a new avatar.<br/>PNG, JPG or WebP (max 5MB).
                    </p>
                  </div>
                </div>
              </div>
            </div>               placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Change Password Card */}
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)', borderColor: 'var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', margin: 0, fontWeight: '700', color: 'var(--color-heading)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '2.5rem' }}>
            Change Password
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  {...register('currentPassword', { 
                    required: newPassword ? 'Current password is required to set a new password' : false 
                  })}
                  className="form-control"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                />
                <Key size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)' }} />
              </div>
              {errors.currentPassword && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', display: 'block' }}>{errors.currentPassword.message}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  {...register('newPassword', {
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    required: currentPassword ? 'New password is required if changing password' : false
                  })}
                  className="form-control"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                />
                <Key size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)' }} />
              </div>
              {errors.newPassword && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', display: 'block' }}>{errors.newPassword.message}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  {...register('confirmPassword', { 
                    validate: value => {
                      if (newPassword && value !== newPassword) return 'Passwords do not match';
                      if (newPassword && !value) return 'Please confirm your new password';
                      return true;
                    }
                  })}
                  className="form-control"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                />
                <Key size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)' }} />
              </div>
              {errors.confirmPassword && <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', display: 'block' }}>{errors.confirmPassword.message}</span>}
            </div>
          </div>
        </div>

        {/* 3. Dashboard Notifications Card */}
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)', borderColor: 'var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', margin: 0, fontWeight: '700', color: 'var(--color-heading)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '2.5rem' }}>
            Dashboard Notifications
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '500', color: 'var(--color-heading)', margin: 0 }}>
                Receive dashboard notifications
              </h4>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-body)', margin: '0.35rem 0 0 0', maxWidth: '32rem' }}>
                Show a badge on the bell icon when you have new messages, announcements, or updates.
              </p>
            </div>
            <div style={{ marginLeft: '1.5rem', flexShrink: 0 }}>
              <Toggle 
                checked={dashboardNotifs} 
                onChange={(val) => setValue('dashboardNotifs', val, { shouldDirty: true })} 
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start', paddingTop: '1rem' }}>
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className="btn btn-primary"
            style={{ opacity: (!isDirty || isSaving) ? 0.6 : 1, cursor: (!isDirty || isSaving) ? 'not-allowed' : 'pointer' }}
          >
            {isSaving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
            Save Changes
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="btn btn-secondary"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-heading)' }}
          >
            <X size={18} />
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default MyProfile;
