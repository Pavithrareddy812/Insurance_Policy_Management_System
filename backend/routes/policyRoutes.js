const express = require('express');
const router = express.Router();
const {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require('../controllers/policyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect); // Require JWT auth for all policy routes

router.route('/')
  .post(createPolicy)
  .get(getPolicies);

router.route('/:id')
  .get(getPolicyById)
  .put(updatePolicy)
  .delete(authorizeRoles('admin'), deletePolicy);

module.exports = router;
