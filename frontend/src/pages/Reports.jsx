import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiPrinter, FiAlertCircle } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  if (user && user.role !== 'admin') {
    return (
      <div className="flex flex-col h-[65vh] items-center justify-center text-center space-y-4">
        <div className="p-4 bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-300 rounded-full">
          <FiAlertCircle className="text-3xl animate-pulse" />
        </div>
        <h3 className="text-sm font-bold text-graphite-900 dark:text-white uppercase tracking-wider">Access Denied</h3>
        <p className="text-xs text-graphite-500 dark:text-graphite-400 max-w-xs">
          You do not have administrative privileges to compile or view policy reports.
        </p>
        <Link to="/" className="px-4 py-1.5 bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 text-xs font-semibold rounded-xl hover:bg-graphite-800 dark:hover:bg-graphite-100 transition shadow">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, policiesRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/policies', { params: { limit: 100 } }),
      ]);
      setData(analyticsRes.data.data);
      setPolicies(policiesRes.data.data);
    } catch (error) {
      console.error('Failed to load reports details:', error);
      toast.error('Could not compile analytics report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (policies.length === 0) {
      toast.error('No policy data available to export.');
      return;
    }

    const headers = ['Policy Number', 'Holder Name', 'Type', 'Annual Premium ($)', 'Expiry Date', 'Nominee', 'Payment Status'];
    const rows = policies.map(p => [
      p.policyNumber,
      p.holderName,
      p.type,
      p.premium,
      p.expiry,
      p.nominee,
      p.paymentStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Insurance_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report exported successfully.');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-graphite-900 border-t-transparent"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const revenueTrend = data?.revenueTrend || [];

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* Actions (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h4 className="text-xs text-graphite-450 dark:text-graphite-400">Generate, print, and export insurance portfolio audits</h4>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-graphite-200 dark:border-graphite-800 text-xs font-semibold rounded-xl hover:bg-graphite-100 dark:hover:bg-graphite-800 transition cursor-pointer text-graphite-700 dark:text-graphite-300"
          >
            <FiPrinter className="text-sm" /> Print Report
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 font-bold text-xs rounded-xl shadow-premium cursor-pointer transition hover:bg-graphite-800 dark:hover:bg-graphite-100"
          >
            <FiDownload className="text-sm" /> Export CSV
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block border-b border-graphite-200 pb-3 mb-5">
        <h2 className="text-lg font-bold">InsuraCorp Insurance Systems</h2>
        <p className="text-[10px] text-graphite-500">Official Policy Portfolio Audit Report | Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* KPI Stats block */}
      <div className="grid grid-cols-3 gap-4 border border-graphite-200 dark:border-graphite-800 rounded-2xl p-4 bg-white dark:bg-graphite-900 shadow-premium print:border-none print:shadow-none print:p-0 print:grid-cols-3 print:gap-2">
        <div className="text-center border-r border-graphite-200 dark:border-graphite-800 last:border-r-0">
          <span className="text-[9px] font-semibold text-graphite-400 uppercase tracking-widest block">Total Policies</span>
          <h3 className="text-lg font-bold text-graphite-900 dark:text-white mt-1">{kpis.totalPolicies}</h3>
        </div>
        <div className="text-center border-r border-graphite-200 dark:border-graphite-800 last:border-r-0">
          <span className="text-[9px] font-semibold text-graphite-400 uppercase tracking-widest block">Premium Collected</span>
          <h3 className="text-lg font-bold text-graphite-900 dark:text-white mt-1">${kpis.totalRevenue?.toLocaleString()}</h3>
        </div>
        <div className="text-center last:border-r-0">
          <span className="text-[9px] font-semibold text-graphite-400 uppercase tracking-widest block">Overdue Items</span>
          <h3 className="text-lg font-bold text-red-650 dark:text-red-300 mt-1">{kpis.overduePolicies}</h3>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
        <div className="glass rounded-2xl p-6 bg-white dark:bg-graphite-900 shadow-premium print:border-none print:shadow-none print:p-0">
          <h4 className="font-bold text-sm text-graphite-800 dark:text-white mb-4">Monthly Premium Collections</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 9 }} />
                <YAxis tickLine={false} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#18181b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 bg-white dark:bg-graphite-900 shadow-premium print:border-none print:shadow-none print:p-0">
          <h4 className="font-bold text-sm text-graphite-800 dark:text-white mb-4">Policy Registration Volatility</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 9 }} />
                <YAxis tickLine={false} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="policies" stroke="#18181b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Portfolio Breakdown Table */}
      <div className="glass rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-850 shadow-premium overflow-hidden print:border-none print:shadow-none print:bg-transparent">
        <div className="px-6 py-4 border-b border-graphite-200 dark:border-graphite-800 print:px-0">
          <h4 className="font-bold text-sm text-graphite-800 dark:text-white">Active Portfolio Breakdown</h4>
          <p className="text-xs text-graphite-400 print:hidden">Comprehensive list of all policies in active management</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-graphite-200 dark:border-graphite-800 bg-graphite-100/30 dark:bg-graphite-950/20 text-[9px] font-bold uppercase tracking-wider text-graphite-400">
                <th className="px-6 py-3">Policy Number</th>
                <th className="px-6 py-3">Holder</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Premium</th>
                <th className="px-6 py-3">Expiry</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-200 dark:divide-graphite-800 text-xs">
              {policies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-graphite-400">No policy records registered in database.</td>
                </tr>
              ) : (
                policies.map(p => (
                  <tr key={p.id} className="hover:bg-graphite-100/30 dark:hover:bg-graphite-950/10">
                    <td className="px-6 py-3 font-mono font-semibold text-graphite-900 dark:text-white">{p.policyNumber}</td>
                    <td className="px-6 py-3 font-semibold text-graphite-800 dark:text-graphite-200">{p.holderName}</td>
                    <td className="px-6 py-3">{p.type}</td>
                    <td className="px-6 py-3 font-bold text-graphite-800 dark:text-white">${parseFloat(p.premium).toFixed(2)}</td>
                    <td className="px-6 py-3 text-graphite-500">{p.expiry}</td>
                    <td className="px-6 py-3 font-semibold">{p.paymentStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styled Print styles */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          aside, header, button, .print\\:hidden, #root > aside {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          #root {
            border: none !important;
            width: 100% !important;
            margin: 0 !important;
          }
          .glass {
            border: none !important;
            background: transparent !important;
            backdrop-filter: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
