// app/admin/create-schedule/components/time-selector.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface TimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  error?: string;
}

export function TimeSelector({ value, onChange, error }: TimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const generateTimeSlots = () => {
    const slots: string[] = [];
    
    const toTimeString = (hour: number): string => {
      const h = hour % 12 || 12;
      const suffix = hour < 12 ? 'AM' : 'PM';
      return `${h}:00 ${suffix}`;
    };
    
    // Generate from 8 AM to 8 PM
    for (let hour = 8; hour <= 20; hour++) {
      for (let duration = 1; duration <= 4; duration++) {
        const endHour = hour + duration;
        if (endHour > 21) continue;
        
        // Skip lunch hour (12 PM - 1 PM)
        if (hour < 12 && endHour > 12) continue;
        
        slots.push(`${toTimeString(hour)} - ${toTimeString(endHour)}`);
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Clock className="h-4 w-4 inline mr-1" />
        Time Slot
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg border ${
          error ? 'border-red-500' : 'border-gray-300'
        } bg-white px-4 py-2.5 text-left text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || 'Select time slot'}
        </span>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-2 space-y-1">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  onChange(slot);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 ${
                  value === slot ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}