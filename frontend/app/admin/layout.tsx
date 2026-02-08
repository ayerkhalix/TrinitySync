'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useAuth } from '@/hooks/use-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login?role=admin');
        return;
      }

      if (!['COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        router.replace('/student');
      }
    }
  }, [user, loading]);

  if (loading) {
    return null; // or a spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <div className="bg-gradient-to-b from-background to-muted/20">
          {children}
        </div>
      </main>
    </div>
  );
}
