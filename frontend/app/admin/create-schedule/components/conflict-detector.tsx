// app/admin/create-schedule/components/conflict-detector.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Users, Building, AlertTriangle, Info } from 'lucide-react';
import { Conflict } from '@/lib/utils/scheduleConflicts';

interface ConflictDetectorProps {
  conflicts: Conflict[];
  isChecking?: boolean;
  totalRows?: number;
  completedRows?: number;
}

export function ConflictDetector({ 
  conflicts, 
  isChecking = false, 
  totalRows = 0,
  completedRows = 0 
}: ConflictDetectorProps) {
  const highConflicts = conflicts.filter(c => c.severity >= 9);
  const mediumConflicts = conflicts.filter(c => c.severity >= 6 && c.severity < 9);
  const lowConflicts = conflicts.filter(c => c.severity <= 5);
  
  const hasCriticalConflicts = highConflicts.length > 0;
  const hasConflicts = conflicts.length > 0;
  
  if (!hasConflicts && !isChecking && completedRows === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-gray-50 border border-gray-200"
      >
        <div className="flex items-center space-x-3">
          <Info className="h-6 w-6 text-gray-600" />
          <div>
            <h4 className="font-medium text-gray-900">Waiting for Input</h4>
            <p className="text-sm text-gray-700">Fill in schedule rows to start conflict detection</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (!hasConflicts && completedRows > 0) {
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
            <p className="text-sm text-emerald-700">All {completedRows} complete row(s) appear to be conflict-free</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className={`h-5 w-5 ${
            hasCriticalConflicts ? 'text-red-600' : 
            mediumConflicts.length > 0 ? 'text-amber-600' : 
            'text-blue-600'
          }`} />
          <h4 className="font-medium text-gray-900">Conflict Detection</h4>
        </div>
        {isChecking && (
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
            <span className="text-sm text-gray-500">Checking...</span>
          </div>
        )}
      </div>
      
      {/* Status Summary */}
      {completedRows > 0 && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Monitoring {completedRows} of {totalRows} row(s) for conflicts
              </span>
            </div>
            <span className="text-xs text-blue-700 px-2 py-1 bg-blue-100 rounded-full">
              Active
            </span>
          </div>
        </div>
      )}
      
      {/* High Priority Conflicts */}
      {highConflicts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-red-700">Critical Conflicts</span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              {highConflicts.length}
            </span>
          </div>
          {highConflicts.map((conflict, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{conflict.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-red-700">
                    {conflict.type === 'room' ? 'Room conflict' : 
                     conflict.type === 'instructor' ? 'Instructor conflict' : 
                     conflict.type === 'time' ? 'Time conflict' : 
                     conflict.type === 'section' ? 'Section conflict' : 
                     conflict.type.replace('_', ' ')}
                  </p>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">
                    {conflict.source === 'database' ? 'Database' : 'Local'}
                  </span>
                </div>
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
            <span className="text-sm font-medium text-amber-700">Warning Conflicts</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {mediumConflicts.length}
            </span>
          </div>
          {mediumConflicts.map((conflict, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">{conflict.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-amber-700">
                    {conflict.type === 'room' ? 'Room conflict' : 
                     conflict.type === 'instructor' ? 'Instructor conflict' : 
                     conflict.type === 'time' ? 'Time conflict' : 
                     conflict.type === 'section' ? 'Section conflict' : 
                     conflict.type.replace('_', ' ')}
                  </p>
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                    {conflict.source === 'database' ? 'Database' : 'Local'}
                  </span>
                </div>
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
            <span className="text-sm font-medium text-blue-700">Info Conflicts</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {lowConflicts.length}
            </span>
          </div>
          {lowConflicts.map((conflict, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">{conflict.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-blue-700">
                    {conflict.type === 'room' ? 'Room conflict' : 
                     conflict.type === 'instructor' ? 'Instructor conflict' : 
                     conflict.type === 'time' ? 'Time conflict' : 
                     conflict.type === 'section' ? 'Section conflict' : 
                     conflict.type.replace('_', ' ')}
                  </p>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    {conflict.source === 'database' ? 'Database' : 'Local'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Conflict Summary */}
      {hasConflicts && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total conflicts:</span>
            <span className="font-medium text-gray-900">{conflicts.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex flex-col items-center p-2 bg-red-50 rounded">
              <span className="text-lg font-bold text-red-600">{highConflicts.length}</span>
              <span className="text-xs text-red-700">Critical</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-amber-50 rounded">
              <span className="text-lg font-bold text-amber-600">{mediumConflicts.length}</span>
              <span className="text-xs text-amber-700">Warning</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-blue-50 rounded">
              <span className="text-lg font-bold text-blue-600">{lowConflicts.length}</span>
              <span className="text-xs text-blue-700">Info</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}