import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiBriefcase } from 'react-icons/fi';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    if (isLogin) {
      const result = await login(email, password);
      setSubmitting(false);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/');
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await register(name, email, password, role);
      setSubmitting(false);
      if (result.success) {
        toast.success('Registration successful. Welcome!');
        navigate('/');
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-graphite-100 to-graphite-50 px-4 dark:from-graphite-950 dark:to-graphite-900">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass w-full max-w-md rounded-2xl p-8 shadow-premium-lg bg-white/80 dark:bg-graphite-900/60"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 mb-3 shadow-md">
            <span className="font-bold text-xl tracking-wider">I</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">
            InsuraCorp Insurance
          </h2>
          <p className="mt-1 text-sm text-graphite-500 dark:text-graphite-400">
            {isLogin ? 'Enterprise Policy Management Suite' : 'Create employee account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300 uppercase tracking-wider">Name</label>
                <div className="relative">
                  <FiUser className="absolute top-1/2 left-3.5 -translate-y-1/2 text-graphite-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-graphite-200 dark:border-graphite-800 bg-white/50 dark:bg-graphite-950/40 text-sm focus:outline-none focus:ring-1 focus:ring-graphite-900 dark:focus:ring-white dark:text-white transition"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <FiMail className="absolute top-1/2 left-3.5 -translate-y-1/2 text-graphite-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-graphite-200 dark:border-graphite-800 bg-white/50 dark:bg-graphite-950/40 text-sm focus:outline-none focus:ring-1 focus:ring-graphite-900 dark:focus:ring-white dark:text-white transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-3.5 -translate-y-1/2 text-graphite-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-graphite-200 dark:border-graphite-800 bg-white/50 dark:bg-graphite-950/40 text-sm focus:outline-none focus:ring-1 focus:ring-graphite-900 dark:focus:ring-white dark:text-white transition"
                required
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300 uppercase tracking-wider">Role</label>
                <div className="relative">
                  <FiBriefcase className="absolute top-1/2 left-3.5 -translate-y-1/2 text-graphite-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-graphite-200 dark:border-graphite-800 bg-white/50 dark:bg-graphite-950/40 text-sm focus:outline-none focus:ring-1 focus:ring-graphite-900 dark:focus:ring-white dark:text-white transition appearance-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-graphite-900 hover:bg-graphite-800 dark:bg-white dark:text-graphite-950 text-white font-medium text-sm tracking-wide shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
          >
            {submitting ? (
              <div className="h-4 w-4 border-2 border-white dark:border-graphite-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : isLogin ? (
              'Sign In to Dashboard'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <span className="text-graphite-500 dark:text-graphite-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-graphite-900 hover:underline dark:text-white cursor-pointer"
          >
            {isLogin ? 'Register here' : 'Sign in here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
