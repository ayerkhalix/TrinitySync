// app/dashboard/schedule-table.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, Edit2, Trash2, AlertCircle, 
  CheckCircle, Clock, MapPin, User, Eye
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ScheduleTableProps {
  schedules: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function ScheduleTable({ schedules, loading, onRefresh }: ScheduleTableProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading schedule...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Found</h3>
          <p className="text-gray-600 mb-6">
            No classes scheduled for the selected filters. Try adjusting your criteria.
          </p>
          <Button onClick={onRefresh}>Refresh</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
        <p className="text-gray-600">Your classes for the current semester</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
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
          <tbody className="divide-y divide-gray-200">
            {schedules.map((schedule, index) => (
              <motion.tr
                key={schedule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{schedule.time_slot}</div>
                      <div className="text-sm text-gray-500">3 hours</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {schedule.days}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{schedule.course_code}</div>
                    <div className="text-sm text-gray-500">{schedule.course_description}</div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">{schedule.instructor}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-mono">{schedule.room}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <button
                      onClick={() => setSelectedRow(selectedRow === schedule.id ? null : schedule.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>
                    
                    <AnimatePresence>
                      {selectedRow === schedule.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border z-10 overflow-hidden"
                        >
                          <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                          <button className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{schedules.length}</span> classes
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onRefresh}>
              Refresh
            </Button>
            <Button>
              Add Class
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}