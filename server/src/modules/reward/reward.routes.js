const express = require('express');
const rewardController = require('./reward.controller');
const rewardTransactionController = require('../reward-transaction/rewardTransaction.controller');
const rewardCatalogController = require('./rewardCatalog.controller');
const rewardRedemptionController = require('./rewardRedemption.controller');
const { validateGetReward } = require('./reward.validation');
const { validateGetHistory } = require('../reward-transaction/rewardTransaction.validation');
const { validateGetCatalog, validateGetRewardDetail, validateRedeemReward } = require('./rewardCatalog.validation');
const { validateGetHistory: validateGetRedemptionHistory, validateGetRedemption } = require('./rewardRedemption.validation');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

// ─── Reward Routes ────────────────────────────────────────────────
router.get('/me', validateGetReward, rewardController.getMyReward);

// ─── Reward Transaction Routes ────────────────────────────────────
router.get('/history', validateGetHistory, rewardTransactionController.getHistory);

// ─── Marketplace Routes ───────────────────────────────────────────
router.get('/marketplace', validateGetCatalog, rewardCatalogController.getCatalog);
router.get('/marketplace/featured', rewardCatalogController.getFeaturedRewards);
router.get('/marketplace/:id', validateGetRewardDetail, rewardCatalogController.getRewardDetail);
router.post('/marketplace/:id/redeem', validateRedeemReward, rewardCatalogController.redeemReward);

// ─── User Redemption History Routes ──────────────────────────────
router.get('/my-redemptions', validateGetRedemptionHistory, rewardRedemptionController.getRedemptionHistory);
router.get('/my-redemptions/:id', validateGetRedemption, rewardRedemptionController.getRedemptionById);

// ─── Admin Redemption Routes ──────────────────────────────────────
// Only ADMIN, SUPER_ADMIN, and COORDINATOR may access these.
router.get(
  '/admin/redemptions',
  authorize(['ADMIN', 'SUPER_ADMIN', 'COORDINATOR']),
  rewardRedemptionController.getAllRedemptions,
);
router.patch(
  '/admin/redemptions/:id/status',
  authorize(['ADMIN', 'SUPER_ADMIN', 'COORDINATOR']),
  rewardRedemptionController.adminUpdateRedemptionStatus,
);

module.exports = router;
