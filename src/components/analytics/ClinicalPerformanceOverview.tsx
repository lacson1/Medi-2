// Clinical Performance Overview Component
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  Users,
  Clock,
  TrendingUp,
  Heart,
  Stethoscope,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { clinicalDataAggregator } from '@/utils/dataAggregation.js';
import { mockApiClient } from "@/api/mockApiClient";

export default function ClinicalPerformanceOverview() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [organizationId, setOrganizationId] = useState('test-org-001-agent-mediflow');

  // Fetch clinical overview data
  const { data: overview, isLoading, error, refetch } = useQuery({
    queryKey: ['clinical-overview', organizationId, dateRange],
    queryFn: () => clinicalDataAggregator.getClinicalOverview(organizationId, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
    enabled: isDateRangeValid, // Only fetch when date range is valid
    onError: (error) => {
      console.error('Failed to fetch clinical overview:', error);
    }
  });

  // Fetch organizations for filter
  const { data: organizations, isLoading: orgLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => mockApiClient.entities.Organization.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Failed to fetch organizations:', error);
    }
  });

  const handleRefresh = () => {
    clinicalDataAggregator.clearCache();
    refetch();
  };

  const validateDateRange = (start: string, end: string) => {
    if (!start || !end) return true;
    return new Date(start) <= new Date(end);
  };

  const isDateRangeValid = validateDateRange(dateRange.start, dateRange.end);

  const getSatisfactionColor = (score: number) => {
    if (!score || score === 0) return 'text-gray-500';
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateColor = (rate: number) => {
    if (!rate || rate === 0) return 'text-gray-500';
    if (rate >= 0.9) return 'text-green-600';
    if (rate >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Activity className="h-5 w-5" />
            Error Loading Clinical Overview
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
          <h2 className="text-2xl font-bold text-gray-900">Clinical Performance Overview</h2>
          <p className="text-gray-600">Key performance indicators and clinical metrics</p>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="organization-select" className="text-sm font-medium text-gray-700 mb-1 block">Organization</label>
              <select
                id="organization-select"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select organization"
                disabled={orgLoading}
              >
                {orgLoading ? (
                  <option value="">Loading organizations...</option>
                ) : organizations?.length > 0 ? (
                  organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))
                ) : (
                  <option value="">No organizations available</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                aria-label="Select start date"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className={`w-full p-2 border rounded-md ${!isDateRangeValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                aria-label="Select end date"
              />
              {!isDateRangeValid && (
                <p className="text-xs text-red-600 mt-1">End date must be after start date</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Range Validation Warning */}
      {!isDateRangeValid && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <Activity className="h-5 w-5" />
              <p className="font-medium">Invalid Date Range</p>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Please ensure the end date is after the start date to view accurate metrics.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Cards */}
      {!isDateRangeValid ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <Calendar className="h-5 w-5" />
              <p className="font-medium">Data Loading Disabled</p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Please correct the date range above to view clinical performance metrics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Encounters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Encounters</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{overview?.totalEncounters || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Clinical visits
              </p>
              {overview?.totalEncounters === 0 && !isLoading && (
                <p className="text-xs text-yellow-600 mt-1">No encounters found for selected period</p>
              )}
            </CardContent>
          </Card>

          {/* Average Wait Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {overview?.avgWaitTime ? `${overview.avgWaitTime.toFixed(1)}m` : 'N/A'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Minutes
              </p>
            </CardContent>
          </Card>

          {/* Patient Satisfaction */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className={`text-2xl font-bold ${getSatisfactionColor(overview?.patientSatisfaction)}`}>
                  {overview?.patientSatisfaction ? `${overview.patientSatisfaction.toFixed(1)}/5.0` : 'N/A'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Out of 5.0
              </p>
            </CardContent>
          </Card>

          {/* Treatment Success Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className={`text-2xl font-bold ${getSuccessRateColor(overview?.treatmentSuccessRate)}`}>
                  {overview?.treatmentSuccessRate ? `${(overview.treatmentSuccessRate * 100).toFixed(1)}%` : 'N/A'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Treatment success
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Metrics */}
      {isDateRangeValid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient Statistics
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
                    <span className="text-sm text-gray-600">Total Patients</span>
                    <span className="font-semibold">{overview?.totalPatients || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Appointments</span>
                    <span className="font-semibold">{overview?.totalAppointments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Encounters per Patient</span>
                    <span className="font-semibold">
                      {overview?.totalPatients > 0 ? (overview.totalEncounters / overview.totalPatients).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Diagnoses
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
                  {overview?.topDiagnoses && overview.topDiagnoses.length > 0 ? (
                    overview.topDiagnoses.slice(0, 5).map((diagnosis, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{diagnosis.diagnosis}</span>
                        <Badge variant="secondary">{diagnosis.count} cases</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No diagnosis data available for the selected period</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Summary */}
      {isDateRangeValid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Summary
            </CardTitle>
            <CardDescription>
              Overall clinical performance assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {overview?.totalEncounters || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Encounters</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {overview?.patientSatisfaction ? `${overview.patientSatisfaction.toFixed(1)}` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Satisfaction Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {overview?.treatmentSuccessRate ? `${(overview.treatmentSuccessRate * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Insights</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Clinical performance metrics are based on real-time data aggregation</li>
                    <li>• Patient satisfaction scores reflect quality of care delivery</li>
                    <li>• Treatment success rates indicate clinical effectiveness</li>
                    <li>• Wait times impact patient experience and operational efficiency</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
