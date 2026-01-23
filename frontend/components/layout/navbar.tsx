// components/layout/navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Calendar, LogOut, User, 
  Activity, Settings, ChevronDown, 
  Moon, Sun, Bell, Search, Sparkles, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '../../hooks/use-theme';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Fixed green theme for all users
  const deptTheme = {
    nav: "bg-gradient-to-r from-emerald-700 to-emerald-800",
    soft: "bg-emerald-50",
    accent: "text-emerald-600",
    logoFrom: "from-emerald-500",
    logoTo: "to-green-600",
    border: "border-emerald-900/30",
    hover: "hover:bg-emerald-700",
    dark: "bg-gradient-to-r from-emerald-800 to-emerald-900",
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Calendar size={18} /> },
    { href: '/admin', label: 'Admin Panel', icon: <Settings size={18} /> },
    { href: '/admin/activity-logs', label: 'Activity Logs', icon: <Activity size={18} /> },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const navbarVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: -100, opacity: 0 }
  };

  return (
    <>
      {/* Navigation Bar */}
      <motion.nav
        initial="visible"
        animate={isScrolled ? "hidden" : "visible"}
        variants={navbarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'translate-y-[-100%]' 
            : 'translate-y-0'
        } ${theme === 'dark' ? deptTheme.dark : deptTheme.nav} border-b ${deptTheme.border} shadow-lg`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} group-hover:${deptTheme.hover} transition-all duration-500 shadow-lg`}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                <GraduationCap className="h-6 w-6 text-white" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute -inset-1 rounded-full ${deptTheme.logoFrom}/20 blur-sm`}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <h1 className="text-xl font-bold text-white">
                  ScheduleFlow
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-white/80">
                    Holy Trinity University
                  </p>
                  <Sparkles className="h-3 w-3 text-white/60 animate-pulse" />
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 rounded-full bg-white"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Notification Bell */}
              <motion.div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {showNotification && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-400 border-2 border-white"
                    />
                  )}
                </motion.button>
              </motion.div>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
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
                      <Sun className="h-5 w-5 text-yellow-300" />
                    ) : (
                      <Moon className="h-5 w-5" />
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
                    className="flex items-center space-x-2 rounded-full p-1 hover:bg-white/10 transition-colors"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`relative h-9 w-9 rounded-full bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-white text-sm font-medium">
                        {user.first_name?.[0] || user.email?.[0]}
                      </span>
                      <div className={`absolute -inset-1 rounded-full ${deptTheme.logoFrom}/30 blur-sm`} />
                    </motion.div>
                    <ChevronDown size={16} className="text-white/80" />
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 0, y: 10, scale: 0.95 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl shadow-2xl border min-w-[240px] overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} flex items-center justify-center`}>
                            <span className="text-white font-medium">
                              {user.first_name?.[0] || user.email?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deptTheme.soft} ${deptTheme.accent}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link href="/profile">
                          <button className="flex w-full items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <User size={16} />
                            <span>Profile Settings</span>
                          </button>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 dark:border-gray-800">
                        <button
                          onClick={logout}
                          className="flex w-full items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
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
                    <Button className="bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900 border border-white/20">
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
                className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white"
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
              className="md:hidden border-t border-white/10 bg-white/10 backdrop-blur-md"
            >
              <div className="px-4 py-3 space-y-1">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        pathname === item.href
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 border-t border-white/10">
                  <div className="p-3 rounded-lg bg-white/10">
                    <p className="text-sm font-medium text-white">
                      Currently viewing as
                    </p>
                    <p className="text-xs text-white/80">
                      {user?.role.replace('_', ' ') || 'Guest'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Scroll Indicator */}
      {isScrolled && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed top-4 right-4 z-40 p-2 rounded-full shadow-lg backdrop-blur-sm ${theme === 'dark' ? deptTheme.dark : deptTheme.nav} hover:${deptTheme.hover} text-white border ${deptTheme.border} transition-all duration-300 hover:scale-110`}
        >
          <ChevronDown className="h-5 w-5 rotate-180" />
        </motion.button>
      )}
    </>
  );
};