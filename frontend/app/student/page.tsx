'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Users, BookOpen, 
  AlertTriangle, Plus, Minus, CheckCircle, 
  XCircle, ChevronRight, Bell, FileText,
  Download, Printer, Eye, TrendingUp,
  GraduationCap, Coffee, PartyPopper,
  ArrowRight, MoreVertical, ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';

// Mock data - This will be replaced with real API calls
const mockTodaySchedule = [
  {
    id: 1,
    subject: 'ITCP 106 - Web Development',
    code: 'ITCP 106',
    time: '08:00 AM - 09:30 AM',
    startTime: '08:00',
    endTime: '09:30',
    room: 'CL2 - Computer Lab 2',
    instructor: 'Prof. Maria Santos',
    type: 'Lecture',
    status: 'completed',
    isNext: false,
  },
  {
    id: 2,
    subject: 'ITDS 108 - Data Structures',
    code: 'ITDS 108',
    time: '10:00 AM - 11:30 AM',
    startTime: '10:00',
    endTime: '11:30',
    room: 'CL1 - Computer Lab 1',
    instructor: 'Prof. John Reyes',
    type: 'Laboratory',
    status: 'completed',
    isNext: false,
  },
  {
    id: 3,
    subject: 'ITEL 103 - Networking',
    code: 'ITEL 103',
    time: '01:00 PM - 02:30 PM',
    startTime: '13:00',
    endTime: '14:30',
    room: 'TC Lab - Tech Center',
    instructor: 'Prof. Robert Lim',
    type: 'Lecture',
    status: 'upcoming',
    isNext: true,
  },
  {
    id: 4,
    subject: 'ITEL 105 - Database Management',
    code: 'ITEL 105',
    time: '03:00 PM - 04:30 PM',
    startTime: '15:00',
    endTime: '16:30',
    room: 'CL3 - Computer Lab 3',
    instructor: 'Prof. Anna Cruz',
    type: 'Laboratory',
    status: 'upcoming',
    isNext: false,
  },
];

const mockFullSchedule = {
  Monday: [
    { time: '08:00-09:30', subject: 'ITCP 106', room: 'CL2', type: 'Lec' },
    { time: '10:00-11:30', subject: 'ITDS 108', room: 'CL1', type: 'Lab' },
  ],
  Tuesday: [
    { time: '09:00-10:30', subject: 'HUM 101', room: 'R202', type: 'Lec' },
    { time: '13:00-14:30', subject: 'ITEL 103', room: 'TC Lab', type: 'Lec' },
  ],
  Wednesday: [
    { time: '08:00-09:30', subject: 'ITCP 106', room: 'CL2', type: 'Lec' },
    { time: '10:00-11:30', subject: 'ITDS 108', room: 'CL1', type: 'Lab' },
    { time: '13:00-14:30', subject: 'ITEL 105', room: 'CL3', type: 'Lab' },
  ],
  Thursday: [
    { time: '09:00-10:30', subject: 'HUM 101', room: 'R202', type: 'Lec' },
    { time: '13:00-14:30', subject: 'ITEL 103', room: 'TC Lab', type: 'Lec' },
  ],
  Friday: [
    { time: '08:00-11:30', subject: 'PE 101', room: 'Gym', type: 'Lab' },
    { time: '13:00-14:30', subject: 'ITEL 105', room: 'CL3', type: 'Lab' },
  ],
};

const mockRequests = [
  {
    id: 1,
    type: 'add',
    subject: 'ITCP 110 - Mobile Development',
    status: 'pending',
    date: '2024-01-10',
    details: 'Elective subject addition request',
  },
  {
    id: 2,
    type: 'drop',
    subject: 'MATH 105 - Calculus II',
    status: 'approved',
    date: '2024-01-05',
    details: 'Schedule conflict resolution',
  },
  {
    id: 3,
    type: 'conflict',
    subject: 'ITDS 108 - Room Conflict',
    status: 'pending',
    date: '2024-01-08',
    details: 'Room double booking detected',
  },
];

const mockAlerts = [
  {
    id: 1,
    type: 'conflict',
    message: 'Potential schedule conflict detected in CL2 on Wednesday',
    severity: 'medium',
  },
  {
    id: 2,
    type: 'reminder',
    message: 'Add/drop period ends on January 15',
    severity: 'low',
  },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState('Monday');
  const [nextClass, setNextClass] = useState<any>(null);
  const [minutesUntilNext, setMinutesUntilNext] = useState<number | null>(null);
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [isDoneForToday, setIsDoneForToday] = useState(false);

  // Calculate next class and countdown
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const todayClasses = mockTodaySchedule;
    setTodaysClasses(todayClasses);

    const upcomingClasses = todayClasses.filter(cls => {
      const [startHour, startMinute] = cls.startTime.split(':').map(Number);
      const classStart = startHour * 60 + startMinute;
      return classStart > currentTime;
    });

    if (upcomingClasses.length > 0) {
      const next = upcomingClasses[0];
      setNextClass(next);
      
      const [startHour, startMinute] = next.startTime.split(':').map(Number);
      const classStart = startHour * 60 + startMinute;
      const minutesUntil = classStart - currentTime;
      setMinutesUntilNext(minutesUntil);
      setIsDoneForToday(false);
    } else {
      setNextClass(null);
      setMinutesUntilNext(null);
      setIsDoneForToday(true);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTimeRemaining = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'approved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'add': return Plus;
      case 'drop': return Minus;
      case 'conflict': return AlertTriangle;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-1">
        {/* SMART STUDENT HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                      {getGreeting()}, <span className="text-primary">{user?.first_name}</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">
                      {isDoneForToday 
                        ? "You're done for today 🎉 Time to relax or study!"
                        : "This is your schedule for today."}
                    </p>
                  </div>

                  {nextClass && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                              Next Up
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {nextClass.subject}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">
                                {nextClass.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">
                                {nextClass.room}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">
                                {nextClass.instructor}
                              </span>
                            </div>
                          </div>
                        </div>
                        {minutesUntilNext !== null && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 min-w-[140px]"
                          >
                            <Clock className="h-8 w-8 text-primary-foreground mb-2" />
                            <p className="text-3xl font-bold text-primary-foreground">
                              {formatTimeRemaining(minutesUntilNext)}
                            </p>
                            <p className="text-sm text-primary-foreground/80 mt-1">
                              until class
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {isDoneForToday && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-primary-foreground shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-foreground/20 rounded-xl">
                          <PartyPopper className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">All classes completed!</h3>
                          <p className="opacity-90">Great work today. Time to review or prepare for tomorrow.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="lg:text-right space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-sm border border-border">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {user?.program} • Year {user?.year_level?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current Semester: First Semester 2024
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Units: 21 • Status: Regular
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Today's Schedule & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION 1: Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          Today's Schedule
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  {/* Timeline View */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {todaysClasses.map((cls, index) => {
                        const isNext = cls.isNext;
                        const isCompleted = cls.status === 'completed';
                        
                        return (
                          <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4 }}
                            className={`relative p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                              isNext
                                ? 'border-primary/50 bg-primary/5 shadow-sm'
                                : isCompleted
                                ? 'border-border bg-card/50 shadow-sm'
                                : 'border-border hover:border-primary/30'
                            }`}
                          >
                            {isNext && (
                              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                                <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
                              </div>
                            )}

                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-foreground">
                                    {cls.subject}
                                  </h3>
                                  <Badge variant={cls.type === 'Lecture' ? 'default' : 'secondary'}>
                                    {cls.type}
                                  </Badge>
                                  {isNext && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20">
                                      Next Class
                                    </Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className={`font-medium ${
                                      isNext 
                                        ? 'text-primary' 
                                        : 'text-foreground'
                                    }`}>
                                      {cls.time}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">{cls.room}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">{cls.instructor}</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {todaysClasses.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">
                          No classes scheduled today
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Enjoy your free day!
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* SECTION 3: Full Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Calendar className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          Weekly Schedule
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          View your full schedule for the week
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Full View
                    </Button>
                  </div>

                  {/* Day Tabs */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {Object.keys(mockFullSchedule).map((day) => (
                      <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          activeDay === day
                            ? 'bg-secondary/10 text-secondary border border-secondary/20'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Schedule Table */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="grid grid-cols-12 bg-accent text-sm font-medium text-foreground">
                      <div className="col-span-3 p-3 border-r border-border">Time</div>
                      <div className="col-span-3 p-3 border-r border-border">Subject</div>
                      <div className="col-span-3 p-3 border-r border-border">Room</div>
                      <div className="col-span-3 p-3">Type</div>
                    </div>
                    {mockFullSchedule[activeDay as keyof typeof mockFullSchedule]?.map((cls, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 border-t border-border hover:bg-accent/50"
                      >
                        <div className="col-span-3 p-3 border-r border-border">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {cls.time}
                          </div>
                        </div>
                        <div className="col-span-3 p-3 border-r border-border font-medium">
                          {cls.subject}
                        </div>
                        <div className="col-span-3 p-3 border-r border-border">
                          {cls.room}
                        </div>
                        <div className="col-span-3 p-3">
                          <Badge variant={cls.type === 'Lec' ? 'default' : 'secondary'} className="text-xs">
                            {cls.type}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button variant="outline" className="gap-2">
                      View Full Schedule
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Quick Actions & Requests */}
          <div className="space-y-8">
            {/* SECTION 2: Quick Student Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              id="quick-actions"
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <BookOpen className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Quick Actions
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Common student requests
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                    variant="outline"
                    className="w-full justify-start h-auto py-4"
                    onClick={() => {/* Handle add subject */}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Request Add Subject</p>
                          <p className="text-sm text-muted-foreground">
                            Add new subject to schedule
                          </p>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="w-full justify-start h-auto py-4"
                      variant="outline"
                      onClick={() => {/* Handle drop subject */}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Minus className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Request Drop Subject</p>
                          <p className="text-sm text-muted-foreground">
                            Remove subject from schedule
                          </p>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="w-full justify-start h-auto py-4"
                      variant="outline"
                      onClick={() => {/* Handle report conflict */}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Report Conflict</p>
                          <p className="text-sm text-muted-foreground">
                            Report schedule issues
                          </p>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="w-full justify-start h-auto py-4"
                      variant="ghost"
                      onClick={() => {/* Handle view full */}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">View Full Schedule</p>
                          <p className="text-sm text-muted-foreground">
                            Complete weekly overview
                          </p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* SECTION 4: Requests & Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <FileText className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          My Requests
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Status of your submissions
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      {mockRequests.length} total
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {mockRequests.map((request) => {
                      const Icon = getRequestIcon(request.type);
                      
                      return (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-foreground">
                                    {request.subject}
                                  </h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                    {request.status}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {request.details}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Submitted on {request.date}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Alerts */}
                  {mockAlerts.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <Bell className="h-4 w-4 text-amber-500" />
                        <h3 className="font-semibold text-foreground">
                          Important Alerts
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {mockAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-lg ${
                              alert.severity === 'medium'
                                ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-700 border border-blue-500/20'
                            }`}
                          >
                            <p className="text-sm">
                              {alert.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <Button variant="outline" className="w-full gap-2">
                      View All Requests
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM SPACING */}
        <div className="h-8" />
      </div>
    </div>
  );
}