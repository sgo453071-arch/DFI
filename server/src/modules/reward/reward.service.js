const rewardRepository = require('./reward.repository');
const { generateRewardId } = require('./reward.utils');
const NotFoundError = require('../../utils/errors/NotFoundError');
const leaderboardService = require('../leaderboard/leaderboard.service');
const gamificationService = require('../leaderboard/gamification.service');
const notificationService = require('../notification/notification.service');

class RewardService {
  async getMyReward(userId) {
    return rewardRepository.findByUser(userId);
  }

  async awardReward(userId, rewardData) {
    const { points, coins, impactScore } = rewardData;

    let reward = await rewardRepository.findByUser(userId);
    if (!reward) {
      reward = await rewardRepository.create({
        rewardId: generateRewardId(),
        user: userId,
        currentPoints: points || 0,
        currentCoins: coins || 0,
        currentImpactScore: impactScore || 0,
      });
    } else {
      const updateData = {};
      if (points) updateData.currentPoints = (reward.currentPoints || 0) + points;
      if (coins) updateData.currentCoins = (reward.currentCoins || 0) + coins;
      if (impactScore) updateData.currentImpactScore = (reward.currentImpactScore || 0) + impactScore;
      reward = await rewardRepository.update(userId, updateData);
    }

    try {
      const notificationPromises = [];
      if (coins) {
        notificationPromises.push(
          notificationService.sendInAppNotification('buildCoinsAwarded', {
            recipientId: userId,
            coins,
            reason: rewardData.reason || 'Reward earned',
          }).catch(() => {})
        );
      }
      if (points) {
        notificationPromises.push(
          notificationService.sendInAppNotification('buildPointsAwarded', {
            recipientId: userId,
            points,
            reason: rewardData.reason || 'Reward earned',
          }).catch(() => {})
        );
      }
      if (impactScore) {
        notificationPromises.push(
          notificationService.sendInAppNotification('buildImpactScoreUpdated', {
            recipientId: userId,
            impactScore,
            totalImpact: reward.currentImpactScore,
          }).catch(() => {})
        );
      }
      await Promise.all(notificationPromises);
    } catch (_error) {
      // Notification failure is non-blocking
    }



    try {
      await gamificationService.evaluateAll(userId);
    } catch (_error) {
      // Gamification evaluation is non-blocking
    }

    return reward;
  }

  async redeemReward(userId, redeemData) {
    const { coins, points } = redeemData;

    const reward = await rewardRepository.findByUser(userId);
    if (!reward) {
      throw new NotFoundError('Reward profile not found');
    }

    const updateData = {};
    if (coins) updateData.currentCoins = Math.max(0, (reward.currentCoins || 0) - coins);
    if (points) updateData.currentPoints = Math.max(0, (reward.currentPoints || 0) - points);

    const updated = await rewardRepository.update(userId, updateData);
    return updated;
  }
}

module.exports = new RewardService();
