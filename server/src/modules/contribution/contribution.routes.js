const express = require('express');
const contributionController = require('./contribution.controller');
const {
  validateCreateContribution,
  validateSubmitContribution,
  validateUpdateContribution,
  validateGetContribution,
  validateGetContributions,
} = require('./contribution.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authenticatedLimiter } = require('../../config/rateLimiter.config');
const { isVolunteer, isAdminOrVolunteer } = require('../../middlewares/rbac.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authenticatedLimiter);

router.post('/', isVolunteer, validateCreateContribution, contributionController.createContribution);

router.post('/:id/submit', isVolunteer, validateSubmitContribution, contributionController.submitContribution);

router.put('/:id', isVolunteer, validateUpdateContribution, contributionController.updateContribution);

router.delete('/:id', isVolunteer, validateGetContribution, contributionController.deleteContribution);

router.get('/my', isVolunteer, validateGetContributions, contributionController.getMyContributions);

router.get('/:id', isAdminOrVolunteer, validateGetContribution, contributionController.getContribution);

router.get('/:id/versions', isVolunteer, validateGetContribution, contributionController.getVersionHistory);

router.get('/:id/reviews', isVolunteer, validateGetContribution, contributionController.getContributionReviews);

module.exports = router;
