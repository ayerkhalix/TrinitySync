// app/admin/create-schedule/components/AnimatedCellConflicts.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Conflict } from '@/lib/utils/scheduleConflicts';

interface AnimatedCellConflictsProps {
  conflicts: Conflict[];
  column: 'course' | 'time' | 'instructor' | 'room';
  rowIndex: number;
}

export function AnimatedCellConflicts({ conflicts, column, rowIndex }: AnimatedCellConflictsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!conflicts || conflicts.length === 0) return null;

  const criticalConflicts = conflicts.filter(c => c.severity >= 9);
  const warningConflicts = conflicts.filter(c => c.severity >= 6 && c.severity < 9);
  const infoConflicts = conflicts.filter(c => c.severity <= 5);

  const totalConflicts = conflicts.length;
  const hasCritical = criticalConflicts.length > 0;
  const hasWarnings = warningConflicts.length > 0;

  // Get appropriate icon based on conflict severity
  const getIcon = () => {
    if (hasCritical) return <AlertCircle className="h-3 w-3 text-red-600" />;
    if (hasWarnings) return <AlertTriangle className="h-3 w-3 text-amber-600" />;
    return <Info className="h-3 w-3 text-blue-600" />;
  };

  // Get badge color based on severity
  const getBadgeColor = () => {
    if (hasCritical) return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
    if (hasWarnings) return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
  };

  return (
    <div className="mt-1">
      {/* Expandable Badge */}
      <motion.button
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full inline-flex items-center justify-between px-2 py-1 rounded text-xs border transition-all ${getBadgeColor()}`}
        aria-label={`${totalConflicts} conflict${totalConflicts !== 1 ? 's' : ''} in ${column}. Click to ${isExpanded ? 'collapse' : 'expand'}`}
      >
        <div className="flex items-center gap-1">
          {getIcon()}
          <span className="font-medium">
            {totalConflicts} conflict{totalConflicts !== 1 ? 's' : ''}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </motion.button>

      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 space-y-1 overflow-hidden"
          >
            {/* Critical conflicts */}
            {criticalConflicts.map((conflict, idx) => (
              <motion.div
                key={`critical-${rowIndex}-${column}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-2 p-2 rounded bg-red-50 text-red-700 border border-red-200"
              >
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium">{conflict.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-red-600 opacity-75">
                      {conflict.source === 'database' ? 'Database' : 'Local'} • {conflict.type}
                    </span>
                    {conflict.conflicting_course_code && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        {conflict.conflicting_course_code}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Warning conflicts */}
            {warningConflicts.map((conflict, idx) => (
              <motion.div
                key={`warning-${rowIndex}-${column}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (criticalConflicts.length + idx) * 0.05 }}
                className="flex items-start gap-2 p-2 rounded bg-amber-50 text-amber-700 border border-amber-200"
              >
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="text-xs">{conflict.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-amber-600 opacity-75">
                      {conflict.source === 'database' ? 'Database' : 'Local'} • {conflict.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Info conflicts */}
            {infoConflicts.map((conflict, idx) => (
              <motion.div
                key={`info-${rowIndex}-${column}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (criticalConflicts.length + warningConflicts.length + idx) * 0.05 }}
                className="flex items-start gap-2 p-2 rounded bg-blue-50 text-blue-700 border border-blue-200"
              >
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs">{conflict.message}</p>
                  <span className="text-[10px] text-blue-600 opacity-75 block mt-1">
                    {conflict.source === 'database' ? 'Database' : 'Local'}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}