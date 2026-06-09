const Payment = require('../models/Payment');
const Policy = require('../models/Policy');

// @desc    Record a new payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  const { policyId, amount, paymentMethod } = req.body;

  try {
    let policy = await Policy.findByPk(policyId);
    if (!policy) {
      policy = await Policy.findOne({ where: { policyId: policyId } });
    }

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const currentBillingPeriod = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    const payment = await Payment.create({
      transactionId,
      policyId: policy.policyId,
      policyHolderName: policy.policyHolderName,
      amount: amount || policy.premiumAmount,
      paymentMethod,
      status: 'Paid',
      billingPeriod: currentBillingPeriod,
      paymentDate: new Date(),
    });

    policy.paymentStatus = 'Paid';
    
    const audit = Array.isArray(policy.auditTrail) ? policy.auditTrail : [];
    audit.push({ action: 'Payment Received', amount: payment.amount, date: new Date(), by: req.user ? req.user.name : 'System' });
    policy.auditTrail = audit;

    await policy.save();

    return res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Create payment error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during payment creation' });
  }
};

// @desc    Get all payments / transaction logs
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      order: [['paymentDate', 'DESC']],
      include: [
        {
          model: Policy,
          attributes: ['id', 'policyId', 'policyHolderName', 'policyType', 'premiumAmount'],
        },
      ],
    });

    const formattedPayments = payments.map(p => ({
      id: p.id,
      transactionId: p.transactionId,
      amount: p.amount,
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      status: p.status,
      Policy: p.Policy ? {
        id: p.Policy.id,
        policyNumber: p.Policy.policyId,
        holderName: p.Policy.policyHolderName,
        type: p.Policy.policyType,
        premium: p.Policy.premiumAmount,
      } : {
        policyNumber: p.policyId,
        holderName: p.policyHolderName,
      }
    }));

    return res.json({
      success: true,
      data: formattedPayments,
    });
  } catch (error) {
    console.error('Get payments error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving payments' });
  }
};

module.exports = {
  createPayment,
  getPayments,
};
