import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiFolder, FiDollarSign, FiPercent, FiAlertCircle, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const COLORS = ['#0d9488', '#0f766e', '#1e293b', '#475569', '#cbd5e1'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        toast.error('Could not retrieve analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-graphite-900 border-t-transparent"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalPolicies: 0,
    paidPolicies: 0,
    pendingPolicies: 0,
    overduePolicies: 0,
    totalRevenue: 0,
    successRate: 0,
  };

  const revenueTrend = data?.revenueTrend || [];
  const typeDistribution = data?.typeDistribution || [];
  const recentActivity = data?.recentActivity || [];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl p-5 shadow-premium bg-white dark:bg-graphite-900 flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-graphite-400 uppercase tracking-widest">Total Premiums</span>
            <h3 className="text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">
              {formatCurrency(kpis.totalRevenue)}
            </h3>
            <p className="text-[10px] text-emerald-500 font-medium">All collections live</p>
          </div>
          <div className="p-3 bg-graphite-100 dark:bg-graphite-800 rounded-xl text-graphite-950 dark:text-white">
            <FiDollarSign className="text-lg" />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-2xl p-5 shadow-premium bg-white dark:bg-graphite-900 flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-graphite-400 uppercase tracking-widest">Active Policies</span>
            <h3 className="text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">
              {kpis.totalPolicies}
            </h3>
            <p className="text-[10px] text-graphite-500 dark:text-graphite-400">
              {kpis.paidPolicies} paid, {kpis.pendingPolicies} pending
            </p>
          </div>
          <div className="p-3 bg-graphite-100 dark:bg-graphite-800 rounded-xl text-graphite-950 dark:text-white">
            <FiFolder className="text-lg" />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass rounded-2xl p-5 shadow-premium bg-white dark:bg-graphite-900 flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-graphite-400 uppercase tracking-widest">Collection Rate</span>
            <h3 className="text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">
              {kpis.successRate}%
            </h3>
            <p className="text-[10px] text-emerald-500 font-medium">Goal success margin 85%</p>
          </div>
          <div className="p-3 bg-graphite-100 dark:bg-graphite-800 rounded-xl text-graphite-950 dark:text-white">
            <FiPercent className="text-lg" />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass rounded-2xl p-5 shadow-premium bg-white dark:bg-graphite-900 flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-graphite-400 uppercase tracking-widest">Overdue Policies</span>
            <h3 className="text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">
              {kpis.overduePolicies}
            </h3>
            <p className="text-[10px] text-red-500 font-medium">Requires immediate follow-up</p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-950/20 rounded-xl text-red-600 dark:text-red-300">
            <FiAlertCircle className="text-lg" />
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 bg-white dark:bg-graphite-900 shadow-premium lg:col-span-2 min-w-0 overflow-hidden">
          <div className="mb-6">
            <h4 className="font-bold text-sm text-graphite-800 dark:text-white">Revenue Performance</h4>
            <p className="text-xs text-graphite-400">Premium monthly collections growth trend</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.3} />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 bg-white dark:bg-graphite-900 shadow-premium flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <h4 className="font-bold text-sm text-graphite-800 dark:text-white">Policy Distribution</h4>
            <p className="text-xs text-graphite-400">Active insurance portfolio allocation</p>
          </div>
          <div className="h-52 w-full relative flex items-center justify-center my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-1 text-center text-[9px] border-t border-graphite-150 dark:border-graphite-800 pt-3">
            {typeDistribution.map((item, index) => (
              <div key={item.name} className="flex flex-col items-center">
                <span className="font-semibold text-graphite-600 dark:text-graphite-400">{item.name}</span>
                <span className="font-bold text-graphite-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log Timeline */}
      <div className="glass rounded-2xl p-6 bg-white dark:bg-graphite-900 shadow-premium">
        <div className="flex items-center gap-2 mb-6">
          <FiActivity className="text-graphite-900 dark:text-white text-lg animate-pulse" />
          <div>
            <h4 className="font-bold text-sm text-graphite-800 dark:text-white">Recent System Activities</h4>
            <p className="text-xs text-graphite-400">Chronological list of policy registrations and collections</p>
          </div>
        </div>

        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-graphite-400 py-4">No recent activity logged in the database yet.</p>
            ) : (
              recentActivity.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-6">
                    {activityIdx !== recentActivity.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-graphite-200 dark:bg-graphite-800" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-graphite-900 text-xs font-semibold ${
                          activity.type === 'policy_creation' 
                            ? 'bg-graphite-100 text-graphite-900 dark:bg-graphite-800 dark:text-white' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350'
                        }`}>
                          {activity.type === 'policy_creation' ? 'P' : '$'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-xs font-medium text-graphite-700 dark:text-graphite-250">
                            {activity.message}
                          </p>
                        </div>
                        <div className="text-right text-[10px] font-medium whitespace-nowrap text-graphite-400">
                          {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
