// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, Building, AlertTriangle, 
  Upload, BarChart3, Settings,
  Filter, Download, Plus, Eye, History, FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConflictAlert } from './components/conflict-alert';
import { BulkUpload } from './components/bulk-upload';
import { useAuth } from '@/hooks/use-auth';
import { ScheduleManager } from './components/schedule-manager';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';

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
      color: 'blue',
      change: '+12%',
      description: 'Active this semester',
      onClick: () => {
        setActiveTab('schedules');
        // Scroll to schedules section
        setTimeout(() => {
          document.getElementById('schedules-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    {
      title: 'Pending Conflicts',
      value: stats.pendingConflicts,
      icon: AlertTriangle,
      color: 'amber',
      change: '-3%',
      description: 'Requires resolution',
      onClick: () => navigateTo('/admin/conflicts')
    },
    {
      title: 'Active Rooms',
      value: stats.activeRooms,
      icon: Building,
      color: 'emerald',
      change: '+5%',
      description: 'Currently allocated',
      onClick: () => navigateTo('/admin/rooms')
    },
    {
      title: 'Instructors',
      value: stats.totalInstructors,
      icon: Users,
      color: 'purple',
      change: '+8%',
      description: 'Teaching this semester',
      onClick: () => navigateTo('/admin/instructors')
    },
  ];

  const quickActions = [
    { 
      label: 'Create Schedule', 
      icon: Plus, 
      onClick: () => navigateTo('/admin/schedules/create-schedule'),
      color: 'blue' 
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
      color: 'emerald' 
    },
    { 
      label: 'View Reports', 
      icon: BarChart3, 
      onClick: () => navigateTo('/admin/reports'),
      color: 'purple' 
    },
    { 
      label: 'Activity Logs', 
      icon: FileText, 
      onClick: () => navigateTo('/admin/activity-logs'),
      color: 'amber' 
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'schedules', label: 'All Schedules', icon: Calendar },
    { id: 'rooms', label: 'Room Management', icon: Building },
    { id: 'instructors', label: 'Instructors', icon: Users },
  ];

  const handleNewSchedule = () => {
    navigateTo('/admin/schedules/create-schedule');
  };

  const handleSettings = () => {
    navigateTo('/admin/settings');
  };

  const handleViewAllActivities = () => {
    navigateTo('/admin/activity-logs');
  };

  const handleExportSchedules = () => {
    // In a real app, this would trigger a download
    alert('Exporting schedules... This would download an Excel file.');
  };

  const handleFilterSchedules = () => {
    // Show filter modal or dropdown
    alert('Filter functionality will open a filter panel.');
  };

  const activityLogs = [
    { 
      id: 1,
      user: 'John Doe', 
      action: 'created schedule', 
      time: '2 min ago', 
      details: 'ITCP 106',
      onClick: () => navigateTo('/admin/schedules')
    },
    { 
      id: 2,
      user: 'Jane Smith', 
      action: 'resolved conflict', 
      time: '15 min ago', 
      details: 'ITDS 108 - Room conflict',
      onClick: () => navigateTo('/admin/conflicts')
    },
    { 
      id: 3,
      user: 'Admin User', 
      action: 'updated room capacity', 
      time: '1 hour ago', 
      details: 'TC Lab capacity updated',
      onClick: () => navigateTo('/admin/rooms')
    },
    { 
      id: 4,
      user: 'System', 
      action: 'detected conflict', 
      time: '2 hours ago', 
      details: 'Instructor overlap in CL2',
      onClick: () => navigateTo('/admin/conflicts')
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Use the modern navbar component */}
      <Navbar />
      
      {/* Main content with padding-top to account for fixed navbar */}
      <div className="pt-12"> {/* Increased padding to 5rem (80px) */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Welcome back, {user?.first_name}. Manage schedules, resolve conflicts, and oversee operations.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  className="!bg-white !text-gray-700 !border-gray-300 hover:!bg-gray-50"
                  onClick={handleSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
            {adminCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card 
                  hover={true} 
                  className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                  onClick={stat.onClick}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <div className="flex items-baseline space-x-2 mt-2">
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                          <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                            stat.change.startsWith('+') 
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                        stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
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
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                  <p className="text-sm text-gray-600">Frequently used admin tools</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleViewAllActivities}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Activity
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className={`p-4 rounded-xl border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer ${
                      action.color === 'blue' ? 'hover:border-blue-500 hover:bg-blue-50' :
                      action.color === 'emerald' ? 'hover:border-emerald-500 hover:bg-emerald-50' :
                      action.color === 'purple' ? 'hover:border-purple-500 hover:bg-purple-50' :
                      'hover:border-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-lg ${
                        action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        action.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                        action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </div>
                  </motion.button>
                ))}
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
            <Card className="!p-2">
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      // Navigate to respective pages for non-overview tabs
                      if (tab.id === 'rooms') {
                        navigateTo('/admin/rooms');
                      } else if (tab.id === 'instructors') {
                        navigateTo('/admin/instructors');
                      }
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
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
                      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                      <p className="text-sm text-gray-600">Latest schedule changes and updates</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleViewAllActivities}
                    >
                      <History className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {activityLogs.map((activity) => (
                      <div 
                        key={activity.id}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={activity.onClick}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              <span className="font-semibold">{activity.user}</span> {activity.action}
                            </p>
                            <p className="text-sm text-gray-500">{activity.details}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'schedules' && (
              <div>
                <Card className="mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Manage Schedules</h2>
                      <p className="text-gray-600">View, edit, and manage all class schedules</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" onClick={handleFilterSchedules}>
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" onClick={handleExportSchedules}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={handleNewSchedule}>
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
              <Card>
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Building className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Management</h3>
                  <p className="text-gray-600 mb-6">
                    Manage room allocations and availability
                  </p>
                  <Button onClick={() => navigateTo('/admin/rooms')}>
                    Go to Room Management
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'instructors' && (
              <Card>
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructor Management</h3>
                  <p className="text-gray-600 mb-6">
                    View and manage instructor assignments
                  </p>
                  <Button onClick={() => navigateTo('/admin/instructors')}>
                    Go to Instructor Management
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}