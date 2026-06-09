const { sequelize } = require('../config/db');
const Policy = require('../models/Policy');
const Payment = require('../models/Payment');
const { Op } = require('sequelize');

// @desc    Get dashboard analytics & KPI data
// @route   GET /api/analytics
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const totalPolicies = await Policy.count();
    const paidPolicies = await Policy.count({ where: { paymentStatus: 'Paid' } });
    const pendingPolicies = await Policy.count({ where: { paymentStatus: 'Unpaid' } });
    const overduePolicies = await Policy.count({ where: { paymentStatus: 'Overdue' } });

    // The legacy database uses status: 'Paid' for successful payments
    const totalPremiumSum = await Payment.sum('amount', { 
      where: { 
        status: {
          [Op.in]: ['Paid', 'Success']
        }
      } 
    }) || 0;
    
    const successRate = totalPolicies > 0 ? Math.round((paidPolicies / totalPolicies) * 100) : 0;

    // Policy Distribution by policyType
    const typeDistributionRaw = await Policy.findAll({
      attributes: ['policyType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['policyType'],
    });

    const typeDistribution = typeDistributionRaw.map(item => ({
      name: item.policyType,
      value: parseInt(item.get('count')) || 0,
    }));

    const allTypes = ['Life', 'Health', 'Auto', 'Home', 'Property', 'Motor'];
    allTypes.forEach(t => {
      if (!typeDistribution.find(item => item.name === t)) {
        typeDistribution.push({ name: t, value: 0 });
      }
    });

    // Monthly Revenue Analytics (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const payments = await Payment.findAll({
      where: {
        status: {
          [Op.in]: ['Paid', 'Success']
        },
        paymentDate: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      attributes: ['amount', 'paymentDate'],
      order: [['paymentDate', 'ASC']],
    });

    const monthlyRevenue = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dateCursor = new Date(sixMonthsAgo);
    for (let i = 0; i < 6; i++) {
      monthlyRevenue.push({
        month: `${monthNames[dateCursor.getMonth()]} ${dateCursor.getFullYear().toString().substr(-2)}`,
        revenue: 0,
        policies: 0,
        monthIndex: dateCursor.getMonth(),
        year: dateCursor.getFullYear(),
      });
      dateCursor.setMonth(dateCursor.getMonth() + 1);
    }

    payments.forEach(p => {
      const pDate = new Date(p.paymentDate);
      const monthIdx = pDate.getMonth();
      const year = pDate.getFullYear();
      
      const bucket = monthlyRevenue.find(b => b.monthIndex === monthIdx && b.year === year);
      if (bucket) {
        bucket.revenue += parseFloat(p.amount);
        bucket.policies += 1;
      }
    });

    const revenueTrend = monthlyRevenue.map(b => ({
      month: b.month,
      revenue: parseFloat(b.revenue.toFixed(2)),
      policies: b.policies,
    }));

    // Recent Activity Log
    const recentPolicies = await Policy.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'policyId', 'policyHolderName', 'createdAt'],
    });

    const recentPayments = await Payment.findAll({
      limit: 5,
      order: [['paymentDate', 'DESC']],
      include: [{ model: Policy, attributes: ['policyId', 'policyHolderName'] }],
    });

    const activities = [];

    recentPolicies.forEach(p => {
      activities.push({
        id: `act-p-${p.id}`,
        type: 'policy_creation',
        message: `New policy ${p.policyId} created for ${p.policyHolderName}`,
        date: p.createdAt,
      });
    });

    recentPayments.forEach(pay => {
      activities.push({
        id: `act-pay-${pay.id}`,
        type: 'payment_success',
        message: `Payment of $${pay.amount} received for Policy ${pay.Policy ? pay.Policy.policyId : pay.policyId}`,
        date: pay.paymentDate,
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivity = activities.slice(0, 7);

    return res.json({
      success: true,
      data: {
        kpis: {
          totalPolicies,
          paidPolicies,
          pendingPolicies,
          overduePolicies,
          totalRevenue: parseFloat(totalPremiumSum.toFixed(2)),
          successRate,
        },
        typeDistribution,
        revenueTrend,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving analytics data' });
  }
};

module.exports = {
  getDashboardAnalytics,
};
