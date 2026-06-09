import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiDollarSign, FiPlus, FiCheckCircle, FiCreditCard, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [unpaidPolicies, setUnpaidPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data.data);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      toast.error('Could not retrieve payment logs.');
    }
  };

  const fetchUnpaidPolicies = async () => {
    try {
      const response = await api.get('/policies', { params: { limit: 100 } });
      const unpaid = response.data.data.filter(p => p.paymentStatus !== 'Paid');
      setUnpaidPolicies(unpaid);
      if (unpaid.length > 0) {
        setSelectedPolicyId(unpaid[0].id);
        setAmount(unpaid[0].premium);
      }
    } catch (error) {
      console.error('Failed to load pending policies:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPayments(), fetchUnpaidPolicies()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePolicyChange = (id) => {
    setSelectedPolicyId(id);
    const policy = unpaidPolicies.find(p => p.id === id);
    if (policy) {
      setAmount(policy.premium);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPolicyId || !amount) {
      toast.error('Please select a policy.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/payments', {
        policyId: selectedPolicyId,
        amount: parseFloat(amount),
        paymentMethod,
      });
      toast.success('Premium payment processed successfully!');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Overview & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="glass rounded-2xl px-5 py-3.5 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-850 shadow-premium w-full sm:w-auto flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl text-emerald-800 dark:text-emerald-350">
            <FiDollarSign className="text-lg" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-graphite-400 uppercase tracking-widest leading-none">Total Collections</span>
            <h3 className="text-xl font-bold tracking-tight text-graphite-900 dark:text-white mt-1">
              {formatCurrency(totalCollected)}
            </h3>
          </div>
        </div>

        <button
          onClick={() => {
            fetchUnpaidPolicies();
            setIsModalOpen(true);
          }}
          disabled={unpaidPolicies.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 font-bold text-xs rounded-xl shadow-premium cursor-pointer transition hover:bg-graphite-800 dark:hover:bg-graphite-100 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <FiPlus className="text-sm" /> Collect Premium
        </button>
      </div>

      {/* Transaction List Card */}
      <div className="glass rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-850 shadow-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-graphite-200 dark:border-graphite-800 bg-graphite-100/30 dark:bg-graphite-950/20">
          <h4 className="font-bold text-sm text-graphite-800 dark:text-white">Premium Payment History</h4>
          <p className="text-xs text-graphite-400">Audit logs of all collection transactions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-graphite-200 dark:border-graphite-800 bg-graphite-100/30 dark:bg-graphite-950/20 text-[9px] font-bold uppercase tracking-wider text-graphite-400">
                <th className="px-6 py-3.5">Transaction ID</th>
                <th className="px-6 py-3.5">Policy Number</th>
                <th className="px-6 py-3.5">Holder Name</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Amount Paid</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-200 dark:divide-graphite-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-graphite-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-graphite-900 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-graphite-450 dark:text-graphite-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-graphite-100/30 dark:hover:bg-graphite-950/10 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-graphite-900 dark:text-white select-all">
                      {p.transactionId}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-graphite-700 dark:text-graphite-300">
                      {p.Policy ? p.Policy.policyNumber : 'N/A'}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-graphite-800 dark:text-graphite-200">
                      {p.Policy ? p.Policy.holderName : 'N/A'}
                    </td>
                    <td className="px-6 py-3.5 text-graphite-500 dark:text-graphite-400">
                      {new Date(p.paymentDate).toLocaleDateString()} at {new Date(p.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-graphite-600 dark:text-graphite-350">
                        <FiCreditCard className="text-[10px]" /> {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-graphite-800 dark:text-white">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <FiCheckCircle className="text-[10px]" /> Success
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Premium Modal */}
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
              className="glass relative w-full max-w-md bg-white dark:bg-graphite-900 rounded-2xl p-6 shadow-premium-lg border border-graphite-200 dark:border-graphite-800 z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-graphite-100 dark:hover:bg-graphite-800 rounded-lg text-graphite-400 cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>

              <h3 className="text-sm font-bold text-graphite-900 dark:text-white mb-4">
                Record Premium Payment
              </h3>

              <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Unpaid Policy</label>
                  <select
                    value={selectedPolicyId}
                    onChange={(e) => handlePolicyChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                  >
                    {unpaidPolicies.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.holderName} - {p.policyNumber} ({p.type}, ${p.premium})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Premium Amount ($)</label>
                  <input
                    type="number"
                    disabled
                    value={amount}
                    className="w-full px-3 py-1.5 text-xs border border-graphite-200 bg-graphite-100 dark:border-graphite-800 dark:bg-graphite-950/40 text-graphite-500 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-graphite-500 uppercase tracking-wider">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-graphite-200 dark:border-graphite-800 dark:bg-graphite-950 dark:text-white rounded-xl focus:outline-none"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4 select-none">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 border border-graphite-200 dark:border-graphite-800 text-xs font-semibold rounded-xl hover:bg-graphite-100 dark:hover:bg-graphite-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3.5 py-1.5 bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 text-xs font-semibold rounded-xl hover:bg-graphite-800 dark:hover:bg-graphite-100 transition shadow cursor-pointer flex items-center gap-2"
                  >
                    {submitting ? 'Processing...' : 'Collect Premium'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payments;
