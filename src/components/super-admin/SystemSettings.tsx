import { useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Monitor,
  Cpu,
  HardDrive as Storage,
  Users,
  Server,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { StatusIndicator, CompactMetric } from '../dashboard/CompactInfoPanel';
import { useQuery } from '@tanstack/react-query';
import { realApiClient } from '@/api/realApiClient';

interface SystemSettingsProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export default function SystemSettings({ onRefresh, loading = false }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch system status from real API
  const { data: systemStatus = [], isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['system-status'],
    queryFn: () => realApiClient.getSystemStatus(),
    refetchInterval: 30000,
    staleTime: 15000
  });

  // Fetch performance metrics from real API
  const { data: performanceMetrics = [], isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => realApiClient.getPerformanceMetrics(),
    refetchInterval: 30000,
    staleTime: 15000
  });

  // Fetch security status from real API
  const { data: securityStatus = [], isLoading: securityLoading, refetch: refetchSecurity } = useQuery({
    queryKey: ['security-status'],
    queryFn: () => realApiClient.getSecurityStatus(),
    refetchInterval: 30000,
    staleTime: 15000
  });

  // Fetch system logs from real API
  const { data: systemLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['system-logs'],
    queryFn: () => realApiClient.getSystemLogs(),
    refetchInterval: 30000,
    staleTime: 15000
  });

  // Handle refresh
  const handleRefresh = () => {
    refetchStatus();
    refetchMetrics();
    refetchSecurity();
    refetchLogs();
    onRefresh?.();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'normal':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Icon mapping for performance metrics
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Zap,
      Clock,
      Users,
      Cpu,
      Monitor,
      Storage
    };
    return iconMap[iconName] || Activity;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500">System Administration & Monitoring</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading || statusLoading || metricsLoading || securityLoading || logsLoading}>
            <RefreshCw className={cn('w-4 h-4', (loading || statusLoading || metricsLoading || securityLoading || logsLoading) && 'animate-spin')} />
          </Button>
          <Badge variant="outline" className="text-xs">
            Super Admin
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {systemStatus.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <StatusIndicator
                    status={item.status === 'normal' ? 'online' : item.status === 'warning' ? 'warning' : 'error'}
                    size="sm"
                  />
                  <span className="text-xs text-gray-500 capitalize">{item.value}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {securityStatus.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <StatusIndicator
                    status={item.status === 'normal' ? 'online' : item.status === 'warning' ? 'warning' : 'error'}
                    size="sm"
                  />
                  <span className="text-xs text-gray-500 capitalize">{item.value}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {systemLogs.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    item.status === 'warning' && 'border-yellow-300 text-yellow-700',
                    item.status === 'normal' && 'border-green-300 text-green-700'
                  )}
                >
                  {item.value}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>Performance Metrics</span>
          </CardTitle>
          <CardDescription>Real-time system performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric) => {
              const IconComponent = getIconComponent(metric.icon);
              return (
                <CompactMetric
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  icon={IconComponent}
                  color={metric.color}
                  trend={metric.trend}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Overall system status and health indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemStatus.map((item) => (
                  <div key={item.id} className={cn('p-3 rounded-lg border', getStatusColor(item.status))}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          item.status === 'critical' && 'border-red-300 text-red-700',
                          item.status === 'warning' && 'border-yellow-300 text-yellow-700',
                          item.status === 'normal' && 'border-green-300 text-green-700'
                        )}
                      >
                        {item.value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Security status and monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityStatus.map((item) => (
                  <div key={item.id} className={cn('p-3 rounded-lg border', getStatusColor(item.status))}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          item.status === 'critical' && 'border-red-300 text-red-700',
                          item.status === 'warning' && 'border-yellow-300 text-yellow-700',
                          item.status === 'normal' && 'border-green-300 text-green-700'
                        )}
                      >
                        {item.value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric) => {
              const IconComponent = getIconComponent(metric.icon);
              return (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{metric.label}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                      <div className="flex items-center justify-center space-x-1">
                        {metric.trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {metric.trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                        <span className={cn(
                          'text-sm font-medium',
                          metric.trend.direction === 'up' && 'text-green-600',
                          metric.trend.direction === 'down' && 'text-red-600',
                          metric.trend.direction === 'stable' && 'text-gray-600'
                        )}>
                          {metric.trend.value > 0 ? '+' : ''}{metric.trend.value}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Dashboard</CardTitle>
              <CardDescription>Comprehensive security monitoring and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {securityStatus.map((item) => (
                  <div key={item.id} className={cn('p-4 rounded-lg border', getStatusColor(item.status))}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.value}</p>
                        </div>
                      </div>
                      <StatusIndicator
                        status={item.status === 'normal' ? 'online' : item.status === 'warning' ? 'warning' : 'error'}
                        size="md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.label}</p>
                        <p className="text-xs text-gray-500">{log.timestamp}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        log.status === 'warning' && 'border-yellow-300 text-yellow-700',
                        log.status === 'normal' && 'border-green-300 text-green-700'
                      )}
                    >
                      {log.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
