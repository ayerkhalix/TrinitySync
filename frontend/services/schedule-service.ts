// services/schedule-service.ts
import { api } from './api-client';

export interface ScheduleFilter {
  year_level?: string;
  semester?: string;
  program?: string;
  course_id?: number;
  instructor_id?: number;
  room_id?: number;
}

export interface Schedule {
  id: number;
  time_slot: string;
  days: string;
  course: {
    id: number;
    code: string;
    name: string;
    description?: string;
    units: number;
  };
  instructor: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  room: {
    id: number;
    code: string;
    name: string;
    capacity: number;
    room_type: string;
  };
  program: {
    id: number;
    code: string;
    name: string;
  };
  year_level: string;
  semester: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleData {
  time_slot: string;
  days: string;
  course_id: number;
  instructor_id: number;
  room_id: number;
  program_id: number;
  year_level: string;
  semester: string;
}

export interface Conflict {
  type: 'room' | 'instructor';
  message: string;
  existing_schedule: number;
  conflicting_with: string;
}

export interface BulkCreateResponse {
  status: 'success' | 'partial_success' | 'error';
  created: number;
  failed: number;
  schedules: Schedule[];
  errors?: Array<{
    schedule: any;
    errors?: any;
    error?: string;
  }>;
}

export class ScheduleService {
  static async getSchedules(filters?: ScheduleFilter): Promise<Schedule[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await api.get(`/schedules/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  static async getScheduleById(id: number): Promise<Schedule> {
    try {
      const response = await api.get(`/schedules/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  static async createSchedule(data: CreateScheduleData): Promise<Schedule> {
    try {
      const response = await api.post('/schedules/', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.conflicts) {
        throw {
          ...error.response.data,
          hasConflicts: true,
        };
      }
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  static async updateSchedule(id: number, data: Partial<CreateScheduleData>): Promise<Schedule> {
    try {
      const response = await api.put(`/schedules/${id}/`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.conflicts) {
        throw {
          ...error.response.data,
          hasConflicts: true,
        };
      }
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  static async deleteSchedule(id: number): Promise<void> {
    try {
      await api.delete(`/schedules/${id}/`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  static async bulkCreateSchedules(
    schedules: CreateScheduleData[],
    year_level: string,
    semester: string,
    program: string
  ): Promise<BulkCreateResponse> {
    try {
      const response = await api.post('/schedules/bulk/', {
        schedules,
        year_level,
        semester,
        program,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk creating schedules:', error);
      throw error;
    }
  }

  static async checkConflict(data: Omit<CreateScheduleData, 'program_id'>): Promise<{
    has_conflicts: boolean;
    conflicts: Conflict[];
    count: number;
  }> {
    try {
      const response = await api.post('/schedules/check-conflict/', data);
      return response.data;
    } catch (error) {
      console.error('Error checking conflict:', error);
      throw error;
    }
  }

  static async filterSchedules(filters: {
    year_level?: string;
    semester?: string;
    program?: string;
  }): Promise<any[]> {
    try {
      const response = await api.post('/schedules/filter/', filters);
      return response.data;
    } catch (error) {
      console.error('Error filtering schedules:', error);
      throw error;
    }
  }

  // Helper methods for generating time slots (from your old system)
  static generateTimeSlots(): string[] {
    const slots: string[] = [];
    const toTimeString = (hour: number): string => {
      const h = hour % 12 || 12;
      const suffix = hour < 12 ? 'AM' : 'PM';
      return `${h}:00 ${suffix}`;
    };

    for (let start = 8; start <= 18; start++) {
      for (let duration = 1; duration <= 4; duration++) {
        const end = start + duration;
        if (end > 19) continue;
        if (start < 12 && end > 12 && end <= 13) continue;
        if (start >= 12 && start < 13) continue;
        slots.push(`${toTimeString(start)} - ${toTimeString(end)}`);
      }
    }

    return slots;
  }

  static getDaysOptions(): string[] {
    return [
      'Monday',
      'Tuesday', 
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Monday/Tuesday',
      'Thursday/Friday',
      'Wednesday',
      'Saturday',
      'Monday',
      'Tuesday',
      'Thursday',
      'Friday',
      'Monday/Wednesday/Friday',
      'Tuesday/Thursday/Saturday'
    ];
  }

  static getRoomOptions(): string[] {
    return ['TC', 'CL2', 'MF201', 'MF202', 'MF203', 'MF204', 'MF205', 'MF206', 'Blended', 'Online'];
  }

  static formatScheduleForTable(schedule: Schedule): {
    id: number;
    time: string;
    day: string;
    course_code: string;
    course_description: string;
    instructor: string;
    room: string;
    year_level: string;
    semester: string;
    program: string;
  } {
    return {
      id: schedule.id,
      time: schedule.time_slot,
      day: schedule.days,
      course_code: schedule.course.code,
      course_description: schedule.course.name,
      instructor: schedule.instructor.full_name,
      room: schedule.room.code,
      year_level: schedule.year_level.replace('_', ' '),
      semester: schedule.semester.replace('_', ' '),
      program: schedule.program.name,
    };
  }

  // Mock data for development
  static getMockSchedules(): Schedule[] {
    return [
      {
        id: 1,
        time_slot: '8:00 AM - 11:00 AM',
        days: 'Thursday/Friday',
        course: {
          id: 1,
          code: 'ITCP 106',
          name: 'Computer Programming 2 (Intermediate Programming)',
          description: 'Advanced programming concepts and techniques',
          units: 3,
        },
        instructor: {
          id: 1,
          employee_id: 'EMP001',
          first_name: 'Ronilo',
          last_name: 'Gayutin',
          full_name: 'Ronilo Gayutin',
        },
        room: {
          id: 1,
          code: 'CL2',
          name: 'Computer Lab 2',
          capacity: 30,
          room_type: 'computer_lab',
        },
        program: {
          id: 1,
          code: 'BSIT',
          name: 'BS Information Technology',
        },
        year_level: 'second_year',
        semester: 'second_sem',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z',
      },
      {
        id: 2,
        time_slot: '1:00 PM - 3:00 PM',
        days: 'Monday/Wednesday/Friday',
        course: {
          id: 2,
          code: 'ITDS 108',
          name: 'Data Structures and Algorithms',
          description: 'Fundamental data structures and algorithms',
          units: 3,
        },
        instructor: {
          id: 2,
          employee_id: 'EMP002',
          first_name: 'Maria',
          last_name: 'Santos',
          full_name: 'Maria Santos',
        },
        room: {
          id: 2,
          code: 'TC',
          name: 'Technology Center',
          capacity: 40,
          room_type: 'classroom',
        },
        program: {
          id: 1,
          code: 'BSIT',
          name: 'BS Information Technology',
        },
        year_level: 'second_year',
        semester: 'second_sem',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z',
      },
      {
        id: 3,
        time_slot: '3:00 PM - 5:00 PM',
        days: 'Tuesday/Thursday',
        course: {
          id: 3,
          code: 'ITDB 110',
          name: 'Fundamentals of Database Systems',
          description: 'Introduction to database management systems',
          units: 3,
        },
        instructor: {
          id: 3,
          employee_id: 'EMP003',
          first_name: 'Juan',
          last_name: 'Dela Cruz',
          full_name: 'Juan Dela Cruz',
        },
        room: {
          id: 3,
          code: 'MF201',
          name: 'Main Building Room 201',
          capacity: 35,
          room_type: 'classroom',
        },
        program: {
          id: 1,
          code: 'BSIT',
          name: 'BS Information Technology',
        },
        year_level: 'second_year',
        semester: 'second_sem',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z',
      },
    ];
  }

  // For development when backend is not ready
  static async getMockSchedulesAsync(): Promise<Schedule[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getMockSchedules());
      }, 500);
    });
  }
}