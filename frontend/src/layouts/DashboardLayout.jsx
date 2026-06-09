import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiTrendingUp, FiFolder, FiDollarSign, FiBarChart2, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiTrendingUp },
    { name: 'Policies', href: '/policies', icon: FiFolder },
    { name: 'Payments', href: '/payments', icon: FiDollarSign },
    ...(user?.role === 'admin' ? [{ name: 'Reports', href: '/reports', icon: FiBarChart2 }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const item = navigation.find(n => n.href === location.pathname);
    return item ? item.name : 'Insurance Management';
  };

  return (
    <div className="flex h-screen w-screen bg-graphite-50 overflow-hidden dark:bg-graphite-950 dark:text-white transition-colors">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-graphite-200 text-graphite-800 select-none">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-graphite-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-graphite-900 text-white font-bold shadow-md">
            <span>I</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-wide text-graphite-900">InsuraCorp</h1>
            <p className="text-[10px] text-graphite-500 uppercase tracking-widest">Insurance</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-graphite-900 text-white shadow-md font-semibold'
                    : 'text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900'
                }`}
              >
                <Icon className="text-lg" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-graphite-200 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-graphite-100 text-graphite-700">
              <FiUser />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-graphite-900">{user?.name}</p>
              <p className="text-[10px] text-graphite-500 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium text-red-650 hover:bg-red-50 hover:text-red-750 transition cursor-pointer"
          >
            <FiLogOut className="text-sm" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 22 }}
              className="fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white text-graphite-800 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-graphite-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-graphite-900 text-white font-bold">
                    <span>I</span>
                  </div>
                  <h1 className="font-bold text-sm tracking-wide text-graphite-900">InsuraCorp</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-graphite-100 text-graphite-600 cursor-pointer"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-graphite-900 text-white shadow-md font-semibold'
                          : 'text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900'
                      }`}
                    >
                      <Icon className="text-lg" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-graphite-200 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-graphite-100 text-graphite-700">
                    <FiUser />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-graphite-900">{user?.name}</p>
                    <p className="text-[10px] text-graphite-500 uppercase">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium text-red-650 hover:bg-red-50 hover:text-red-750 transition"
                >
                  <FiLogOut className="text-sm" />
                  Logout Session
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-graphite-200 dark:bg-graphite-900 dark:border-graphite-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-graphite-100 dark:hover:bg-graphite-800 md:hidden cursor-pointer"
            >
              <FiMenu className="text-lg" />
            </button>
            <h2 className="text-lg font-bold tracking-tight text-graphite-900 dark:text-white">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-graphite-100 dark:bg-graphite-800 border border-graphite-200/60 dark:border-graphite-700 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-graphite-600 dark:text-graphite-300">System Live</span>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-premium">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-graphite-900 text-white dark:bg-white dark:text-graphite-950 text-[10px] font-bold">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left leading-none pr-1">
                <p className="text-[10px] font-bold text-graphite-800 dark:text-white">{user?.name}</p>
                <span className="text-[8px] font-semibold text-graphite-400 uppercase tracking-widest">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 relative bg-graphite-50 dark:bg-graphite-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
