'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, User, ChevronDown, 
  Moon, Sun, LogOut, Settings,
  Download, Printer, Eye, GraduationCap,
  Sparkles,
  Menu, X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import { useTheme } from '@/hooks/use-theme';

export default function StudentNavbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const notifications = [
    { id: 1, text: 'Your add request for ITCP 106 is pending', time: '2h ago', unread: true },
    { id: 2, text: 'Schedule conflict detected in CL2', time: '1d ago', unread: true },
    { id: 3, text: 'Your drop request has been approved', time: '2d ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Show notification badge
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const profileActions = [
    { label: 'View Profile', icon: User, href: '/student/profile' },
    { label: 'Settings', icon: Settings, href: '/student/settings' },
    { label: 'Export Schedule', icon: Download, href: '/student/export' },
    { label: 'Print Schedule', icon: Printer, href: '/student/print' },
    { label: 'View Full Schedule', icon: Eye, href: '/student/schedule' },
  ];

  const closeDropdowns = () => {
    setIsNotificationDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setIsNotificationDropdownOpen(false);
      }
      if (!target.closest('.user-dropdown') && !target.closest('.user-menu-button')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand - Now centered since nav items are removed */}
            <div className="flex items-center">
              <Link href="/student" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 group-hover:from-primary/90 group-hover:to-primary transition-all duration-500 border border-primary/30"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 dark:from-black/10 to-transparent" />
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -inset-1 rounded-xl from-primary/20 to-primary/10 blur-sm"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="hidden md:block"
                >
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground tracking-tight">
                      TrinitySync
                    </h1>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded border border-primary/30">
                      STUDENT
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Student Portal
                    </p>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Right Side Actions Only */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Notification */}
              <motion.div className="relative notification-dropdown">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="notification-button flex items-center justify-center h-10 w-10 rounded-xl bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onClick={() => {
                    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
                    setIsUserDropdownOpen(false);
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {showNotification && unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive border-2 border-card"
                    />
                  )}
                </motion.button>
                <NotificationDropdown
                  isOpen={isNotificationDropdownOpen}
                  notifications={notifications}
                  title="Student notifications"
                />
              </motion.div>

              {/* User Menu */}
              {user && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative user-dropdown"
                >
                  <motion.button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="user-menu-button flex items-center space-x-3 rounded-xl px-3 py-1.5 hover:bg-accent border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border border-primary/30"
                    >
                      <span className="text-primary-foreground text-sm font-bold">
                        {user.first_name?.[0] || user.email?.[0]}
                      </span>
                      <div className="absolute -inset-1 rounded-lg from-primary/20 to-primary/10 blur-sm" />
                    </motion.div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {user.first_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.program}
                      </p>
                    </div>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 z-50"
                      >
                        <motion.div
                          className="rounded-xl shadow-xl border min-w-[260px] overflow-hidden bg-card border-border"
                        >
                          {/* User Info */}
                          <div className="p-4 border-b border-border bg-gradient-to-r from-accent/30 to-accent/10">
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border border-primary/30">
                                <span className="text-primary-foreground font-bold text-lg">
                                  {user.first_name?.[0] || user.email?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-foreground">
                                  {user.first_name} {user.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                <GraduationCap className="h-3 w-3 mr-1.5" />
                                {user.program} • Year {user.year_level?.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="py-2">
                            <div className="px-3 py-2">
                              <p className="text-xs font-medium text-muted-foreground mb-2">QUICK ACTIONS</p>
                              <div className="space-y-1">
                                {profileActions.map((action) => {
                                  const Icon = action.icon;
                                  return (
                                    <Link key={action.label} href={action.href} onClick={closeDropdowns}>
                                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                        <div className="flex items-center space-x-3">
                                          <div className="p-1.5 rounded-md bg-primary/10">
                                            <Icon className="h-4 w-4 text-primary" />
                                          </div>
                                          <span className="text-sm font-medium text-foreground">{action.label}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg]" />
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-border p-2 bg-accent/10">
                            <button
                              onClick={() => {
                                logout();
                                closeDropdowns();
                              }}
                              className="flex w-full items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
                            >
                              <LogOut size={16} />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-accent text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 ml-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Minimal version since nav items are removed */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-card/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3">
                <div className="p-3.5 rounded-xl bg-accent/40 border border-border">
                  <p className="text-sm font-medium text-muted-foreground">
                    Currently viewing as
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-semibold text-foreground">
                      Student • {user?.program}
                    </p>
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
