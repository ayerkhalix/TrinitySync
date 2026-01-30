// types/user.ts
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'COLLEGE_ADMIN' | 'SUPER_ADMIN';
  student_id?: string; // For student registration
  employee_id?: string; // For staff registration
}

// Match Django backend response
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'COLLEGE_ADMIN' | 'SUPER_ADMIN';
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar_url?: string;
  is_active: boolean;
  email_verified: boolean;
  student_profile?: StudentProfile;
  staff_profile?: StaffProfile;
}

export interface StudentProfile {
  student_id: string;
  college: string;
  program: string;
  year_level: string;
  section: string;
  admission_year: number;
  expected_graduation?: string;
  is_graduated: boolean;
}

export interface StaffProfile {
  employee_id?: string;
  position: string;
  department: string;
  is_college_admin: boolean;
  is_super_admin: boolean;
  office_location?: string;
  office_hours?: Record<string, any>;
  expertise?: string[];
}