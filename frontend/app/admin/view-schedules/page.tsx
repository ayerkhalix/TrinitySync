// app/admin/view-schedules/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Calendar, Printer, Eye, 
  Download, ChevronDown, ChevronUp, Clock,
  Building, Users, BookOpen, FileText,
  X, RefreshCw, CheckCircle, AlertCircle,
  CalendarDays, GraduationCap, Layers,
  ChevronRight, Grid, Table, List,
  ArrowLeft, CheckSquare, Square
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface CourseSchedule {
  id: number;
  program: string;
  year_level: string;
  section: string;
  semester: string;
  academic_year: string;
  schedule_table: ScheduleItem[];
  status: 'active' | 'pending' | 'draft';
  created_at: string;
  updated_at: string;
}

interface ScheduleItem {
  id: number;
  subject_code: string;
  subject_name: string;
  units: number;
  days: string;
  time_slot: string;
  instructor: string;
  room: string;
  type: 'lecture' | 'laboratory' | 'blended';
}

export default function ViewSchedulesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseSchedule[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseSchedule[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Dropdown states
  const [showProgramFilter, setShowProgramFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [showSemesterFilter, setShowSemesterFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  // Filter options
  const programOptions = ['all', 'BSIT', 'BSCS', 'BSCE', 'BSME', 'BSN', 'BSA', 'BSED', 'BSPH'];
  const yearLevelOptions = ['all', 'first_year', 'second_year', 'third_year', 'fourth_year', 'fifth_year'];
  const semesterOptions = ['all', 'first_sem', 'second_sem', 'summer'];
  const statusOptions = ['all', 'active', 'pending', 'draft'];

  // Time slots for schedule table
  const timeSlots = [
    '7:00 AM - 7:50 AM',
    '7:50 AM - 8:40 AM',
    '8:40 AM - 9:30 AM',
    '9:30 AM - 10:20 AM',
    '10:20 AM - 11:10 AM',
    '11:10 AM - 12:00 PM',
    '12:00 PM - 12:50 PM',
    '12:50 PM - 1:40 PM',
    '1:40 PM - 2:30 PM',
    '2:30 PM - 3:20 PM',
    '3:20 PM - 4:10 PM',
    '4:10 PM - 5:00 PM',
    '5:00 PM - 5:50 PM',
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Mock data for demonstration
  useEffect(() => {
    const mockCourses: CourseSchedule[] = [
      {
        id: 1,
        program: 'BSIT',
        year_level: 'first_year',
        section: 'BSIT 1A',
        semester: 'first_sem',
        academic_year: '2024-2025',
        status: 'active',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        schedule_table: [
          {
            id: 101,
            subject_code: 'GE 101',
            subject_name: 'Understanding the Self',
            units: 3,
            days: 'Monday/Wednesday/Friday',
            time_slot: '7:00 AM - 7:50 AM',
            instructor: 'Dr. Maria Santos',
            room: 'CL2',
            type: 'lecture'
          },
          {
            id: 102,
            subject_code: 'GE 102',
            subject_name: 'Readings in Philippine History',
            units: 3,
            days: 'Monday/Wednesday/Friday',
            time_slot: '7:50 AM - 8:40 AM',
            instructor: 'Prof. Juan Dela Cruz',
            room: 'CL2',
            type: 'lecture'
          },
          {
            id: 103,
            subject_code: 'IT 101',
            subject_name: 'Introduction to Computing',
            units: 3,
            days: 'Tuesday/Thursday',
            time_slot: '7:00 AM - 8:30 AM',
            instructor: 'Ronilo Gayutin',
            room: 'TC',
            type: 'lecture'
          },
        ]
      },
      {
        id: 2,
        program: 'BSIT',
        year_level: 'first_year',
        section: 'BSIT 1B',
        semester: 'first_sem',
        academic_year: '2024-2025',
        status: 'active',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        schedule_table: [
          {
            id: 201,
            subject_code: 'GE 101',
            subject_name: 'Understanding the Self',
            units: 3,
            days: 'Monday/Wednesday/Friday',
            time_slot: '7:00 AM - 7:50 AM',
            instructor: 'Dr. Maria Santos',
            room: 'MF201',
            type: 'lecture'
          },
          {
            id: 202,
            subject_code: 'GE 102',
            subject_name: 'Readings in Philippine History',
            units: 3,
            days: 'Monday/Wednesday/Friday',
            time_slot: '7:50 AM - 8:40 AM',
            instructor: 'Prof. Juan Dela Cruz',
            room: 'MF201',
            type: 'lecture'
          },
          {
            id: 203,
            subject_code: 'IT 101',
            subject_name: 'Introduction to Computing',
            units: 3,
            days: 'Tuesday/Thursday',
            time_slot: '8:40 AM - 10:10 AM',
            instructor: 'Ronilo Gayutin',
            room: 'TC',
            type: 'lecture'
          },
        ]
      },
      {
        id: 3,
        program: 'BSIT',
        year_level: 'second_year',
        section: 'BSIT 2A',
        semester: 'second_sem',
        academic_year: '2024-2025',
        status: 'active',
        created_at: '2024-01-16',
        updated_at: '2024-01-16',
        schedule_table: [
          {
            id: 301,
            subject_code: 'ITCP 106',
            subject_name: 'Computer Programming 2',
            units: 3,
            days: 'Monday/Wednesday/Friday',
            time_slot: '8:40 AM - 9:30 AM',
            instructor: 'Ronilo Gayutin',
            room: 'TC',
            type: 'lecture'
          },
          {
            id: 302,
            subject_code: 'ITDS 108',
            subject_name: 'Data Structures and Algorithms',
            units: 3,
            days: 'Tuesday/Thursday',
            time_slot: '1:40 PM - 3:10 PM',
            instructor: 'Maria Santos',
            room: 'CL2',
            type: 'lecture'
          },
          {
            id: 303,
            subject_code: 'ITIM 109',
            subject_name: 'Information Management',
            units: 3,
            days: 'Monday/Wednesday/Friday',
            time_slot: '10:20 AM - 11:10 AM',
            instructor: 'Juan Dela Cruz',
            room: 'MF202',
            type: 'lecture'
          },
        ]
      },
      {
        id: 4,
        program: 'BSCE',
        year_level: 'first_year',
        section: 'BSCE 1A',
        semester: 'first_sem',
        academic_year: '2024-2025',
        status: 'active',
        created_at: '2024-01-14',
        updated_at: '2024-01-14',
        schedule_table: [
          {
            id: 401,
            subject_code: 'CE 101',
            subject_name: 'Engineering Mechanics',
            units: 4,
            days: 'Monday/Wednesday/Friday',
            time_slot: '7:00 AM - 8:30 AM',
            instructor: 'Carlos Lim',
            room: 'MF205',
            type: 'lecture'
          },
          {
            id: 402,
            subject_code: 'MATH 101',
            subject_name: 'Calculus 1',
            units: 3,
            days: 'Tuesday/Thursday',
            time_slot: '7:00 AM - 8:30 AM',
            instructor: 'Ana Reyes',
            room: 'MF203',
            type: 'lecture'
          },
        ]
      },
      {
        id: 5,
        program: 'BSCE',
        year_level: 'second_year',
        section: 'BSCE 2B',
        semester: 'second_sem',
        academic_year: '2024-2025',
        status: 'pending',
        created_at: '2024-01-17',
        updated_at: '2024-01-17',
        schedule_table: [
          {
            id: 501,
            subject_code: 'CE 201',
            subject_name: 'Structural Analysis',
            units: 4,
            days: 'Monday/Wednesday/Friday',
            time_slot: '8:40 AM - 10:10 AM',
            instructor: 'Michael Tan',
            room: 'MF206',
            type: 'lecture'
          },
          {
            id: 502,
            subject_code: 'CE 202',
            subject_name: 'Fluid Mechanics',
            units: 3,
            days: 'Tuesday/Thursday',
            time_slot: '10:20 AM - 11:50 AM',
            instructor: 'Elena Torres',
            room: 'MF204',
            type: 'lecture'
          },
        ]
      },
      {
        id: 6,
        program: 'BSN',
        year_level: 'first_year',
        section: 'BSN 1A',
        semester: 'first_sem',
        academic_year: '2024-2025',
        status: 'draft',
        created_at: '2024-01-18',
        updated_at: '2024-01-18',
        schedule_table: [
          {
            id: 601,
            subject_code: 'NURS 101',
            subject_name: 'Anatomy & Physiology',
            units: 5,
            days: 'Monday/Tuesday/Wednesday',
            time_slot: '7:00 AM - 8:30 AM',
            instructor: 'Dr. Sarah Johnson',
            room: 'MF207',
            type: 'lecture'
          },
        ]
      },
    ];

    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.program.toLowerCase().includes(term) ||
        course.section.toLowerCase().includes(term) ||
        course.academic_year.toLowerCase().includes(term)
      );
    }

    // Program filter
    if (selectedProgram !== 'all') {
      filtered = filtered.filter(course => course.program === selectedProgram);
    }

    // Year level filter
    if (selectedYearLevel !== 'all') {
      filtered = filtered.filter(course => course.year_level === selectedYearLevel);
    }

    // Semester filter
    if (selectedSemester !== 'all') {
      filtered = filtered.filter(course => course.semester === selectedSemester);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(course => course.status === selectedStatus);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedProgram, selectedYearLevel, selectedSemester, selectedStatus, courses]);

  const handlePrint = () => {
    if (selectedCourse) {
      // Print individual course schedule
      window.print();
    } else {
      // Print course list
      window.print();
    }
  };

  const handleExport = () => {
    const data = selectedCourse || filteredCourses;
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = selectedCourse 
      ? `${selectedCourse.program}_${selectedCourse.section}_schedule.json`
      : 'courses_export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedProgram('all');
    setSelectedYearLevel('all');
    setSelectedSemester('all');
    setSelectedStatus('all');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'draft': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'draft': return <FileText className="h-3 w-3" />;
      default: return null;
    }
  };

  const formatYearLevel = (year: string) => {
    return year.replace('_', ' ').replace('year', 'Year').toUpperCase();
  };

  const formatSemester = (semester: string) => {
    return semester.replace('_', ' ').replace('sem', 'Semester').toUpperCase();
  };

  const getCellContent = (timeSlot: string, day: string, schedule: ScheduleItem[]) => {
    const matchingItems = schedule.filter(item => 
      item.time_slot === timeSlot && item.days.includes(day)
    );

    if (matchingItems.length === 0) return null;

    return matchingItems.map(item => (
      <div key={item.id} className="mb-2 last:mb-0 p-2 rounded bg-primary/5 border border-primary/10">
        <div className="text-xs font-medium text-foreground">{item.subject_code}</div>
        <div className="text-xs text-muted-foreground truncate">{item.subject_name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">{item.instructor}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
            {item.room}
          </span>
        </div>
      </div>
    ));
  };

  const activeFilterCount = [
    selectedProgram !== 'all',
    selectedYearLevel !== 'all',
    selectedSemester !== 'all',
    selectedStatus !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          {selectedCourse ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedCourse(null)}
              className="hover:bg-accent/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="hover:bg-accent/50"
            >
              <ChevronDown className="h-5 w-5 rotate-90" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                {selectedCourse ? 'COURSE SCHEDULE' : 'COURSE MANAGEMENT'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {selectedCourse 
                ? `${selectedCourse.program} - ${selectedCourse.section}`
                : 'View Course Schedules'
              }
            </h1>
            <p className="text-muted-foreground">
              {selectedCourse 
                ? `${formatSemester(selectedCourse.semester)} • AY ${selectedCourse.academic_year}`
                : 'Browse and manage all course schedules'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!selectedCourse && (
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                className={viewMode === 'grid' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'primary' : 'ghost'}
                size="sm"
                className={viewMode === 'table' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button 
            onClick={handleExport}
            variant="outline"
            className="border-border text-foreground hover:bg-accent/50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={handlePrint}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </motion.div>

      {/* Back to List */}
      {selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(selectedCourse.status)}`}>
                  {getStatusIcon(selectedCourse.status)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCourse.status)}`}>
                      {getStatusIcon(selectedCourse.status)}
                      {selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      Updated: {new Date(selectedCourse.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCourse(null)}
                className="border-border text-foreground hover:bg-accent/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Course List View */}
      {!selectedCourse && (
        <>
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-3xl font-bold text-foreground">{courses.length}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      +8%
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-3xl font-bold text-foreground">
                      {courses.filter(s => s.status === 'active').length}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-3xl font-bold text-foreground">
                      {courses.filter(s => s.status === 'pending').length}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Filtered Results</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-3xl font-bold text-foreground">{filteredCourses.length}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent text-muted-foreground">
                      {filteredCourses.length > 0 ? ((filteredCourses.length / courses.length) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-accent text-muted-foreground">
                  <Filter className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-card border-border">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Filters & Search</h3>
                  <p className="text-sm text-muted-foreground">Refine course schedules by criteria</p>
                </div>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <Button
                      onClick={handleResetFilters}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters ({activeFilterCount})
                    </Button>
                  )}
                  <Button
                    onClick={() => setLoading(true)}
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-accent/50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search programs, sections, academic year..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-3">
                {/* Program Filter */}
                <div className="relative">
                  <Button
                    onClick={() => setShowProgramFilter(!showProgramFilter)}
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 border ${
                      selectedProgram !== 'all' 
                        ? 'bg-primary/10 text-primary border-primary/30' 
                        : 'border-border text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <GraduationCap className="h-4 w-4" />
                    {selectedProgram === 'all' ? 'All Programs' : selectedProgram}
                    {showProgramFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {showProgramFilter && (
                    <div className="absolute top-full left-0 mt-1 z-10 bg-card border border-border rounded-lg shadow-lg min-w-[180px]">
                      {programOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedProgram(option);
                            setShowProgramFilter(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-accent ${
                            selectedProgram === option 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-foreground'
                          }`}
                        >
                          {option === 'all' ? 'All Programs' : option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year Level Filter */}
                <div className="relative">
                  <Button
                    onClick={() => setShowYearFilter(!showYearFilter)}
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 border ${
                      selectedYearLevel !== 'all' 
                        ? 'bg-primary/10 text-primary border-primary/30' 
                        : 'border-border text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    {selectedYearLevel === 'all' ? 'All Years' : formatYearLevel(selectedYearLevel)}
                    {showYearFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {showYearFilter && (
                    <div className="absolute top-full left-0 mt-1 z-10 bg-card border border-border rounded-lg shadow-lg min-w-[180px]">
                      {yearLevelOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedYearLevel(option);
                            setShowYearFilter(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-accent ${
                            selectedYearLevel === option 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-foreground'
                          }`}
                        >
                          {option === 'all' ? 'All Years' : formatYearLevel(option)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Semester Filter */}
                <div className="relative">
                  <Button
                    onClick={() => setShowSemesterFilter(!showSemesterFilter)}
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 border ${
                      selectedSemester !== 'all' 
                        ? 'bg-primary/10 text-primary border-primary/30' 
                        : 'border-border text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <CalendarDays className="h-4 w-4" />
                    {selectedSemester === 'all' ? 'All Semesters' : formatSemester(selectedSemester)}
                    {showSemesterFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {showSemesterFilter && (
                    <div className="absolute top-full left-0 mt-1 z-10 bg-card border border-border rounded-lg shadow-lg min-w-[180px]">
                      {semesterOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedSemester(option);
                            setShowSemesterFilter(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-accent ${
                            selectedSemester === option 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-foreground'
                          }`}
                        >
                          {option === 'all' ? 'All Semesters' : formatSemester(option)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Button
                    onClick={() => setShowStatusFilter(!showStatusFilter)}
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 border ${
                      selectedStatus !== 'all' 
                        ? 'bg-primary/10 text-primary border-primary/30' 
                        : 'border-border text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    {selectedStatus === 'all' ? 'All Status' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                    {showStatusFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {showStatusFilter && (
                    <div className="absolute top-full left-0 mt-1 z-10 bg-card border border-border rounded-lg shadow-lg min-w-[180px]">
                      {statusOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedStatus(option);
                            setShowStatusFilter(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-accent ${
                            selectedStatus === option 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-foreground'
                          }`}
                        >
                          {option === 'all' ? 'All Status' : option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Courses Grid/Table View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Course Schedules</h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    onClick={() => router.push('/admin/create-schedule')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-4 text-muted-foreground">Loading courses...</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-accent flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || activeFilterCount > 0 
                      ? 'Try adjusting your filters or search term'
                      : 'No course schedules have been created yet'}
                  </p>
                  <Button 
                    onClick={handleResetFilters}
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent/50"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCourse(course)}
                      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl font-bold text-foreground">{course.program}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                              {getStatusIcon(course.status)}
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-lg font-semibold text-foreground">{course.section}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatYearLevel(course.year_level)} • {formatSemester(course.semester)}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Academic Year:</span>
                          <span className="font-medium text-foreground">{course.academic_year}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Subjects:</span>
                          <span className="font-medium text-foreground">{course.schedule_table.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Units:</span>
                          <span className="font-medium text-foreground">
                            {course.schedule_table.reduce((sum, item) => sum + item.units, 0)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Updated {new Date(course.updated_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                              onClick={(e?: React.MouseEvent) => {
                                e?.stopPropagation();
                                setSelectedCourse(course);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Table View
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-accent/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Program & Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Year & Semester
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Academic Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Subjects
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {filteredCourses.map((course) => (
                        <tr 
                          key={course.id} 
                          className="hover:bg-accent/10 transition-colors cursor-pointer"
                          onClick={() => setSelectedCourse(course)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <GraduationCap className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{course.program}</div>
                                <div className="text-sm text-muted-foreground">{course.section}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-foreground">{formatYearLevel(course.year_level)}</div>
                            <div className="text-sm text-muted-foreground">{formatSemester(course.semester)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-foreground">{course.academic_year}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{course.schedule_table.length}</span>
                              <span className="text-sm text-muted-foreground">
                                ({course.schedule_table.reduce((sum, item) => sum + item.units, 0)} units)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(course.status)}`}>
                              {getStatusIcon(course.status)}
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                onClick={(e?: React.MouseEvent) => {
                                  e?.stopPropagation();
                                  setSelectedCourse(course);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer */}
              {filteredCourses.length > 0 && (
                <div className="px-6 py-4 border-t border-border bg-accent/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredCourses.length} of {courses.length} courses
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}

      {/* Schedule Table View */}
      {selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Schedule Table</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCourse.schedule_table.length} subjects • {formatSemester(selectedCourse.semester)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-accent/50"
                    onClick={() => router.push(`/admin/edit-schedule/${selectedCourse.id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Edit Schedule
                  </Button>
                </div>
              </div>
            </div>

            {/* Subjects Summary */}
            <div className="p-6 border-b border-border bg-accent/10">
              <h4 className="font-medium text-foreground mb-3">Subjects in this Course</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCourse.schedule_table.map((subject) => (
                  <div key={subject.id} className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-foreground">{subject.subject_code}</div>
                        <div className="text-sm text-muted-foreground">{subject.subject_name}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {subject.units} unit{subject.units !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-foreground">{subject.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{subject.days}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{subject.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{subject.room}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Schedule Table */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-border">
                  <thead>
                    <tr>
                      <th className="border border-border p-3 bg-accent/30 text-left text-sm font-medium text-muted-foreground">
                        Time
                      </th>
                      {days.map((day) => (
                        <th key={day} className="border border-border p-3 bg-accent/30 text-center text-sm font-medium text-muted-foreground">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot}>
                        <td className="border border-border p-3 bg-accent/10 text-sm font-medium text-foreground whitespace-nowrap">
                          {timeSlot}
                        </td>
                        {days.map((day) => (
                          <td key={day} className="border border-border p-2 min-w-[200px] max-w-[300px]">
                            {getCellContent(timeSlot, day, selectedCourse.schedule_table)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="p-6 border-t border-border bg-accent/10">
              <h4 className="font-medium text-foreground mb-3">Legend</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-primary/10 border border-primary/20"></div>
                  <span className="text-sm text-muted-foreground">Regular Class</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-emerald-500/10 border border-emerald-500/20"></div>
                  <span className="text-sm text-muted-foreground">Laboratory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-blue-500/10 border border-blue-500/20"></div>
                  <span className="text-sm text-muted-foreground">Blended/Online</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}