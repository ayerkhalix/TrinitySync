// components/layout/navbar.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Calendar, LogOut, User, 
  Activity, Settings, ChevronDown 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

import { useAuth } from '@/hooks/use-auth';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Calendar size={18} /> },
    { href: '/admin', label: 'Admin Panel', icon: <Settings size={18} /> },
    { href: '/admin/activity-logs', label: 'Activity Logs', icon: <Activity size={18} /> },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-card border-b"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ScheduleFlow</h1>
              <p className="text-xs text-gray-500">Holy Trinity University</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 rounded-full p-1 hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.first_name?.[0] || user.email?.[0]}
                    </span>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-lg shadow-xl border min-w-[200px] overflow-hidden"
                  >
                    <div className="p-4 border-b">
                      <p className="font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-blue-600 mt-1 capitalize">
                        {user.role.replace('_', ' ')}
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="flex w-full items-center space-x-2 p-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
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
            className="md:hidden border-t"
          >
            <div className="px-4 py-3 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};