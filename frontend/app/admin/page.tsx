// app/admin/page.tsx - REDESIGNED (Updated for your Card component)
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, Building, AlertTriangle, 
  Upload, BarChart3, Settings, Clock,
  Filter, Download, Plus, Eye, History, FileText,
  ChevronRight, CheckCircle, XCircle, AlertCircle,
  ArrowUpRight, ArrowDownRight, MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ConflictAlert } from './components/conflict-alert';
import { BulkUpload } from './components/bulk-upload';
import { useAuth } from '@/hooks/use-auth';
import { ScheduleManager } from './components/schedule-manager';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedules' | 'rooms' | 'instructors'>('overview');
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSchedules: 0,
    pendingConflicts: 0,
    activeRooms: 0,
    totalInstructors: 0,
    utilizationRate: 0,
    occupancyRate: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data for development
    setStats({
      totalSchedules: 156,
      pendingConflicts: 12,
      activeRooms: 24,
      totalInstructors: 45,
      utilizationRate: 78,
      occupancyRate: 92,
    });

    setConflicts([
      { id: 1, type: 'room', message: 'Room CL2 conflict at 8:00 AM Monday', severity: 'high' },
      { id: 2, type: 'instructor', message: 'Instructor overlap at 1:00 PM Tuesday', severity: 'medium' },
      { id: 3, type: 'room', message: 'Room TC Lab double booking at 10:00 AM Wednesday', severity: 'high' },
      { id: 4, type: 'instructor', message: 'Instructor has overlapping classes at 3:00 PM Thursday', severity: 'medium' },
    ]);
  };

  // Navigation handlers
  const navigateTo = (path: string) => {
    router.push(path);
  };

  const adminCards = [
    {
      title: 'Total Schedules',
      value: '156',
      icon: Calendar,
      color: 'primary',
      change: '+12%',
      changePositive: true,
      description: 'Active this semester',
      meta: 'Updated just now',
      onClick: () => {
        setActiveTab('schedules');
        setTimeout(() => {
          document.getElementById('schedules-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    {
      title: 'Pending Conflicts',
      value: '12',
      icon: AlertTriangle,
      color: 'destructive',
      change: '-3%',
      changePositive: false,
      description: 'Requires resolution',
      meta: 'Updated 5 min ago',
      onClick: () => navigateTo('/admin/conflicts')
    },
    {
      title: 'Active Rooms',
      value: '24',
      icon: Building,
      color: 'secondary',
      change: '+5%',
      changePositive: true,
      description: 'Currently allocated',
      meta: 'Updated 15 min ago',
      onClick: () => navigateTo('/admin/rooms')
    },
    {
      title: 'Instructors',
      value: '45',
      icon: Users,
      color: 'accent',
      change: '+8%',
      changePositive: true,
      description: 'Teaching this semester',
      meta: 'Updated 30 min ago',
      onClick: () => navigateTo('/admin/instructors')
    },
  ];

  const quickActions = [
    { 
      label: 'Create Schedule', 
      icon: Plus, 
      onClick: () => navigateTo('/admin/create-schedule'),
      color: 'primary',
      description: 'Add new class schedule'
    },
    { 
      label: 'Bulk Upload', 
      icon: Upload, 
      onClick: () => {
        const uploadSection = document.getElementById('bulk-upload-section');
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
      },
      color: 'secondary',
      description: 'Upload multiple schedules'
    },
    { 
      label: 'View Reports', 
      icon: BarChart3, 
      onClick: () => navigateTo('/admin/reports'),
      color: 'accent',
      description: 'Analytics & insights'
    },
    { 
      label: 'Activity Logs', 
      icon: FileText, 
      onClick: () => navigateTo('/admin/activity-logs'),
      color: 'muted',
      description: 'Track all changes'
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'schedules', label: 'All Schedules', icon: Calendar },
    { id: 'rooms', label: 'Room Management', icon: Building },
    { id: 'instructors', label: 'Instructors', icon: Users },
  ];

  const handleNewSchedule = () => {
    navigateTo('/admin/create-schedule');
  };

  const handleSettings = () => {
    navigateTo('/admin/settings');
  };

  const handleViewAllActivities = () => {
    navigateTo('/admin/activity-logs');
  };

  const handleExportSchedules = () => {
    alert('Exporting schedules... This would download an Excel file.');
  };

  const handleFilterSchedules = () => {
    alert('Filter functionality will open a filter panel.');
  };

  const activityLogs = [
    { 
      id: 1,
      user: 'John Doe', 
      action: 'created schedule', 
      time: '2 min ago', 
      details: 'ITCP 106',
      icon: CheckCircle,
      status: 'success',
      onClick: () => navigateTo('/admin/schedules')
    },
    { 
      id: 2,
      user: 'Jane Smith', 
      action: 'resolved conflict', 
      time: '15 min ago', 
      details: 'ITDS 108 - Room conflict',
      icon: AlertCircle,
      status: 'warning',
      onClick: () => navigateTo('/admin/conflicts')
    },
    { 
      id: 3,
      user: 'Admin User', 
      action: 'updated room capacity', 
      time: '1 hour ago', 
      details: 'TC Lab capacity updated',
      icon: CheckCircle,
      status: 'success',
      onClick: () => navigateTo('/admin/rooms')
    },
    { 
      id: 4,
      user: 'System', 
      action: 'detected conflict', 
      time: '2 hours ago', 
      details: 'Instructor overlap in CL2',
      icon: XCircle,
      status: 'error',
      onClick: () => navigateTo('/admin/conflicts')
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground tracking-wide">ADMIN DASHBOARD</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                Welcome back, <span className="text-primary">{user?.first_name}</span>
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg max-w-2xl">
                Manage schedules, resolve conflicts, and oversee campus operations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                size="lg"
                className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                onClick={handleNewSchedule}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </div>
          </div>

          <Separator className="bg-border/50" />
        </motion.div>

        {/* Stats Overview Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminCards.map((stat, index) => {
              const Icon = stat.icon;
              const colorClass = stat.color === 'destructive' ? 'text-destructive' : 
                               stat.color === 'secondary' ? 'text-secondary' : 
                               stat.color === 'accent' ? 'text-accent' : 'text-primary';
              
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card 
                    hover={true}
                    className="h-full border-border/40 bg-card/50 backdrop-blur-sm"
                    onClick={stat.onClick}
                  >
                    <div className="p-6">
                      {/* Header Zone */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground tracking-wide">
                            {stat.title}
                          </p>
                          {/* Dominant Number */}
                          <p className="text-3xl font-bold text-foreground tracking-tight">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl ${
                          stat.color === 'primary' ? 'bg-primary/10' :
                          stat.color === 'destructive' ? 'bg-destructive/10' :
                          stat.color === 'secondary' ? 'bg-secondary/10' :
                          'bg-accent/10'
                        }`}>
                          <Icon className={`h-5 w-5 ${colorClass}`} />
                        </div>
                      </div>

                      {/* Main Content Zone */}
                      <div className="space-y-3">
                        {/* Change Badge */}
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={stat.changePositive ? "success" : "outline"}
                            className={`px-2 py-1 text-xs font-medium ${
                              stat.changePositive 
                                ? '' 
                                : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                            }`}
                          >
                            {stat.changePositive ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {stat.change}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground">
                          {stat.description}
                        </p>
                      </div>

                      {/* Footer/Meta Zone */}
                      <div className="mt-6 pt-4 border-t border-border/30">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-2" />
                          <span>{stat.meta}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Tabs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/40">
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Frequently used admin tools and shortcuts
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={handleViewAllActivities}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Activity
                    </Button>
                  </div>
                  
                  {/* Card Content */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      
                      return (
                        <motion.button
                          key={action.label}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={action.onClick}
                          className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              action.color === 'primary' ? 'bg-primary/10 text-primary' :
                              action.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                              action.color === 'accent' ? 'bg-accent/10 text-accent' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {action.label}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {action.description}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={handleViewAllActivities}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View all admin tools
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tabs Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="outline" className="p-2">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          if (tab.id === 'rooms') {
                            navigateTo('/admin/rooms');
                          } else if (tab.id === 'instructors') {
                            navigateTo('/admin/instructors');
                          }
                        }}
                        className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                        <span>{tab.label}</span>
                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              id="schedules-section"
              className="space-y-8"
            >
              {activeTab === 'overview' && (
                <>
                  {/* Conflict Alerts */}
                  <ConflictAlert conflicts={conflicts} />
                  
                  {/* Bulk Upload Section */}
                  <div id="bulk-upload-section">
                    <BulkUpload />
                  </div>
                </>
              )}

              {activeTab === 'schedules' && (
                <Card className="border-border/40">
                  <div className="p-6">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/30">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Manage Schedules</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          View, edit, and manage all class schedules
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-border/50"
                          onClick={handleFilterSchedules}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="border-border/50"
                          onClick={handleExportSchedules}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleNewSchedule}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Schedule
                        </Button>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <ScheduleManager />
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'rooms' && (
                <Card className="border-border/40">
                  <div className="p-12 text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                      <Building className="h-10 w-10 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Room Management</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Manage room allocations, availability, and configurations across campus
                    </p>
                    <Button 
                      onClick={() => navigateTo('/admin/rooms')}
                    >
                      Go to Room Management
                    </Button>
                  </div>
                </Card>
              )}

              {activeTab === 'instructors' && (
                <Card className="border-border/40">
                  <div className="p-12 text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                      <Users className="h-10 w-10 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Instructor Management</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      View and manage instructor assignments, availability, and course loads
                    </p>
                    <Button 
                      onClick={() => navigateTo('/admin/instructors')}
                    >
                      Go to Instructor Management
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Right Column - Recent Activity Feed */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/40 h-full">
                <div className="p-6 h-full flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Latest system updates and changes
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handleViewAllActivities}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Card Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      {activityLogs.map((activity) => {
                        const Icon = activity.icon;
                        const statusColor = {
                          success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                          warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                          error: 'bg-destructive/10 text-destructive border-destructive/20'
                        };

                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ x: 4 }}
                            className="group"
                          >
                            <div 
                              className="p-4 rounded-lg border border-border/30 hover:border-border/60 hover:bg-accent/5 transition-all duration-300 cursor-pointer"
                              onClick={activity.onClick}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${statusColor[activity.status as keyof typeof statusColor]}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-medium text-foreground text-sm leading-tight">
                                        <span className="font-semibold">{activity.user}</span>{' '}
                                        {activity.action}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {activity.details}
                                      </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {activity.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={handleViewAllActivities}
                    >
                      <History className="h-4 w-4 mr-2" />
                      View all activity
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}