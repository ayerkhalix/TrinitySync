// hooks/use-theme.ts
'use client';

import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Get stored theme or system preference
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (systemDark ? 'dark' : 'light');
    
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}