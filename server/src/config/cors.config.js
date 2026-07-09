const ALLOWED_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
];

const ALLOWED_HEADERS = [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'Authorization',
  'Cache-Control',
];

/**
 * Production-ready CORS Configuration
 *
 * Supports:
 * - Local React (Vite)
 * - Local React (CRA)
 * - Render Frontend
 * - Future Production Frontend
 */
const getCorsConfig = () => {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://app-disha-for-indiaa.vercel.app',
  ];

  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : [];

  const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

  return {
    origin(origin, callback) {
      // Allow Postman, curl, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Check if the origin matches directly, or is a Vercel deployment, or custom domain
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        /\.vercel\.app$/.test(origin) ||
        origin.endsWith('.dishaforindia.org') ||
        /\.dishaforindia\.org$/.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }

      // eslint-disable-next-line no-console
      console.error(`❌ CORS Blocked Origin: ${origin}`);

      return callback(
        new Error(`CORS policy: origin '${origin}' is not allowed.`),
        false
      );
    },

    credentials: true,

    methods: ALLOWED_METHODS,

    allowedHeaders: ALLOWED_HEADERS,

    exposedHeaders: [
      'Content-Length',
      'X-Request-Id',
      'Set-Cookie',
    ],

    optionsSuccessStatus: 200,

    preflightContinue: false,
  };
};

module.exports = getCorsConfig;
