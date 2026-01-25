// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/use-theme";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}