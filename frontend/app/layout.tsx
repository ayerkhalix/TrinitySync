// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "ScheduleFlow - Anti-Conflict Scheduling System",
  description: "Holy Trinity University Scheduling Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Force initial theme */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'bg-white text-gray-900 border border-gray-200 shadow-lg',
                description: 'text-gray-600',
                actionButton: 'bg-gray-900 text-white',
                cancelButton: 'bg-gray-100 text-gray-700',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}