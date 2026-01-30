// app/test/page.tsx
'use client';

import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';

export default function TestPage() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Dark Mode Test</h1>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Toggle Theme (Current: {theme})
          </button>
          <div className="text-sm">
            HTML has 'dark' class: {document.documentElement.classList.contains('dark').toString()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <h2 className="text-xl font-semibold">Card 1</h2>
            <p>This should have proper background</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p>Muted background</p>
            </div>
          </Card>
          
          <div className="bg-card text-card-foreground border-border border rounded-xl p-6">
            <h2 className="text-xl font-semibold">Direct div</h2>
            <p>Using CSS variable classes</p>
          </div>
        </div>
        
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="font-semibold">Important: Tailwind v4 doesn't support `dark:` prefix by default!</p>
          <p className="text-sm mt-2">
            We're using CSS variables instead. When you toggle theme, the variables change automatically.
          </p>
        </div>
      </div>
    </div>
  );
}   