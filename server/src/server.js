const path = require('path');
// Load environment variables as early as possible, before any module that might read them
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Validate required environment variables — fail fast
const validateEnv = require('./utils/envValidator');
validateEnv();

const app = require('./app');
const connectDB = require('./config/db');
const { initializeSocket } = require('./socket/socketServer');
const { initializeAnnouncementAutomation } = require('./modules/announcement/announcement.automation');

// ─────────────────────────────────────────────
// Handle Uncaught Exceptions (synchronous errors not caught anywhere)
// ─────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  // eslint-disable-next-line no-console
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// ─────────────────────────────────────────────
// Connect to Database
// ─────────────────────────────────────────────
connectDB().then(async () => {
  initializeAnnouncementAutomation();

  // ── Seed / ensure admin user exists via Supabase Auth ────────────
  // Passwords live in Supabase Auth, NOT in our users table.
  // We use supabase.auth.admin.createUser to create/update the
  // Supabase auth record, then upsert the profile row.
  try {
    const supabase   = require('./config/supabase');
    const User       = require('./modules/user/user.model');
    const adminEmail = 'induaggarwal@gmail.com';
    const adminPass  = 'dishaforindia';

    // 1. Check if a Supabase auth user already exists for this email
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingAuthUser = (listData?.users || []).find(u => u.email === adminEmail);

    let supabaseId;

    if (existingAuthUser) {
      supabaseId = existingAuthUser.id;
      // Ensure password is current (idempotent)
      await supabase.auth.admin.updateUserById(supabaseId, {
        password:      adminPass,
        email_confirm: true,
      });
      console.log('[SERVER] ✅ Admin Supabase auth user verified.');
    } else {
      // Create the Supabase auth user
      const { data: newAuthData, error: createErr } = await supabase.auth.admin.createUser({
        email:         adminEmail,
        password:      adminPass,
        email_confirm: true,
        user_metadata: { name: 'Indu Aggarwal', username: 'induaggarwal' },
      });
      if (createErr) throw createErr;
      supabaseId = newAuthData.user.id;
      console.log('[SERVER] ✅ Admin Supabase auth user created.');
    }

    // 2. Upsert the profile row in our users table
    let profile = await User.findOne({ supabaseId });
    if (!profile) profile = await User.findOne({ email: adminEmail });

    if (profile) {
      let needsSave = false;
      if (profile.role !== 'admin')    { profile.role = 'admin';   needsSave = true; }
      if (profile.status !== 'active') { profile.status = 'active'; needsSave = true; }
      if (!profile.username)           { profile.username = 'induaggarwal'; needsSave = true; }
      if (!profile.supabaseId)         { profile.supabaseId = supabaseId; needsSave = true; }
      // Remove any stale bcrypt hash — passwords live in Supabase Auth now
      if (profile.password)            { profile.password = undefined; needsSave = true; }
      if (needsSave) {
        await profile.save();
        console.log('[SERVER] ✅ Admin profile row updated.');
      }
    } else {
      const { generateVolunteerId } = require('./utils/volunteerId');
      const volunteerId = await generateVolunteerId();
      await User.create({
        supabaseId,
        volunteerId,
        name:     'Indu Aggarwal',
        username: 'induaggarwal',
        email:    adminEmail,
        role:     'admin',
        status:   'active',
        country:  'India',
      });
      console.log('[SERVER] ✅ Admin profile row created.');
    }
  } catch (err) {
    console.error('[SERVER] ❌ Error seeding admin:', err.message || err);
  }
});

// ─────────────────────────────────────────────
// Start HTTP Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[SERVER] 🚀 Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// Initialize Socket.IO
initializeSocket(server);

// ─────────────────────────────────────────────
// Handle Unhandled Promise Rejections (async errors not caught anywhere)
// ─────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  // eslint-disable-next-line no-console
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// ─────────────────────────────────────────────
// Graceful Shutdown on SIGTERM (e.g., Heroku, Docker, Kubernetes)
// ─────────────────────────────────────────────
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('[SERVER] 📴 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('[SERVER] ✅ HTTP server closed.');
  });
});
