'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Download,
  Eye,
  FileText,
  History,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/services/api-client';

interface ActivityLog {
  id: string;
  user: string | null;
  user_name: string;
  user_email: string | null;
  user_role: string | null;
  action_type: string;
  action_type_display: string;
  description: string;
  ip_address: string | null;
  affected_models: string[];
  model_ids: Record<string, string[]>;
  metadata: Record<string, unknown>;
  details: Record<string, unknown>;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
}

const roleLabel = (role: string | null) => {
  if (!role) return 'System';
  return role.replaceAll('_', ' ');
};

const roleColor = (role: string | null) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'border-purple-500/20 bg-purple-500/10 text-purple-600';
    case 'COLLEGE_ADMIN':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-600';
    case 'STUDENT':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600';
    default:
      return 'border-amber-500/20 bg-amber-500/10 text-amber-600';
  }
};

const statusColor = (status: ActivityLog['status']) => {
  switch (status) {
    case 'success':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600';
    case 'warning':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-600';
    case 'error':
      return 'border-destructive/20 bg-destructive/10 text-destructive';
    default:
      return 'border-border bg-accent text-muted-foreground';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login':
    case 'logout':
      return Eye;
    case 'create':
    case 'update':
    case 'schedule_generate':
      return FileText;
    case 'conflict_resolved':
    case 'approve':
      return CheckCircle;
    case 'conflict_detected':
    case 'reject':
      return AlertTriangle;
    default:
      return History;
  }
};

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
};

const isInRange = (timestamp: string, range: string) => {
  if (range === 'all') return true;

  const date = new Date(timestamp).getTime();
  const now = Date.now();
  const diff = now - date;

  switch (range) {
    case 'today':
      return diff <= 24 * 60 * 60 * 1000;
    case '7d':
      return diff <= 7 * 24 * 60 * 60 * 1000;
    case '30d':
      return diff <= 30 * 24 * 60 * 60 * 1000;
    default:
      return true;
  }
};

export default function ActivityLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    actionType: '',
    userRole: '',
    dateRange: 'today',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ActivityLog[]>('/activity-logs/activity-logs/', {
        params: {
          ordering: '-timestamp',
          ...(searchTerm ? { search: searchTerm } : {}),
          ...(filters.actionType ? { action_type: filters.actionType } : {}),
        },
      });
      setLogs(response.data);
    } catch (fetchError) {
      console.error('Failed to fetch activity logs:', fetchError);
      setError('Unable to load activity logs from the backend right now.');
    } finally {
      setLoading(false);
    }
  }, [filters.actionType, searchTerm]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchLogs();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchLogs, searchTerm, filters.actionType]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesRole = !filters.userRole || log.user_role === filters.userRole;
      const matchesDateRange = isInRange(log.timestamp, filters.dateRange);
      return matchesRole && matchesDateRange;
    });
  }, [logs, filters.userRole, filters.dateRange]);

  const selectedLog = useMemo(
    () => filteredLogs.find((log) => log.id === selectedLogId) ?? null,
    [filteredLogs, selectedLogId]
  );

  const actionOptions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.action_type))).sort(),
    [logs]
  );

  const roleOptions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.user_role).filter(Boolean) as string[])).sort(),
    [logs]
  );

  const stats = useMemo(() => {
    const now = Date.now();
    return {
      total: filteredLogs.length,
      today: filteredLogs.filter((log) => now - new Date(log.timestamp).getTime() <= 24 * 60 * 60 * 1000).length,
      users: new Set(filteredLogs.map((log) => log.user_email || log.user_name)).size,
      warnings: filteredLogs.filter((log) => log.status !== 'success').length,
    };
  }, [filteredLogs]);

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium tracking-wide text-muted-foreground">ACTIVITY LOGS</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">System Activity Logs</h1>
            <p className="max-w-2xl text-base text-muted-foreground lg:text-lg">
              Live audit history from the backend, including schedule operations, approvals, and conflict handling.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button onClick={() => void fetchLogs()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Logs
            </Button>
          </div>
        </div>
        <Separator className="bg-border/50" />
      </motion.div>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5 p-4" hover={false}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Activity logs could not be loaded</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-8 p-6" hover={false}>
        <div className="grid gap-4 lg:grid-cols-[2fr_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search descriptions, users, or affected records"
              className="pl-11"
            />
          </div>
          <select value={filters.actionType} onChange={(event) => setFilters((current) => ({ ...current, actionType: event.target.value }))} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
            <option value="">All actions</option>
            {actionOptions.map((option) => (
              <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>
            ))}
          </select>
          <select value={filters.userRole} onChange={(event) => setFilters((current) => ({ ...current, userRole: event.target.value }))} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
            <option value="">All roles</option>
            {roleOptions.map((option) => (
              <option key={option} value={option}>{roleLabel(option)}</option>
            ))}
          </select>
          <select value={filters.dateRange} onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value }))} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </Card>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4" hover={false}>
          <p className="text-sm text-muted-foreground">Total activities</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4" hover={false}>
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.today}</p>
        </Card>
        <Card className="p-4" hover={false}>
          <p className="text-sm text-muted-foreground">Unique actors</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.users}</p>
        </Card>
        <Card className="p-4" hover={false}>
          <p className="text-sm text-muted-foreground">Warnings / errors</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.warnings}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card className="overflow-hidden" hover={false}>
          <div className="border-b border-border p-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Activities</h2>
            <p className="mt-1 text-sm text-muted-foreground">Showing {filteredLogs.length} live records from the audit trail.</p>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold text-foreground">No activity logs matched your filters</p>
              <p className="mt-2 text-muted-foreground">Try broadening your search or date range.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredLogs.map((log, index) => {
                const Icon = getActivityIcon(log.action_type);
                return (
                  <motion.button
                    key={log.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="grid w-full gap-4 p-5 text-left transition-colors hover:bg-accent/30 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
                    onClick={() => setSelectedLogId(log.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${statusColor(log.status)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{log.action_type_display}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{log.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={roleColor(log.user_role)}>
                            {roleLabel(log.user_role)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{log.user_name}</span>
                          {log.user_email && <span className="text-xs text-muted-foreground">• {log.user_email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Object.keys(log.details).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(log.details).slice(0, 3).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-foreground">{key}:</span> {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        'No additional metadata'
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <Badge variant="outline" className={statusColor(log.status)}>
                        {log.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">{formatRelativeTime(log.timestamp)}</div>
                      <div className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6" hover={false}>
          <h2 className="text-lg font-semibold text-foreground">Log Details</h2>
          {selectedLog ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Action</p>
                <p className="font-medium text-foreground">{selectedLog.action_type_display}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-foreground">{selectedLog.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actor</p>
                <p className="text-foreground">{selectedLog.user_name}</p>
                {selectedLog.user_email && <p className="text-sm text-muted-foreground">{selectedLog.user_email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="outline" className={roleColor(selectedLog.user_role)}>
                    {roleLabel(selectedLog.user_role)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColor(selectedLog.status)}>
                    {selectedLog.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p className="text-foreground">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IP Address</p>
                <p className="font-mono text-sm text-foreground">{selectedLog.ip_address || 'Unavailable'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Affected models</p>
                <p className="text-foreground">{selectedLog.affected_models.length > 0 ? selectedLog.affected_models.join(', ') : 'None recorded'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metadata</p>
                <pre className="overflow-x-auto rounded-lg bg-accent/30 p-3 text-xs text-foreground">{JSON.stringify(selectedLog.details, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">
              Select a log entry to inspect its full metadata, affected records, and audit details.
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setSelectedLogId(null)} disabled={!selectedLog}>
              Clear selection
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
