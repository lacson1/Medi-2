import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    PieChart,
    RefreshCw,
    Download,
    Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    loading?: boolean;
    valueType?: 'currency' | 'percentage' | 'count' | 'health' | 'time';
    thresholds?: {
        low?: number;
        medium?: number;
        high?: number;
    };
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    changeLabel,
    icon: Icon,
    color,
    trend,
    loading = false,
    valueType = 'count',
    thresholds
}) => {
    // Color coding utility functions
    const getNumericValue = (val: string | number): number => {
        if (typeof val === 'number') return val;
        const match = val.toString().match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    };

    const getValueColor = (val: string | number, type: string, thresholds?: any): string => {
        const numericValue = getNumericValue(val);

        if (type === 'health' || type === 'percentage') {
            if (numericValue >= 80) return 'text-green-600';
            if (numericValue >= 60) return 'text-yellow-600';
            return 'text-red-600';
        }

        if (type === 'currency') {
            return numericValue >= 0 ? 'text-green-600' : 'text-red-600';
        }

        if (thresholds) {
            if (numericValue >= (thresholds.high || 100)) return 'text-green-600';
            if (numericValue >= (thresholds.medium || 50)) return 'text-yellow-600';
            return 'text-red-600';
        }

        if (trend) {
            switch (trend) {
                case 'up': return 'text-green-600';
                case 'down': return 'text-red-600';
                default: return 'text-gray-600';
            }
        }

        return 'text-gray-900';
    };
    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                            <p className={cn('text-2xl font-bold', getValueColor(value, valueType, thresholds))}>{value}</p>
                            {change !== undefined && (
                                <div className="flex items-center mt-1">
                                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600 mr-1" />}
                                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
                                    <span className={cn(
                                        'text-sm font-medium',
                                        trend === 'up' && 'text-green-600',
                                        trend === 'down' && 'text-red-600',
                                        trend === 'stable' && 'text-gray-600'
                                    )}>
                                        {change > 0 ? '+' : ''}{change}%
                                    </span>
                                    {changeLabel && (
                                        <span className="text-sm text-gray-500 ml-1">{changeLabel}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={cn('p-3 rounded-full', color)}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

interface ChartData {
    name: string;
    value: number;
    [key: string]: any;
}

interface EnhancedDashboardProps {
    metrics?: {
        totalPatients: number;
        totalAppointments: number;
        totalRevenue: number;
        activePrescriptions: number;
    };
    chartData?: {
        patientTrends: ChartData[];
        appointmentTrends: ChartData[];
        revenueTrends: ChartData[];
        departmentDistribution: ChartData[];
    };
    alerts?: Array<{
        id: string;
        type: 'warning' | 'error' | 'info' | 'success';
        title: string;
        message: string;
        timestamp: string;
    }>;
    onRefresh?: () => void;
    onExport?: () => void;
    loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function EnhancedDashboard({
    metrics = {
        totalPatients: 0,
        totalAppointments: 0,
        totalRevenue: 0,
        activePrescriptions: 0
    },
    chartData = {
        patientTrends: [],
        appointmentTrends: [],
        revenueTrends: [],
        departmentDistribution: []
    },
    alerts = [],
    onRefresh,
    onExport,
    loading = false
}: EnhancedDashboardProps) {
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await onRefresh?.();
        } finally {
            setRefreshing(false);
        }
    };

    const metricCards = [
        {
            title: 'Total Patients',
            value: metrics.totalPatients.toLocaleString(),
            change: 12,
            changeLabel: 'vs last month',
            icon: Users,
            color: 'bg-blue-500',
            trend: 'up' as const,
            valueType: 'count' as const,
            thresholds: { low: 500, medium: 1000, high: 1500 }
        },
        {
            title: 'Appointments Today',
            value: metrics.totalAppointments,
            change: -5,
            changeLabel: 'vs yesterday',
            icon: Calendar,
            color: 'bg-green-500',
            trend: 'down' as const,
            valueType: 'count' as const,
            thresholds: { low: 10, medium: 20, high: 30 }
        },
        {
            title: 'Monthly Revenue',
            value: `$${metrics.totalRevenue.toLocaleString()}`,
            change: 8,
            changeLabel: 'vs last month',
            icon: BarChart3,
            color: 'bg-purple-500',
            trend: 'up' as const,
            valueType: 'currency' as const
        },
        {
            title: 'Active Prescriptions',
            value: metrics.activePrescriptions,
            change: 3,
            changeLabel: 'vs last week',
            icon: Activity,
            color: 'bg-orange-500',
            trend: 'up' as const,
            valueType: 'count' as const,
            thresholds: { low: 50, medium: 100, high: 200 }
        }
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview of your medical practice</p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
                        Refresh
                    </Button>

                    {onExport && (
                        <Button variant="outline" onClick={onExport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                                'p-4 rounded-lg border flex items-start space-x-3',
                                alert.type === 'warning' && 'bg-yellow-50 border-yellow-200',
                                alert.type === 'error' && 'bg-red-50 border-red-200',
                                alert.type === 'info' && 'bg-blue-50 border-blue-200',
                                alert.type === 'success' && 'bg-green-50 border-green-200'
                            )}
                        >
                            <AlertTriangle className={cn(
                                'w-5 h-5 mt-0.5',
                                alert.type === 'warning' && 'text-yellow-600',
                                alert.type === 'error' && 'text-red-600',
                                alert.type === 'info' && 'text-blue-600',
                                alert.type === 'success' && 'text-green-600'
                            )} />
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((card, index) => (
                    <MetricCard
                        key={index}
                        {...card}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Trends</CardTitle>
                                <CardDescription>Patient registrations over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData.patientTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Appointment Trends</CardTitle>
                                <CardDescription>Daily appointment counts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData.appointmentTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="patients" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Demographics</CardTitle>
                            <CardDescription>Distribution of patients by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <RechartsPieChart>
                                    <Pie
                                        data={chartData.departmentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.departmentDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trends</CardTitle>
                            <CardDescription>Monthly revenue performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={chartData.revenueTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="departments" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Department Performance</CardTitle>
                                <CardDescription>Patient count by department</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData.departmentDistribution} layout="horizontal">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={100} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#06b6d4" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Department Distribution</CardTitle>
                                <CardDescription>Percentage breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {chartData.departmentDistribution.map((dept, index) => (
                                        <div key={dept.name} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className={cn(
                                                        "w-3 h-3 rounded-full",
                                                        index % 6 === 0 && "bg-blue-500",
                                                        index % 6 === 1 && "bg-emerald-500",
                                                        index % 6 === 2 && "bg-amber-500",
                                                        index % 6 === 3 && "bg-red-500",
                                                        index % 6 === 4 && "bg-violet-500",
                                                        index % 6 === 5 && "bg-cyan-500"
                                                    )}
                                                />
                                                <span className="text-sm font-medium">{dept.name}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">{dept.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
