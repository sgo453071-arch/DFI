/**
 * api.js — Axios instance with sliding-session token management.
 *
 * Architecture:
 *  • Access token (15 min)  — stored in localStorage, attached as Bearer header.
 *  • Refresh token (30 day) — stored in HttpOnly cookie, never touched by JS.
 *
 * Sliding session behaviour:
 *  Every time a 401 is received the interceptor silently calls /auth/refresh-token.
 *  The server validates the cookie, issues a new access token AND a new 30-day
 *  refresh cookie (token rotation), so active users never get logged out.
 *
 * Loop-break guarantee:
 *  A Set of "permanently failed" refresh attempts is kept. If /refresh-token itself
 *  returns a 401/403, or if the refresh attempt throws for any reason, we immediately:
 *    1. Clear localStorage token
 *    2. Drain the failedQueue with an error
 *    3. Dispatch the custom 'auth-expired' event — AuthContext redirects to /login
 *  No further retries are ever attempted for that session.
 */

import axios from 'axios';
import { logMalformedResponse } from './loggingService';

// ─── Base URL ────────────────────────────────────────────────────────────────
// .env      → VITE_API_URL=http://localhost:5000/api/v1   (local dev)
// .env.production → VITE_API_URL=https://dfi-production-38a9.up.railway.app/api/v1
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://dfi-production-38a9.up.railway.app/api/v1';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // required so the HttpOnly refresh-token cookie is sent
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

const clearSession = () => {
  localStorage.removeItem('authToken');
  delete api.defaults.headers.common['Authorization'];
};

const redirectToLogin = () => {
  // Only fire once per navigation; ignore if we're already on auth pages
  const onAuthPage =
    window.location.pathname === '/login' ||
    window.location.pathname === '/';
  if (!onAuthPage) {
    window.dispatchEvent(new CustomEvent('auth-expired'));
  }
};

// ─── Request interceptor ──────────────────────────────────────────────────────
// Attach the stored Bearer token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Refresh-token queue ──────────────────────────────────────────────────────
// While one refresh is in-flight, all other 401'd requests queue here and
// resolve / reject once the refresh resolves / fails.
let isRefreshing = false;
let failedQueue   = [];

const drainQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  // Success path — unwrap the Axios envelope so callers receive the body directly
  (response) => response.data,

  // Error path
  async (error) => {
    const originalRequest = error.config;
    const status          = error.response?.status;

    // ── 1. Any endpoint that is part of the auth flow must NEVER trigger a
    //       refresh attempt — doing so causes the infinite loop.
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login')       ||
      originalRequest?.url?.includes('/auth/register')    ||
      originalRequest?.url?.includes('/auth/refresh-token') ||
      originalRequest?.url?.includes('/auth/logout');

    if (status === 401 && isAuthEndpoint) {
      // Refresh token itself returned 401 — session is truly dead.
      clearSession();
      drainQueue(error);
      redirectToLogin();
      return Promise.reject(buildError(error));
    }

    // ── 2. For every OTHER 401, attempt a silent token refresh exactly once.
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // mark so we never retry this request again

      // If a refresh is already in-flight, queue this request to retry later.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // ── 3. Start a fresh refresh attempt.
      isRefreshing = true;

      try {
        // Use a bare axios call so this request is NOT intercepted again,
        // avoiding any chance of a recursive loop.
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        // Server wraps the response: { success, message, data: { token } }
        const newToken =
          refreshResponse.data?.data?.token ||
          refreshResponse.data?.token;

        if (!newToken) throw new Error('No access token returned from refresh');

        // Persist and propagate the new token
        setAuthToken(newToken);
        drainQueue(null, newToken);

        // Retry the original request with the fresh token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // ── 4. Refresh failed — break the loop, clear session, redirect.
        clearSession();
        drainQueue(refreshError);
        logMalformedResponse({
          endpoint: originalRequest?.url,
          status,
          refreshError: refreshError?.message,
        });
        redirectToLogin();
        return Promise.reject(buildError(refreshError));

      } finally {
        isRefreshing = false;
      }
    }

    // ── 5. All other errors (400, 403, 404, 500…) — normalise and reject.
    return Promise.reject(buildError(error));
  },
);

/**
 * Normalise any error (Axios error, plain Error, or custom object) into a
 * consistent shape that the rest of the app can rely on.
 */
function buildError(error) {
  // Already a normalised object from a previous pass
  if (error?.message && !error?.isAxiosError && !error?.response) return error;

  const message =
    error?.response?.data?.message ||
    error?.message               ||
    'Something went wrong. Please try again.';

  return {
    message,
    status:        error?.response?.status,
    data:          error?.response?.data,
    originalError: error,
  };
}

export default api;
