// app/admin/layout.tsx
'use client';

import { Navbar } from '@/components/layout/navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-16"> {/* 4rem padding for fixed navbar */}
        {children}
      </div>
    </div>
  );
}