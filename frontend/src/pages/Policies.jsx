import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Policies = () => {
  const { user } = useContext(AuthContext);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [formStep, setFormStep] = useState(1);

  // View Details control states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingPolicy, setViewingPolicy] = useState(null);

  // Form states
  const [holderName, setHolderName] = useState('');
  const [policyType, setPolicyType] = useState('Health');
  const [premium, setPremium] = useState('');
  const [expiry, setExpiry] = useState('');
  const [nominee, setNominee] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Extended Details Form states
  const [insuredItemOrPerson, setInsuredItemOrPerson] = useState('');
  const [sumAssured, setSumAssured] = useState('');
  const [coveragePeriod, setCoveragePeriod] = useState('');
  const [nomineeDetails, setNomineeDetails] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [waitingPeriod, setWaitingPeriod] = useState('');
  const [coverageDetails, setCoverageDetails] = useState('');
  const [policyDocumentUrl, setPolicyDocumentUrl] = useState('');
  const [policeVerificationCertificate, setPoliceVerificationCertificate] = useState('');
  const [otherDocuments, setOtherDocuments] = useState('');

  const validateStep = (step) => {
    if (step === 1) {
      if (!holderName.trim()) {
        toast.error('Holder Name is required.');
        return false;
      }
      const nameRegex = /^[a-zA-Z\s.'-]+$/;
      if (!nameRegex.test(holderName.trim())) {
        toast.error('Holder Name must contain only letters, spaces, periods, hyphens, or apostrophes.');
        return false;
      }
      if (holderName.trim().length < 2) {
        toast.error('Holder Name must be at least 2 characters long.');
        return false;
      }

      if (!premium) {
        toast.error('Annual Premium is required.');
        return false;
      }
      if (isNaN(premium) || parseFloat(premium) <= 0) {
        toast.error('Annual Premium must be a positive number.');
        return false;
      }

      if (!expiry) {
        toast.error('Expiry Date is required.');
        return false;
      }
      const expiryDate = new Date(expiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(expiryDate.getTime()) || expiryDate <= today) {
        toast.error('Expiry Date must be a future date.');
        return false;
      }

      if (!nominee.trim()) {
        toast.error('Nominee Name is required.');
        return false;
      }
      if (!nameRegex.test(nominee.trim())) {
        toast.error('Nominee Name must contain only letters, spaces, periods, hyphens, or apostrophes.');
        return false;
      }
      if (nominee.trim().length < 2) {
        toast.error('Nominee Name must be at least 2 characters long.');
        return false;
      }

      if (sumAssured && (isNaN(sumAssured) || parseFloat(sumAssured) <= 0)) {
        toast.error('Sum Assured must be a positive number.');
        return false;
      }
    }

    if (step === 2) {
      if (idNumber.trim()) {
        if (idType === 'Aadhaar') {
          const aadhaarRegex = /^\d{12}$/;
          if (!aadhaarRegex.test(idNumber.trim())) {
            toast.error('Aadhaar Card must be exactly 12 digits.');
            return false;
          }
        } else if (idType === 'PAN') {
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
          if (!panRegex.test(idNumber.trim())) {
            toast.error('PAN Card number must be in a valid format (e.g. ABCDE1234F).');
            return false;
          }
        }
      }
    }

    if (step === 3) {
      if (email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          toast.error('Please enter a valid email address.');
          return false;
        }
      }

      if (phone.trim()) {
        const phoneRegex = /^[+\d\s().-]{7,20}$/;
        if (!phoneRegex.test(phone.trim())) {
          toast.error('Please enter a valid phone number (7-20 characters, allowing digits, spaces, +, -, (, )).');
          return false;
        }
      }
    }

    return true;
  };

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/policies', {
        params: {
          search,
          type: type === 'All' ? undefined : type,
          paymentStatus: status === 'All' ? undefined : status,
          page,
          limit: 8,
        },
      });
      setPolicies(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Failed to load policies:', error);
      toast.error('Could not retrieve policy records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [search, type, status, page]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormStep(1);
    setHolderName('');
    setPolicyType('Health');
    setPremium('');
    setExpiry('');
    setNominee('');
    setPaymentStatus('Pending');
    setEmail('');
    setPhone('');
    setAddress('');
    setInsuredItemOrPerson('');
    setSumAssured('');
    setCoveragePeriod('');
    setNomineeDetails('');
    setIdType('Aadhaar');
    setIdNumber('');
    setVehicleRegistration('');
    setDriverLicense('');
    setWaitingPeriod('');
    setCoverageDetails('');
    setPolicyDocumentUrl('');
    setPoliceVerificationCertificate('');
    setOtherDocuments('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (policy) => {
    setModalMode('edit');
    setFormStep(1);
    setSelectedPolicyId(policy.id);
    setHolderName(policy.holderName || '');
    setPolicyType(policy.type || 'Health');
    setPremium(policy.premium || '');
    setExpiry(policy.expiry || '');
    setNominee(policy.nominee || '');
    setPaymentStatus(policy.paymentStatus || 'Pending');
    setEmail(policy.email || '');
    setPhone(policy.phone || '');
    setAddress(policy.address || '');
    setInsuredItemOrPerson(policy.insuredItemOrPerson || '');
    setSumAssured(policy.sumAssured || '');
    setCoveragePeriod(policy.coveragePeriod || '');
    setNomineeDetails(policy.nomineeDetails || '');
    setIdType(policy.idType || 'Aadhaar');
    setIdNumber(policy.idNumber || '');
    setVehicleRegistration(policy.vehicleRegistration || '');
    setDriverLicense(policy.driverLicense || '');
    setWaitingPeriod(policy.waitingPeriod || '');
    setCoverageDetails(policy.coverageDetails || '');
    setPolicyDocumentUrl(policy.policyDocumentUrl || '');
    setPoliceVerificationCertificate(policy.policeVerificationCertificate || '');
    setOtherDocuments(policy.otherDocuments || '');
    setIsModalOpen(true);
  };

  const handleSavePolicy = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const payload = {
      holderName,
      type: policyType,
      premium: parseFloat(premium),
      expiry,
      nominee,
      paymentStatus,
      email,
      phone,
      address,
      insuredItemOrPerson,
      sumAssured: sumAssured ? parseFloat(sumAssured) : null,
      coveragePeriod,
      nomineeDetails,
      idType,
      idNumber,
      vehicleRegistration: policyType === 'Auto' ? vehicleRegistration : '',
      driverLicense: policyType === 'Auto' ? driverLicense : '',
      waitingPeriod: policyType === 'Health' ? waitingPeriod : '',
      coverageDetails: policyType === 'Health' ? coverageDetails : '',
      policyDocumentUrl,
      policeVerificationCertificate,
      otherDocuments,
    };

    try {
      if (modalMode === 'create') {
        await api.post('/policies', payload);
        toast.success('Policy successfully added.');
      } else {
        await api.put(`/policies/${selectedPolicyId}`, payload);
        toast.success('Policy updated successfully.');
      }
      setIsModalOpen(false);
      fetchPolicies();
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error(error.response?.data?.message || 'Failed to save policy record.');
    }
  };

  const handleDeletePolicy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/policies/${id}`);
      toast.success('Policy deleted.');
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-graphite-400 text-xs" />
            <input
              type="text"
              placeholder="Search holder, policy..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 rounded-xl bg-white dark:bg-graphite-900 focus:outline-none focus:ring-1 focus:ring-graphite-900 dark:focus:ring-white dark:text-white"
            />
          </div>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 rounded-xl bg-white dark:bg-graphite-900 focus:outline-none text-graphite-600 dark:text-graphite-300"
          >
            <option value="All">All Types</option>
            <option value="Life">Life</option>
            <option value="Health">Health</option>
            <option value="Auto">Auto</option>
            <option value="Home">Home</option>
            <option value="Property">Property</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 rounded-xl bg-white dark:bg-graphite-900 focus:outline-none text-graphite-600 dark:text-graphite-300"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 font-bold text-xs rounded-xl shadow-premium cursor-pointer transition hover:bg-graphite-800 dark:hover:bg-graphite-100"
        >
          <FiPlus className="text-sm" /> Add Policy
        </button>
      </div>

      {/* Main Table Card */}
      <div className="glass rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-850 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-graphite-200 dark:border-graphite-800 bg-graphite-100/30 dark:bg-graphite-950/20 text-[9px] font-bold uppercase tracking-wider text-graphite-400">
                <th className="px-6 py-3.5">Policy Number</th>
                <th className="px-6 py-3.5">Holder Name</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Premium</th>
                <th className="px-6 py-3.5">Expiry Date</th>
                <th className="px-6 py-3.5">Nominee</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-200 dark:divide-graphite-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-graphite-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-graphite-900 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-graphite-450 dark:text-graphite-400">
                    No policies found matching filters.
                  </td>
                </tr>
              ) : (
                policies.map((p) => (
                  <tr key={p.id} className="hover:bg-graphite-100/30 dark:hover:bg-graphite-950/20 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-graphite-900 dark:text-white select-all">
                      {p.policyNumber}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-graphite-800 dark:text-graphite-200">
                      {p.holderName}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-graphite-100 text-graphite-600 dark:bg-graphite-800 dark:text-graphite-350 border border-graphite-200/50 dark:border-graphite-700/50">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-graphite-800 dark:text-graphite-200">
                      ${parseFloat(p.premium).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-graphite-500 dark:text-graphite-400">
                      {p.expiry}
                    </td>
                    <td className="px-6 py-3.5 text-graphite-600 dark:text-graphite-300">
                      {p.nominee}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        p.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-350'
                          : p.paymentStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-350'
                          : 'bg-red-100 text-red-850 dark:bg-red-950/40 dark:text-red-350'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => { setViewingPolicy(p); setIsDetailOpen(true); }}
                        className="p-1.5 text-graphite-500 hover:text-graphite-900 hover:bg-graphite-100 dark:hover:bg-graphite-800 rounded-lg cursor-pointer transition inline-flex items-center"
                        title="View Details"
                      >
                        <FiEye className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-graphite-500 hover:text-graphite-900 hover:bg-graphite-100 dark:hover:bg-graphite-800 rounded-lg cursor-pointer transition inline-flex items-center"
                        title="Edit Policy"
                      >
                        <FiEdit2 className="text-xs" />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeletePolicy(p.id)}
                          className="p-1.5 text-red-400 hover:text-red-650 hover:bg-red-950/15 rounded-lg cursor-pointer transition inline-flex items-center"
                          title="Delete Policy"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-graphite-200 dark:border-graphite-800 bg-white dark:bg-graphite-900 select-none">
            <span className="text-[10px] font-semibold text-graphite-400 uppercase tracking-wider">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded-lg border border-graphite-200 dark:border-graphite-800 hover:bg-graphite-100 dark:hover:bg-graphite-800 disabled:opacity-30 cursor-pointer transition"
              >
                <FiChevronLeft className="text-sm text-graphite-500 dark:text-graphite-400" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded-lg border border-graphite-200 dark:border-graphite-800 hover:bg-graphite-100 dark:hover:bg-graphite-800 disabled:opacity-30 cursor-pointer transition"
              >
                <FiChevronRight className="text-sm text-graphite-500 dark:text-graphite-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pop-up Modals for CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="glass relative w-full max-w-lg bg-white dark:bg-graphite-900 rounded-2xl p-6 shadow-premium-lg border border-graphite-200 dark:border-graphite-800 z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-graphite-100 dark:hover:bg-graphite-800 rounded-lg text-graphite-400 cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>

              <h3 className="text-sm font-bold text-graphite-900 dark:text-white mb-4 flex items-center gap-2">
                <span>{modalMode === 'create' ? 'Create New Insurance Policy' : 'Edit Policy Details'}</span>
                <span className="text-[10px] font-normal text-graphite-400 dark:text-graphite-500 bg-graphite-100 dark:bg-graphite-950 px-2 py-0.5 rounded-full uppercase tracking-wider">Step {formStep} of 3</span>
              </h3>

              {/* Progress Stepper */}
              <div className="flex justify-between items-center mb-6 select-none border-b border-graphite-100 dark:border-graphite-800 pb-3">
                {[
                  { label: 'Schedule Info', step: 1 },
                  { label: 'Verification', step: 2 },
                  { label: 'Documents', step: 3 }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.step}
                    disabled={modalMode === 'create' && formStep < item.step}
                    onClick={() => setFormStep(item.step)}
                    className="flex items-center flex-1 last:flex-initial text-left focus:outline-none disabled:cursor-not-allowed group"
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-300 ${
                      formStep === item.step 
                        ? 'bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 scale-110 shadow-premium' 
                        : formStep > item.step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-graphite-100 text-graphite-400 dark:bg-graphite-800 dark:text-graphite-550'
                    }`}>
                      {formStep > item.step ? '✓' : item.step}
                    </div>
                    <span className={`text-[9px] font-bold ml-1.5 hidden sm:inline uppercase tracking-wider transition-colors duration-300 ${
                      formStep === item.step
                        ? 'text-graphite-900 dark:text-white'
                        : 'text-graphite-400 dark:text-graphite-500'
                    }`}>
                      {item.label}
                    </span>
                    {item.step < 3 && (
                      <div className={`h-[1px] flex-1 mx-3 hidden sm:block transition-all duration-300 ${
                        formStep > item.step 
                          ? 'bg-emerald-500' 
                          : 'bg-graphite-100 dark:bg-graphite-800'
                      }`} />
                    )}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
                {formStep === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-3.5"
                  >
                    {/* Step 1 Fields */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Holder Name *</label>
                      <input
                        type="text"
                        required
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-graphite-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Policy Type *</label>
                        <select
                          value={policyType}
                          onChange={(e) => setPolicyType(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                        >
                          <option value="Life">Life</option>
                          <option value="Health">Health</option>
                          <option value="Auto">Auto</option>
                          <option value="Home">Home</option>
                          <option value="Property">Property</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Annual Premium ($) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          step="0.01"
                          value={premium}
                          onChange={(e) => setPremium(e.target.value)}
                          placeholder="e.g. 1200"
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-graphite-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Expiry Date *</label>
                        <input
                          type="date"
                          required
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Nominee Name *</label>
                        <input
                          type="text"
                          required
                          value={nominee}
                          onChange={(e) => setNominee(e.target.value)}
                          placeholder="Beneficiary name"
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Nominee Details (Relationship, Age, etc.)</label>
                      <input
                        type="text"
                        value={nomineeDetails}
                        onChange={(e) => setNomineeDetails(e.target.value)}
                        placeholder="e.g. Spouse, 34 years old"
                        className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Insured Item or Person</label>
                        <input
                          type="text"
                          value={insuredItemOrPerson}
                          onChange={(e) => setInsuredItemOrPerson(e.target.value)}
                          placeholder="e.g. Honda Civic 2024 / John Doe"
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Coverage Period</label>
                        <input
                          type="text"
                          value={coveragePeriod}
                          onChange={(e) => setCoveragePeriod(e.target.value)}
                          placeholder="e.g. 1 Year"
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Sum Assured / Insured Amount ($)</label>
                      <input
                        type="number"
                        min="1"
                        value={sumAssured}
                        onChange={(e) => setSumAssured(e.target.value)}
                        placeholder="e.g. 150000"
                        className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-graphite-900"
                      />
                    </div>
                  </motion.div>
                )}

                {formStep === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-3.5"
                  >
                    {/* Identity Proof */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">ID Proof Type</label>
                        <select
                          value={idType}
                          onChange={(e) => setIdType(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                        >
                          <option value="Aadhaar">Aadhaar Card</option>
                          <option value="PAN">PAN Card</option>
                          <option value="Passport">Passport</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Driver License">Driver's License</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">ID Proof Number</label>
                        <input
                          type="text"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          placeholder="ID number"
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Conditional vehicle policy inputs */}
                    {policyType === 'Auto' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="p-3 bg-graphite-50 dark:bg-graphite-950/40 rounded-xl border border-graphite-150 dark:border-graphite-800/60 space-y-3"
                      >
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-600 dark:text-graphite-400">Vehicle Policy Parameters</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Vehicle Registration No.</label>
                            <input
                              type="text"
                              value={vehicleRegistration}
                              onChange={(e) => setVehicleRegistration(e.target.value)}
                              placeholder="e.g. DL-3C-AB-1234"
                              className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Driver's License No.</label>
                            <input
                              type="text"
                              value={driverLicense}
                              onChange={(e) => setDriverLicense(e.target.value)}
                              placeholder="e.g. DL1420110012345"
                              className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Conditional health policy inputs */}
                    {policyType === 'Health' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="p-3 bg-graphite-50 dark:bg-graphite-950/40 rounded-xl border border-graphite-150 dark:border-graphite-800/60 space-y-3"
                      >
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-600 dark:text-graphite-400">Health Policy Parameters</h4>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Waiting Period</label>
                            <input
                              type="text"
                              value={waitingPeriod}
                              onChange={(e) => setWaitingPeriod(e.target.value)}
                              placeholder="e.g. 30 Days / 2 Years"
                              className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Coverage Details & Exclusions</label>
                            <textarea
                              rows="3"
                              value={coverageDetails}
                              onChange={(e) => setCoverageDetails(e.target.value)}
                              placeholder="Describe coverage scopes, OPD, critical illness waiting, exclusions etc."
                              className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {formStep === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-3.5"
                  >
                    {/* Policyholder Contact details */}
                    <div className="p-3 bg-graphite-50 dark:bg-graphite-950/40 rounded-xl border border-graphite-150 dark:border-graphite-800/60 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-600 dark:text-graphite-400">Policyholder Details</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. sarah@example.com"
                            className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Phone Number</label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. +1 555-0199"
                            className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Residential Address</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="City, State, Country"
                          className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Policy Documents */}
                    <div className="p-3 bg-graphite-50 dark:bg-graphite-950/40 rounded-xl border border-graphite-150 dark:border-graphite-800/60 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-600 dark:text-graphite-400">Policy & Legal Documents</h4>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Insurance Policy Document Link / Ref</label>
                          <input
                            type="text"
                            value={policyDocumentUrl}
                            onChange={(e) => setPolicyDocumentUrl(e.target.value)}
                            placeholder="e.g. /docs/policy-schedule-sarah.pdf"
                            className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Police Verification Certificate Ref</label>
                          <input
                            type="text"
                            value={policeVerificationCertificate}
                            onChange={(e) => setPoliceVerificationCertificate(e.target.value)}
                            placeholder="e.g. PVC-82910-NYPD"
                            className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Other Required Documents</label>
                          <input
                            type="text"
                            value={otherDocuments}
                            onChange={(e) => setOtherDocuments(e.target.value)}
                            placeholder="e.g. Medicalcheckup.pdf, Idproof.jpg"
                            className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Payment Status</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Stepper Footer Controls */}
                <div className="flex gap-2 justify-between pt-4 border-t border-graphite-100 dark:border-graphite-800 select-none">
                  {formStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setFormStep((s) => s - 1)}
                      className="px-3.5 py-1.5 border border-graphite-200 dark:border-graphite-800 text-xs font-semibold rounded-xl hover:bg-graphite-100 dark:hover:bg-graphite-800 transition cursor-pointer"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3.5 py-1.5 border border-graphite-200 dark:border-graphite-800 text-xs font-semibold rounded-xl hover:bg-graphite-100 dark:hover:bg-graphite-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                  <div className="flex gap-2">
                    {formStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!validateStep(formStep)) return;
                          setFormStep((s) => s + 1);
                        }}
                        className="px-3.5 py-1.5 bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 text-xs font-semibold rounded-xl hover:bg-graphite-800 dark:hover:bg-graphite-100 transition shadow cursor-pointer"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSavePolicy()}
                        className="px-3.5 py-1.5 bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 text-xs font-semibold rounded-xl hover:bg-graphite-800 dark:hover:bg-graphite-100 transition shadow cursor-pointer"
                      >
                        {modalMode === 'create' ? 'Create' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isDetailOpen && viewingPolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="glass relative w-full max-w-xl bg-white dark:bg-graphite-900 rounded-2xl p-6 shadow-premium-lg border border-graphite-200 dark:border-graphite-800 z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-graphite-100 dark:hover:bg-graphite-800 rounded-lg text-graphite-400 cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-graphite-900 text-white dark:bg-white dark:text-graphite-900">
                  {viewingPolicy.type}
                </span>
                <h3 className="text-sm font-bold text-graphite-900 dark:text-white">
                  Policy Details
                </h3>
              </div>

              <div className="space-y-6">
                {/* 1. Policy Number & Status */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-graphite-50 dark:bg-graphite-950/40 rounded-2xl border border-graphite-150 dark:border-graphite-800/60 gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-graphite-400 uppercase tracking-widest block">Policy Number</span>
                    <span className="text-sm font-mono font-bold text-graphite-900 dark:text-white select-all">{viewingPolicy.policyNumber}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      viewingPolicy.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-350'
                        : viewingPolicy.paymentStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-350'
                        : 'bg-red-100 text-red-850 dark:bg-red-950/40 dark:text-red-350'
                    }`}>
                      Payment: {viewingPolicy.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Grid for main properties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Policyholder Details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-400 border-b border-graphite-100 dark:border-graphite-800 pb-1.5">Policyholder & Identity</h4>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-graphite-400 uppercase block">Full Name</span>
                        <span className="font-semibold text-graphite-800 dark:text-graphite-200">{viewingPolicy.holderName}</span>
                      </div>
                      
                      {viewingPolicy.email && (
                        <div>
                          <span className="text-[9px] font-bold text-graphite-400 uppercase block">Email Address</span>
                          <span className="text-graphite-600 dark:text-graphite-300">{viewingPolicy.email}</span>
                        </div>
                      )}

                      {viewingPolicy.phone && (
                        <div>
                          <span className="text-[9px] font-bold text-graphite-400 uppercase block">Phone Number</span>
                          <span className="text-graphite-600 dark:text-graphite-300">{viewingPolicy.phone}</span>
                        </div>
                      )}

                      {viewingPolicy.address && (
                        <div>
                          <span className="text-[9px] font-bold text-graphite-400 uppercase block">Address</span>
                          <span className="text-graphite-600 dark:text-graphite-300">{viewingPolicy.address}</span>
                        </div>
                      )}

                      {(viewingPolicy.idType || viewingPolicy.idNumber) && (
                        <div>
                          <span className="text-[9px] font-bold text-graphite-400 uppercase block">Identity Verification ({viewingPolicy.idType || 'ID'})</span>
                          <span className="font-mono font-medium text-graphite-700 dark:text-graphite-300">{viewingPolicy.idNumber || 'Not Provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Policy Schedule */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-400 border-b border-graphite-100 dark:border-graphite-800 pb-1.5">Policy Schedule</h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] font-bold text-graphite-400 uppercase block">Annual Premium</span>
                          <span className="font-bold text-graphite-900 dark:text-white">${parseFloat(viewingPolicy.premium).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-graphite-400 uppercase block">Sum Assured</span>
                          <span className="font-bold text-graphite-900 dark:text-white">
                            {viewingPolicy.sumAssured ? `$${parseFloat(viewingPolicy.sumAssured).toFixed(2)}` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Expiry Date</span>
                          <span className="text-graphite-700 dark:text-graphite-300">{viewingPolicy.expiry}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Coverage Period</span>
                          <span className="text-graphite-700 dark:text-graphite-300">{viewingPolicy.coveragePeriod || 'N/A'}</span>
                        </div>
                      </div>

                      {viewingPolicy.insuredItemOrPerson && (
                        <div>
                          <span className="text-[9px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Insured Subject (Item/Person)</span>
                          <span className="font-medium text-graphite-800 dark:text-graphite-200">{viewingPolicy.insuredItemOrPerson}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-[9px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Nominee Beneficiary</span>
                        <span className="font-semibold text-graphite-800 dark:text-graphite-200">{viewingPolicy.nominee}</span>
                        {viewingPolicy.nomineeDetails && (
                          <span className="text-[10px] text-graphite-500 block">({viewingPolicy.nomineeDetails})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specific features for health / auto */}
                {(viewingPolicy.type === 'Auto' || viewingPolicy.type === 'Health') && (
                  <div className="p-4 bg-graphite-50 dark:bg-graphite-950/40 rounded-2xl border border-graphite-150 dark:border-graphite-800/60 space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-700 dark:text-graphite-300">
                      {viewingPolicy.type === 'Auto' ? 'Vehicle Specific Details' : 'Health Specific Details'}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {viewingPolicy.type === 'Auto' ? (
                        <>
                          <div>
                            <span className="text-[9px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Vehicle Registration</span>
                            <span className="font-semibold text-graphite-800 dark:text-graphite-200">{viewingPolicy.vehicleRegistration || 'Not Provided'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Driver's License</span>
                            <span className="font-mono text-graphite-850 dark:text-graphite-200">{viewingPolicy.driverLicense || 'Not Provided'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-[9px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Waiting Period</span>
                            <span className="font-semibold text-graphite-800 dark:text-graphite-200">{viewingPolicy.waitingPeriod || 'Not Provided'}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[9px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Coverage Details & Exclusions</span>
                            <p className="text-graphite-700 dark:text-graphite-300 whitespace-pre-wrap">{viewingPolicy.coverageDetails || 'Not Provided'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-400 border-b border-graphite-100 dark:border-graphite-800 pb-1.5">Submitted Documents</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl border border-graphite-150 dark:border-graphite-800 bg-white dark:bg-graphite-950 flex flex-col justify-between">
                      <span className="text-[8px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Policy Document</span>
                      <span className="text-[11px] font-medium text-graphite-800 dark:text-graphite-200 truncate mt-1">
                        {viewingPolicy.policyDocumentUrl || 'Not Uploaded'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-graphite-150 dark:border-graphite-800 bg-white dark:bg-graphite-950 flex flex-col justify-between">
                      <span className="text-[8px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Police Verification</span>
                      <span className="text-[11px] font-medium text-graphite-800 dark:text-graphite-200 truncate mt-1">
                        {viewingPolicy.policeVerificationCertificate || 'Not Verified'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-graphite-150 dark:border-graphite-800 bg-white dark:bg-graphite-950 flex flex-col justify-between">
                      <span className="text-[8px] font-bold text-graphite-450 dark:text-graphite-400 uppercase block">Other Documents</span>
                      <span className="text-[11px] font-medium text-graphite-800 dark:text-graphite-200 truncate mt-1">
                        {viewingPolicy.otherDocuments || 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit Trail */}
                {viewingPolicy.auditTrail && viewingPolicy.auditTrail.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-graphite-400 border-b border-graphite-100 dark:border-graphite-800 pb-1.5">History & Audit Trail</h4>
                    
                    <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                      {viewingPolicy.auditTrail.map((log, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] text-graphite-500 py-1 border-b border-graphite-50 dark:border-graphite-850 last:border-0">
                          <span>Action: <strong>{log.action}</strong> by {log.by}</span>
                          <span>{new Date(log.date).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 select-none">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-1.5 bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 text-xs font-bold rounded-xl hover:bg-graphite-800 dark:hover:bg-graphite-100 transition shadow cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Policies;
