const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Policy = sequelize.define('Policy', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  policyId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  policyHolderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  policyType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  premiumAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  policyStatus: {
    type: DataTypes.STRING,
    defaultValue: 'Active',
  },
  nomineeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nomineeDetails: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  insuredItemOrPerson: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sumAssured: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  coveragePeriod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vehicleRegistration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  driverLicense: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  waitingPeriod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coverageDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  policyDocumentUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  policeVerificationCertificate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otherDocuments: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'Unpaid',
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  auditTrail: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'policies',
  timestamps: true,
});

module.exports = Policy;
