// hooks/useScheduleConflicts.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ScheduleRow, 
  Conflict,
  isRowComplete,
  checkLocalConflicts,
  checkDatabaseConflicts,
  getConflictsForRow
} from '@/lib/utils/scheduleConflicts';

interface UseScheduleConflictsProps {
  scheduleGroupId: string;
  rows: ScheduleRow[];
}

interface UseScheduleConflictsReturn {
  rowConflicts: Record<number, Conflict[]>;
  checkingRows: Record<number, boolean>;
  localConflicts: Conflict[];
  
  /** Immediate async check (awaitable) */
  checkRowConflicts: (
    row: ScheduleRow,
    rowIndex: number,
    excludeItemId?: string
  ) => Promise<void>;
  
  /** Debounced fire-and-forget check */
  checkRowConflictsDebounced: (
    row: ScheduleRow,
    rowIndex: number,
    excludeItemId?: string
  ) => void;
  
  checkAllRowsConflicts: () => Promise<void>;
  hasCriticalConflicts: () => boolean;
  getConflictsForRow: (rowIndex: number) => Conflict[];
  clearRowConflicts: (rowIndex: number) => void;
  clearAllConflicts: () => void;
}

export const useScheduleConflicts = ({
  scheduleGroupId,
  rows
}: UseScheduleConflictsProps): UseScheduleConflictsReturn => {
  const [rowConflicts, setRowConflicts] = useState<Record<number, Conflict[]>>({});
  const [checkingRows, setCheckingRows] = useState<Record<number, boolean>>({});
  const [localConflicts, setLocalConflicts] = useState<Conflict[]>([]);
  
  const debounceRefs = useRef<Record<number, NodeJS.Timeout>>({});
  
  /**
   * Immediate async check for conflicts
   */
  const checkRowConflicts = useCallback(async (
    row: ScheduleRow,
    rowIndex: number,
    excludeItemId?: string
  ): Promise<void> => {
    if (!isRowComplete(row)) {
      // Clear conflicts if row becomes incomplete
      setRowConflicts(prev => {
        const newConflicts = { ...prev };
        delete newConflicts[rowIndex];
        return newConflicts;
      });
      return;
    }
    
    setCheckingRows(prev => ({ ...prev, [rowIndex]: true }));
    
    try {
      // Check database conflicts
      const dbResult = await checkDatabaseConflicts(row, scheduleGroupId, excludeItemId);
      
      // Check local conflicts among all rows
      const newLocalConflicts = checkLocalConflicts(rows);
      setLocalConflicts(newLocalConflicts);
      
      // Get combined conflicts for this row
      const combinedConflicts = getConflictsForRow(rowIndex, dbResult.conflicts, newLocalConflicts);
      
      // Update conflicts for this row
      setRowConflicts(prev => ({
        ...prev,
        [rowIndex]: combinedConflicts
      }));
      
    } catch (error) {
      console.error(`Error checking conflicts for row ${rowIndex}:`, error);
      throw error; // Re-throw for proper error handling
    } finally {
      setCheckingRows(prev => {
        const newChecking = { ...prev };
        delete newChecking[rowIndex];
        return newChecking;
      });
    }
  }, [scheduleGroupId, rows]);
  
  /**
   * Debounced version to prevent excessive API calls
   * Returns void (fire-and-forget)
   */
  const checkRowConflictsDebounced = useCallback((
    row: ScheduleRow,
    rowIndex: number,
    excludeItemId?: string
  ) => {
    // Clear existing debounce timer for this row
    if (debounceRefs.current[rowIndex]) {
      clearTimeout(debounceRefs.current[rowIndex]);
    }
    
    // Set new debounce timer (500ms)
    debounceRefs.current[rowIndex] = setTimeout(() => {
      checkRowConflicts(row, rowIndex, excludeItemId).catch(error => {
        console.error(`Debounced conflict check failed for row ${rowIndex}:`, error);
      });
    }, 500);
  }, [checkRowConflicts]);
  
  /**
   * Check all rows for conflicts immediately
   */
  const checkAllRowsConflicts = useCallback(async () => {
    const checkingPromises = rows.map((row, index) => 
      isRowComplete(row) ? checkRowConflicts(row, index) : Promise.resolve()
    );
    
    await Promise.all(checkingPromises);
  }, [rows, checkRowConflicts]);
  
  /**
   * Check if any row has critical conflicts
   */
  const hasCriticalConflicts = useCallback((): boolean => {
    return Object.values(rowConflicts).some(conflicts => 
      conflicts?.some(c => c.severity >= 9)
    );
  }, [rowConflicts]);
  
  /**
   * Get conflicts for a specific row
   */
  const getConflictsForRowIndex = useCallback((rowIndex: number): Conflict[] => {
    return rowConflicts[rowIndex] || [];
  }, [rowConflicts]);
  
  /**
   * Clear conflicts for a specific row
   */
  const clearRowConflicts = useCallback((rowIndex: number) => {
    setRowConflicts(prev => {
      const newConflicts = { ...prev };
      delete newConflicts[rowIndex];
      return newConflicts;
    });
  }, []);
  
  /**
   * Clear all conflicts
   */
  const clearAllConflicts = useCallback(() => {
    setRowConflicts({});
    setLocalConflicts([]);
  }, []);
  
  // Auto-check rows when they become complete (using debounced version)
  useEffect(() => {
    rows.forEach((row, index) => {
      if (isRowComplete(row) && !rowConflicts[index]) {
        checkRowConflictsDebounced(row, index);
      }
    });
  }, [rows, rowConflicts, checkRowConflictsDebounced]);
  
  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceRefs.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);
  
  return {
    rowConflicts,
    checkingRows,
    localConflicts,
    checkRowConflicts,                    // ✅ Immediate async version
    checkRowConflictsDebounced,          // ✅ Debounced void version
    checkAllRowsConflicts,
    hasCriticalConflicts,
    getConflictsForRow: getConflictsForRowIndex,
    clearRowConflicts,
    clearAllConflicts,
  };
};