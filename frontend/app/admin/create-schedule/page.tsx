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

interface ScheduleRow {
  id: number;
  courseCode: string;
  courseTitle: string;
  days: string;
  startTime: string;
  endTime: string;
  instructor: string;
  room: string;
  section: string;
  program: string;
  yearLevel: string;
  semester: string;
}

interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  units: number;
  program: string;
  year_level: string;
  semester: string;
}

export default function CreateSchedulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [instructorOptions, setInstructorOptions] = useState<string[]>([]);
  
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([
    {
      id: 1,
      courseCode: '',
      courseTitle: '',
      days: '',
      startTime: '',
      endTime: '',
      instructor: '',
      room: '',
      section: '',
      program: 'BSIT',
      yearLevel: 'second_year',
      semester: 'second_sem',
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

  // Mock data for demonstration
  useEffect(() => {
    // Mock course data
    setCourseOptions([
      { id: 1, code: 'ITCP 106', name: 'Computer Programming 2', description: 'Intermediate Programming', units: 3, program: 'BSIT', year_level: 'second_year', semester: 'second_sem' },
      { id: 2, code: 'ITDS 108', name: 'Data Structures and Algorithms', description: 'Data Structures', units: 3, program: 'BSIT', year_level: 'second_year', semester: 'second_sem' },
      { id: 3, code: 'ITEL 109', name: 'Discrete Mathematics', description: 'Discrete Math', units: 3, program: 'BSIT', year_level: 'second_year', semester: 'second_sem' },
      { id: 4, code: 'ITEL 110', name: 'Fundamentals of Database Systems', description: 'Database Systems', units: 3, program: 'BSIT', year_level: 'second_year', semester: 'second_sem' },
    ]);

    // Mock instructor data
    setInstructorOptions([
      'Ronilo Gayutin',
      'Maria Santos',
      'Juan Dela Cruz',
      'Ana Reyes',
      'Carlos Lim',
      'Elena Torres'
    ]);
  }, []);

  const addRow = () => {
    const newRow: ScheduleRow = {
      id: Date.now(),
      courseCode: '',
      courseTitle: '',
      days: '',
      startTime: '',
      endTime: '',
      instructor: '',
      room: '',
      section: '',
      program: 'BSIT',
      yearLevel: 'second_year',
      semester: 'second_sem',
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
        // Auto-populate course title when course code is selected
        if (field === 'courseCode' && value) {
          const selectedCourse = courseOptions.find(course => course.code === value);
          if (selectedCourse) {
            return { 
              ...row, 
              [field]: value,
              courseTitle: selectedCourse.name,
              program: selectedCourse.program,
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
      // Create schedules (mock implementation)
      setTimeout(() => {
        // Save to localStorage for demo
        const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        scheduleRows.forEach(row => {
          schedules.push({
            id: Date.now() + row.id,
            time_slot: `${row.startTime} - ${row.endTime}`,
            days: row.days,
            course_code: row.courseCode,
            course_description: row.courseTitle,
            instructor: row.instructor,
            room: row.room,
            section: row.section,
            program: row.program,
            year_level: row.yearLevel,
            semester: row.semester,
            created_at: new Date().toISOString(),
            status: 'active'
          });
        });
        localStorage.setItem('schedules', JSON.stringify(schedules));
        
        setShowSuccess(true);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      }, 1000);
      
    } catch (error: any) {
      alert('Error creating schedule: ' + error.message);
      setIsSubmitting(false);
    }
  };

  const completedRows = scheduleRows.filter(row => 
    row.courseCode && row.days && row.startTime && row.endTime && row.instructor && row.room
  ).length;

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
            className="border-border text-foreground hover:bg-accent/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {scheduleRows.map((row, rowIndex) => (
                    <tr key={row.id} className="hover:bg-accent/10 transition-colors">
                      {/* Course Code & Title */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="relative">
                            <select
                              value={row.courseCode}
                              onChange={(e) => updateRow(row.id, 'courseCode', e.target.value)}
                              className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">Select Course</option>
                              {courseOptions.map(course => (
                                <option key={course.id} value={course.code}>
                                  {course.code} - {course.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                          {row.courseTitle && (
                            <div className="text-xs text-muted-foreground px-1">{row.courseTitle}</div>
                          )}
                        </div>
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
                      
                      {/* Section */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          value={row.section}
                          onChange={(e) => updateRow(row.id, 'section', e.target.value)}
                          placeholder="e.g., BSIT 2A"
                          className="text-sm bg-card border-border"
                        />
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
                  className="border-border text-foreground hover:bg-accent/50 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Row
                </Button>
                <Button 
                  type="submit" 
                  loading={isSubmitting} 
                  disabled={showSuccess}
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
                  <span className="font-medium text-foreground">Each row</span>
                  <span className="text-muted-foreground"> represents one subject/course</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Use Add Row</span>
                  <span className="text-muted-foreground"> to schedule multiple courses</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Time slots</span>
                  <span className="text-muted-foreground"> must be in 20 or 40 minute increments</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">All dropdowns are required</span>
                  <span className="text-muted-foreground"> except Section</span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Course selection</span>
                  <span className="text-muted-foreground"> will auto-populate other details</span>
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