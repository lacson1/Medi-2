// Performance Trends Component
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  BarChart3,
  LineChart,
  Download
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { clinicalDataAggregator } from '@/utils/dataAggregation';
import { mockApiClient } from "@/api/mockApiClient";

export default function PerformanceTrends() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [organizationId, setOrganizationId] = useState('test-org-001-agent-mediflow');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [chartType, setChartType] = useState('line');

  // Fetch performance trends data
  const { data: trends, isLoading, error, refetch } = useQuery({
    queryKey: ['performance-trends', organizationId, selectedPeriod],
    queryFn: () => clinicalDataAggregator.getPerformanceTrends(organizationId, selectedPeriod),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch organizations for filter
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => mockApiClient.entities.Organization.list(),
  });

  const handleRefresh = () => {
    clinicalDataAggregator.clearCache();
    refetch();
  };

  const exportChart = () => {
    // This would export the chart as an image
    console.log('Exporting chart...');
  };

  const formatChartData = (trends: any[]) => {
    if (!trends) return [];

    return trends.map((trend: any) => ({
      period: trend.period,
      encounters: trend.encounters?.length || 0,
      avgWaitTime: trend.avgWaitTime || 0,
      satisfaction: trend.satisfaction || 0,
      successRate: trend.successRate ? trend.successRate * 100 : 0
    }));
  };

  const calculateTrend = (data: any[], field) => {
    if (!data || data.length < 2) return 0;

    const first = data[0][field];
    const last = data[data.length - 1][field];

    if (first === 0) return 0;
    return ((last - first) / first) * 100;
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            Error Loading Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatChartData(trends);
  const encountersTrend = calculateTrend(chartData, 'encounters');
  const satisfactionTrend = calculateTrend(chartData, 'satisfaction');
  const successRateTrend = calculateTrend(chartData, 'successRate');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Trends</h2>
          <p className="text-gray-600">Clinical performance trends over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportChart} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Chart
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="organization-select" className="text-sm font-medium text-gray-700 mb-1 block">Organization</label>
              <select
                id="organization-select"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select organization"
              >
                {organizations?.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="period-select" className="text-sm font-medium text-gray-700 mb-1 block">Period</label>
              <select
                id="period-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select time period"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
            <div>
              <label htmlFor="chart-type-select" className="text-sm font-medium text-gray-700 mb-1 block">Chart Type</label>
              <select
                id="chart-type-select"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select chart type"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  id="start-date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-xs"
                  aria-label="Start date"
                />
                <input
                  type="date"
                  id="end-date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-xs"
                  aria-label="End date"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encounters Trend</CardTitle>
            {encountersTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${encountersTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {encountersTrend >= 0 ? '+' : ''}{encountersTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Trend</CardTitle>
            {satisfactionTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${satisfactionTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {satisfactionTrend >= 0 ? '+' : ''}{satisfactionTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate Trend</CardTitle>
            {successRateTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${successRateTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {successRateTrend >= 0 ? '+' : ''}{successRateTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {chartType === 'line' ? <LineChart className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
            Performance Trends Chart
          </CardTitle>
          <CardDescription>
            Clinical performance metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'satisfaction') return [`${value.toFixed(1)}/5.0`, 'Satisfaction'];
                        if (name === 'successRate') return [`${value.toFixed(1)}%`, 'Success Rate'];
                        if (name === 'avgWaitTime') return [`${value.toFixed(1)} min`, 'Avg Wait Time'];
                        return [value, name];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="encounters"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Encounters"
                    />
                    <Line
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Satisfaction"
                    />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Success Rate"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgWaitTime"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Avg Wait Time"
                    />
                  </RechartsLineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'satisfaction') return [`${value.toFixed(1)}/5.0`, 'Satisfaction'];
                        if (name === 'successRate') return [`${value.toFixed(1)}%`, 'Success Rate'];
                        if (name === 'avgWaitTime') return [`${value.toFixed(1)} min`, 'Avg Wait Time'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="encounters" fill="#3b82f6" name="Encounters" />
                    <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction" />
                    <Bar dataKey="successRate" fill="#8b5cf6" name="Success Rate" />
                    <Bar dataKey="avgWaitTime" fill="#f59e0b" name="Avg Wait Time" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encounters Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Encounters Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                {chartData.map((data, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{data.period}</span>
                    <span className="font-semibold">{data.encounters} encounters</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Periods</span>
                  <span className="font-semibold">{chartData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Encounters/Period</span>
                  <span className="font-semibold">
                    {chartData.length > 0 ? (chartData.reduce((sum: any, d: any) => sum + d.encounters, 0) / chartData.length).toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Satisfaction</span>
                  <span className="font-semibold">
                    {chartData.length > 0 ? (chartData.reduce((sum: any, d: any) => sum + d.satisfaction, 0) / chartData.length).toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Success Rate</span>
                  <span className="font-semibold">
                    {chartData.length > 0 ? (chartData.reduce((sum: any, d: any) => sum + d.successRate, 0) / chartData.length).toFixed(1) : 'N/A'}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>{"Trend Analysis Insights"}</CardTitle>
          <CardDescription>
            Key insights from the performance trends data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Trend Analysis</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Performance trends are calculated from real-time clinical data</li>
                <li>• Positive trends indicate improving clinical performance</li>
                <li>• Negative trends may require attention and intervention</li>
                <li>• Trends help identify patterns and seasonal variations</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Monitor trends regularly to identify performance patterns</li>
                <li>• Investigate significant changes in metrics</li>
                <li>• Use trend data for capacity planning and resource allocation</li>
                <li>• Share trend insights with clinical teams for continuous improvement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
