// lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const fullUrl = `${API_URL}${path}`;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  console.log("🔍 Fetching:", {
    url: fullUrl,
    method: options.method || "GET",
    hasToken: !!token,
  });

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  console.log("📊 Response:", {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
  });

  if (!res.ok) {
    let errorMessage = `API error: ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}


// Types
export interface Course {
  id: string;
  course_code: string;
  course_title: string;
  year_level: string;
  semester: string;
  units: number;
}

export interface Program {
  id: string;
  name: string;
  code: string;
}

export interface ScheduleData {
  course_id: string;
  course_code: string;
  course_title: string;
  days: string;
  start_time: string;
  end_time: string;
  instructor: string;
  room: string;
  program_id: string;
  year_level: string;
  semester: string;
}

// API Functions
export async function fetchPrograms(): Promise<Program[]> {
  try {
    // Adjust endpoint based on your actual API
    const data = await apiFetch('/colleges/programs/'); // Or /programs/
    return data.results || data || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    // Return mock data for development
    return [
      { id: '1', code: 'BSIT', name: 'Bachelor of Science in Information Technology' },
      { id: '2', code: 'BSCS', name: 'Bachelor of Science in Computer Science' },
    ];
  }
}

// In lib/api.ts, update the fetchCourses function:
export async function fetchCourses(
  programId: string,
  yearLevel: string,  // ADD THIS PARAMETER
  semester: string
): Promise<Course[]> {
  try {
    // Update the endpoint to include year_level
    const data = await apiFetch(
      `/courses/filter_courses/?program=${programId}&year_level=${yearLevel}&semester=${semester}`
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        course_code: 'ITCP 106',
        course_title: 'Computer Programming 2',
        year_level: yearLevel,  // Use the passed yearLevel
        semester: semester,     // Use the passed semester
        units: 3
      }
    ];
  }
}

export async function createSchedules(schedules: ScheduleData[]) {
  try {
    const data = await apiFetch('/schedules/bulk_create/', {
      method: 'POST',
      body: JSON.stringify({ schedules }),
    });
    return data;
  } catch (error) {
    console.error('Error creating schedules:', error);
    throw error;
  }
}

// Alternative: If you don't have schedules endpoint yet, use this mock
export async function createSchedulesMock(schedules: ScheduleData[]) {
  console.log('📤 Creating schedules (mock):', schedules);
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `${schedules.length} schedules created successfully`,
        schedule_ids: schedules.map((_, i) => `schedule_${Date.now()}_${i}`)
      });
    }, 1000);
  });
}

export interface ConflictCheckRequest {
  schedule_group_id: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  instructor_id: string | null;
  exclude_item_id?: string | null;
}

export interface ConflictCheckResponse {
  conflicts: Array<{
    type: string;
    severity: number;
    message: string;
    source: string;
    conflicting_item_id?: string;
    conflicting_course_code?: string;
    conflicting_course_title?: string;
    conflicting_schedule_group?: string;
    conflicting_section?: string;
    conflicting_room?: string;
  }>;
  has_critical_conflict: boolean;
  summary: {
    total_conflicts: number;
    critical_conflicts: number;
    warning_conflicts: number;
    info_conflicts: number;
  };
}

/**
 * Check conflicts for a single schedule row
 */
export const checkRowConflicts = async (
  data: ConflictCheckRequest
): Promise<ConflictCheckResponse> => {
  try {
    const response = await apiFetch('/api/schedules/check-row-conflicts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check conflicts: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking row conflicts:', error);
    throw error;
  }
};

// Export everything
export default {
  API_URL,
  apiFetch,
  fetchPrograms,
  fetchCourses,
  createSchedules,
  createSchedulesMock
};