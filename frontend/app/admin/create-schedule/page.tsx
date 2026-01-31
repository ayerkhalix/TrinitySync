// app/admin/create-schedule/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, Clock, CalendarDays, User, 
  Building, BookOpen, AlertCircle, CheckCircle,
  Filter, Plus, Trash2, ChevronDown, XCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { apiFetch, fetchPrograms, fetchCourses, createSchedules } from '@/lib/api';

interface ScheduleRow {
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

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  year_level: string;
  semester: string;
  units: number;
}

interface Program {
  id: string;
  name: string;
  code: string;
}

const semesterOptions = [
  { value: 'first_sem', label: 'First Semester' },
  { value: 'second_sem', label: 'Second Semester' },
  { value: 'third_sem', label: 'Third Semester' },
  { value: 'summer', label: 'Summer Term' },
  { value: 'special', label: 'Special Term' },
] as const;

const yearLevelOptions = [
  { value: 'first_year', label: 'First Year' },
  { value: 'second_year', label: 'Second Year' },
  { value: 'third_year', label: 'Third Year' },
  { value: 'fourth_year', label: 'Fourth Year' },
];

export default function CreateSchedulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [instructorOptions, setInstructorOptions] = useState<string[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([
    {
      id: 1,
      courseId: '',
      courseCode: '',
      courseTitle: '',
      days: '',
      startTime: '',
      endTime: '',
      instructor: '',
      room: '',
      program: '',
      yearLevel: '',
      semester: '',
    }
  ]);

  const daysOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Monday/Tuesday',
    'Wednesday/Thursday',
    'Thursday/Friday',
    'Monday/Wednesday/Friday',
    'Tuesday/Thursday/Saturday'
  ];

  const roomOptions = [
    'TC', 'CL2', 'MF201', 'MF202', 'MF203', 'MF204', 'MF205', 'MF206', 'Blended', 'Online'
  ];

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const timeString = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
    const militaryTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return { display: timeString, value: militaryTime };
  });

  // Fetch programs on mount
  useEffect(() => {
    loadPrograms();
    
    // Mock instructor data (in real app, fetch from API)
    setInstructorOptions([
      'Ronilo Gayutin',
      'Maria Santos',
      'Juan Dela Cruz',
      'Ana Reyes',
      'Carlos Lim',
      'Elena Torres'
    ]);
  }, []);

  // Fetch courses when program, year level, or semester changes
  useEffect(() => {
    if (selectedProgram && selectedYearLevel && selectedSemester) {
      loadCourses(selectedProgram, selectedYearLevel, selectedSemester);
    } else {
      setCourseOptions([]);
      // 🔴 FIXED: Inline reset instead of clearCourseSelections
      setScheduleRows(prev =>
        prev.map(row => ({
          ...row,
          courseId: '',
          courseCode: '',
          courseTitle: '',
          yearLevel: selectedYearLevel || row.yearLevel,
          semester: selectedSemester || row.semester,
        }))
      );
    }
  }, [selectedProgram, selectedYearLevel, selectedSemester]);

  const loadPrograms = async () => {
    try {
      const data = await fetchPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const loadCourses = async (programId: string, yearLevel: string, semester: string) => {
    setIsLoadingCourses(true);
    try {
      // 🟢 FIXED: Now passes all three parameters
      const data = await fetchCourses(programId, yearLevel, semester);
      setCourseOptions(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourseOptions([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleProgramChange = (value: string) => {
    setSelectedProgram(value);
    // Don't clear year level and semester when program changes
  };

  const handleYearLevelChange = (value: string) => {
    setSelectedYearLevel(value);
    // Update year level in all existing rows
    setScheduleRows(prevRows => 
      prevRows.map(row => ({
        ...row,
        yearLevel: value,
      }))
    );
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    // Update semester in all existing rows
    setScheduleRows(prevRows => 
      prevRows.map(row => ({
        ...row,
        semester: value,
      }))
    );
  };

  const addRow = () => {
    // Prevent adding rows if filters aren't complete
    if (!selectedProgram || !selectedYearLevel || !selectedSemester) {
      alert('Please select Program, Year Level, and Semester first');
      return;
    }

    const newRow: ScheduleRow = {
      id: Date.now(),
      courseId: '',
      courseCode: '',
      courseTitle: '',
      days: '',
      startTime: '',
      endTime: '',
      instructor: '',
      room: '',
      program: selectedProgram,
      yearLevel: selectedYearLevel,
      semester: selectedSemester,
    };
    setScheduleRows([...scheduleRows, newRow]);
  };

  const removeRow = (id: number) => {
    if (scheduleRows.length > 1) {
      setScheduleRows(scheduleRows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: number, field: keyof ScheduleRow, value: string) => {
    setScheduleRows(scheduleRows.map(row => {
      if (row.id === id) {
        // When courseCode changes, find the course and update all fields
        if (field === 'courseCode' && value) {
          const selectedCourse = courseOptions.find(course => course.course_code === value);
          if (selectedCourse) {
            // Validate that the selected course matches the filters
            if (selectedCourse.year_level !== selectedYearLevel) {
              alert(`Selected course is for ${selectedCourse.year_level.replace('_', ' ')}, but you've selected ${selectedYearLevel.replace('_', ' ')}. Please choose a course that matches the selected year level.`);
              return row; // Don't update
            }
            
            return { 
              ...row, 
              [field]: value,
              courseId: selectedCourse.id,
              courseTitle: selectedCourse.course_title,
              yearLevel: selectedCourse.year_level,
              semester: selectedCourse.semester
            };
          }
        }
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const validateForm = () => {
    let isValid = true;
    scheduleRows.forEach(row => {
      if (!row.courseCode || !row.days || !row.startTime || !row.endTime || !row.instructor || !row.room) {
        isValid = false;
      }
      // Validate time logic
      if (row.startTime && row.endTime) {
        const start = convertToMinutes(row.startTime);
        const end = convertToMinutes(row.endTime);
        if (start >= end) {
          isValid = false;
        }
        // Validate duration is in 20 or 40 minute increments
        const duration = end - start;
        if (duration % 20 !== 0 || duration % 40 === 0) {
          isValid = false;
        }
      }
    });
    return isValid;
  };

  const convertToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      alert('Please fill in all required fields and ensure time durations are valid (20 or 40 minute increments)');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare schedule data for backend
      const scheduleData = scheduleRows.map(row => ({
        course_id: row.courseId,
        course_code: row.courseCode,
        course_title: row.courseTitle,
        days: row.days,
        start_time: row.startTime,
        end_time: row.endTime,
        instructor: row.instructor,
        room: row.room,
        program_id: selectedProgram,
        year_level: row.yearLevel,
        semester: row.semester,
      }));
      
      // Save to backend
      await createSchedules(scheduleData);
      
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error: any) {
      alert('Error creating schedule: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedRows = scheduleRows.filter(row => 
    row.courseCode && row.days && row.startTime && row.endTime && row.instructor && row.room
  ).length;

  const areFiltersComplete = selectedProgram && selectedYearLevel && selectedSemester;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-l-4 border-l-primary">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Schedules Created Successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    {scheduleRows.length} schedule(s) added. Redirecting to admin dashboard...
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="hover:bg-accent/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">CREATE SCHEDULE</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Create New Schedule</h1>
            <p className="text-muted-foreground">Add multiple subjects in one go. Each row represents one course.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => router.push('/admin')}
            disabled={isSubmitting}
            className="border-border text-foreground hover:bg-accent/50"
          >
            Cancel
          </Button>
          <Button 
            onClick={addRow}
            variant="outline"
            disabled={!areFiltersComplete}
            className="border-border text-foreground hover:bg-accent/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
        </div>
      </motion.div>

      {/* Program, Year Level & Semester Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program
              </label>
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.code} - {program.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            
            {/* Year Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Level
              </label>
              <div className="relative">
                <select
                  value={selectedYearLevel}
                  onChange={(e) => handleYearLevelChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select year level</option>
                  {yearLevelOptions.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            
            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select semester</option>
                  {semesterOptions.map(sem => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          
          {areFiltersComplete && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {courseOptions.length} courses available for {yearLevelOptions.find(y => y.value === selectedYearLevel)?.label} {semesterOptions.find(s => s.value === selectedSemester)?.label}
                  </span>
                </div>
                {isLoadingCourses && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">Loading courses...</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!areFiltersComplete && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Please select Program, Year Level, and Semester to load available courses
                </span>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Course Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Course Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {scheduleRows.map((row, rowIndex) => (
                    <tr key={row.id} className="hover:bg-accent/10 transition-colors">
                      {/* Course Code */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            value={row.courseCode}
                            onChange={(e) => updateRow(row.id, 'courseCode', e.target.value)}
                            className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            disabled={!areFiltersComplete}
                          >
                            <option value="">Select Course</option>
                            {courseOptions.map(course => (
                              <option key={course.id} value={course.course_code}>
                                {course.course_code}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      
                      {/* Course Title */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          value={row.courseTitle}
                          readOnly
                          placeholder="Auto-filled from course selection"
                          className="text-sm bg-muted border-border text-muted-foreground"
                        />
                      </td>
                      
                      {/* Days */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            value={row.days}
                            onChange={(e) => updateRow(row.id, 'days', e.target.value)}
                            className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">Select Days</option>
                            {daysOptions.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      
                      {/* Time (Start & End) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <select
                              value={row.startTime}
                              onChange={(e) => updateRow(row.id, 'startTime', e.target.value)}
                              className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">Start</option>
                              {timeOptions.map(time => (
                                <option key={time.value} value={time.value}>
                                  {time.display}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                          <div className="relative flex-1">
                            <select
                              value={row.endTime}
                              onChange={(e) => updateRow(row.id, 'endTime', e.target.value)}
                              className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">End</option>
                              {timeOptions.map(time => (
                                <option key={time.value} value={time.value}>
                                  {time.display}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                        {row.startTime && row.endTime && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Duration: {Math.round((convertToMinutes(row.endTime) - convertToMinutes(row.startTime)) / 60)}h 
                            {(convertToMinutes(row.endTime) - convertToMinutes(row.startTime)) % 60}m
                          </div>
                        )}
                      </td>
                      
                      {/* Instructor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            value={row.instructor}
                            onChange={(e) => updateRow(row.id, 'instructor', e.target.value)}
                            className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">Select Instructor</option>
                            {instructorOptions.map(instructor => (
                              <option key={instructor} value={instructor}>{instructor}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      
                      {/* Room */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            value={row.room}
                            onChange={(e) => updateRow(row.id, 'room', e.target.value)}
                            className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">Select Room</option>
                            {roomOptions.map(room => (
                              <option key={room} value={room}>{room}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(row.id)}
                          disabled={scheduleRows.length <= 1}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-border/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Total courses: <span className="font-semibold text-foreground">{scheduleRows.length}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{completedRows}</span> / {scheduleRows.length} rows complete
                  </div>
                  <div className="h-4 w-4 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <div 
                      className="h-2 w-2 rounded-full bg-primary animate-pulse"
                      style={{ animationDuration: '1.5s' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                disabled={isSubmitting}
                className="border-border text-foreground hover:bg-accent/50 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button 
                  onClick={addRow}
                  variant="outline"
                  disabled={!areFiltersComplete}
                  className="border-border text-foreground hover:bg-accent/50 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Row
                </Button>
                <Button 
                  type="submit" 
                  loading={isSubmitting} 
                  disabled={showSuccess || !areFiltersComplete}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All Schedules
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Preview & Instructions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Instructions */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Instructions</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Select Program, Year Level, and Semester first</span>
                  <span className="text-muted-foreground"> to load available courses</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Course selection</span>
                  <span className="text-muted-foreground"> will auto-populate course title and details</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Courses are filtered by</span>
                  <span className="text-muted-foreground"> Program + Year Level + Semester</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Changing filters</span>
                  <span className="text-muted-foreground"> will clear course selections</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">All fields are required</span>
                  <span className="text-muted-foreground"> for schedule creation</span>
                </div>
              </li>
            </ul>
          </Card>

          {/* Conflict Detection */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Conflict Detection</h3>
              </div>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Real-time conflict checking enabled...
              </div>
              {scheduleRows.length > 1 && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {scheduleRows.length} courses being monitored for conflicts
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Conflicts will be automatically detected and highlighted
                </div>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}