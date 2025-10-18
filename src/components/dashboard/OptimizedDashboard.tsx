import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    DollarSign,
    Activity,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowUpRight,
    MoreHorizontal,
    Filter,
    RefreshCw,
    Bell,
    Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CriticalMetric {
    id: string;
    title: string;
    value: string | number;
    change: number;
    changeLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend: 'up' | 'down' | 'stable';
    priority: 'high' | 'medium' | 'low';
}

interface QuickAction {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    onClick: () => void;
}

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
}

interface OptimizedDashboardProps {
    metrics?: CriticalMetric[];
    quickActions?: QuickAction[];
    alerts?: Alert[];
    onRefresh?: () => void;
    loading?: boolean;
}

export default function OptimizedDashboard({
    metrics = [],
    quickActions = [],
    alerts = [],
    onRefresh,
    loading = false
}: OptimizedDashboardProps) {
    const [showAllMetrics, setShowAllMetrics] = useState(false);

    // Prioritize metrics - show only high priority by default
    const primaryMetrics = metrics.filter(m => m.priority === 'high');
    const secondaryMetrics = metrics.filter(m => m.priority !== 'high');
    const displayedMetrics = showAllMetrics ? metrics : primaryMetrics;

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-3 h-3 text-green-600" />;
            case 'down':
                return <TrendingDown className="w-3 h-3 text-red-600" />;
            default:
                return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default:
                return <Bell className="w-4 h-4 text-blue-600" />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'critical':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header - Minimized */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">Medical Practice Overview</p>
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
            {alerts.filter(a => a.type === 'critical').length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    {alerts.filter(a => a.type === 'critical').map((alert) => (
                        <Card key={alert.id} className={cn('border-l-4 border-l-red-500', getAlertColor(alert.type))}>
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    {getAlertIcon(alert.type)}
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
                {displayedMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={cn(
                            'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
                            metric.priority === 'high' && 'ring-2 ring-blue-100'
                        )}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn('p-2 rounded-lg', metric.color)}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {getTrendIcon(metric.trend)}
                                        <span className={cn(
                                            'text-xs font-medium',
                                            metric.trend === 'up' && 'text-green-600',
                                            metric.trend === 'down' && 'text-red-600',
                                            metric.trend === 'stable' && 'text-gray-600'
                                        )}>
                                            {metric.change > 0 ? '+' : ''}{metric.change}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                                    <p className="text-sm text-gray-600">{metric.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{metric.changeLabel}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Show More/Less Toggle for Secondary Metrics */}
            {secondaryMetrics.length > 0 && (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllMetrics(!showAllMetrics)}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        {showAllMetrics ? 'Show Less' : `Show ${secondaryMetrics.length} More`}
                        <ArrowUpRight className={cn('w-4 h-4 ml-1', showAllMetrics && 'rotate-180')} />
                    </Button>
                </div>
            )}

            {/* Quick Actions - Icon-based, Compact */}
            {quickActions.length > 0 && (
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
            )}

            {/* Secondary Information - Minimized */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Activity - Compact */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Recent Activity</CardTitle>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { icon: Calendar, text: 'New appointment scheduled', time: '2 min ago', color: 'text-blue-600' },
                            { icon: Users, text: 'Patient registered', time: '5 min ago', color: 'text-green-600' },
                            { icon: Activity, text: 'Lab result available', time: '12 min ago', color: 'text-purple-600' },
                            { icon: DollarSign, text: 'Payment received', time: '1 hour ago', color: 'text-green-600' }
                        ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 py-2">
                                <item.icon className={cn('w-4 h-4', item.color)} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 truncate">{item.text}</p>
                                    <p className="text-xs text-gray-500">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* System Status - Icon-based */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { label: 'API Server', status: 'online', color: 'bg-green-500' },
                                { label: 'Database', status: 'online', color: 'bg-green-500' },
                                { label: 'File Storage', status: 'online', color: 'bg-green-500' },
                                { label: 'Email Service', status: 'warning', color: 'bg-yellow-500' }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{item.label}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className={cn('w-2 h-2 rounded-full', item.color)} />
                                        <span className="text-xs text-gray-500 capitalize">{item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Indicators - Minimal */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Response Time</span>
                                    <span className="text-gray-900 font-medium">245ms</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full w-[85%]" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Uptime</span>
                                    <span className="text-gray-900 font-medium">99.9%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full w-[99%]" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
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
            </div>

            {/* Non-Critical Alerts - Minimized */}
            {alerts.filter(a => a.type !== 'critical').length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Notifications</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                {alerts.filter(a => a.type !== 'critical').length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {alerts.filter(a => a.type !== 'critical').slice(0, 3).map((alert) => (
                            <div key={alert.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                {getAlertIcon(alert.type)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 truncate">{alert.title}</p>
                                    <p className="text-xs text-gray-500">{alert.timestamp}</p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'text-xs',
                                        alert.type === 'warning' && 'border-yellow-300 text-yellow-700',
                                        alert.type === 'info' && 'border-blue-300 text-blue-700'
                                    )}
                                >
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
