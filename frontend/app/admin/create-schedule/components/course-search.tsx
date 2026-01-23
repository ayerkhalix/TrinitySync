// app/admin/create-schedule/components/course-search.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

interface CourseSearchProps {
  onSelect: (course: Course) => void;
  selectedCourse?: Course | null;
}

export function CourseSearch({ onSelect, selectedCourse }: CourseSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  // Mock courses data
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: 1,
        code: 'ITCP 106',
        name: 'Computer Programming 2 (Intermediate Programming)',
        description: 'Advanced programming concepts and techniques',
        units: 3,
        program: 'BSIT',
        year_level: 'second_year',
        semester: 'second_sem',
      },
      {
        id: 2,
        code: 'ITDS 108',
        name: 'Data Structures and Algorithms',
        description: 'Fundamental data structures and algorithms',
        units: 3,
        program: 'BSIT',
        year_level: 'second_year',
        semester: 'second_sem',
      },
      {
        id: 3,
        code: 'ITIM 109',
        name: 'Information Management',
        description: 'Database management and information systems',
        units: 3,
        program: 'BSIT',
        year_level: 'second_year',
        semester: 'second_sem',
      },
      {
        id: 4,
        code: 'ITDB 110',
        name: 'Fundamentals of Database Systems',
        description: 'Introduction to database systems',
        units: 3,
        program: 'BSIT',
        year_level: 'second_year',
        semester: 'second_sem',
      },
      {
        id: 5,
        code: 'CE 101',
        name: 'Engineering Mechanics',
        description: 'Basic engineering mechanics principles',
        units: 4,
        program: 'BSCE',
        year_level: 'first_year',
        semester: 'first_sem',
      },
    ];
    
    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Course
      </label>
      
      <div className="relative">
        {selectedCourse ? (
          <div className="rounded-lg border border-gray-300 bg-white p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedCourse.code}</div>
                  <div className="text-sm text-gray-600">{selectedCourse.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{selectedCourse.description}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelect(null as any);
                  setIsOpen(true);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                className="pl-10"
              />
            </div>
            
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg max-h-80 overflow-y-auto"
              >
                <div className="p-2">
                  {filteredCourses.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No courses found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => {
                            onSelect(course);
                            setIsOpen(false);
                            setSearchTerm('');
                          }}
                          className="w-full text-left p-3 rounded hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{course.code}</div>
                              <div className="text-sm text-gray-600">{course.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {course.description}
                              </div>
                              <div className="flex items-center space-x-3 mt-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {course.program}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {course.year_level.replace('_', ' ')}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {course.units} units
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}