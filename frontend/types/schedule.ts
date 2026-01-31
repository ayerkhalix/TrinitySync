// types/schedule.ts
export interface ScheduleRow {
  id: number;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  days: string;
  startTime: string;
  endTime: string;
  instructor: string;
  room: string;
  program: string;
  yearLevel: string;
  semester: string;
}

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

export const semesterOptions = [
  { value: 'first_sem', label: 'First Semester' },
  { value: 'second_sem', label: 'Second Semester' },
  { value: 'third_sem', label: 'Third Semester' },
  { value: 'summer', label: 'Summer Term' },
  { value: 'special', label: 'Special Term' },
] as const;

export type SemesterType = typeof semesterOptions[number]['value'];