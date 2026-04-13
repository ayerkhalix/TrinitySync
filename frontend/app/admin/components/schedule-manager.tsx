'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScheduleService, type ScheduleGroup } from '@/services/schedule-service';

interface FlattenedScheduleItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string;
  room: string;
  day: string;
  timeSlot: string;
  programName: string;
  section: string;
  yearLevel: string;
  scheduleGroupId: string;
  status: string;
}

const formatYearLevel = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const dayLabel: Record<string, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

export function ScheduleManager() {
  const [items, setItems] = useState<FlattenedScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const groups = await ScheduleService.groups.getAll();
      const flattened = groups.flatMap((group: ScheduleGroup) =>
        group.items.map((item) => ({
          id: item.id,
          courseCode: item.course_code,
          courseTitle: item.course_title,
          instructorName: item.instructor_name || 'TBA',
          room: item.room,
          day: dayLabel[item.day] || item.day,
          timeSlot: `${ScheduleService.helper.formatTime(item.start_time)} - ${ScheduleService.helper.formatTime(item.end_time)}`,
          programName: group.program_name,
          section: group.section,
          yearLevel: group.year_level,
          scheduleGroupId: group.id,
          status: group.status,
        }))
      );
      setItems(flattened);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSchedules();
  }, []);

  const filteredSchedules = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      item.courseCode.toLowerCase().includes(query) ||
      item.courseTitle.toLowerCase().includes(query) ||
      item.instructorName.toLowerCase().includes(query) ||
      item.room.toLowerCase().includes(query) ||
      item.programName.toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query)
    );
  }, [items, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this schedule item from the database?')) {
      return;
    }

    setBusyId(id);
    try {
      await ScheduleService.items.delete(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete schedule item:', error);
      window.alert('Unable to delete this schedule item right now.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search live schedule items..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" size="sm" onClick={() => void fetchSchedules()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-accent/40">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Time & Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {filteredSchedules.map((schedule, index) => (
              <motion.tr
                key={schedule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-accent/20"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">{schedule.courseCode}</div>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">{schedule.courseTitle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">{schedule.timeSlot}</div>
                      <div className="text-sm text-muted-foreground">{schedule.day}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium text-foreground">{schedule.instructorName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium text-foreground">{schedule.room}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">{schedule.programName}</div>
                  <div className="text-xs text-muted-foreground">Section {schedule.section} • {formatYearLevel(schedule.yearLevel)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      {schedule.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(schedule.id)}
                      loading={busyId === schedule.id}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredSchedules.length === 0 && (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-lg font-semibold text-foreground">No schedule items found</h3>
            <p className="text-muted-foreground">Try a different search term or refresh the data.</p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filteredSchedules.length}</span> of <span className="font-medium text-foreground">{items.length}</span> live schedule items
      </div>
    </div>
  );
}
