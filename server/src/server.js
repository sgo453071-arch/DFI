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

  // ── Seed / ensure admin and superadmin users exist via Supabase Auth ────────────
  // Passwords live in Supabase Auth, NOT in our users table.
  // We use supabase.auth.admin.createUser to create/update the
  // Supabase auth record, then upsert the profile row.
  try {
    const supabase = require('./config/supabase');
    const User     = require('./modules/user/user.model');
    const { generateVolunteerId } = require('./utils/volunteerId');

    const seedUsers = [
      {
        email:    'induaggarwal@gmail.com',
        password: 'dishaforindia',
        name:     'Indu Aggarwal',
        username: 'induaggarwal',
        role:     'admin',
      },
      {
        email:    'admin@dishaforindia.org',
        password: 'changeme123',
        name:     'Super Admin',
        username: 'superadmin',
        role:     'superadmin',
      },
    ];

    // 1. Get all users from Supabase Auth to check existence
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingUsers = listData?.users || [];

    for (const targetUser of seedUsers) {
      const existingAuthUser = existingUsers.find((u) => u.email === targetUser.email);
      let supabaseId;

      if (existingAuthUser) {
        supabaseId = existingAuthUser.id;
        // Ensure password and metadata is current (idempotent)
        await supabase.auth.admin.updateUserById(supabaseId, {
          password:      targetUser.password,
          email_confirm: true,
          user_metadata: { name: targetUser.name, username: targetUser.username },
        });
        // eslint-disable-next-line no-console
        console.log(`[SERVER] ✅ Supabase auth user verified: ${targetUser.email}`);
      } else {
        // Create the Supabase auth user
        const { data: newAuthData, error: createErr } = await supabase.auth.admin.createUser({
          email:         targetUser.email,
          password:      targetUser.password,
          email_confirm: true,
          user_metadata: { name: targetUser.name, username: targetUser.username },
        });
        if (createErr) throw createErr;
        supabaseId = newAuthData.user.id;
        // eslint-disable-next-line no-console
        console.log(`[SERVER] ✅ Supabase auth user created: ${targetUser.email}`);
      }

      // 2. Upsert the profile row in our users table
      let profile = await User.findOne({ supabaseId });
      if (!profile) profile = await User.findOne({ email: targetUser.email });

      if (profile) {
        let needsSave = false;
        if (profile.role !== targetUser.role) { profile.role = targetUser.role; needsSave = true; }
        if (profile.status !== 'active') { profile.status = 'active'; needsSave = true; }
        if (!profile.username) { profile.username = targetUser.username; needsSave = true; }
        if (!profile.supabaseId) { profile.supabaseId = supabaseId; needsSave = true; }
        // Remove any stale bcrypt hash — passwords live in Supabase Auth now
        if (profile.password) { profile.password = undefined; needsSave = true; }
        if (needsSave) {
          await profile.save();
          // eslint-disable-next-line no-console
          console.log(`[SERVER] ✅ Profile row updated for: ${targetUser.email}`);
        }
      } else {
        const volunteerId = await generateVolunteerId();
        await User.create({
          supabaseId,
          volunteerId,
          name:     targetUser.name,
          username: targetUser.username,
          email:    targetUser.email,
          role:     targetUser.role,
          status:   'active',
          country:  'India',
        });
        // eslint-disable-next-line no-console
        console.log(`[SERVER] ✅ Profile row created for: ${targetUser.email}`);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SERVER] ❌ Error seeding auth users:', err.message || err);
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
