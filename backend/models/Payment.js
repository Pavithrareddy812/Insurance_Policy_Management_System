const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Policy = require('./Policy');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  policyId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  policyHolderName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Paid',
  },
  billingPeriod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'payments',
  timestamps: true,
});

// Setup relationship via policyId alphanumeric string
Policy.hasMany(Payment, { foreignKey: 'policyId', sourceKey: 'policyId', onDelete: 'CASCADE' });
Payment.belongsTo(Policy, { foreignKey: 'policyId', targetKey: 'policyId' });

module.exports = Payment;
