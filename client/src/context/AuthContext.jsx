/**
 * AuthContext.jsx — Authentication state powered by Supabase Auth.
 *
 * Public API is unchanged so every consumer (Login.jsx, Register.jsx,
 * ProtectedRoute, DashboardLayout, etc.) continues to work without edits:
 *
 *   const { user, loading, error, login, register, logout, refreshUser } = useAuth();
 *
 * How it works:
 *  1. On mount, supabase.auth.getSession() restores any existing session.
 *  2. supabase.auth.onAuthStateChange() keeps the context in sync whenever
 *     the SDK silently refreshes the access token or the user signs out.
 *  3. login/register/logout delegate to Supabase, then sync the profile
 *     from our backend (/auth/me) so `user` always has role, username, etc.
 *  4. api.js reads the Supabase access token from the SDK on every request
 *     instead of localStorage — no manual token management needed.
 */

import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from 'react';
import { supabase } from '../services/supabaseClient';
import api          from '../services/api';

// ── One-time migration cleanup ────────────────────────────────────────────────
// Remove the old 'authToken' key written by the previous custom-JWT system.
// Leaving it in localStorage causes stale tokens to be attached to requests.
try {
  if (localStorage.getItem('authToken')) {
    localStorage.removeItem('authToken');
  }
} catch { /* localStorage unavailable in SSR / private browsing */ }

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  if (user.role && (user.role.toLowerCase() === 'superadmin' || user.role.toLowerCase() === 'super_admin')) {
    return { ...user, role: 'super_admin' };
  }
  return user;
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Prevent concurrent /auth/me calls
  const profileFetchRef   = useRef(false);
  // Flag set by login() so onAuthStateChange SIGNED_IN skips the duplicate /auth/me call
  const justLoggedInRef   = useRef(false);

  /* ── Load our backend profile given a Supabase session ──────────── */
  const loadProfile = useCallback(async (session) => {
    if (!session?.access_token) {
      setUser(null);
      try { localStorage.removeItem('dfi_user_profile'); } catch {}
      return;
    }

    let cachedUser = null;
    try {
      const stored = localStorage.getItem('dfi_user_profile');
      if (stored) cachedUser = JSON.parse(stored);
    } catch {}

    if (cachedUser) {
      setUser(normalizeUser(cachedUser));
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;

      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        const norm = normalizeUser(res.data.user);
        setUser(norm);
        try { localStorage.setItem('dfi_user_profile', JSON.stringify(norm)); } catch {}
      } else if (!cachedUser) {
        setUser(null);
      }
    } catch {
      if (!cachedUser && session.user) {
        const fallbackRole = session.user.user_metadata?.role || session.user.app_metadata?.role || 'volunteer';
        const fallback = normalizeUser({
          id: session.user.id,
          email: session.user.email,
          role: fallbackRole,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        });
        setUser(fallback);
      }
    }
  }, []);

  /* ── Bootstrap: restore session on page load ─────────────────────── */
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const isSupabaseToken = session.access_token?.split('.').length === 3 &&
            (() => {
              try {
                const payload = JSON.parse(atob(session.access_token.split('.')[1]));
                return payload.iss?.includes('supabase') || payload.aud === 'authenticated';
              } catch { return false; }
            })();

          if (!isSupabaseToken) {
            await supabase.auth.signOut();
            try { localStorage.removeItem('dfi_user_profile'); } catch {}
            if (mounted) setLoading(false);
            return;
          }
        }

        if (!mounted) return;
        await loadProfile(session);
      } catch {
        // Keep cached user if session bootstrap errors
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          try { localStorage.removeItem('dfi_user_profile'); } catch {}
          delete api.defaults.headers.common['Authorization'];
          return;
        }

        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          if (event === 'SIGNED_IN' && justLoggedInRef.current) {
            justLoggedInRef.current = false;
            return;
          }
          await loadProfile(session);
        }
      }
    );

    const handleAuthExpired = async () => {
      setUser(null);
      try { localStorage.removeItem('dfi_user_profile'); } catch {}
      delete api.defaults.headers.common['Authorization'];
      await supabase.auth.signOut().catch(() => {});
    };
    window.addEventListener('auth-expired', handleAuthExpired);

    return () => {
      mounted = false;
      window.removeEventListener('auth-expired', handleAuthExpired);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  /* ── Login ───────────────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email, password,
      });

      if (sbError) throw new Error(sbError.message || 'Invalid email or password');

      const { session } = data;
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;

      justLoggedInRef.current = true;

      let backendUser = null;
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data?.user) {
          backendUser = normalizeUser(res.data.user);
        }
      } catch (err) {
        console.error('[AuthContext] login profile fetch error:', err);
      }

      if (!backendUser) {
        let optimisticRole = 'VOLUNTEER';
        let optimisticName = 'Volunteer';
        
        try {
          if (session.access_token) {
            const payload = JSON.parse(atob(session.access_token.split('.')[1]));
            if (payload.user_metadata?.role) optimisticRole = payload.user_metadata.role;
            if (payload.user_metadata?.full_name) optimisticName = payload.user_metadata.full_name;
          }
        } catch (e) {}

        backendUser = normalizeUser({ 
          id: session.user.id, 
          email: session.user.email,
          role: optimisticRole,
          name: optimisticName
        });
      }

      setUser(backendUser);
      try { localStorage.setItem('dfi_user_profile', JSON.stringify(backendUser)); } catch {}
      setLoading(false);

      return { success: true, user: backendUser };
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  /* ── Register ────────────────────────────────────────────────────── */
  const register = useCallback(async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      if (!res.success) throw new Error(res.message || 'Registration failed');
      return { success: true, user: res.data?.user };
    } catch (err) {
      const msg = err.message || 'Could not complete registration';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Logout ──────────────────────────────────────────────────────── */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout').catch(() => {});
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      try { localStorage.removeItem('dfi_user_profile'); } catch {}
      delete api.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, []);

  /* ── Refresh profile from backend (e.g. after profile update) ────── */
  const refreshUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        const res = await api.get('/auth/me');
        if (res.success && res.data?.user) setUser(normalizeUser(res.data.user));
      }
    } catch (err) {
      console.error('[AuthContext] refreshUser error:', err);
    }
  }, []);

  /* ── checkAuth (legacy compat — called by some pages) ───────────── */
  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await loadProfile(session);
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      refreshUser,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
