import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    CreditCard,
    Receipt,
    Calendar,
    Users,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    Download,
    Filter,
    MoreHorizontal,
    Target,
    Wallet,
    Banknote,
    Calculator
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { StatusIndicator, CompactMetric } from '../dashboard/CompactInfoPanel';

interface FinancialAnalyticsProps {
    onRefresh?: () => void;
    loading?: boolean;
}

export default function FinancialAnalytics({ onRefresh, loading = false }: FinancialAnalyticsProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState('month');

    // Financial metrics
    const financialMetrics = [
        {
            id: 'revenue',
            label: 'Total Revenue',
            value: '$45,230',
            icon: DollarSign,
            color: 'bg-green-500',
            trend: { value: 8, direction: 'up' as const },
            priority: 'high' as const
        },
        {
            id: 'collected',
            label: 'Amount Collected',
            value: '$38,450',
            icon: CheckCircle,
            color: 'bg-blue-500',
            trend: { value: 12, direction: 'up' as const },
            priority: 'high' as const
        },
        {
            id: 'outstanding',
            label: 'Outstanding',
            value: '$6,780',
            icon: AlertTriangle,
            color: 'bg-orange-500',
            trend: { value: -5, direction: 'down' as const },
            priority: 'high' as const
        },
        {
            id: 'overdue',
            label: 'Overdue',
            value: '$2,340',
            icon: AlertTriangle,
            color: 'bg-red-500',
            trend: { value: 3, direction: 'up' as const },
            priority: 'high' as const
        },
        {
            id: 'collection-rate',
            label: 'Collection Rate',
            value: '85.2%',
            icon: Target,
            color: 'bg-purple-500',
            trend: { value: 2, direction: 'up' as const },
            priority: 'medium' as const
        },
        {
            id: 'avg-payment',
            label: 'Avg Payment Time',
            value: '12 days',
            icon: Clock,
            color: 'bg-indigo-500',
            trend: { value: -2, direction: 'down' as const },
            priority: 'medium' as const
        }
    ];

    // Payment methods breakdown
    const paymentMethods = [
        { method: 'Credit Card', amount: 18500, percentage: 48.2, color: 'bg-blue-500' },
        { method: 'Insurance', amount: 12300, percentage: 32.0, color: 'bg-green-500' },
        { method: 'Cash', amount: 4500, percentage: 11.7, color: 'bg-yellow-500' },
        { method: 'Check', amount: 2150, percentage: 5.6, color: 'bg-purple-500' },
        { method: 'Other', amount: 1000, percentage: 2.6, color: 'bg-gray-500' }
    ];

    // Revenue trends
    const revenueTrends = [
        { period: 'Jan', revenue: 42000, patients: 180 },
        { period: 'Feb', revenue: 38000, patients: 165 },
        { period: 'Mar', revenue: 45000, patients: 195 },
        { period: 'Apr', revenue: 48000, patients: 210 },
        { period: 'May', revenue: 45230, patients: 198 },
        { period: 'Jun', revenue: 47000, patients: 205 }
    ];

    // Top payers
    const topPayers = [
        { name: 'Blue Cross Blue Shield', amount: 8500, percentage: 22.1, status: 'normal' },
        { name: 'Aetna', amount: 6200, percentage: 16.1, status: 'normal' },
        { name: 'Cigna', amount: 4800, percentage: 12.5, status: 'warning' },
        { name: 'UnitedHealth', amount: 3600, percentage: 9.4, status: 'normal' },
        { name: 'Self Pay', amount: 2800, percentage: 7.3, status: 'normal' }
    ];

    // Recent transactions
    const recentTransactions = [
        { id: '1', patient: 'John Doe', amount: 150, method: 'Credit Card', status: 'completed', timestamp: '2 min ago' },
        { id: '2', patient: 'Jane Smith', amount: 85, method: 'Insurance', status: 'pending', timestamp: '15 min ago' },
        { id: '3', patient: 'Bob Johnson', amount: 200, method: 'Cash', status: 'completed', timestamp: '1 hour ago' },
        { id: '4', patient: 'Alice Brown', amount: 120, method: 'Check', status: 'processing', timestamp: '2 hours ago' },
        { id: '5', patient: 'Charlie Wilson', amount: 95, method: 'Credit Card', status: 'completed', timestamp: '3 hours ago' }
    ];

    // Financial alerts
    const financialAlerts = [
        { id: '1', type: 'warning', title: 'High Outstanding Balance', message: 'Outstanding balance increased by 15% this month', timestamp: '1 hour ago' },
        { id: '2', type: 'info', title: 'Payment Reminder', message: 'Send payment reminders to 12 patients', timestamp: '2 hours ago' },
        { id: '3', type: 'critical', title: 'Failed Payment', message: '3 credit card payments failed today', timestamp: '3 hours ago' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'processing':
                return <Activity className="w-4 h-4 text-blue-600" />;
            case 'failed':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'pending':
                return 'bg-yellow-50 border-yellow-200';
            case 'processing':
                return 'bg-blue-50 border-blue-200';
            case 'failed':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
                    <p className="text-sm text-gray-500">Revenue, Payments & Financial Performance</p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </Button>
                </div>
            </div>

            {/* Financial Alerts */}
            {financialAlerts.filter(a => a.type === 'critical').length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    {financialAlerts.filter(a => a.type === 'critical').map((alert) => (
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

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {financialMetrics.filter(m => m.priority === 'high').map((metric) => (
                    <Card key={metric.id} className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn('p-2 rounded-lg', metric.color)}>
                                    <metric.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex items-center space-x-1">
                                    {metric.trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                                    {metric.trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                                    <span className={cn(
                                        'text-xs font-medium',
                                        metric.trend.direction === 'up' && 'text-green-600',
                                        metric.trend.direction === 'down' && 'text-red-600',
                                        metric.trend.direction === 'stable' && 'text-gray-600'
                                    )}>
                                        {metric.trend.value > 0 ? '+' : ''}{metric.trend.value}%
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                                <p className="text-sm text-gray-600">{metric.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {financialMetrics.filter(m => m.priority === 'medium').map((metric) => (
                    <CompactMetric
                        key={metric.id}
                        label={metric.label}
                        value={metric.value}
                        icon={metric.icon}
                        color={metric.color}
                        trend={metric.trend}
                    />
                ))}
            </div>

            {/* Detailed Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Payment Methods Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <PieChart className="w-5 h-5" />
                                    <span>Payment Methods</span>
                                </CardTitle>
                                <CardDescription>Revenue breakdown by payment method</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {paymentMethods.map((method) => (
                                        <div key={method.method} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={cn('w-3 h-3 rounded-full', method.color)} />
                                                <span className="text-sm font-medium">{method.method}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">${method.amount.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500">{method.percentage}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Payers */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="w-5 h-5" />
                                    <span>Top Payers</span>
                                </CardTitle>
                                <CardDescription>Highest revenue sources</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {topPayers.map((payer) => (
                                        <div key={payer.name} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <StatusIndicator
                                                    status={payer.status === 'normal' ? 'online' : 'warning'}
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{payer.name}</p>
                                                    <p className="text-xs text-gray-500">{payer.percentage}% of total</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">${payer.amount.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest payment activities and status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className={cn('flex items-center justify-between p-3 border rounded-lg', getStatusColor(transaction.status))}>
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(transaction.status)}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{transaction.patient}</p>
                                                <p className="text-xs text-gray-500">{transaction.method} • {transaction.timestamp}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">${transaction.amount}</div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-xs',
                                                    transaction.status === 'completed' && 'border-green-300 text-green-700',
                                                    transaction.status === 'pending' && 'border-yellow-300 text-yellow-700',
                                                    transaction.status === 'processing' && 'border-blue-300 text-blue-700'
                                                )}
                                            >
                                                {transaction.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5" />
                                    <span>Revenue Trends</span>
                                </CardTitle>
                                <CardDescription>Monthly revenue and patient volume</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {revenueTrends.map((trend) => (
                                        <div key={trend.period} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-blue-600">{trend.period}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">${trend.revenue.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">{trend.patients} patients</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Revenue</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Health */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calculator className="w-5 h-5" />
                                    <span>Financial Health</span>
                                </CardTitle>
                                <CardDescription>Key financial indicators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium text-green-900">Collection Rate</p>
                                                <p className="text-xs text-green-700">Above industry average</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-900">85.2%</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-900">Outstanding Balance</p>
                                                <p className="text-xs text-yellow-700">Requires attention</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-yellow-900">$6,780</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">Avg Payment Time</p>
                                                <p className="text-xs text-blue-700">Improving trend</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-900">12 days</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Reports</CardTitle>
                            <CardDescription>Generate and download financial reports</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                                    <Receipt className="w-6 h-6" />
                                    <span>Revenue Report</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                                    <CreditCard className="w-6 h-6" />
                                    <span>Payment Report</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                                    <Users className="w-6 h-6" />
                                    <span>Patient Billing</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                                    <BarChart3 className="w-6 h-6" />
                                    <span>Analytics Report</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
