// lib/utils/scheduleConflicts.ts

export interface Conflict {
  type: string;
  severity: number;
  message: string;
  source: 'database' | 'local';
  conflicting_item_id?: string;
  conflicting_course_code?: string;
  conflicting_course_title?: string;
  conflicting_schedule_group?: string;
  conflicting_section?: string;
  conflicting_room?: string;
  rowIndices?: number[];
}

export interface DatabaseConflictResponse {
  conflicts: Conflict[];
  has_critical_conflict: boolean;
  summary: {
    total_conflicts: number;
    critical_conflicts: number;
    warning_conflicts: number;
    info_conflicts: number;
  };
}

export interface ScheduleRow {
  id: number;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  days: string[]; // CHANGED: Now an array
  startTime: string;
  endTime: string;
  instructor: string;
  room: string;
  program: string;
  yearLevel: string;
  semester: string;
}

/**
 * Check if a row is complete for conflict detection
 */
export const isRowComplete = (row: ScheduleRow): boolean => {
  return Boolean(
    row.days && 
    row.days.length > 0 && // CHANGED: Check array has elements
    row.startTime &&
    row.endTime &&
    row.room &&
    row.instructor
  );
};

/**
 * Convert time string (HH:MM) to minutes for comparison
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two time intervals overlap
 */
export const hasTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  return s1 < e2 && s2 < e1;
};

/**
 * Check if two arrays have any common elements
 */
export const hasCommonDay = (days1: string[], days2: string[]): boolean => {
  return days1.some(day => days2.includes(day));
};

/**
 * Convert frontend day format (array) to backend format (single day)
 * Since backend expects a single day, we send the first selected day
 */
export const convertDaysToBackendFormat = (frontendDays: string[]): string => {
  if (frontendDays.length === 0) return 'MON';
  
  const dayMap: Record<string, string> = {
    'Mon': 'MON',
    'Tue': 'TUE',
    'Wed': 'WED',
    'Thu': 'THU',
    'Fri': 'FRI',
    'Sat': 'SAT',
    'Sun': 'SUN'
  };
  
  // Convert first day to backend format
  const firstDay = frontendDays[0];
  return dayMap[firstDay] || 'MON';
};

/**
 * Check conflicts between unsaved rows (local conflicts)
 */
export const checkLocalConflicts = (rows: ScheduleRow[]): Conflict[] => {
  const conflicts: Conflict[] = [];
  
  rows.forEach((row1, i) => {
    if (!isRowComplete(row1)) return;
    
    rows.forEach((row2, j) => {
      if (i >= j || !isRowComplete(row2)) return;
      
      // Check if they have any common day AND time overlaps
      const hasCommonDays = hasCommonDay(row1.days, row2.days);
      const hasOverlap = hasTimeOverlap(row1.startTime, row1.endTime, row2.startTime, row2.endTime);
      
      if (hasCommonDays && hasOverlap) {
        // Room conflict
        if (row1.room === row2.room) {
          conflicts.push({
            rowIndices: [i, j],
            type: 'room',
            severity: 9,
            message: `Room ${row1.room} conflict between rows ${i + 1} and ${j + 1}`,
            source: 'local'
          });
        }
        
        // Instructor conflict
        if (row1.instructor && row2.instructor && row1.instructor === row2.instructor) {
          conflicts.push({
            rowIndices: [i, j],
            type: 'instructor',
            severity: 8,
            message: `Instructor ${row1.instructor} conflict between rows ${i + 1} and ${j + 1}`,
            source: 'local'
          });
        }
      }
    });
  });
  
  return conflicts;
};

/**
 * Call backend to check conflicts against database
 */
export const checkDatabaseConflicts = async (
  row: ScheduleRow,
  scheduleGroupId: string,
  excludeItemId?: string
): Promise<DatabaseConflictResponse> => {
  try {
    // Since backend expects a single day, we need to check for each selected day
    // For now, we'll check the first day only (this is a limitation)
    const backendDay = convertDaysToBackendFormat(row.days);
    
    const payload = {
      schedule_group_id: scheduleGroupId,
      day: backendDay,
      start_time: row.startTime,
      end_time: row.endTime,
      room: row.room,
      instructor_id: row.instructor || null,
      exclude_item_id: excludeItemId || null
    };
    
    const response = await fetch('/api/scheduling/check-row-conflicts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking database conflicts:', error);
    return {
      conflicts: [],
      has_critical_conflict: false,
      summary: {
        total_conflicts: 0,
        critical_conflicts: 0,
        warning_conflicts: 0,
        info_conflicts: 0
      }
    };
  }
};

/**
 * Get row color based on conflict severity
 */
export const getRowColor = (conflicts: Conflict[]): string => {
  if (!conflicts || conflicts.length === 0) {
    return 'inherit';
  }
  
  const maxSeverity = Math.max(...conflicts.map(c => c.severity || 0));
  
  if (maxSeverity >= 9) {
    return '#fef2f2'; // Red background for critical
  } else if (maxSeverity >= 6) {
    return '#fffbeb'; // Yellow background for warnings
  } else {
    return '#eff6ff'; // Blue background for info
  }
};

/**
 * Check if a row has critical conflicts (severity >= 9)
 */
export const hasCriticalConflicts = (conflicts: Conflict[]): boolean => {
  return conflicts?.some(c => c.severity >= 9) || false;
};

/**
 * Get conflicts for a specific row from all conflicts
 */
export const getConflictsForRow = (
  rowIndex: number,
  dbConflicts: Conflict[],
  localConflicts: Conflict[]
): Conflict[] => {
  const conflicts: Conflict[] = [];
  
  // Add database conflicts for this row
  if (dbConflicts) {
    conflicts.push(...dbConflicts);
  }
  
  // Add local conflicts involving this row
  if (localConflicts) {
    const rowLocalConflicts = localConflicts.filter(c => 
      c.rowIndices && c.rowIndices.includes(rowIndex)
    );
    conflicts.push(...rowLocalConflicts);
  }
  
  return conflicts;
};

// Conflict type to column mapping
export const CONFLICT_COLUMN_MAP: Record<string, 'course' | 'time' | 'instructor' | 'room'> = {
  room: 'room',
  instructor: 'instructor',
  section: 'time', // Section conflicts are about time overlaps
  time_overlap: 'time',
  time: 'time',
  course: 'course',
};

/**
 * Get conflicts for a specific column
 */
export const getColumnConflicts = (
  conflicts: Conflict[] | undefined,
  column: 'course' | 'time' | 'instructor' | 'room'
): Conflict[] => {
  if (!conflicts) return [];
  return conflicts.filter(c => CONFLICT_COLUMN_MAP[c.type] === column);
};

/**
 * Check if there are critical conflicts for a specific column
 */
export const hasCriticalColumnConflicts = (
  conflicts: Conflict[] | undefined,
  column: 'course' | 'time' | 'instructor' | 'room'
): boolean => {
  const columnConflicts = getColumnConflicts(conflicts, column);
  return columnConflicts.some(c => c.severity >= 9);
};

/**
 * Get the most severe conflict color for a column
 */
export const getColumnConflictColor = (
  conflicts: Conflict[] | undefined,
  column: 'course' | 'time' | 'instructor' | 'room'
): string => {
  const columnConflicts = getColumnConflicts(conflicts, column);
  if (columnConflicts.length === 0) return 'inherit';
  
  const maxSeverity = Math.max(...columnConflicts.map(c => c.severity || 0));
  
  if (maxSeverity >= 9) {
    return '#fef2f2'; // Red background
  } else if (maxSeverity >= 6) {
    return '#fffbeb'; // Yellow background
  } else {
    return '#eff6ff'; // Blue background
  }
};