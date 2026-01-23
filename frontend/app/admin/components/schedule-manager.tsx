// app/admin/components/schedule-manager.tsx - Fixed
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit2, Trash2, CheckCircle, XCircle, 
  Clock, Users, MapPin, BookOpen,
  MoreVertical, Filter, Search, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Schedule {
  id: number;
  time_slot: string;
  days: string;
  course: {
    code: string;
    name: string;
  };
  instructor: {
    full_name: string;
    employee_id: string;
  };
  room: {
    code: string;
    name: string;
  };
  program: {
    name: string;
  };
  year_level: string;
}

export function ScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockData: Schedule[] = [
        {
          id: 1,
          time_slot: '8:00 AM - 11:00 AM',
          days: 'Thursday/Friday',
          course: {
            code: 'ITCP 106',
            name: 'Computer Programming 2 (Intermediate Programming)',
          },
          instructor: {
            full_name: 'Ronilo Gayutin',
            employee_id: 'EMP001'
          },
          room: {
            code: 'CL2',
            name: 'Computer Lab 2'
          },
          program: {
            name: 'BS Information Technology'
          },
          year_level: 'second_year'
        },
        {
          id: 2,
          time_slot: '1:00 PM - 3:00 PM',
          days: 'Monday/Wednesday/Friday',
          course: {
            code: 'ITDS 108',
            name: 'Data Structures and Algorithms',
          },
          instructor: {
            full_name: 'Maria Santos',
            employee_id: 'EMP002'
          },
          room: {
            code: 'TC',
            name: 'Technology Center'
          },
          program: {
            name: 'BS Information Technology'
          },
          year_level: 'second_year'
        },
      ];
      
      setSchedules(mockData);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        schedule.course.code.toLowerCase().includes(searchLower) ||
        schedule.course.name.toLowerCase().includes(searchLower) ||
        schedule.instructor.full_name.toLowerCase().includes(searchLower) ||
        schedule.room.code.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        // In a real app, you would call an API here
        setSchedules(schedules.filter(s => s.id !== id));
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSchedules}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time & Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchedules.map((schedule, index) => (
              <motion.tr
                key={schedule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{schedule.course.code}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {schedule.course.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {schedule.program.name} • {schedule.year_level.replace('_', ' ')}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{schedule.time_slot}</div>
                      <div className="text-sm text-gray-500">{schedule.days}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{schedule.instructor.full_name}</div>
                      <div className="text-xs text-gray-500">{schedule.instructor.employee_id}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{schedule.room.code}</div>
                      <div className="text-xs text-gray-500">{schedule.room.name}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* Edit schedule */}}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {filteredSchedules.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first schedule'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">1</span> to{' '}
          <span className="font-medium">{filteredSchedules.length}</span> of{' '}
          <span className="font-medium">{schedules.length}</span> schedules
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}