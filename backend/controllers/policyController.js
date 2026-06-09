const { Op } = require('sequelize');
const Policy = require('../models/Policy');
const Payment = require('../models/Payment');

const validatePolicyData = (data) => {
  const {
    holderName, premium, expiry, nominee, sumAssured, idType, idNumber, email, phone
  } = data;

  const nameRegex = /^[a-zA-Z\s.'-]+$/;

  if (!holderName || !holderName.trim()) {
    return 'Holder Name is required';
  }
  if (!nameRegex.test(holderName.trim())) {
    return 'Holder Name must contain only characters';
  }
  if (holderName.trim().length < 2) {
    return 'Holder Name must be at least 2 characters long';
  }

  if (premium === undefined || premium === null || premium === '') {
    return 'Annual Premium is required';
  }
  if (isNaN(premium) || parseFloat(premium) <= 0) {
    return 'Annual Premium must be a positive number';
  }

  if (!expiry) {
    return 'Expiry Date is required';
  }
  const expiryDate = new Date(expiry);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(expiryDate.getTime()) || expiryDate <= today) {
    return 'Expiry Date must be a future date';
  }

  if (!nominee || !nominee.trim()) {
    return 'Nominee Name is required';
  }
  if (!nameRegex.test(nominee.trim())) {
    return 'Nominee Name must contain only characters';
  }
  if (nominee.trim().length < 2) {
    return 'Nominee Name must be at least 2 characters long';
  }

  if (sumAssured !== undefined && sumAssured !== null && sumAssured !== '') {
    if (isNaN(sumAssured) || parseFloat(sumAssured) <= 0) {
      return 'Sum Assured must be a positive number';
    }
  }

  if (idNumber && idNumber.trim()) {
    if (idType === 'Aadhaar') {
      const aadhaarRegex = /^\d{12}$/;
      if (!aadhaarRegex.test(idNumber.trim())) {
        return 'Aadhaar Card must be exactly 12 digits';
      }
    } else if (idType === 'PAN') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!panRegex.test(idNumber.trim())) {
        return 'PAN Card number must be in a valid format';
      }
    }
  }

  if (email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
  }

  if (phone && phone.trim()) {
    const phoneRegex = /^[+\d\s().-]{7,20}$/;
    if (!phoneRegex.test(phone.trim())) {
      return 'Please enter a valid phone number';
    }
  }

  return null;
};

// @desc    Create a new policy
// @route   POST /api/policies
// @access  Private
const createPolicy = async (req, res) => {
  const {
    holderName, type, premium, expiry, nominee, paymentStatus, email, phone, address,
    insuredItemOrPerson, sumAssured, coveragePeriod, nomineeDetails, idType, idNumber,
    vehicleRegistration, driverLicense, waitingPeriod, coverageDetails,
    policyDocumentUrl, policeVerificationCertificate, otherDocuments
  } = req.body;

  const validationError = validatePolicyData({
    holderName, premium, expiry, nominee, sumAssured, idType, idNumber, email, phone
  });

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const policyId = `POL-${Math.floor(100000 + Math.random() * 900000)}`;

    const policy = await Policy.create({
      policyId,
      policyHolderName: holderName,
      policyType: type,
      premiumAmount: premium,
      startDate: new Date(),
      expiryDate: expiry,
      nomineeName: nominee,
      paymentStatus: paymentStatus || 'Unpaid',
      email: email || '',
      phone: phone || '',
      address: address || '',
      policyStatus: 'Active',
      insuredItemOrPerson: insuredItemOrPerson || '',
      sumAssured: sumAssured || null,
      coveragePeriod: coveragePeriod || '',
      nomineeDetails: nomineeDetails || '',
      idType: idType || '',
      idNumber: idNumber || '',
      vehicleRegistration: vehicleRegistration || '',
      driverLicense: driverLicense || '',
      waitingPeriod: waitingPeriod || '',
      coverageDetails: coverageDetails || '',
      policyDocumentUrl: policyDocumentUrl || '',
      policeVerificationCertificate: policeVerificationCertificate || '',
      otherDocuments: otherDocuments || '',
      documents: [],
      auditTrail: [{ action: 'Created', date: new Date(), by: req.user ? req.user.name : 'System' }],
    });

    return res.status(201).json({
      success: true,
      data: {
        id: policy.id,
        policyNumber: policy.policyId,
        holderName: policy.policyHolderName,
        type: policy.policyType,
        premium: policy.premiumAmount,
        expiry: policy.expiryDate,
        nominee: policy.nomineeName,
        paymentStatus: policy.paymentStatus,
        email: policy.email,
        phone: policy.phone,
        address: policy.address,
        insuredItemOrPerson: policy.insuredItemOrPerson,
        sumAssured: policy.sumAssured,
        coveragePeriod: policy.coveragePeriod,
        nomineeDetails: policy.nomineeDetails,
        idType: policy.idType,
        idNumber: policy.idNumber,
        vehicleRegistration: policy.vehicleRegistration,
        driverLicense: policy.driverLicense,
        waitingPeriod: policy.waitingPeriod,
        coverageDetails: policy.coverageDetails,
        policyDocumentUrl: policy.policyDocumentUrl,
        policeVerificationCertificate: policy.policeVerificationCertificate,
        otherDocuments: policy.otherDocuments,
      },
    });
  } catch (error) {
    console.error('Create policy error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during policy creation' });
  }
};

// @desc    Get all policies (with search, filter, and pagination)
// @route   GET /api/policies
// @access  Private
const getPolicies = async (req, res) => {
  const { search, type, paymentStatus, page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (type && type !== 'All') {
      whereClause.policyType = type;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      if (paymentStatus === 'Pending' || paymentStatus === 'Overdue' || paymentStatus === 'Unpaid') {
        whereClause.paymentStatus = 'Unpaid';
      } else {
        whereClause.paymentStatus = paymentStatus;
      }
    }

    if (search) {
      whereClause[Op.or] = [
        { policyHolderName: { [Op.like]: `%${search}%` } },
        { policyId: { [Op.like]: `%${search}%` } },
        { nomineeName: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: policies } = await Policy.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    const formattedPolicies = policies.map(p => ({
      id: p.id,
      policyNumber: p.policyId,
      holderName: p.policyHolderName,
      type: p.policyType,
      premium: p.premiumAmount,
      expiry: p.expiryDate ? p.expiryDate.toISOString().split('T')[0] : '',
      nominee: p.nomineeName,
      paymentStatus: p.paymentStatus === 'Unpaid' ? 'Pending' : p.paymentStatus,
      email: p.email,
      phone: p.phone,
      address: p.address,
      insuredItemOrPerson: p.insuredItemOrPerson,
      sumAssured: p.sumAssured,
      coveragePeriod: p.coveragePeriod,
      nomineeDetails: p.nomineeDetails,
      idType: p.idType,
      idNumber: p.idNumber,
      vehicleRegistration: p.vehicleRegistration,
      driverLicense: p.driverLicense,
      waitingPeriod: p.waitingPeriod,
      coverageDetails: p.coverageDetails,
      policyDocumentUrl: p.policyDocumentUrl,
      policeVerificationCertificate: p.policeVerificationCertificate,
      otherDocuments: p.otherDocuments,
      auditTrail: p.auditTrail,
    }));

    return res.json({
      success: true,
      count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: formattedPolicies,
    });
  } catch (error) {
    console.error('Get policies error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving policies' });
  }
};

// @desc    Get single policy details
// @route   GET /api/policies/:id
// @access  Private
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const formatted = {
      id: policy.id,
      policyNumber: policy.policyId,
      holderName: policy.policyHolderName,
      type: policy.policyType,
      premium: policy.premiumAmount,
      expiry: policy.expiryDate ? policy.expiryDate.toISOString().split('T')[0] : '',
      nominee: policy.nomineeName,
      paymentStatus: policy.paymentStatus === 'Unpaid' ? 'Pending' : policy.paymentStatus,
      email: policy.email,
      phone: policy.phone,
      address: policy.address,
      insuredItemOrPerson: policy.insuredItemOrPerson,
      sumAssured: policy.sumAssured,
      coveragePeriod: policy.coveragePeriod,
      nomineeDetails: policy.nomineeDetails,
      idType: policy.idType,
      idNumber: policy.idNumber,
      vehicleRegistration: policy.vehicleRegistration,
      driverLicense: policy.driverLicense,
      waitingPeriod: policy.waitingPeriod,
      coverageDetails: policy.coverageDetails,
      policyDocumentUrl: policy.policyDocumentUrl,
      policeVerificationCertificate: policy.policeVerificationCertificate,
      otherDocuments: policy.otherDocuments,
      auditTrail: policy.auditTrail,
    };

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Get policy details error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving policy details' });
  }
};

// @desc    Update a policy
// @route   PUT /api/policies/:id
// @access  Private
const updatePolicy = async (req, res) => {
  const {
    holderName, type, premium, expiry, nominee, paymentStatus, email, phone, address,
    insuredItemOrPerson, sumAssured, coveragePeriod, nomineeDetails, idType, idNumber,
    vehicleRegistration, driverLicense, waitingPeriod, coverageDetails,
    policyDocumentUrl, policeVerificationCertificate, otherDocuments
  } = req.body;

  try {
    const policy = await Policy.findByPk(req.params.id);

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const valHolderName = holderName !== undefined ? holderName : policy.policyHolderName;
    const valPremium = premium !== undefined ? premium : policy.premiumAmount;
    const valExpiry = expiry !== undefined ? expiry : policy.expiryDate;
    const valNominee = nominee !== undefined ? nominee : policy.nomineeName;
    const valSumAssured = sumAssured !== undefined ? sumAssured : policy.sumAssured;
    const valIdType = idType !== undefined ? idType : policy.idType;
    const valIdNumber = idNumber !== undefined ? idNumber : policy.idNumber;
    const valEmail = email !== undefined ? email : policy.email;
    const valPhone = phone !== undefined ? phone : policy.phone;

    const validationError = validatePolicyData({
      holderName: valHolderName,
      premium: valPremium,
      expiry: valExpiry,
      nominee: valNominee,
      sumAssured: valSumAssured,
      idType: valIdType,
      idNumber: valIdNumber,
      email: valEmail,
      phone: valPhone
    });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    policy.policyHolderName = holderName !== undefined ? holderName : policy.policyHolderName;
    policy.policyType = type !== undefined ? type : policy.policyType;
    policy.premiumAmount = premium !== undefined ? premium : policy.premiumAmount;
    policy.expiryDate = expiry !== undefined ? expiry : policy.expiryDate;
    policy.nomineeName = nominee !== undefined ? nominee : policy.nomineeName;
    policy.paymentStatus = paymentStatus !== undefined ? (paymentStatus === 'Pending' ? 'Unpaid' : paymentStatus) : policy.paymentStatus;
    policy.email = email !== undefined ? email : policy.email;
    policy.phone = phone !== undefined ? phone : policy.phone;
    policy.address = address !== undefined ? address : policy.address;
    
    policy.insuredItemOrPerson = insuredItemOrPerson !== undefined ? insuredItemOrPerson : policy.insuredItemOrPerson;
    policy.sumAssured = sumAssured !== undefined ? sumAssured : policy.sumAssured;
    policy.coveragePeriod = coveragePeriod !== undefined ? coveragePeriod : policy.coveragePeriod;
    policy.nomineeDetails = nomineeDetails !== undefined ? nomineeDetails : policy.nomineeDetails;
    policy.idType = idType !== undefined ? idType : policy.idType;
    policy.idNumber = idNumber !== undefined ? idNumber : policy.idNumber;
    policy.vehicleRegistration = vehicleRegistration !== undefined ? vehicleRegistration : policy.vehicleRegistration;
    policy.driverLicense = driverLicense !== undefined ? driverLicense : policy.driverLicense;
    policy.waitingPeriod = waitingPeriod !== undefined ? waitingPeriod : policy.waitingPeriod;
    policy.coverageDetails = coverageDetails !== undefined ? coverageDetails : policy.coverageDetails;
    policy.policyDocumentUrl = policyDocumentUrl !== undefined ? policyDocumentUrl : policy.policyDocumentUrl;
    policy.policeVerificationCertificate = policeVerificationCertificate !== undefined ? policeVerificationCertificate : policy.policeVerificationCertificate;
    policy.otherDocuments = otherDocuments !== undefined ? otherDocuments : policy.otherDocuments;

    const audit = Array.isArray(policy.auditTrail) ? policy.auditTrail : [];
    audit.push({ action: 'Updated', date: new Date(), by: req.user ? req.user.name : 'System' });
    policy.auditTrail = audit;

    await policy.save();

    const formatted = {
      id: policy.id,
      policyNumber: policy.policyId,
      holderName: policy.policyHolderName,
      type: policy.policyType,
      premium: policy.premiumAmount,
      expiry: policy.expiryDate ? policy.expiryDate.toISOString().split('T')[0] : '',
      nominee: policy.nomineeName,
      paymentStatus: policy.paymentStatus === 'Unpaid' ? 'Pending' : policy.paymentStatus,
      email: policy.email,
      phone: policy.phone,
      address: policy.address,
      insuredItemOrPerson: policy.insuredItemOrPerson,
      sumAssured: policy.sumAssured,
      coveragePeriod: policy.coveragePeriod,
      nomineeDetails: policy.nomineeDetails,
      idType: policy.idType,
      idNumber: policy.idNumber,
      vehicleRegistration: policy.vehicleRegistration,
      driverLicense: policy.driverLicense,
      waitingPeriod: policy.waitingPeriod,
      coverageDetails: policy.coverageDetails,
      policyDocumentUrl: policy.policyDocumentUrl,
      policeVerificationCertificate: policy.policeVerificationCertificate,
      otherDocuments: policy.otherDocuments,
      auditTrail: policy.auditTrail,
    };

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Update policy error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating policy' });
  }
};

// @desc    Delete a policy
// @route   DELETE /api/policies/:id
// @access  Private
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    // Explicitly delete associated payments first to prevent foreign key constraint violations
    await Payment.destroy({ where: { policyId: policy.policyId } });

    await policy.destroy();

    return res.json({
      success: true,
      message: 'Policy deleted successfully',
    });
  } catch (error) {
    console.error('Delete policy error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error deleting policy' });
  }
};

module.exports = {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
};
