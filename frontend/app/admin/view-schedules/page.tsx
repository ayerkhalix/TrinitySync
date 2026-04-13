'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  Eye,
  GraduationCap,
  Grid,
  List,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScheduleService, type ScheduleGroup, type ScheduleItem } from '@/services/schedule-service';

const DAY_OPTIONS = [
  { code: 'MON', label: 'Monday' },
  { code: 'TUE', label: 'Tuesday' },
  { code: 'WED', label: 'Wednesday' },
  { code: 'THU', label: 'Thursday' },
  { code: 'FRI', label: 'Friday' },
  { code: 'SAT', label: 'Saturday' },
  { code: 'SUN', label: 'Sunday' },
] as const;

const STATUS_ORDER = ['draft', 'pending', 'approved', 'active', 'archived', 'cancelled'] as const;

const formatYearLevel = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatSemester = (value: string) =>
  value
    .split('_')
    .map((part) => (part === 'sem' ? 'Semester' : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');

const formatStatus = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const statusClasses: Record<string, string> = {
  draft: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  pending: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  approved: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  active: 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400',
  archived: 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
  cancelled: 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  draft: Clock,
  pending: AlertCircle,
  approved: ShieldCheck,
  active: CheckCircle,
  archived: Calendar,
  cancelled: AlertCircle,
};

function getItemTimeLabel(item: ScheduleItem) {
  return `${ScheduleService.helper.formatTime(item.start_time)} - ${ScheduleService.helper.formatTime(item.end_time)}`;
}

function getSlotKey(item: ScheduleItem) {
  return `${item.start_time}-${item.end_time}`;
}

function getItemMode(item: ScheduleItem) {
  if (item.is_online) return 'Online';
  if (item.is_lab) return 'Laboratory';
  return 'Lecture';
}

export default function ViewSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedYearLevel, setSelectedYearLevel] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ScheduleService.groups.getAll();
      setSchedules(data);
    } catch (fetchError) {
      console.error('Failed to fetch schedules:', fetchError);
      setError('Unable to load schedules from the backend right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSchedules();
  }, []);

  const filteredSchedules = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return schedules.filter((schedule) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        schedule.program_name.toLowerCase().includes(normalizedSearch) ||
        schedule.section.toLowerCase().includes(normalizedSearch) ||
        schedule.school_year_name.toLowerCase().includes(normalizedSearch) ||
        schedule.items.some(
          (item) =>
            item.course_code.toLowerCase().includes(normalizedSearch) ||
            item.course_title.toLowerCase().includes(normalizedSearch) ||
            item.room.toLowerCase().includes(normalizedSearch) ||
            (item.instructor_name || '').toLowerCase().includes(normalizedSearch)
        );

      const matchesProgram = selectedProgram === 'all' || schedule.program_name === selectedProgram;
      const matchesYear = selectedYearLevel === 'all' || schedule.year_level === selectedYearLevel;
      const matchesSemester = selectedSemester === 'all' || schedule.semester === selectedSemester;
      const matchesStatus = selectedStatus === 'all' || schedule.status === selectedStatus;

      return matchesSearch && matchesProgram && matchesYear && matchesSemester && matchesStatus;
    });
  }, [schedules, searchTerm, selectedProgram, selectedYearLevel, selectedSemester, selectedStatus]);

  const selectedSchedule = useMemo(
    () => schedules.find((schedule) => schedule.id === selectedScheduleId) ?? null,
    [schedules, selectedScheduleId]
  );

  const programOptions = useMemo(
    () => ['all', ...new Set(schedules.map((schedule) => schedule.program_name))],
    [schedules]
  );
  const yearLevelOptions = useMemo(
    () => ['all', ...new Set(schedules.map((schedule) => schedule.year_level))],
    [schedules]
  );
  const semesterOptions = useMemo(
    () => ['all', ...new Set(schedules.map((schedule) => schedule.semester))],
    [schedules]
  );
  const statusOptions = useMemo(
    () => ['all', ...STATUS_ORDER.filter((status) => schedules.some((schedule) => schedule.status === status))],
    [schedules]
  );

  const timeSlots = useMemo(() => {
    if (!selectedSchedule) {
      return [] as Array<{ key: string; label: string }>;
    }

    return Array.from(new Set(selectedSchedule.items.map((item) => getSlotKey(item))))
      .sort((left, right) => left.localeCompare(right))
      .map((slot) => {
        const [start, end] = slot.split('-');
        return {
          key: slot,
          label: `${ScheduleService.helper.formatTime(start)} - ${ScheduleService.helper.formatTime(end)}`,
        };
      });
  }, [selectedSchedule]);

  const activeFilterCount = [selectedProgram, selectedYearLevel, selectedSemester, selectedStatus]
    .filter((value) => value !== 'all').length + (searchTerm ? 1 : 0);

  const handleDeleteSchedule = async (schedule: ScheduleGroup) => {
    const confirmed = window.confirm(
      `Delete ${schedule.program_name} ${schedule.section}? This will remove the schedule group and all of its items.`
    );

    if (!confirmed) {
      return;
    }

    setBusyId(schedule.id);
    try {
      await ScheduleService.groups.delete(schedule.id);
      setSchedules((current) => current.filter((item) => item.id !== schedule.id));
      if (selectedScheduleId === schedule.id) {
        setSelectedScheduleId(null);
      }
    } catch (deleteError) {
      console.error('Failed to delete schedule:', deleteError);
      window.alert('Unable to delete this schedule group right now.');
    } finally {
      setBusyId(null);
    }
  };

  const handleApproveSchedule = async (schedule: ScheduleGroup) => {
    setBusyId(schedule.id);
    try {
      await ScheduleService.groups.approve(schedule.id);
      await fetchSchedules();
      setSelectedScheduleId(schedule.id);
    } catch (approveError) {
      console.error('Failed to approve schedule:', approveError);
      window.alert('Unable to approve this schedule right now.');
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = (schedule: ScheduleGroup) => {
    const blob = new Blob([JSON.stringify(schedule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schedule.program_name}-${schedule.section}-schedule.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderStatusBadge = (status: string) => {
    const Icon = statusIcons[status] || AlertCircle;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusClasses[status] || statusClasses.draft}`}>
        <Icon className="h-3.5 w-3.5" />
        {formatStatus(status)}
      </span>
    );
  };

  const renderScheduleCard = (schedule: ScheduleGroup) => {
    const totalUnits = schedule.items.reduce((sum, item) => sum + (item.course_units || 0), 0);

    return (
      <motion.div
        key={schedule.id}
        whileHover={{ y: -4 }}
        className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{schedule.program_name}</span>
              {renderStatusBadge(schedule.status)}
            </div>
            <div className="text-xl font-bold text-foreground">Section {schedule.section}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {formatYearLevel(schedule.year_level)} • {formatSemester(schedule.semester)}
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>School Year</span>
            <span className="font-medium text-foreground">{schedule.school_year_name}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Schedule Items</span>
            <span className="font-medium text-foreground">{schedule.item_count}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Total Units</span>
            <span className="font-medium text-foreground">{totalUnits}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Conflicts</span>
            <span className={`font-medium ${schedule.conflict_count > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {schedule.conflict_count}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedScheduleId(schedule.id)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          {(schedule.status === 'draft' || schedule.status === 'pending') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApproveSchedule(schedule)}
              loading={busyId === schedule.id}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => handleExport(schedule)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSchedule(schedule)}
            loading={busyId === schedule.id}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => (selectedSchedule ? setSelectedScheduleId(null) : router.push('/admin'))}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                {selectedSchedule ? 'SCHEDULE DETAILS' : 'VIEW SCHEDULES'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {selectedSchedule ? `${selectedSchedule.program_name} • ${selectedSchedule.section}` : 'Schedule Management'}
            </h1>
            <p className="text-muted-foreground">
              {selectedSchedule
                ? `${formatSemester(selectedSchedule.semester)} • ${selectedSchedule.school_year_name}`
                : 'Browse live schedule groups, review their items, and manage records in the database.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedSchedule ? (
            <>
              <Button variant="outline" onClick={() => handleExport(selectedSchedule)}>
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              {(selectedSchedule.status === 'draft' || selectedSchedule.status === 'pending') && (
                <Button loading={busyId === selectedSchedule.id} onClick={() => handleApproveSchedule(selectedSchedule)}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Approve Schedule
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center rounded-lg border border-border p-1">
                <Button variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'table' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('table')}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" onClick={() => void fetchSchedules()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => router.push('/admin/create-schedule')}>
                <Calendar className="mr-2 h-4 w-4" />
                Create Schedule
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5 p-4" hover={false}>
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Schedule data could not be loaded</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!selectedSchedule && (
        <>
          <Card className="mb-6 p-6" hover={false}>
            <div className="grid gap-4 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search program, section, course, room, or instructor"
                  className="pl-11"
                />
              </div>
              <select value={selectedProgram} onChange={(event) => setSelectedProgram(event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                {programOptions.map((option) => (
                  <option key={option} value={option}>{option === 'all' ? 'All programs' : option}</option>
                ))}
              </select>
              <select value={selectedYearLevel} onChange={(event) => setSelectedYearLevel(event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                {yearLevelOptions.map((option) => (
                  <option key={option} value={option}>{option === 'all' ? 'All year levels' : formatYearLevel(option)}</option>
                ))}
              </select>
              <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                {semesterOptions.map((option) => (
                  <option key={option} value={option}>{option === 'all' ? 'All semesters' : formatSemester(option)}</option>
                ))}
              </select>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option === 'all' ? 'All statuses' : formatStatus(option)}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProgram('all');
                  setSelectedYearLevel('all');
                  setSelectedSemester('all');
                  setSelectedStatus('all');
                }}
              >
                Reset {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Button>
            </div>
          </Card>

          <Card className="mb-6 p-6" hover={false}>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Total schedule groups</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{schedules.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filtered results</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{filteredSchedules.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending approval</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {schedules.filter((schedule) => schedule.status === 'draft' || schedule.status === 'pending').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open conflicts</p>
                <p className="mt-1 text-2xl font-bold text-destructive">
                  {schedules.reduce((sum, schedule) => sum + schedule.conflict_count, 0)}
                </p>
              </div>
            </div>
          </Card>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden" hover={false}>
              <div className="border-b border-border p-6">
                <h2 className="text-lg font-semibold text-foreground">Live Schedule Groups</h2>
                <p className="text-sm text-muted-foreground">Viewing records from the scheduling API and database.</p>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                  <p className="mt-4 text-muted-foreground">Loading schedules...</p>
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-lg font-semibold text-foreground">No schedules matched your filters</p>
                  <p className="mt-2 text-muted-foreground">Try broadening the search or create a new schedule group.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSchedules.map(renderScheduleCard)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-accent/40">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Program / Section</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Year / Semester</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">School Year</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {filteredSchedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-accent/20">
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{schedule.program_name}</div>
                            <div className="text-sm text-muted-foreground">Section {schedule.section}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            <div>{formatYearLevel(schedule.year_level)}</div>
                            <div className="text-muted-foreground">{formatSemester(schedule.semester)}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{schedule.school_year_name}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{schedule.item_count}</td>
                          <td className="px-6 py-4">{renderStatusBadge(schedule.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedScheduleId(schedule.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule)} loading={busyId === schedule.id} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}

      {selectedSchedule && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="p-6" hover={false}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {renderStatusBadge(selectedSchedule.status)}
                  <span className="text-sm text-muted-foreground">Updated {new Date(selectedSchedule.updated_at).toLocaleString()}</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{selectedSchedule.program_name} • Section {selectedSchedule.section}</h2>
                <p className="mt-2 text-muted-foreground">
                  {formatYearLevel(selectedSchedule.year_level)} • {formatSemester(selectedSchedule.semester)} • {selectedSchedule.school_year_name}
                </p>
                {selectedSchedule.notes && (
                  <p className="mt-3 rounded-lg bg-accent/30 p-3 text-sm text-muted-foreground">{selectedSchedule.notes}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => void fetchSchedules()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="ghost" onClick={() => handleDeleteSchedule(selectedSchedule)} loading={busyId === selectedSchedule.id} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6" hover={false}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Schedule Items</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedSchedule.items.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{item.course_code}</p>
                      <p className="text-sm text-muted-foreground">{item.course_title}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {item.course_units} unit{item.course_units === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{DAY_OPTIONS.find((day) => day.code === item.day)?.label || item.day}</p>
                    <p>{getItemTimeLabel(item)}</p>
                    <p>Room: <span className="font-medium text-foreground">{item.room}</span></p>
                    <p>Instructor: <span className="font-medium text-foreground">{item.instructor_name || 'TBA'}</span></p>
                    <p>Mode: <span className="font-medium text-foreground">{getItemMode(item)}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden" hover={false}>
            <div className="border-b border-border p-6">
              <h3 className="text-lg font-semibold text-foreground">Weekly Timetable</h3>
              <p className="text-sm text-muted-foreground">Generated from live schedule items for this section.</p>
            </div>
            <div className="overflow-x-auto p-6">
              <table className="min-w-full border-collapse border border-border">
                <thead>
                  <tr>
                    <th className="border border-border bg-accent/40 p-3 text-left text-sm font-semibold text-foreground">Time</th>
                    {DAY_OPTIONS.map((day) => (
                      <th key={day.code} className="border border-border bg-accent/40 p-3 text-left text-sm font-semibold text-foreground">{day.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot.key}>
                      <td className="border border-border bg-accent/20 p-3 text-sm font-medium text-foreground whitespace-nowrap">{slot.label}</td>
                      {DAY_OPTIONS.map((day) => {
                        const items = selectedSchedule.items.filter(
                          (item) => item.day === day.code && getSlotKey(item) === slot.key
                        );

                        return (
                          <td key={`${slot.key}-${day.code}`} className="min-w-[180px] border border-border p-2 align-top">
                            {items.length === 0 ? null : items.map((item) => (
                              <div key={item.id} className="mb-2 rounded-lg border border-primary/20 bg-primary/5 p-3 last:mb-0">
                                <div className="font-medium text-foreground">{item.course_code}</div>
                                <div className="text-xs text-muted-foreground">{item.course_title}</div>
                                <div className="mt-2 text-xs text-muted-foreground">{item.instructor_name || 'TBA'} • {item.room}</div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {selectedSchedule.item_count} schedule items • {selectedSchedule.conflict_count} active conflict{selectedSchedule.conflict_count === 1 ? '' : 's'}
              </div>
              <Button variant="ghost" onClick={() => setSelectedScheduleId(null)}>
                Back to all schedules
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
