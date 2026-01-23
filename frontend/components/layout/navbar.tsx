// components/layout/navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Calendar, LogOut, User, 
  Activity, Settings, ChevronDown, 
  Moon, Sun, Bell, Search, Sparkles, GraduationCap,
  Shield, Building2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '../../hooks/use-theme';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Fixed solid theme - NO GRADIENTS for maximum visibility
  const deptTheme = {
    nav: "bg-emerald-700",
    soft: "bg-emerald-50",
    accent: "text-emerald-700",
    logoFrom: "from-emerald-500",
    logoTo: "to-emerald-700",
    border: "border-emerald-900/30",
    hover: "hover:bg-emerald-600",
    dark: "bg-emerald-800",
    darkBorder: "border-emerald-900/50",
    active: "bg-emerald-600",
    card: "bg-white dark:bg-gray-900",
    shadow: "shadow-xl shadow-emerald-950/10",
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Calendar size={18} /> },
    { href: '/admin', label: 'Admin Panel', icon: <Shield size={18} /> },
    { href: '/admin/activity-logs', label: 'Activity Logs', icon: <Activity size={18} /> },
    { href: '/admin/settings', label: 'System Settings', icon: <Settings size={18} /> },
  ];

  // Handle notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Navigation Bar - FIXED: Removed scroll hide logic */}
      <motion.nav
      
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? deptTheme.dark : deptTheme.nav} border-b ${theme === 'dark' ? deptTheme.darkBorder : deptTheme.border} ${deptTheme.shadow}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} group-hover:${deptTheme.hover} transition-all duration-500 shadow-lg border border-emerald-500/30`}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent" />
                  <GraduationCap className="h-6 w-6 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`absolute -inset-1 rounded-xl ${deptTheme.logoFrom}/20 blur-sm`}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                      ScheduleFlow
                    </h1>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-600/40 text-emerald-200 rounded border border-emerald-500/30">
                      ADMIN
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <Building2 className="h-3 w-3 text-emerald-300" />
                    <p className="text-xs font-medium text-emerald-200">
                      Holy Trinity University
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1 ml-4">
                {menuItems.map((item, index) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className={`relative px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center space-x-2.5 ${
                          isActive 
                            ? `${deptTheme.active} text-white shadow-lg shadow-emerald-900/30`
                            : 'text-emerald-100 hover:bg-emerald-600/50 hover:text-white'
                        } border ${
                          isActive 
                            ? 'border-emerald-500/50' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`${isActive ? 'text-white' : 'text-emerald-300'}`}>
                            {item.icon}
                          </div>
                          <span className="font-semibold text-sm">{item.label}</span>
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-300"
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-100 border border-emerald-500/30 transition-colors"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Notification */}
              <motion.div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-100 border border-emerald-500/30 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {showNotification && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-emerald-700 shadow-sm"
                    />
                  )}
                </motion.button>
              </motion.div>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-100 border border-emerald-500/30 transition-colors"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5 text-amber-300" />
                    ) : (
                      <Moon className="h-5 w-5 text-emerald-200" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* User Menu */}
              {user ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3 rounded-xl px-3 py-1.5 hover:bg-emerald-600/40 border border-emerald-500/30 transition-colors"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`relative h-8 w-8 rounded-lg bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} flex items-center justify-center shadow-md`}
                    >
                      <span className="text-white text-sm font-bold">
                        {user.first_name?.[0] || user.email?.[0]}
                      </span>
                      <div className={`absolute -inset-1 rounded-lg ${deptTheme.logoFrom}/30 blur-sm`} />
                    </motion.div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-white leading-tight">
                        {user.first_name} {user.last_name?.[0]}.
                      </p>
                      <p className="text-xs text-emerald-200">
                        {user.role.replace('_', ' ')}
                      </p>
                    </div>
                    <ChevronDown size={16} className="text-emerald-300" />
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 0, y: 10, scale: 0.95 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl shadow-2xl border min-w-[260px] overflow-hidden ${deptTheme.card} border-gray-300 dark:border-gray-800`}
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/30">
                        <div className="flex items-center space-x-3">
                          <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} flex items-center justify-center shadow-md`}>
                            <span className="text-white font-bold text-lg">
                              {user.first_name?.[0] || user.email?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${deptTheme.soft} ${deptTheme.accent} border border-emerald-200 dark:border-emerald-800`}>
                            <Shield className="h-3 w-3 mr-1.5" />
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link href="/profile">
                          <button className="flex w-full items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-l-4 border-transparent hover:border-emerald-500">
                            <User size={18} className="text-gray-500 dark:text-gray-400" />
                            <span className="font-medium">Profile Settings</span>
                          </button>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 dark:border-gray-800 p-2">
                        <button
                          onClick={logout}
                          className="flex w-full items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 border-2 border-emerald-300 font-semibold shadow-md">
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-emerald-600/40 text-white border border-emerald-500/30 ml-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-emerald-800/40 bg-emerald-800/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {menuItems.map((item, index) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                            : 'text-emerald-100 hover:bg-emerald-700/70'
                        } border ${isActive ? 'border-emerald-500/50' : 'border-transparent'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className={`${isActive ? 'text-white' : 'text-emerald-300'}`}>
                          {item.icon}
                        </div>
                        <span className="font-semibold">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
                <div className="pt-4 border-t border-emerald-800/40">
                  <div className="p-3.5 rounded-xl bg-emerald-700/40 border border-emerald-600/30">
                    <p className="text-sm font-medium text-emerald-200">
                      Currently viewing as
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs font-semibold text-emerald-100">
                        {user?.role.replace('_', ' ') || 'Guest User'}
                      </p>
                      <Sparkles className="h-3 w-3 text-emerald-300 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

    </>
  );
};