// app/admin/activity-logs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, User, Clock, 
  Filter, Download, Search, RefreshCw,
  Eye, FileText, AlertTriangle, CheckCircle,
  History, ChevronRight, MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';

export default function ActivityLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    user_role: '',
    date_range: 'today',
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setLogs([
        {
          id: 1,
          user_name: 'John Doe',
          user_role: 'department_admin',
          activity_type: 'schedule_create',
          activity_type_display: 'Schedule Created',
          details: { course_code: 'ITCP 106', room: 'CL2' },
          ip_address: '192.168.1.100',
          timestamp: '2024-01-15T08:00:00Z',
          status: 'success'
        },
        {
          id: 2,
          user_name: 'Jane Smith',
          user_role: 'student',
          activity_type: 'login',
          activity_type_display: 'User Login',
          details: { method: 'Email' },
          ip_address: '192.168.1.101',
          timestamp: '2024-01-15T07:30:00Z',
          status: 'success'
        },
        {
          id: 3,
          user_name: 'Admin User',
          user_role: 'super_admin',
          activity_type: 'bulk_schedule',
          activity_type_display: 'Bulk Schedule Operation',
          details: { count: 10, errors: 0 },
          ip_address: '192.168.1.102',
          timestamp: '2024-01-14T15:45:00Z',
          status: 'success'
        },
        {
          id: 4,
          user_name: 'System',
          user_role: 'system',
          activity_type: 'conflict_detected',
          activity_type_display: 'Conflict Detected',
          details: { conflict_type: 'room', location: 'CL2', time: '8:00 AM' },
          ip_address: '127.0.0.1',
          timestamp: '2024-01-14T10:20:00Z',
          status: 'warning'
        },
        {
          id: 5,
          user_name: 'Robert Chen',
          user_role: 'department_admin',
          activity_type: 'schedule_update',
          activity_type_display: 'Schedule Updated',
          details: { course_code: 'ITDS 108', changes: 'Room changed' },
          ip_address: '192.168.1.103',
          timestamp: '2024-01-13T14:15:00Z',
          status: 'success'
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Eye className="h-4 w-4" />;
      case 'schedule_create': return <FileText className="h-4 w-4" />;
      case 'schedule_update': return <FileText className="h-4 w-4" />;
      case 'bulk_schedule': return <FileText className="h-4 w-4" />;
      case 'conflict_detected': return <AlertTriangle className="h-4 w-4" />;
      case 'conflict_resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'department_admin': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'student': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'system': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-4">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-muted-foreground tracking-wide">ACTIVITY LOGS</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  System Activity Logs
                </h1>
                <p className="text-muted-foreground text-base lg:text-lg max-w-2xl">
                  Monitor all system activities, user actions, and administrative operations.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/admin')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={fetchLogs}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Logs
                </Button>
              </div>
            </div>

            <Separator className="bg-border/50" />
          </motion.div>

          {/* Filters & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-border/40">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Search */}
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities, users, or details..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-accent/50 border-border"
                    />
                  </div>
                  
                  {/* Filters */}
                  <div className="flex items-center gap-3">
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="h-12 rounded-lg border border-border bg-accent/50 px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">All Activities</option>
                      <option value="login">Logins</option>
                      <option value="schedule_create">Schedule Creation</option>
                      <option value="schedule_update">Schedule Updates</option>
                      <option value="bulk_schedule">Bulk Operations</option>
                      <option value="conflict_detected">Conflict Detection</option>
                    </select>
                    
                    <select
                      value={filters.user_role}
                      onChange={(e) => setFilters({ ...filters, user_role: e.target.value })}
                      className="h-12 rounded-lg border border-border bg-accent/50 px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">All Roles</option>
                      <option value="student">Students</option>
                      <option value="department_admin">Department Admins</option>
                      <option value="super_admin">Super Admins</option>
                      <option value="system">System</option>
                    </select>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-12 border-border/50"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-border/40 bg-card/50">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Activities</p>
                      <p className="text-2xl font-bold text-foreground">1,245</p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="border-border/40 bg-card/50">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Logs</p>
                      <p className="text-2xl font-bold text-foreground">42</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Clock className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="border-border/40 bg-card/50">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold text-foreground">156</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="border-border/40 bg-card/50">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">System Alerts</p>
                      <p className="text-2xl font-bold text-foreground">8</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Logs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/40 overflow-hidden">
              <div className="p-6">
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/30">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Recent Activities</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Latest system activities and user actions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-border/50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                      <p className="mt-4 text-muted-foreground">Loading activity logs...</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <div className="overflow-hidden rounded-lg border border-border/50">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 bg-accent text-sm font-medium text-foreground">
                          <div className="col-span-4 p-4 border-r border-border">Activity & User</div>
                          <div className="col-span-3 p-4 border-r border-border">Details</div>
                          <div className="col-span-2 p-4 border-r border-border">IP Address</div>
                          <div className="col-span-3 p-4">Time & Status</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-border">
                          {logs.map((log, index) => (
                            <motion.div
                              key={log.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="grid grid-cols-12 hover:bg-accent/30 transition-colors cursor-pointer group"
                              onClick={() => console.log('View log details:', log.id)}
                            >
                              {/* Activity & User */}
                              <div className="col-span-4 p-4 border-r border-border">
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-lg ${getStatusColor(log.status)}`}>
                                    {getActivityIcon(log.activity_type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                      {log.activity_type_display}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                      <span className="text-sm text-foreground">{log.user_name}</span>
                                      <Badge variant="outline" className={`text-xs ${getRoleColor(log.user_role)}`}>
                                        {log.user_role.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="col-span-3 p-4 border-r border-border">
                                {log.details && Object.keys(log.details).length > 0 ? (
                                  <div className="space-y-1">
                                    {Object.entries(log.details).map(([key, value]) => (
                                      <div key={key} className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{key}:</span>
                                        <span className="text-sm font-medium text-foreground">{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">No additional details</span>
                                )}
                              </div>

                              {/* IP Address */}
                              <div className="col-span-2 p-4 border-r border-border">
                                <code className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">
                                  {log.ip_address}
                                </code>
                              </div>

                              {/* Time & Status */}
                              <div className="col-span-3 p-4">
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                      {formatDate(log.timestamp)}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className={`text-xs w-fit ${getStatusColor(log.status)}`}>
                                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {logs.length} of 1,245 activities
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => router.push('/admin/activity-logs/all')}
                    >
                      View all activity logs
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Bottom Spacing */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}