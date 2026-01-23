// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Building2, ChevronRight, 
  Sparkles, ArrowRight, Users, BookOpen,
  Calendar, Shield, Cpu, HeartPulse
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth entry
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const colleges = [
    {
      id: 'cet',
      name: 'College of Engineering and Technology',
      description: 'Innovation through technology and engineering excellence',
      icon: <Cpu className="h-8 w-8" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
      programs: ['BSIT', 'BSCE', 'BSGE', 'BSCpE'],
      stats: '2,500+ Students • 150+ Faculty'
    },
    {
      id: 'cnhs',
      name: 'College of Nursing and Health Sciences',
      description: 'Compassionate care and medical excellence',
      icon: <HeartPulse className="h-8 w-8" />,
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10',
      programs: ['BSN', 'BS MedTech', 'BS Pharmacy', 'BS Psychology'],
      stats: '1,800+ Students • 120+ Faculty'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '4,300+', icon: Users },
    { label: 'Academic Programs', value: '24', icon: BookOpen },
    { label: 'Faculty Members', value: '270+', icon: Users },
    { label: 'Years of Excellence', value: '25+', icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <GraduationCap className="absolute inset-0 m-auto h-8 w-8 text-blue-600" />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-gray-600"
          >
            Loading HTU Portal...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-200/20 to-cyan-200/20"
            initial={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh',
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
            }}
            animate={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh',
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
        ))}
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-1 w-1 rounded-full bg-blue-300/30"
            initial={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh',
            }}
            animate={{
              y: [null, '-20px', '0px'],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl opacity-30" />
                <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  HTU Portal
                </h1>
                <p className="text-sm text-gray-500">Holy Trinity University</p>
              </div>
            </Link>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex items-center space-x-6"
            >
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Academic Year 2024-2025</span>
              </div>
              <Link
                href="/login"
                className="group flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="font-medium">Faculty Login</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <main className="px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center space-x-2 mb-6">
                <Sparkles className="h-6 w-6 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Welcome to HTU Digital Campus
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent bg-size-200 animate-gradient">
                  Schedule Your
                </span>
                <br />
                <span className="text-gray-900">Academic Success</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                Access your class schedules, manage academic activities, and connect with 
                your college community through our intelligent scheduling platform.
              </p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                        <stat.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* College Selection */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Select Your College
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose your college department to access tailored scheduling tools and resources
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {colleges.map((college) => (
                  <motion.div
                    key={college.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCollege(college.id)}
                    className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedCollege === college.id 
                        ? 'ring-3 ring-blue-500 ring-offset-2' 
                        : 'hover:shadow-xl'
                    }`}
                  >
                    <div className={`absolute inset-0 ${college.bgColor}`} />
                    
                    <div className="relative p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${college.color} bg-opacity-10`}>
                          {college.icon}
                        </div>
                        
                        <AnimatePresence>
                          {selectedCollege === college.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-6 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center"
                            >
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {college.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-6">
                        {college.description}
                      </p>

                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {college.programs.map((program) => (
                            <span
                              key={program}
                              className="px-3 py-1 text-sm rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700"
                            >
                              {program}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {college.stats}
                        </span>
                        
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center space-x-1 text-blue-600 font-medium"
                        >
                          <span>Explore</span>
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Animated border effect */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${college.color} ${
                      selectedCollege === college.id ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-300`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
            <AnimatePresence>
              {selectedCollege && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-gray-200/50 backdrop-blur-sm">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Ready to Access Your Schedule?
                      </h3>
                      <p className="text-gray-600 mb-8">
                        Sign in to view your class schedule, track academic progress, and 
                        manage your learning journey at {colleges.find(c => c.id === selectedCollege)?.name}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                          href="/login"
                          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="relative flex items-center justify-center space-x-2">
                            <span>Student Login</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </Link>
                        
                        <Link
                          href="/login"
                          className="group relative overflow-hidden rounded-xl border-2 border-gray-300 bg-white text-gray-900 px-8 py-4 text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:scale-105"
                        >
                          <span className="relative flex items-center justify-center space-x-2">
                            <Shield className="h-5 w-5" />
                            <span>Admin Portal</span>
                          </span>
                        </Link>
                      </div>
                      
                      <p className="mt-6 text-sm text-gray-500">
                        Need help? Contact IT Support at{' '}
                        <a href="mailto:it-support@htu.edu" className="text-blue-600 hover:underline">
                          it-support@htu.edu
                        </a>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16 text-center"
            >
              <div className="inline-flex items-center space-x-2 text-gray-500 mb-4">
                <Building2 className="h-5 w-5" />
                <span>Holy Trinity University • Puerto Princesa City, Palawan</span>
              </div>
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} HTU Digital Campus. Empowering education through technology.
              </p>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Custom CSS for gradient animation */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .bg-size-200 {
          background-size: 200% auto;
        }
      `}</style>
    </div>
  );
}