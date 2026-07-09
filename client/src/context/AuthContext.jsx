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

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Prevent concurrent /auth/me calls during the Supabase session restore
  const profileFetchRef = useRef(false);

  /* ── Load our backend profile given a Supabase session ──────────── */
  const loadProfile = useCallback(async (session) => {
    if (!session?.access_token) {
      setUser(null);
      return;
    }
    try {
      // api.js will pick the token up from supabase.auth.getSession() automatically,
      // but we also set it explicitly so it's available before the first getSession call
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;

      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  /* ── Bootstrap: restore session on page load ─────────────────────── */
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (profileFetchRef.current) return;
      profileFetchRef.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        await loadProfile(session);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
        profileFetchRef.current = false;
      }
    };

    bootstrap();

    // Subscribe to auth state changes (token refresh, sign-out, OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
          return;
        }

        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          await loadProfile(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  /* ── Login ───────────────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      // Delegate to Supabase — session is automatically persisted to localStorage
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email, password,
      });

      if (sbError) throw new Error(sbError.message || 'Invalid email or password');

      const { session } = data;
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;

      // Fetch backend profile (has role, username, volunteerId, etc.)
      const res = await api.get('/auth/me');
      if (!res.success || !res.data?.user) throw new Error('Failed to load user profile');

      const loggedInUser = res.data.user;
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Register ────────────────────────────────────────────────────── */
  const register = useCallback(async (userData) => {
    setError(null);
    setLoading(true);
    try {
      // Create Supabase auth user + backend profile via our API
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
      // Best-effort server-side revocation
      await api.post('/auth/logout').catch(() => {});
      // Client-side: clear Supabase session from localStorage
      await supabase.auth.signOut();
    } finally {
      setUser(null);
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
        if (res.success && res.data?.user) setUser(res.data.user);
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
