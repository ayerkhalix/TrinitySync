// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Filter, Download, Printer, 
  Eye, Clock, MapPin, Users 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScheduleTable } from './schedule-table';
import { useAuth } from '@/hooks/use-auth';
import { ScheduleService } from '../../services/schedule-service';

export default function DashboardPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    semester: 'first_sem',
    year_level: user?.year_level || 'first_year',
    program: user?.program || 'BSIT',
  });

  useEffect(() => {
    fetchSchedules();
  }, [filters]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await ScheduleService.getSchedules(filters);
      setSchedules(data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Classes', value: schedules.length, icon: Calendar, color: 'blue' },
    { label: 'Weekly Hours', value: schedules.length * 3, icon: Clock, color: 'emerald' },
    { label: 'Rooms Used', value: new Set(schedules.map(s => s.room)).size, icon: MapPin, color: 'purple' },
    { label: 'Instructors', value: new Set(schedules.map(s => s.instructor)).size, icon: Users, color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="gradient-primary">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h1 className="text-3xl font-bold mb-2">Class Schedule</h1>
            <p className="text-white/80">
              Welcome back, {user?.first_name}! Here's your academic schedule for the semester.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 -mt-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card hover={false} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Schedule Filters</h2>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="first_sem">First Semester</option>
                  <option value="second_sem">Second Semester</option>
                  <option value="third_sem">Third Semester</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Level
                </label>
                <select
                  value={filters.year_level}
                  onChange={(e) => setFilters({ ...filters, year_level: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="first_year">First Year</option>
                  <option value="second_year">Second Year</option>
                  <option value="third_year">Third Year</option>
                  <option value="fourth_year">Fourth Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program
                </label>
                <select
                  value={filters.program}
                  onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="BSIT">BS Information Technology</option>
                  <option value="BSCE">BS Computer Engineering</option>
                  <option value="BSGE">BS Geodetic Engineering</option>
                  <option value="BSCpE">BS Computer Engineering</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Schedule Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ScheduleTable 
            schedules={schedules} 
            loading={loading} 
            onRefresh={fetchSchedules}
          />
        </motion.div>
      </div>
    </div>
  );
}