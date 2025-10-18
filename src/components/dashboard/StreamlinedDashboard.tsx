import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  AlertTriangle,
  RefreshCw,
  Pill,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import OptimizedStatsCard from './OptimizedStatsCard';

interface StreamlinedDashboardProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export default function StreamlinedDashboard({ onRefresh, loading = false }: StreamlinedDashboardProps) {
  // Core medical practice metrics only
  const coreMetrics = [
    {
      id: 'patients',
      title: 'Active Patients',
      value: '1,247',
      icon: Users,
      gradient: 'from-calm-500 to-calm-600',
      priority: 'high' as const,
      trend: { value: 12, label: 'vs last month', direction: 'up' as const },
      status: 'normal' as const
    },
    {
      id: 'appointments',
      title: 'Today\'s Appointments',
      value: '23',
      icon: Calendar,
      gradient: 'from-calm-teal-500 to-calm-teal-600',
      priority: 'high' as const,
      trend: { value: -5, label: 'vs yesterday', direction: 'down' as const },
      status: 'warning' as const
    },
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: '$45,230',
      icon: DollarSign,
      gradient: 'from-calm-gray-500 to-calm-gray-600',
      priority: 'high' as const,
      trend: { value: 8, label: 'vs last month', direction: 'up' as const },
      status: 'normal' as const
    },
    {
      id: 'prescriptions',
      title: 'Active Prescriptions',
      value: '156',
      icon: Pill,
      gradient: 'from-calm-400 to-calm-500',
      priority: 'high' as const,
      trend: { value: 3, label: 'vs last week', direction: 'up' as const },
      status: 'normal' as const
    }
  ];

  // Critical alerts only - System maintenance resolved
  const criticalAlerts = [
    {
      id: '2',
      type: 'warning' as const,
      title: 'High Patient Volume',
      message: 'Appointment slots are 85% full for tomorrow.',
      timestamp: '15 minutes ago'
    }
  ];

  // Essential quick actions only
  const essentialActions = [
    { id: 'new-patient', label: 'New Patient', icon: Users, color: 'bg-calm-500', onClick: () => window.location.href = '/patients' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'bg-calm-teal-500', onClick: () => window.location.href = '/appointments' },
    { id: 'prescribe', label: 'Prescribe', icon: Pill, color: 'bg-calm-400', onClick: () => window.location.href = '/prescriptions' },
    { id: 'lab-order', label: 'Lab Order', icon: Activity, color: 'bg-calm-gray-500', onClick: () => window.location.href = '/lab-orders' },
    { id: 'patient-workspace', label: 'Patient Workspace', icon: Stethoscope, color: 'bg-calm-teal-400', onClick: () => window.location.href = '/enhanced-patient-workspace/patient-1' }
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-calm-surface min-h-screen">
      {/* Header - Minimal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-calm-gray-900">Medical Dashboard</h1>
          <p className="text-sm text-calm-gray-500">Practice Overview</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Critical Alerts - High Priority */}
      {criticalAlerts.filter(a => a.type === 'critical').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {criticalAlerts.filter(a => a.type === 'critical').map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-red-500 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900">{alert.title}</h4>
                    <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Critical
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Core Metrics - Large, Prominent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coreMetrics.map((metric, index) => (
          <OptimizedStatsCard
            key={metric.id}
            {...metric}
            isLoading={loading}
          />
        ))}
      </div>

      {/* Essential Quick Actions - Minimal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {essentialActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-shadow"
                onClick={action.onClick}
              >
                <div className={cn('p-2 rounded-lg', action.color)}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Non-Critical Alerts - Minimized */}
      {criticalAlerts.filter(a => a.type !== 'critical').length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {criticalAlerts.filter(a => a.type !== 'critical').length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticalAlerts.filter(a => a.type !== 'critical').map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{alert.title}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                  {alert.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
