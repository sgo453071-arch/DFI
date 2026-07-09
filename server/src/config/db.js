/**
 * db.js — Database connection via the mongoose-compat layer.
 *
 * The mongoose-compat package translates Mongoose-style API calls into
 * raw PostgreSQL queries against Supabase (or any PostgreSQL database).
 *
 * Connection priority:
 *  1. DATABASE_URL   — direct pg connection string (Railway / Supabase pooler)
 *  2. SUPABASE_URL + SUPABASE_KEY — Supabase HTTP REST client (fallback)
 *
 * No MongoDB. No mongoose.connect(). The compat layer owns the connection.
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS to avoid resolution issues on Railway

const mongoose     = require('mongoose');          // this is the mongoose-compat package
const { runSeeders } = require('../database/seeders');

const connectDB = async () => {
  try {
    // mongoose-compat's connect() inspects DATABASE_URL / SUPABASE_URL itself
    const connStr =
      process.env.DATABASE_URL ||     // direct PostgreSQL connection string
      process.env.SUPABASE_URL ||     // Supabase HTTP client fallback
      null;

    if (!connStr) {
      throw new Error(
        'No database connection string found. ' +
        'Set DATABASE_URL (PostgreSQL) or SUPABASE_URL + SUPABASE_KEY in your environment.'
      );
    }

    const conn = await mongoose.connect(connStr);

    const label = process.env.DATABASE_URL
      ? 'Supabase PostgreSQL (direct)'
      : 'Supabase (HTTP client)';

    // eslint-disable-next-line no-console
    console.log(`[DB] ✅ Connected to ${label}: ${conn.connection?.host || connStr.split('@').pop()?.split('/')[0] || 'supabase'}`);

    // Run seeders after connection (skipped in production unless RUN_SEEDERS=true)
    if (process.env.NODE_ENV !== 'production' || process.env.RUN_SEEDERS === 'true') {
      await runSeeders();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[DB] ❌ Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
