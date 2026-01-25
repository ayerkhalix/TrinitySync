// app/student/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import StudentNavbar from '@/components/layout/StudentNavbar';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect non-students or unauthenticated users
  useEffect(() => {
    if (!loading) {
      if (!user) {
        redirect('/login');
      }
    }
  }, [user, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading student portal...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, show nothing (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Student Navigation */}
      <StudentNavbar />
      
      {/* Main Content */}
      <main className="relative">
        {/* Background Pattern (Subtle) */}
        <div className="absolute inset-0 -z-10 h-full w-full 
          bg-background
          bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)]
          [background-size:18px_18px]" />
        
        {/* Page Transition */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} University Schedule System
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Student Portal v1.0
              </p>
            </div>
            <div className="flex space-x-6">
              <a 
                href="/student/help" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Help Center
              </a>
              <a 
                href="/student/faq" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </a>
              <a 
                href="/student/contact" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Need immediate assistance? Contact the registrar's office at 
              <a href="tel:+1234567890" className="text-primary hover:underline ml-1">
                (123) 456-7890
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Sidebar Overlay (for future use) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Quick Actions Floating Button (Mobile) */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-40 lg:hidden h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-xl transition-shadow"
        onClick={() => {
          document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </motion.button>
    </div>
  );
}