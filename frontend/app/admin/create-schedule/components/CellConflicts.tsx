// app/admin/create-schedule/components/CellConflicts.tsx
'use client';

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Conflict } from '@/lib/utils/scheduleConflicts';

interface CellConflictsProps {
  conflicts: Conflict[];
  compact?: boolean;
  onClear?: () => void;
}

export function CellConflicts({ conflicts, compact = false, onClear }: CellConflictsProps) {
  if (!conflicts || conflicts.length === 0) return null;

  const criticalConflicts = conflicts.filter(c => c.severity >= 9);
  const warningConflicts = conflicts.filter(c => c.severity >= 6 && c.severity < 9);
  const infoConflicts = conflicts.filter(c => c.severity <= 5);

  const totalConflicts = conflicts.length;
  const hasCritical = criticalConflicts.length > 0;

  if (compact) {
    return (
      <div className="mt-1">
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
          hasCritical 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-amber-100 text-amber-800 border border-amber-200'
        }`}>
          {hasCritical ? (
            <AlertCircle className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          <span>{totalConflicts} conflict{totalConflicts !== 1 ? 's' : ''}</span>
          {onClear && (
            <button
              onClick={onClear}
              className="ml-1 hover:opacity-75"
              aria-label="Clear conflicts"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-1">
      {/* Critical conflicts */}
      {criticalConflicts.map((conflict, idx) => (
        <div
          key={`critical-${idx}`}
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
        </div>
      ))}

      {/* Warning conflicts */}
      {warningConflicts.map((conflict, idx) => (
        <div
          key={`warning-${idx}`}
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
        </div>
      ))}

      {/* Info conflicts */}
      {infoConflicts.map((conflict, idx) => (
        <div
          key={`info-${idx}`}
          className="flex items-start gap-2 p-2 rounded bg-blue-50 text-blue-700 border border-blue-200"
        >
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <p className="text-xs">{conflict.message}</p>
            <span className="text-[10px] text-blue-600 opacity-75 block mt-1">
              {conflict.source === 'database' ? 'Database' : 'Local'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}