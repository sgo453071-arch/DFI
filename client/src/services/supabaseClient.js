/**
 * supabaseClient.js — Browser-side Supabase client.
 *
 * Uses the ANON (public) key — safe to expose in the browser.
 * NEVER use the service role key here.
 *
 * Responsibilities on the frontend:
 *  - supabase.auth.signInWithPassword()   → login
 *  - supabase.auth.signUp()               → register
 *  - supabase.auth.signOut()              → logout (clears local session)
 *  - supabase.auth.getSession()           → restore session on page load
 *  - supabase.auth.onAuthStateChange()    → react to token refresh / logout
 *  - supabase.auth.signInWithOAuth()      → Google OAuth
 *  - supabase.auth.resetPasswordForEmail()→ forgot password
 *
 * Session storage: Supabase stores the session in localStorage by default,
 * so the access token survives page reloads and the SDK auto-refreshes it
 * before expiry — no manual refresh-token logic needed on the client.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[supabaseClient] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. ' +
    'Copy them from your Supabase project settings → API → Project API keys (anon/public).'
  );
}

// ── One-time Session Guard to prevent Cross-Domain Overwrites ─────────────────
// When users navigate from the Public Website to the Dashboard, the Public Website
// passes its session via the URL hash (#access_token=...). 
// Supabase's `detectSessionInUrl: true` unconditionally parses this and overwrites 
// the Dashboard's localStorage. This causes Admins to be unexpectedly downgraded 
// to Volunteers.
// We intercept the hash here and hide it from Supabase if an active session already exists,
// UNLESS we are explicitly on an OAuth / Recovery route.
if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
  try {
    const isAuthRoute = 
      window.location.pathname.includes('/login') || 
      window.location.pathname.includes('/register') || 
      window.location.pathname.includes('/reset-password');
      
    const existingSessionStr = localStorage.getItem('dfi_session');
    
    if (!isAuthRoute && existingSessionStr) {
      // Hide the incoming session hash so Supabase uses the existing localStorage session
      const originalHash = window.location.hash;
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      window.__crossDomainHash = originalHash;
      console.log('[Auth Guard] Prevented cross-domain session overwrite. Preserved existing session.');
    }
  } catch (err) {
    console.error('[Auth Guard] Error evaluating session guard:', err);
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,          // keep session across page reloads
    autoRefreshToken:   true,          // SDK refreshes access token automatically
    detectSessionInUrl: true,          // pick up OAuth redirect tokens from URL hash
    storageKey:         'dfi_session', // namespace so multiple Supabase apps don't clash
  },
});

export default supabase;
