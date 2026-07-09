import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Show a message if session expired or Google Auth failed
  const expired = searchParams.get('expired');
  const errorParam = searchParams.get('error');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      const userRole = response?.user?.role?.toUpperCase();

      if (['ADMIN', 'SUPER_ADMIN', 'COORDINATOR'].includes(userRole)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend Google OAuth url
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/auth/google`;
  };

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto', padding: '1rem' }} className="animate-slide-up">
      <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--color-heading)', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-body)', fontSize: '0.9rem' }}>Sign in to continue your volunteer journey</p>
        </div>

        {expired && (
          <div style={{
            display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-accent)',
            borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 500
          }}>
            <AlertCircle size={16} />
            <span>Session expired. Please log in again.</span>
          </div>
        )}

        {errorParam && (
          <div style={{
            display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)',
            borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 500
          }}>
            <AlertCircle size={16} />
            <span>Authentication failed. Please try again.</span>
          </div>
        )}

        {localError && (
          <div style={{
            display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)',
            borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 500
          }}>
            <AlertCircle size={16} />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)' }}>
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="name@email.com"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Forgot Password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)' }}>
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', gap: '0.75rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-body)', fontWeight: 500 }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="btn btn-secondary"
          style={{ width: '100%', display: 'flex', gap: '0.5rem', border: '1px solid var(--color-border)', color: 'var(--color-heading)' }}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-body)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
