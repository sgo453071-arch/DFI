const { rateLimit } = require('express-rate-limit');

/**
 * Global API rate limiter.
 * 1000 requests per 15 minutes per IP — enough for active dashboard usage.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => {
    // Never rate-limit health checks
    return req.path === '/health' || req.path === '/api/v1/health';
  },
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Authentication rate limiter (login, register).
 * 100 requests per 15 minutes per IP.
 * Only failed requests count toward the limit.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Forgot password rate limiter.
 * 3 requests per hour per IP.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests from this IP. Please try again after 1 hour.',
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  forgotPasswordLimiter,
};
