import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { useFinancialAnalytics } from '@/hooks/useSuperAdminData';

// Simple chart components (in a real app, you'd use a proper charting library)
const SimpleBarChart = ({ data, height = 200 }: any) => {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-500">No data available</div>;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-2">
      {data.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-20 text-sm text-gray-600 truncate">{item.label}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div
              className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            >
              <span className="text-xs text-white font-medium">
                ${item.value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SimplePieChart = ({ data, height = 200 }: any) => {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-500">No data available</div>;

  const total = data.reduce((sum: any, item: any) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="space-y-2">
      {data.map((item: any, index: number) => {
        const percentage = (item.value / total) * 100;
        cumulativePercentage += percentage;

        return (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">${item.value.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SimpleLineChart = ({ data, height = 200 }: any) => {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-500">No data available</div>;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="relative h-48">
      <svg width="100%" height="100%" className="absolute inset-0">
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={data.map((item: any, index: number) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return `${x},${y}`;
          }).join(' ')}
        />
        {data.map((item: any, index: number) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="#3b82f6"
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        {data.map((item: any, index: number) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

export default function FinancialAnalytics() {
  const { data: financial, isLoading, error, refresh } = useFinancialAnalytics();
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('12months');

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: any) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Loading Financial Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const revenueByOrgData = financial?.byOrganization?.map(org => ({
    label: org.organization_name,
    value: org.total_revenue,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  })) || [];

  const monthlyTrendData = financial?.monthlyTrends?.map(trend => ({
    label: trend.month,
    value: trend.revenue
  })) || [];

  const paymentStatusData = financial?.byOrganization?.map(org => ({
    label: org.organization_name,
    value: org.pending_payments,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Analytics</h2>
          <p className="text-sm text-gray-600">
            Revenue, billing, and payment analytics across all organizations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-24" /> :
                formatCurrency(financial?.summary?.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-20" /> :
                formatCurrency(financial?.summary?.totalPending || 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <AlertCircle className="h-3 w-3" />
              <span>Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-20" /> :
                formatCurrency(financial?.summary?.totalPaid || 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <CheckCircle className="h-3 w-3" />
              <span>Successfully processed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Transaction</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-16" /> :
                formatCurrency(financial?.summary?.averageTransactionValue || 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <TrendingUp className="h-3 w-3" />
              <span>+5.2% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            <PieChart className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> :
                `${(financial?.summary?.paymentSuccessRate || 0).toFixed(1)}%`}
            </div>
            <div className="flex items-center gap-1 text-xs text-indigo-600">
              <CheckCircle className="h-3 w-3" />
              <span>Payment success rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Organization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue by Organization
              </CardTitle>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Total revenue generated by each organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartType === 'bar' ? (
              <SimpleBarChart data={revenueByOrgData} />
            ) : (
              <SimplePieChart data={revenueByOrgData} />
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Revenue Trend
            </CardTitle>
            <CardDescription>
              Revenue growth over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={monthlyTrendData} />
          </CardContent>
        </Card>
      </div>

      {/* Organization Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Organization Financial Details
          </CardTitle>
          <CardDescription>
            Detailed financial metrics for each organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : financial?.byOrganization?.map((org, index) => (
              <div key={org.organization_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{org.organization_name}</h4>
                  <p className="text-sm text-gray-600">
                    {org.total_patients} patients • {org.active_subscriptions} subscriptions
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(org.total_revenue)}
                    </div>
                    <div className="text-xs text-gray-500">Total Revenue</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-orange-600">
                      {formatCurrency(org.pending_payments)}
                    </div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(org.paid_amount)}
                    </div>
                    <div className="text-xs text-gray-500">Paid</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPercentage(org.revenueGrowth)}
                      </div>
                      {org.revenueGrowth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Growth</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {org.payment_success_rate}%
                    </div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Status Overview
          </CardTitle>
          <CardDescription>
            Pending payments requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={paymentStatusData} />
        </CardContent>
      </Card>
    </div>
  );
}
