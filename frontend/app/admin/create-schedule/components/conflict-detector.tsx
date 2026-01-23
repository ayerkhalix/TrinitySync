// app/admin/create-schedule/components/conflict-detector.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Users, Building } from 'lucide-react';

interface ConflictDetectorProps {
  formData: {
    time_slot: string;
    days: string;
    room: string;
    instructor: string;
    course_code: string;
  };
}

interface Conflict {
  type: 'room' | 'instructor' | 'time';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export function ConflictDetector({ formData }: ConflictDetectorProps) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    if (formData.time_slot || formData.days || formData.room || formData.instructor) {
      checkConflicts();
    }
  }, [formData]);
  
  const checkConflicts = async () => {
    if (!formData.time_slot || !formData.days) return;
    
    setIsChecking(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const newConflicts: Conflict[] = [];
      
      // Mock conflict detection logic
      if (formData.room === 'CL2' && formData.time_slot === '8:00 AM - 11:00 AM') {
        newConflicts.push({
          type: 'room',
          message: 'Room CL2 is already booked at this time',
          severity: 'high'
        });
      }
      
      if (formData.room === 'TC' && formData.days.includes('Monday')) {
        newConflicts.push({
          type: 'room',
          message: 'High demand for TC on Mondays',
          severity: 'medium'
        });
      }
      
      if (formData.instructor.toLowerCase().includes('gayutin') && 
          formData.time_slot === '1:00 PM - 3:00 PM') {
        newConflicts.push({
          type: 'instructor',
          message: 'Instructor has another class at this time',
          severity: 'high'
        });
      }
      
      // Check for time conflicts
      const morningSlots = ['8:00 AM - 11:00 AM', '9:00 AM - 12:00 PM'];
      const afternoonSlots = ['1:00 PM - 3:00 PM', '2:00 PM - 4:00 PM'];
      
      if (morningSlots.includes(formData.time_slot)) {
        newConflicts.push({
          type: 'time',
          message: 'Morning slots have high occupancy',
          severity: 'low'
        });
      }
      
      setConflicts(newConflicts);
      setIsChecking(false);
    }, 500);
  };
  
  if (conflicts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-emerald-50 border border-emerald-200"
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
          <div>
            <h4 className="font-medium text-emerald-900">No Conflicts Detected</h4>
            <p className="text-sm text-emerald-700">Schedule appears to be conflict-free</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  const highConflicts = conflicts.filter(c => c.severity === 'high');
  const mediumConflicts = conflicts.filter(c => c.severity === 'medium');
  const lowConflicts = conflicts.filter(c => c.severity === 'low');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <h4 className="font-medium text-gray-900">Conflict Detection</h4>
        </div>
        {isChecking && (
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
            <span className="text-sm text-gray-500">Checking...</span>
          </div>
        )}
      </div>
      
      {/* High Priority Conflicts */}
      {highConflicts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-red-700">High Priority</span>
          </div>
          {highConflicts.map((conflict, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{conflict.message}</p>
                <p className="text-xs text-red-700 mt-1">
                  {conflict.type === 'room' ? 'Room conflict' : 
                   conflict.type === 'instructor' ? 'Instructor conflict' : 'Time conflict'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Medium Priority Conflicts */}
      {mediumConflicts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <span className="text-sm font-medium text-amber-700">Medium Priority</span>
          </div>
          {mediumConflicts.map((conflict, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">{conflict.message}</p>
                <p className="text-xs text-amber-700 mt-1">
                  {conflict.type === 'room' ? 'Room conflict' : 
                   conflict.type === 'instructor' ? 'Instructor conflict' : 'Time conflict'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Low Priority Conflicts */}
      {lowConflicts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-blue-700">Low Priority</span>
          </div>
          {lowConflicts.map((conflict, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">{conflict.message}</p>
                <p className="text-xs text-blue-700 mt-1">
                  {conflict.type === 'room' ? 'Room conflict' : 
                   conflict.type === 'instructor' ? 'Instructor conflict' : 'Time conflict'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}