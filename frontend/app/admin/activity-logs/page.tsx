// app/admin/activity-logs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, User, Clock, 
  Filter, Download, Search, RefreshCw,
  Eye, FileText, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar'; // Add this import

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
        },
        {
          id: 2,
          user_name: 'Jane Smith',
          user_role: 'student',
          activity_type: 'login',
          activity_type_display: 'User Login',
          details: {},
          ip_address: '192.168.1.101',
          timestamp: '2024-01-15T07:30:00Z',
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
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Eye className="h-4 w-4" />;
      case 'schedule_create': return <FileText className="h-4 w-4" />;
      case 'bulk_schedule': return <FileText className="h-4 w-4" />;
      case 'conflict_resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'department_admin': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Add the Navbar component here */}
      <Navbar />
      
      {/* Add padding-top to account for fixed navbar */}
      <div className="pt-4">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                <p className="text-gray-600">Monitor system activities and user actions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Rest of the existing activity logs code remains the same */}
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                    >
                      <option value="">All Activities</option>
                      <option value="login">Logins</option>
                      <option value="schedule_create">Schedule Changes</option>
                      <option value="bulk_schedule">Bulk Operations</option>
                    </select>
                    
                    <select
                      value={filters.user_role}
                      onChange={(e) => setFilters({ ...filters, user_role: e.target.value })}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                    >
                      <option value="">All Roles</option>
                      <option value="student">Students</option>
                      <option value="department_admin">Department Admins</option>
                      <option value="super_admin">Super Admins</option>
                    </select>
                    
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Logs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading activity logs...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log, index) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                {getActivityIcon(log.activity_type)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{log.activity_type_display}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(log.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{log.user_name}</div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(log.user_role)}`}>
                                  {log.user_role.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {log.details && Object.keys(log.details).length > 0 ? (
                                <div className="space-y-1">
                                  {Object.entries(log.details).map(([key, value]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                      <span className="text-gray-500">{key}:</span>
                                      <span className="font-medium">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500">No additional details</span>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              {log.ip_address}
                            </code>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(log.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}