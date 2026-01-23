// app/login/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, GraduationCap, Shield, UserRound } from 'lucide-react';
import { LoginForm } from './login-form';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');

  const roleCards = [
    {
      role: 'student' as const,
      title: 'Student Access',
      description: 'View your class schedule, track activities, and manage your academic calendar.',
      icon: <GraduationCap className="h-8 w-8" />,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      role: 'admin' as const,
      title: 'Admin Portal',
      description: 'Manage schedules, resolve conflicts, and oversee academic planning.',
      icon: <Shield className="h-8 w-8" />,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-blue-200"
            initial={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh',
            }}
            animate={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh',
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-xl opacity-30" />
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
            >
              Schedule<span className="text-blue-600">Flow</span>
            </motion.h1>
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600"
            >
              Holy Trinity University • College of Engineering and Technology
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Role Selection */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Select Access Type</h2>
              <p className="text-gray-600">
                Choose your role to access the appropriate portal with tailored features.
              </p>
              
              <div className="space-y-4">
                {roleCards.map((card) => (
                  <motion.button
                    key={card.role}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(card.role)}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
                      selectedRole === card.role
                        ? `border-transparent bg-gradient-to-r ${card.color} text-white shadow-xl`
                        : 'border-gray-200 bg-white/80 hover:border-blue-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        selectedRole === card.role
                          ? 'bg-white/20'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                      }`}>
                        {card.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                        <p className={`text-sm ${
                          selectedRole === card.role ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6 rounded-xl"
              >
                <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600">
                  Contact the IT department at{' '}
                  <a href="mailto:it@htu.edu" className="text-blue-600 hover:underline">
                    it@htu.edu
                  </a>{' '}
                  for account assistance.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Panel - Login Form */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8 rounded-2xl shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRole}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm role={selectedRole} />
                </motion.div>
              </AnimatePresence>

              {/* Demo Credentials */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <details className="group">
                  <summary className="flex items-center cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    <span>Demo Credentials</span>
                    <svg className="ml-1 h-4 w-4 group-open:rotate-180 transition-transform">
                      <path fill="currentColor" d="M7 10l5 5 5-5z" />
                    </svg>
                  </summary>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">Student</p>
                      <p className="text-gray-600">student@htu.edu / password</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">Admin</p>
                      <p className="text-gray-600">admin@htu.edu / admin123</p>
                    </div>
                  </div>
                </details>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center text-sm text-gray-500"
          >
            <p>© {new Date().getFullYear()} Holy Trinity University. All rights reserved.</p>
            <p className="mt-1">College of Engineering and Technology</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}