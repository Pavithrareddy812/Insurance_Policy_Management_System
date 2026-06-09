const express = require('express');
const router = express.Router();
const { createPayment, getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Require JWT auth for all payment routes

router.route('/')
  .post(createPayment)
  .get(getPayments);

module.exports = router;
