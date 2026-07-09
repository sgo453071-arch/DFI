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

    // Temporary Seed Logic for Admin User
    try {
    const bcrypt = require('bcrypt');
    const User = require('./modules/user/user.model');
    const email = 'induaggarwal@gmail.com';
    const password = 'dishaforindia';
    
    let admin = await User.findOne({ email });
    if (admin) {
      let needsSave = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        needsSave = true;
      }
      if (admin.status !== 'active') {
        admin.status = 'active';
        needsSave = true;
      }
      if (!admin.username) {
        admin.username = 'induaggarwal';
        needsSave = true;
      }
      if (!admin.password || !admin.password.startsWith('$2b$')) {
        admin.password = await bcrypt.hash(password, 10);
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log('[SERVER] ✅ Admin user updated on startup (password hashed).');
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = new User({
        name: 'Indu Aggarwal',
        email: email,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        username: 'induaggarwal',
        country: 'India'
      });
      await admin.save();
      console.log('[SERVER] ✅ Admin user seeded on startup.');
    }
  } catch (err) {
    console.error('[SERVER] ❌ Error seeding admin:', err);
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
