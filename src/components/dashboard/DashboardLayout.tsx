import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    DollarSign,
    Activity,
    Clock,
    Settings,
    Stethoscope,
    Pill,
    FileText,
    BarChart3,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import OptimizedStatsCard from './OptimizedStatsCard';
import CompactInfoPanel from './CompactInfoPanel';
import { CompactMetric, StatusIndicator } from './CompactInfoPanel';

interface DashboardLayoutProps {
    onRefresh?: () => void;
    loading?: boolean;
}

export default function DashboardLayout({ onRefresh, loading = false }: DashboardLayoutProps) {
    const [activeView, setActiveView] = useState('overview');

    // Primary metrics - High priority, large display with color coding
    const primaryMetrics = [
        {
            id: 'patients',
            title: 'Active Patients',
            value: '1,247',
            icon: Users,
            gradient: 'from-calm-500 to-calm-600',
            priority: 'high' as const,
            trend: { value: 12, label: 'vs last month', direction: 'up' as const },
            status: 'normal' as const,
            valueType: 'count' as const,
            thresholds: { low: 500, medium: 1000, high: 1500 }
        },
        {
            id: 'appointments',
            title: 'Today\'s Appointments',
            value: '23',
            icon: Calendar,
            gradient: 'from-calm-teal-500 to-calm-teal-600',
            priority: 'high' as const,
            trend: { value: -5, label: 'vs yesterday', direction: 'down' as const },
            status: 'warning' as const,
            valueType: 'count' as const,
            thresholds: { low: 10, medium: 20, high: 30 }
        },
        {
            id: 'revenue',
            title: 'Monthly Revenue',
            value: '$45,230',
            icon: DollarSign,
            gradient: 'from-calm-gray-500 to-calm-gray-600',
            priority: 'high' as const,
            trend: { value: 8, label: 'vs last month', direction: 'up' as const },
            status: 'normal' as const,
            valueType: 'currency' as const
        },
        {
            id: 'prescriptions',
            title: 'Active Prescriptions',
            value: '156',
            icon: Pill,
            gradient: 'from-calm-400 to-calm-500',
            priority: 'high' as const,
            trend: { value: 3, label: 'vs last week', direction: 'up' as const },
            status: 'normal' as const,
            valueType: 'count' as const,
            thresholds: { low: 50, medium: 100, high: 200 }
        }
    ];

    // Secondary metrics - Medium priority, compact display with color coding
    const secondaryMetrics = [
        {
            id: 'lab-results',
            title: 'Lab Results',
            value: '12',
            icon: Activity,
            gradient: 'from-cyan-500 to-cyan-600',
            priority: 'medium' as const,
            trend: { value: 2, label: 'pending', direction: 'up' as const },
            status: 'normal' as const,
            valueType: 'count' as const,
            thresholds: { low: 5, medium: 15, high: 25 }
        },
        {
            id: 'telemedicine',
            title: 'Telemedicine Sessions',
            value: '8',
            icon: Stethoscope,
            gradient: 'from-indigo-500 to-indigo-600',
            priority: 'medium' as const,
            trend: { value: 15, label: 'vs last week', direction: 'up' as const },
            status: 'normal' as const,
            valueType: 'count' as const,
            thresholds: { low: 3, medium: 8, high: 15 }
        },
        {
            id: 'documents',
            title: 'Documents Generated',
            value: '34',
            icon: FileText,
            gradient: 'from-pink-500 to-pink-600',
            priority: 'medium' as const,
            trend: { value: 7, label: 'vs last week', direction: 'up' as const },
            status: 'normal' as const,
            valueType: 'count' as const,
            thresholds: { low: 10, medium: 25, high: 50 }
        },
        {
            id: 'system-health',
            title: 'System Health',
            value: '99.9%',
            icon: Zap,
            gradient: 'from-emerald-500 to-emerald-600',
            priority: 'medium' as const,
            trend: { value: 0.1, label: 'uptime', direction: 'stable' as const },
            status: 'normal' as const,
            valueType: 'health' as const
        }
    ];

    // Critical alerts
    const criticalAlerts = [
        {
            id: '1',
            type: 'critical' as const,
            title: 'System Maintenance Required',
            message: 'Database backup failed. Immediate attention needed.',
            timestamp: '2 minutes ago'
        },
        {
            id: '2',
            type: 'warning' as const,
            title: 'High Patient Volume',
            message: 'Appointment slots are 85% full for tomorrow.',
            timestamp: '15 minutes ago'
        }
    ];

    // Quick actions
    const quickActions = [
        { id: 'new-patient', label: 'New Patient', icon: Users, color: 'bg-blue-500', onClick: () => { } },
        { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'bg-green-500', onClick: () => { } },
        { id: 'prescribe', label: 'Prescribe', icon: Pill, color: 'bg-orange-500', onClick: () => { } },
        { id: 'lab-order', label: 'Lab Order', icon: Activity, color: 'bg-purple-500', onClick: () => { } },
        { id: 'telemedicine', label: 'Telemedicine', icon: Stethoscope, color: 'bg-indigo-500', onClick: () => { } },
        { id: 'reports', label: 'Reports', icon: BarChart3, color: 'bg-pink-500', onClick: () => { } }
    ];

    // Recent activity data
    const recentActivity = [
        { id: '1', label: 'New appointment scheduled', value: 'Dr. Smith', timestamp: '2 min ago', status: 'normal' },
        { id: '2', label: 'Patient registered', value: 'John Doe', timestamp: '5 min ago', status: 'normal' },
        { id: '3', label: 'Lab result available', value: 'Blood Test', timestamp: '12 min ago', status: 'warning' },
        { id: '4', label: 'Payment received', value: '$150.00', timestamp: '1 hour ago', status: 'normal' },
        { id: '5', label: 'Prescription filled', value: 'Medication X', timestamp: '2 hours ago', status: 'normal' }
    ];

    // System status data
    const systemStatus = [
        { id: '1', label: 'API Server', value: 'Online', status: 'normal' },
        { id: '2', label: 'Database', value: 'Online', status: 'normal' },
        { id: '3', label: 'File Storage', value: 'Online', status: 'normal' },
        { id: '4', label: 'Email Service', value: 'Warning', status: 'warning' },
        { id: '5', label: 'Backup System', value: 'Error', status: 'critical' }
    ];

    return (
        <div className="space-y-6 p-6 bg-gradient-calm-surface min-h-screen">
            {/* Header - Minimized */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-calm-gray-900">Medical Dashboard</h1>
                    <p className="text-sm text-calm-gray-500">Practice Overview & Analytics</p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
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

            {/* Primary Metrics - Large, Prominent */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {primaryMetrics.map((metric, index) => (
                    <OptimizedStatsCard
                        key={metric.id}
                        {...metric}
                        isLoading={loading}
                    />
                ))}
            </div>

            {/* Quick Actions - Icon-based, Compact */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {quickActions.map((action) => (
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

            {/* Secondary Information - Minimized and Collapsible */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Activity - Compact */}
                <CompactInfoPanel
                    title="Recent Activity"
                    icon={Clock}
                    data={recentActivity}
                    priority="medium"
                    defaultCollapsed={false}
                />

                {/* System Status - Icon-based */}
                <CompactInfoPanel
                    title="System Status"
                    icon={Zap}
                    data={systemStatus}
                    priority="high"
                    defaultCollapsed={true}
                />

                {/* Secondary Metrics - Compact */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Additional Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {secondaryMetrics.map((metric) => (
                            <CompactMetric
                                key={metric.id}
                                label={metric.title}
                                value={metric.value}
                                icon={metric.icon}
                                color={metric.gradient}
                                trend={metric.trend}
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Performance Indicators - Minimal */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Performance Overview</CardTitle>
                        <div className="flex items-center space-x-2">
                            <StatusIndicator status="online" size="sm" />
                            <span className="text-xs text-gray-500">All systems operational</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Response Time</span>
                                <span className="text-gray-900 font-medium">245ms</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full w-[85%]" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Uptime</span>
                                <span className="text-gray-900 font-medium">99.9%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full w-[99%]" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Active Users</span>
                                <span className="text-gray-900 font-medium">23</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full w-[60%]" />
                            </div>
                        </div>
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
