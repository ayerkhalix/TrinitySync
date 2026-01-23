// types/user.ts
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'department_admin' | 'super_admin';
  student_id?: string;
  department?: string;
  year_level?: string;
  program?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  first_name: string;
  last_name: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  program?: string;
}