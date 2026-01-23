// app/admin/components/conflict-alert.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ConflictAlertProps {
  conflicts: Array<{
    id: number;
    type: 'room' | 'instructor';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export function ConflictAlert({ conflicts }: ConflictAlertProps) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);

  const visibleConflicts = conflicts.filter(c => !dismissed.includes(c.id));
  const hasConflicts = visibleConflicts.length > 0;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-5 w-5" />;
      case 'medium': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const handleResolve = (id: number) => {
    setDismissed([...dismissed, id]);
  };

  if (!hasConflicts) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conflicts Detected</h3>
            <p className="text-gray-600">All schedules are conflict-free!</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-amber-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Schedule Conflicts</h3>
            <p className="text-sm text-gray-600">
              {visibleConflicts.length} conflict{visibleConflicts.length !== 1 ? 's' : ''} require{visibleConflicts.length === 1 ? 's' : ''} attention
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(conflicts.map(c => c.id))}
          >
            Dismiss All
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {visibleConflicts.map((conflict) => (
              <motion.div
                key={conflict.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-4 rounded-lg border ${getSeverityColor(conflict.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${getSeverityColor(conflict.severity).replace('bg-', 'bg-opacity-20 ').replace('text-', 'text-opacity-100 ')}`}>
                      {getSeverityIcon(conflict.severity)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(conflict.severity)}`}>
                          {conflict.type.charAt(0).toUpperCase() + conflict.type.slice(1)} Conflict
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conflict.severity === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : conflict.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {conflict.severity.charAt(0).toUpperCase() + conflict.severity.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-1">{conflict.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Navigate to resolve page */}}
                    >
                      Resolve
                    </Button>
                    <button
                      onClick={() => handleResolve(conflict.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Automatic conflict detection is active
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Trigger conflict check */}}
          >
            Run Check Now
          </Button>
        </div>
      </div>
    </Card>
  );
}