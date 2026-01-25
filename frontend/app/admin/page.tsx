// app/admin/page.tsx - REDESIGNED
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, Building, AlertTriangle, 
  Upload, BarChart3, Settings, Clock,
  Filter, Download, Plus, Eye, History, FileText,
  ChevronRight, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
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
      value: stats.totalSchedules,
      icon: Calendar,
      color: 'primary',
      change: '+12%',
      description: 'Active this semester',
      onClick: () => {
        setActiveTab('schedules');
        setTimeout(() => {
          document.getElementById('schedules-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    {
      title: 'Pending Conflicts',
      value: stats.pendingConflicts,
      icon: AlertTriangle,
      color: 'destructive',
      change: '-3%',
      description: 'Requires resolution',
      onClick: () => navigateTo('/admin/conflicts')
    },
    {
      title: 'Active Rooms',
      value: stats.activeRooms,
      icon: Building,
      color: 'secondary',
      change: '+5%',
      description: 'Currently allocated',
      onClick: () => navigateTo('/admin/rooms')
    },
    {
      title: 'Instructors',
      value: stats.totalInstructors,
      icon: Users,
      color: 'accent',
      change: '+8%',
      description: 'Teaching this semester',
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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">ADMIN DASHBOARD</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.first_name}</h1>
            <p className="text-muted-foreground mt-2">
              Manage schedules, resolve conflicts, and oversee operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-border text-foreground hover:bg-accent/50 hover:border-border/80"
              onClick={handleSettings}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleNewSchedule}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {adminCards.map((stat, index) => {
          const colorMap = {
            primary: 'bg-primary/10 text-primary border-primary/20',
            destructive: 'bg-destructive/10 text-destructive border-destructive/20',
            secondary: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
            accent: 'bg-accent/10 text-accent-foreground border-accent/20',
            muted: 'bg-muted/50 text-muted-foreground border-border'
          };

          const iconColorMap = {
            primary: 'bg-primary/20 text-primary',
            destructive: 'bg-destructive/20 text-destructive',
            secondary: 'bg-secondary/20 text-secondary-foreground',
            accent: 'bg-accent/20 text-accent-foreground',
            muted: 'bg-muted text-muted-foreground'
          };

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card 
                hover={true} 
                className={`relative overflow-hidden cursor-pointer border-2 ${colorMap[stat.color as keyof typeof colorMap]} transition-all duration-300`}
                onClick={stat.onClick}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-current/5 to-transparent rounded-full -translate-y-8 translate-x-8" />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stat.change.startsWith('+') 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${iconColorMap[stat.color as keyof typeof iconColorMap]}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Updated just now</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
              <p className="text-sm text-muted-foreground">Frequently used admin tools</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
              onClick={handleViewAllActivities}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Activity
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const colorMap = {
                primary: 'border-primary/20 hover:border-primary/40 hover:bg-primary/5',
                secondary: 'border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5',
                accent: 'border-accent/20 hover:border-accent/40 hover:bg-accent/5',
                muted: 'border-border hover:border-border/80 hover:bg-muted/30'
              };

              const iconColorMap = {
                primary: 'bg-primary/10 text-primary',
                secondary: 'bg-secondary/10 text-secondary-foreground',
                accent: 'bg-accent/10 text-accent-foreground',
                muted: 'bg-muted text-muted-foreground'
              };

              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  className={`p-4 rounded-xl border-2 bg-card/50 ${colorMap[action.color as keyof typeof colorMap]} transition-all duration-300 cursor-pointer text-left`}
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${iconColorMap[action.color as keyof typeof iconColorMap]}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{action.label}</span>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card variant="outline" className="!p-1">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
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
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                  <span>{tab.label}</span>
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
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Conflict Alerts */}
            <ConflictAlert conflicts={conflicts} />
            
            {/* Bulk Upload Section */}
            <div id="bulk-upload-section">
              <BulkUpload />
            </div>
            
            {/* Recent Activity */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                  <p className="text-sm text-muted-foreground">Latest schedule changes and updates</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  onClick={handleViewAllActivities}
                >
                  <History className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {activityLogs.map((activity) => {
                  const statusColor = {
                    success: 'text-emerald-600 bg-emerald-500/10',
                    warning: 'text-amber-600 bg-amber-500/10',
                    error: 'text-destructive bg-destructive/10'
                  };

                  return (
                    <div 
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors group"
                      onClick={activity.onClick}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${statusColor[activity.status as keyof typeof statusColor]}`}>
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            <span className="font-semibold">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div>
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Manage Schedules</h2>
                  <p className="text-muted-foreground">View, edit, and manage all class schedules</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="border-border text-foreground hover:bg-accent/50 hover:border-border/80"
                    onClick={handleFilterSchedules}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent/50 hover:border-border/80"
                    onClick={handleExportSchedules}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleNewSchedule}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </div>
              </div>
              
              {/* Schedule Manager Component */}
              <ScheduleManager />
            </Card>
          </div>
        )}

        {activeTab === 'rooms' && (
          <Card className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Room Management</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Manage room allocations, availability, and configurations across campus
            </p>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigateTo('/admin/rooms')}
            >
              Go to Room Management
            </Button>
          </Card>
        )}

        {activeTab === 'instructors' && (
          <Card className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Instructor Management</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              View and manage instructor assignments, availability, and course loads
            </p>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigateTo('/admin/instructors')}
            >
              Go to Instructor Management
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
}