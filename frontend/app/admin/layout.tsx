// app/admin/layout.tsx
'use client';

import { Navbar } from '@/components/layout/navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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