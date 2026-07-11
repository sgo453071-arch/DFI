const Announcement = require('./announcement.model');
const User = require('../user/user.model');
const announcementService = require('./announcement.service');
const notificationService = require('../notification/notification.service');
const { STATUS, TARGET_AUDIENCE } = require('./announcement.constants');
const { ROLES, STATUS: USER_STATUS } = require('../user/user.constants');

/* eslint-disable no-undef */

const AUTOMATION_INTERVAL_MS = Number(process.env.ANNOUNCEMENT_AUTOMATION_INTERVAL_MS) || 60_000;

class AnnouncementAutomationService {
  constructor() {
    this.running = false;
    this.timer = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.tick();
    this.timer = setInterval(() => this.tick(), AUTOMATION_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
  }

  async tick() {
    try {
      await this.processScheduledPublishing();
      await this.processExpiredAnnouncements();
    } catch (err) {
      /* eslint-disable no-console */
      console.error('[AnnouncementAutomation] tick failed:', err.message);
    }
  }

  async processScheduledPublishing() {
    const now = new Date();
    const scheduled = await Announcement.find({
      status: STATUS.SCHEDULED,
      scheduledAt: { $lte: now },
      isDeleted: false,
    }).limit(50);

    for (const announcement of scheduled) {
      try {
        await announcementService.publishAnnouncement(announcement._id);
      } catch (err) {
        console.error(`[AnnouncementAutomation] Failed to publish ${announcement._id}:`, err.message);
      }
    }
  }

  async processExpiredAnnouncements() {
    const now = new Date();
    const expired = await Announcement.find({
      status: STATUS.PUBLISHED,
      expiresAt: { $lte: now },
      isDeleted: false,
    }).limit(50);

    for (const announcement of expired) {
      try {
        await announcementService.expireAnnouncement(announcement._id);
      } catch (err) {
        console.error(`[AnnouncementAutomation] Failed to expire ${announcement._id}:`, err.message);
      }
    }
  }

  async _notifyAudience(announcement) {
    const recipientIds = await this._resolveRecipients(announcement);
    const promises = recipientIds.map((userId) =>
      notificationService.notifyAnnouncement(
        userId,
        announcement.title,
        announcement.message,
        null,
        null,
        announcement.createdBy
      ).catch(() => {})
    );
    await Promise.allSettled(promises);
  }

  async _resolveRecipients(announcement) {
    const audience = announcement.targetAudience;
    if (audience === TARGET_AUDIENCE.SPECIFIC_USERS) {
      return (announcement.specificUsers || []).map((id) => id.toString());
    }

    const filter = { status: USER_STATUS.ACTIVE, _id: { $ne: announcement.createdBy } };

    switch (audience) {
      case TARGET_AUDIENCE.VOLUNTEERS:
        filter.role = ROLES.VOLUNTEER;
        break;
      case TARGET_AUDIENCE.ADMINS:
        filter.role = { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.COORDINATOR] };
        break;
      case TARGET_AUDIENCE.NGOS:
        filter.role = ROLES.NGO;
        break;
      case TARGET_AUDIENCE.ALL_USERS:
      default:
        break;
    }

    const users = await User.find(filter).distinct('_id');
    return users.map((id) => id.toString());
  }
}

const announcementAutomation = new AnnouncementAutomationService();

const initializeAnnouncementAutomation = () => {
  announcementAutomation.start();
  return announcementAutomation;
};

module.exports = {
  announcementAutomation,
  initializeAnnouncementAutomation,
};
