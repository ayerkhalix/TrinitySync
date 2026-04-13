// services/schedule-service.ts
import { apiClient as api } from './api-client';

// ============================================
// TYPES (UUID-FIRST, MATCHING BACKEND)
// ============================================

// =================== NEW: CREATE DTOs ===================
export interface CreateScheduleGroupData {
  college: string;        // UUID
  program: string;        // UUID
  year_level: string;
  section: string;
  semester: string;
  school_year: string;    // UUID
  status?: 'draft' | 'pending' | 'approved' | 'active' | 'archived' | 'cancelled';
  notes?: string;
}

export interface CreateScheduleItemData {
  schedule_group: string;  // UUID
  course: string;          // UUID
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  instructor?: string | null;  // UUID or null
  max_students?: number;
}

// =================== RESPONSE TYPES ===================
export interface ScheduleGroup {
  id: string;
  college: string;
  college_name: string;
  program: string;
  program_name: string;
  year_level: string;
  section: string;
  semester: string;
  school_year: string;
  school_year_name: string;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'archived' | 'cancelled';
  created_by: string;
  created_by_email: string;
  approved_by: string | null;
  approval_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  items: ScheduleItem[];
  item_count: number;
  conflict_count: number;
}

export interface ScheduleItem {
  id: string;
  schedule_group: string;
  
  course: string;                // UUID
  course_code: string;           // display
  course_title: string;          // display
  course_units: number;          // display
  
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  
  instructor: string | null;       // UUID input
  instructor_id: string | null;    // UUID output
  instructor_name: string | null;  // display only
  
  instructor_override: string | null;
  max_students: number;
  current_enrollment: number;
  
  is_lab: boolean;
  is_online: boolean;
  online_link: string | null;
  metadata: Record<string, unknown>;
}

export interface SchoolYear {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface Conflict {
  type: 'room' | 'instructor' | 'time_overlap';
  severity: number;
  message: string;
  source: 'database';
  conflicting_item_id: string;
  conflicting_course_code: string;
  conflicting_course_title: string;
  conflicting_schedule_group: string;
  conflicting_section: string;
}

export interface RowConflictCheckResponse {
  conflicts: Conflict[];
  has_critical_conflict: boolean;
  summary: {
    total_conflicts: number;
    critical_conflicts: number;
    warning_conflicts: number;
    info_conflicts: number;
  };
}

export interface BulkCreateScheduleGroup {
  college_id: string;
  program_id: string;
  year_level: string;
  section: string;
  semester: string;
  school_year_id: string;
  items?: Array<{
    course_id: string;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    instructor_id?: string | null;
    max_students?: number;
  }>;
}

export interface BulkCreateResponse {
  status: 'success' | 'partial_success' | 'error';
  created: number;
  schedule_ids: string[];
  conflicts?: Conflict[];
}

export type UpdateScheduleItemData = Partial<CreateScheduleItemData>;

// ============================================
// SCHEDULE GROUP SERVICE
// ============================================

export class ScheduleGroupService {
  static async getAll(): Promise<ScheduleGroup[]> {
    const response = await api.get('/scheduling/schedule-groups/');
    return response.data;
  }

  static async getById(id: string): Promise<ScheduleGroup> {
    const response = await api.get(`/scheduling/schedule-groups/${id}/`);
    return response.data;
  }

  // =================== FIXED: Proper DTO pattern ===================
  static async create(data: CreateScheduleGroupData): Promise<ScheduleGroup> {
    const response = await api.post('/scheduling/schedule-groups/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<CreateScheduleGroupData>): Promise<ScheduleGroup> {
    const response = await api.put(`/scheduling/schedule-groups/${id}/`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/scheduling/schedule-groups/${id}/`);
  }

  static async approve(id: string): Promise<void> {
    await api.post(`/scheduling/schedule-groups/${id}/approve/`);
  }

  static async checkConflicts(id: string): Promise<{
    conflicts_found: number;
    conflicts: Conflict[];
  }> {
    const response = await api.post(`/scheduling/schedule-groups/${id}/check_conflicts/`);
    return response.data;
  }

  static async bulkCreate(payload: {
    schedules: BulkCreateScheduleGroup[];
    force?: boolean;
  }): Promise<BulkCreateResponse> {
    const response = await api.post('/scheduling/schedule-groups/bulk_create/', payload);
    return response.data;
  }
}

// ============================================
// SCHEDULE ITEM SERVICE
// ============================================

export class ScheduleItemService {
  static async getAll(groupId?: string): Promise<ScheduleItem[]> {
    const url = groupId 
      ? `/scheduling/schedule-items/?schedule_group=${groupId}`
      : '/scheduling/schedule-items/';
    
    const response = await api.get(url);
    return response.data;
  }

  static async getById(id: string): Promise<ScheduleItem> {
    const response = await api.get(`/scheduling/schedule-items/${id}/`);
    return response.data;
  }

  // =================== FIXED: Uses proper CreateScheduleItemData DTO ===================
  static async create(data: CreateScheduleItemData): Promise<ScheduleItem> {
    const response = await api.post('/scheduling/schedule-items/', data);
    return response.data;
  }

  static async update(id: string, data: UpdateScheduleItemData): Promise<ScheduleItem> {
    const response = await api.put(`/scheduling/schedule-items/${id}/`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/scheduling/schedule-items/${id}/`);
  }
}

// ============================================
// CONFLICT CHECK SERVICE
// ============================================

export class ConflictCheckService {
  static async checkRowConflict(data: {
    schedule_group_id: string;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    instructor_id?: string | null;
    exclude_item_id?: string | null;
  }): Promise<RowConflictCheckResponse> {
    const response = await api.post('/scheduling/check-row-conflicts/', data);
    return response.data;
  }

  static async bulkCheckConflicts(items: Array<{
    course_id: string;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    instructor_id?: string | null;
    max_students?: number;
  }>): Promise<{
    has_conflicts: boolean;
    conflicts: Conflict[];
    count: number;
  }> {
    const response = await api.post('/scheduling/check-schedule-conflicts/', {
      schedule_items: items
    });
    return response.data;
  }
}

// ============================================
// SCHOOL YEAR SERVICE
// ============================================

export class SchoolYearService {
  static async getAll(): Promise<SchoolYear[]> {
    const response = await api.get('/scheduling/school-years/');
    return response.data;
  }

  static async getActive(): Promise<SchoolYear | null> {
    const years = await this.getAll();
    return years.find(year => year.is_active) || null;
  }

  static async create(data: Omit<SchoolYear, 'id'>): Promise<SchoolYear> {
    const response = await api.post('/scheduling/school-years/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<SchoolYear>): Promise<SchoolYear> {
    const response = await api.put(`/scheduling/school-years/${id}/`, data);
    return response.data;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const ScheduleHelper = {
  /**
   * Format time for display (e.g., "09:00 AM")
   */
  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  /**
   * Format time range (e.g., "09:00 AM - 10:30 AM")
   */
  formatTimeRange(start: string, end: string): string {
    return `${this.formatTime(start)} - ${this.formatTime(end)}`;
  },

  /**
   * Format day abbreviation (e.g., "Mon")
   */
  formatDay(day: string): string {
    const dayMap: Record<string, string> = {
      'MON': 'Mon',
      'TUE': 'Tue',
      'WED': 'Wed',
      'THU': 'Thu',
      'FRI': 'Fri',
      'SAT': 'Sat',
      'SUN': 'Sun'
    };
    return dayMap[day] || day;
  },

  /**
   * Get day options for dropdown
   */
  getDayOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'MON', label: 'Monday' },
      { value: 'TUE', label: 'Tuesday' },
      { value: 'WED', label: 'Wednesday' },
      { value: 'THU', label: 'Thursday' },
      { value: 'FRI', label: 'Friday' },
      { value: 'SAT', label: 'Saturday' },
      { value: 'SUN', label: 'Sunday' }
    ];
  },

  /**
   * Generate time slots for dropdown (30-minute intervals from 7 AM to 9 PM)
   */
  generateTimeSlots(): Array<{ value: string; label: string }> {
    const slots: Array<{ value: string; label: string }> = [];
    
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayHour = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
        slots.push({ value: time24, label });
      }
    }
    
    return slots;
  },

  /**
   * Validate if time range is valid
   */
  validateTimeRange(start: string, end: string): boolean {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    
    return endTotal > startTotal && (endTotal - startTotal) <= 360; // Max 6 hours
  },

  /**
   * Calculate duration in hours
   */
  calculateDuration(start: string, end: string): number {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    
    return (endTotal - startTotal) / 60;
  }
};

// ============================================
// LEGACY COMPATIBILITY (Remove when ready)
// ============================================

/**
 * @deprecated Use ScheduleGroupService.getAll() instead
 */
export async function getSchedules(): Promise<ScheduleItem[]> {
  console.warn('getSchedules() is deprecated. Use ScheduleItemService.getAll() instead.');
  return ScheduleItemService.getAll();
}

/**
 * @deprecated Use ScheduleItemService.create() instead
 */
export async function createSchedule(data: CreateScheduleItemData): Promise<ScheduleItem> {
  console.warn('createSchedule() is deprecated. Use ScheduleItemService.create() instead.');
  return ScheduleItemService.create(data);
}

/**
 * @deprecated Use ConflictCheckService.checkRowConflict() instead
 */
export async function checkConflict(data: {
  schedule_group_id: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  instructor_id?: string | null;
}): Promise<RowConflictCheckResponse> {
  console.warn('checkConflict() is deprecated. Use ConflictCheckService.checkRowConflict() instead.');
  return ConflictCheckService.checkRowConflict(data);
}

// Export all services
export const ScheduleService = {
  groups: ScheduleGroupService,
  items: ScheduleItemService,
  conflicts: ConflictCheckService,
  years: SchoolYearService,
  helper: ScheduleHelper
};

export default ScheduleService;
