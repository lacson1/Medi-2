// Staff Performance Component
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Heart,
  Target,
  Award,
  BarChart3,
  Download,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { clinicalDataAggregator } from '@/utils/dataAggregation';
import { mockApiClient } from "@/api/mockApiClient";

export default function StaffPerformance() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [organizationId, setOrganizationId] = useState('test-org-001-agent-mediflow');
  const [sortBy, setSortBy] = useState('productivity');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch staff performance data
  const { data: staffData, isLoading, error, refetch } = useQuery({
    queryKey: ['staff-performance', organizationId, dateRange],
    queryFn: () => clinicalDataAggregator.getStaffPerformance(organizationId, dateRange),
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
    console.log('Exporting staff performance chart...');
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProductivityColor = (productivity: number) => {
    if (productivity >= 0.8) return 'text-green-600';
    if (productivity >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-600';
    if (rate >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Doctor': return 'bg-blue-100 text-blue-800';
      case 'Nurse': return 'bg-green-100 text-green-800';
      case 'Provider': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort staff data
  const filteredStaff = staffData?.filter((staff: any) =>
    roleFilter === 'all' || staff.role === roleFilter
  ) || [];

  const sortedStaff = [...filteredStaff].sort((a, b) => {
    switch (sortBy) {
      case 'productivity':
        return b.productivity - a.productivity;
      case 'satisfaction':
        return b.patientSatisfaction - a.patientSatisfaction;
      case 'appointments':
        return b.totalAppointments - a.totalAppointments;
      case 'success':
        return b.treatmentSuccessRate - a.treatmentSuccessRate;
      default:
        return 0;
    }
  });

  // Calculate summary statistics
  const totalStaff = filteredStaff.length;
  const avgSatisfaction = totalStaff > 0 ?
    filteredStaff.reduce((sum: any, staff: any) => sum + staff.patientSatisfaction, 0) / totalStaff : 0;
  const avgProductivity = totalStaff > 0 ?
    filteredStaff.reduce((sum: any, staff: any) => sum + staff.productivity, 0) / totalStaff : 0;
  const avgSuccessRate = totalStaff > 0 ?
    filteredStaff.reduce((sum: any, staff: any) => sum + staff.treatmentSuccessRate, 0) / totalStaff : 0;

  // Format chart data
  const chartData = sortedStaff.slice(0, 10).map(staff => ({
    name: staff.name.split(' ')[0], // First name only for chart
    fullName: staff.name,
    appointments: staff.totalAppointments,
    satisfaction: staff.patientSatisfaction,
    successRate: staff.treatmentSuccessRate * 100,
    productivity: staff.productivity * 100
  }));

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Users className="h-5 w-5" />
            Error Loading Staff Performance
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Performance</h2>
          <p className="text-gray-600">Individual staff performance metrics and analytics</p>
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
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Sorting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="staff-org-select" className="text-sm font-medium text-gray-700 mb-1 block">Organization</label>
              <select
                id="staff-org-select"
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
              <label htmlFor="staff-role-select" className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
              <select
                id="staff-role-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select role filter"
              >
                <option value="all">All Roles</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Provider">Provider</option>
              </select>
            </div>
            <div>
              <label htmlFor="staff-sort-select" className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
              <select
                id="staff-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select sort criteria"
              >
                <option value="productivity">Productivity</option>
                <option value="satisfaction">Satisfaction</option>
                <option value="appointments">Appointments</option>
                <option value="success">Success Rate</option>
              </select>
            </div>
            <div>
              <label htmlFor="staff-start-date" className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
              <input
                id="staff-start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select start date"
              />
            </div>
            <div>
              <label htmlFor="staff-end-date" className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <input
                id="staff-end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select end date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalStaff}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Active staff members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold ${getPerformanceColor(avgSatisfaction)}`}>
                {avgSatisfaction.toFixed(1)}/5.0
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Patient satisfaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Productivity</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold ${getProductivityColor(avgProductivity)}`}>
                {(avgProductivity * 100).toFixed(1)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Productivity score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold ${getSuccessRateColor(avgSuccessRate)}`}>
                {(avgSuccessRate * 100).toFixed(1)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Treatment success
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Staff Performance Comparison
          </CardTitle>
          <CardDescription>
            Top performing staff members by {sortBy}
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
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
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
                      if (name === 'productivity') return [`${value.toFixed(1)}%`, 'Productivity'];
                      return [value, name];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullName;
                      }
                      return label;
                    }}
                  />
                  <Bar dataKey="appointments" fill="#3b82f6" name="Appointments" />
                  <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction" />
                  <Bar dataKey="successRate" fill="#8b5cf6" name="Success Rate" />
                  <Bar dataKey="productivity" fill="#f59e0b" name="Productivity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Performance Details
          </CardTitle>
          <CardDescription>
            Detailed performance metrics for each staff member
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Staff Member</th>
                    <th className="text-left p-2 font-medium">Role</th>
                    <th className="text-left p-2 font-medium">Specialization</th>
                    <th className="text-left p-2 font-medium">Appointments</th>
                    <th className="text-left p-2 font-medium">Satisfaction</th>
                    <th className="text-left p-2 font-medium">Success Rate</th>
                    <th className="text-left p-2 font-medium">Productivity</th>
                    <th className="text-left p-2 font-medium">Avg Wait Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStaff.map((staff, index) => (
                    <tr key={staff.userId} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {staff.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium">{staff.name}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getRoleBadgeColor(staff.role)}>
                          {staff.role}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {staff.specialization || 'N/A'}
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div className="font-medium">{staff.totalAppointments}</div>
                          <div className="text-xs text-gray-500">
                            {staff.completedAppointments} completed
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className={`font-medium ${getPerformanceColor(staff.patientSatisfaction)}`}>
                          {staff.patientSatisfaction.toFixed(1)}/5.0
                        </div>
                      </td>
                      <td className="p-2">
                        <div className={`font-medium ${getSuccessRateColor(staff.treatmentSuccessRate)}`}>
                          {(staff.treatmentSuccessRate * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="p-2">
                        <div className={`font-medium ${getProductivityColor(staff.productivity)}`}>
                          {(staff.productivity * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {staff.avgWaitTime ? `${staff.avgWaitTime.toFixed(1)}m` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                {sortedStaff.slice(0, 3).map((staff, index) => (
                  <div key={staff.userId} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{staff.name}</span>
                    <Badge variant="outline">{staff.patientSatisfaction.toFixed(1)}/5.0</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Most Productive
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                {sortedStaff.slice(0, 3).map((staff, index) => (
                  <div key={staff.userId} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{staff.name}</span>
                    <Badge variant="outline">{(staff.productivity * 100).toFixed(1)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Highest Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                {sortedStaff.slice(0, 3).map((staff, index) => (
                  <div key={staff.userId} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{staff.name}</span>
                    <Badge variant="outline">{(staff.treatmentSuccessRate * 100).toFixed(1)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>{"Staff Performance Insights"}</CardTitle>
          <CardDescription>
            Key insights from staff performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Performance Analysis</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Staff performance metrics are calculated from real-time clinical data</li>
                <li>• Productivity scores combine appointment completion and encounter efficiency</li>
                <li>• Patient satisfaction reflects quality of care delivery</li>
                <li>• Success rates indicate clinical effectiveness and treatment outcomes</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Management Insights</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Identify top performers for recognition and mentoring opportunities</li>
                <li>• Support staff who may need additional training or resources</li>
                <li>• Use performance data for fair evaluation and development planning</li>
                <li>• Monitor trends to ensure consistent quality of care delivery</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
