const Application = require('./application.model');
const { APPLICATION_STATUS } = require('./application.constants');

const AUTOMATION_INTERVAL_MS = 60 * 1000; // 1 minute check interval
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours

class ApplicationAutomation {
  constructor() {
    this.timer = null;
    this.isRunning = false;
  }

  start() {
    if (this.timer) return;
    // eslint-disable-next-line no-console
    console.log('[ApplicationAutomation] 🚀 24-hour application cleanup automation initialized (interval: 60s)');

    // Run initial sync 5 seconds after startup
    global.setTimeout(() => {
      this.tick();
    }, 5000);

    this.timer = global.setInterval(() => {
      this.tick();
    }, AUTOMATION_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      global.clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      await this.syncApplicationDeletions();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ApplicationAutomation] Error during application deletion tick:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  async syncApplicationDeletions() {
    const now = Date.now();
    const cutoff = new Date(now - TWENTY_FOUR_HOURS_MS);

    // Statuses subject to 24-hour post-decision deletion: accepted or removed/rejected
    const DECIDED_STATUSES = [
      APPLICATION_STATUS.APPROVED,
      APPLICATION_STATUS.JOINED,
      APPLICATION_STATUS.REJECTED,
      APPLICATION_STATUS.WITHDRAWN,
      APPLICATION_STATUS.CANCELLED,
    ];

    // Find non-deleted applications that have been accepted or removed/rejected
    const candidates = await Application.find({
      isDeleted: false,
      status: { $in: DECIDED_STATUSES },
    }).lean();

    if (!candidates || candidates.length === 0) {
      return;
    }

    const toDeleteIds = [];

    for (const app of candidates) {
      // Determine the decision timestamp
      const decisionTime = app.decidedAt || app.joinedAt || app.withdrawnAt || app.updatedAt || app.createdAt;
      if (!decisionTime) continue;

      const decisionDate = new Date(decisionTime);
      if (!isNaN(decisionDate.getTime()) && decisionDate <= cutoff) {
        toDeleteIds.push(app._id);
      }
    }

    if (toDeleteIds.length > 0) {
      await Application.updateMany(
        { _id: { $in: toDeleteIds } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        }
      );
      // eslint-disable-next-line no-console
      console.log(
        `[ApplicationAutomation] 🗑️ Automatically soft-deleted ${toDeleteIds.length} application(s) accepted/removed over 24 hours ago.`
      );
    }
  }
}

const applicationAutomation = new ApplicationAutomation();

module.exports = {
  applicationAutomation,
  initializeApplicationAutomation: () => applicationAutomation.start(),
  syncApplicationDeletions: () => applicationAutomation.syncApplicationDeletions(),
};
