// components/layout/navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Calendar, LogOut, User, 
  Activity, Settings, ChevronDown, 
  Moon, Sun, Bell, Sparkles, GraduationCap,
  Shield, Building2, CalendarDays, Clock, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '../../hooks/use-theme';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const deptTheme = {
    nav: "bg-card border-border",
    soft: "bg-accent",
    accent: "text-primary",
    logoFrom: "from-primary",
    logoTo: "to-primary",
    border: "border-border",
    hover: "hover:bg-accent",
    dark: "bg-card",
    darkBorder: "border-border",
    active: "bg-accent",
    card: "bg-card",
    shadow: "shadow-lg",
  };

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: <Calendar size={18} />, exact: true },
    { href: '/admin/view-schedules', label: 'Schedules', icon: <CalendarDays size={18} /> },
    { href: '/admin/activity-logs', label: 'Activity Logs', icon: <Activity size={18} /> },
    { href: '/admin/settings', label: 'System Settings', icon: <Settings size={18} /> },
  ];
  const notifications = [
    { id: 1, text: 'Faculty scheduling changes need review', time: '15m ago', unread: true },
    { id: 2, text: 'A new conflict alert was generated for Room CL2', time: '1h ago', unread: true },
    { id: 3, text: 'Schedule export for BSIT was completed', time: 'Yesterday', unread: false },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const closeDropdowns = () => {
    setIsNotificationDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

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

  // Helper function to determine if a nav item is active
  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 ${deptTheme.nav} border-b ${deptTheme.border} ${deptTheme.shadow}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} group-hover:${deptTheme.hover} transition-all duration-500 border border-primary/30`}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 dark:from-black/10 to-transparent" />
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
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
                    <h1 className="text-xl font-bold text-foreground tracking-tight">
                      TrinitySync
                    </h1>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded border border-primary/30">
                      ADMIN
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Holy Trinity University
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1 ml-4">
                {menuItems.map((item, index) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className={`relative px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center space-x-2.5 ${
                          active 
                            ? `${deptTheme.active} text-foreground shadow-md`
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        } border ${
                          active 
                            ? 'border-primary/50' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`${active ? 'text-primary' : 'text-muted-foreground'}`}>
                            {item.icon}
                          </div>
                          <span className="font-semibold text-sm">{item.label}</span>
                        </div>
                        {active && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
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
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toggleTheme();
                  setTimeout(() => {
                    const themeToggleBtn = document.querySelector('[data-theme-toggle]');
                    themeToggleBtn?.classList.add('rotate-full');
                    setTimeout(() => {
                      themeToggleBtn?.classList.remove('rotate-full');
                    }, 600);
                  }, 0);
                }}
                data-theme-toggle
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
                  className="notification-button flex items-center justify-center h-10 w-10 rounded-xl bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  onClick={() => {
                    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
                    setIsUserDropdownOpen(false);
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {showNotification && (
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
                  title="Admin notifications"
                />
              </motion.div>

              {/* User Menu */}
              {user ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative user-dropdown"
                >
                  <motion.button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="user-menu-button flex items-center space-x-3 rounded-xl px-3 py-1.5 hover:bg-accent border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`relative h-8 w-8 rounded-lg bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} flex items-center justify-center border border-primary/30`}
                    >
                      <span className="text-primary-foreground text-sm font-bold">
                        {user.first_name?.[0] || user.email?.[0]}
                      </span>
                      <div className={`absolute -inset-1 rounded-lg ${deptTheme.logoFrom}/20 blur-sm`} />
                    </motion.div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {user.first_name} {user.last_name?.[0]}.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.role.replace('_', ' ')}
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
                          className={`rounded-xl shadow-xl border min-w-[260px] overflow-hidden ${deptTheme.card} border-border`}
                        >
                          {/* User Info */}
                          <div className="p-4 border-b border-border bg-gradient-to-r from-accent/30 to-accent/10">
                            <div className="flex items-center space-x-3">
                              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${deptTheme.logoFrom} ${deptTheme.logoTo} flex items-center justify-center border border-primary/30`}>
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
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20`}>
                                <Shield className="h-3 w-3 mr-1.5" />
                                {user.role.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="py-2">
                            <div className="px-3 py-2">
                              <p className="text-xs font-medium text-muted-foreground mb-2">QUICK ACTIONS</p>
                              <div className="space-y-1">
                                <Link href="/admin/create-schedule" onClick={closeDropdowns}>
                                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-1.5 rounded-md bg-primary/10">
                                        <Clock className="h-4 w-4 text-primary" />
                                      </div>
                                      <span className="text-sm font-medium text-foreground">Create Schedule</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </Link>
                                <Link href="/admin/conflicts" onClick={closeDropdowns}>
                                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-1.5 rounded-md bg-destructive/10">
                                        <Shield className="h-4 w-4 text-destructive" />
                                      </div>
                                      <span className="text-sm font-medium text-foreground">View Conflicts</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2 border-t border-border">
                            <Link href="/profile" onClick={closeDropdowns}>
                              <div className="flex items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-accent text-foreground cursor-pointer">
                                <User size={18} className="text-muted-foreground" />
                                <span className="font-medium">Profile Settings</span>
                              </div>
                            </Link>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-border p-2 bg-accent/10">
                            <button
                              onClick={() => {
                                logout();
                                closeDropdowns();
                              }}
                              className="flex w-full items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20 cursor-pointer"
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
              ) : (
                <Link href="/login" onClick={closeDropdowns}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
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
                className="lg:hidden p-2 rounded-xl hover:bg-accent text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 ml-2 cursor-pointer"
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
              className="lg:hidden border-t border-border bg-card/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {menuItems.map((item, index) => {
                  const active = isActive(item.href, item.exact);
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
                          active
                            ? 'bg-accent text-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        } border ${active ? 'border-primary/50' : 'border-transparent'} cursor-pointer`}
                        onClick={closeDropdowns}
                      >
                        <div className={`${active ? 'text-primary' : 'text-muted-foreground'}`}>
                          {item.icon}
                        </div>
                        <span className="font-semibold">{item.label}</span>
                        {active && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
                <div className="pt-4 border-t border-border">
                  <div className="p-3.5 rounded-xl bg-accent/40 border border-border">
                    <p className="text-sm font-medium text-muted-foreground">
                      Currently viewing as
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs font-semibold text-foreground">
                        {user?.role.replace('_', ' ') || 'Guest User'}
                      </p>
                      <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Add custom styles for smooth theme toggle rotation */}
      <style jsx global>{`
        @keyframes rotate-full {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .rotate-full {
          animation: rotate-full 0.6s ease-in-out;
        }
      `}</style>
    </>
  );
};
