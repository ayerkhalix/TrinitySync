// app/admin/create-schedule/components/day-selector.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';

const DAYS = [
  { label: 'Monday', short: 'Mon' },
  { label: 'Tuesday', short: 'Tue' },
  { label: 'Wednesday', short: 'Wed' },
  { label: 'Thursday', short: 'Thu' },
  { label: 'Friday', short: 'Fri' },
  { label: 'Saturday', short: 'Sat' },
];

interface Props {
  value: string[];
  onChange: (days: string[]) => void;
  error?: boolean;
}

export function DaySelector({ value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set mounted flag for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const toggle = (day: string) => {
    onChange(
      value.includes(day)
        ? value.filter(d => d !== day)
        : [...value, day]
    );
  };

  const label = value.length ? value.join(', ') : 'Select Days';

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};
    
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Check if there's space below (downward opening)
    const spaceBelow = viewportHeight - rect.bottom;
    const dropdownHeight = 260; // Approximate dropdown height
    
    if (spaceBelow > dropdownHeight) {
      // Open downward
      return {
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        transformOrigin: 'top left',
      };
    } else {
      // Open upward (not enough space below)
      return {
        top: rect.top - dropdownHeight - 8,
        left: rect.left,
        width: rect.width,
        transformOrigin: 'bottom left',
      };
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
          error ? 'border-red-300' : 'border-border'
        } bg-white text-foreground hover:bg-accent/20 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors`}
      >
        <span className={value.length ? 'text-foreground' : 'text-muted-foreground'}>
          {label}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Portal-based dropdown - This escapes the table clipping */}
      {open && mounted && buttonRef.current && createPortal(
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed z-[9999] rounded-lg border border-border bg-white shadow-lg"
          style={getDropdownPosition()}
        >
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
              Select Days (Multiple)
            </div>
            {DAYS.map(d => (
              <label
                key={d.short}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={value.includes(d.short)}
                  onChange={() => toggle(d.short)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm text-foreground">{d.label}</span>
              </label>
            ))}
          </div>
        </motion.div>,
        document.body
      )}
    </div>
  );
}