import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { LabResult } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, differenceInDays, isAfter, isBefore, subDays, subMonths } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const DATE_RANGES = {
  '7d': { label: 'Last 7 Days', days: 7 },
  '30d': { label: 'Last 30 Days', days: 30 },
  '90d': { label: 'Last 90 Days', days: 90 },
  '1y': { label: 'Last Year', days: 365 },
  'custom': { label: 'Custom Range', days: null }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function LabAnalytics({ labOrders = [] }: any) {
  const [dateRange, setDateRange] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch lab results for analytics
  const { data: labResults = [], isLoading: loadingResults } = useQuery({
    queryKey: ['labResults'],
    queryFn: () => LabResult.list(),
  });

  // Calculate date range
  const getDateRange = () => {
    if (dateRange === 'custom') {
      return {
        start: parseISO(customStartDate),
        end: parseISO(customEndDate)
      };
    }
    
    const days = DATE_RANGES[dateRange].days;
    return {
      start: subDays(new Date(), days),
      end: new Date()
    };
  };

  // Filter data based on date range and category
  const filteredData = useMemo(() => {
    const { start, end } = getDateRange();
    
    let filteredOrders = labOrders.filter(order => {
      const orderDate = parseISO(order.date_ordered);
      return isAfter(orderDate, start) && isBefore(orderDate, end);
    });

    if (categoryFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.category === categoryFilter);
    }

    return filteredOrders;
  }, [labOrders, dateRange, customStartDate, customEndDate, categoryFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalOrders = filteredData.length;
    const completedOrders = filteredData.filter(order => order.status === 'completed').length;
    const pendingOrders = filteredData.filter(order => order.status === 'pending').length;
    const urgentOrders = filteredData.filter(order => order.priority === 'urgent').length;
    const statOrders = filteredData.filter(order => order.priority === 'stat').length;

    // Calculate average turnaround time (mock calculation)
    const avgTurnaroundTime = totalOrders > 0 ? Math.round(Math.random() * 4 + 2) : 0;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      urgentOrders,
      statOrders,
      avgTurnaroundTime,
      completionRate
    };
  }, [filteredData]);

  // Generate test type breakdown
  const testTypeBreakdown = useMemo(() => {
    const breakdown = {};
    filteredData.forEach(order => {
      const testType = order.test_name?.split(' ')[0] || 'Other';
      breakdown[testType] = (breakdown[testType] || 0) + 1;
    });
    
    return Object.entries(breakdown).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [filteredData]);

  // Generate daily trends
  const dailyTrends = useMemo(() => {
    const { start, end } = getDateRange();
    const trends = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const ordersOnDate = filteredData.filter(order => 
        format(parseISO(order.date_ordered), 'yyyy-MM-dd') === dateStr
      );
      
      trends.push({
        date: format(currentDate, 'MMM dd'),
        orders: ordersOnDate.length,
        completed: ordersOnDate.filter(order => order.status === 'completed').length,
        pending: ordersOnDate.filter(order => order.status === 'pending').length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return trends;
  }, [filteredData, dateRange, customStartDate, customEndDate]);

  // Generate priority distribution
  const priorityDistribution = useMemo(() => {
    const distribution = {
      routine: 0,
      urgent: 0,
      stat: 0
    };
    
    filteredData.forEach(order => {
      const priority = order.priority || 'routine';
      distribution[priority] = (distribution[priority] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [filteredData]);

  const exportAnalytics = () => {
    const data = {
      dateRange: DATE_RANGES[dateRange].label,
      metrics,
      testTypeBreakdown,
      dailyTrends,
      priorityDistribution,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadingResults) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Lab Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{"Date Range"}</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DATE_RANGES).map(([key, range]) => (
                    <SelectItem key={key} value={key}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <Label>{"Start Date"}</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{"End Date"}</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Label>{"Category Filter"}</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="hematology">Hematology</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="microbiology">Microbiology</SelectItem>
                  <SelectItem value="immunology">Immunology</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={exportAnalytics} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Turnaround</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgTurnaroundTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent Orders</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.urgentOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Daily Order Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Test Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Test Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={testTypeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {testTypeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
