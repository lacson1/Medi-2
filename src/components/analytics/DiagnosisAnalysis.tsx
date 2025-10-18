// Diagnosis Analysis Component
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  Download
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { clinicalDataAggregator } from '@/utils/dataAggregation';
import styles from './DiagnosisAnalysis.module.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'];

// TypeScript interfaces
interface DiagnosisItem {
  diagnosis: string;
  count: number;
  percentage: number;
}

interface DiagnosisData {
  totalDiagnoses: number;
  distribution: DiagnosisItem[];
  demographics?: {
    ageGroups: Record<string, number>;
    genderDistribution: Record<string, number>;
  };
  trends?: Array<{
    month: string;
    diagnoses: DiagnosisItem[];
  }>;
}

interface Organization {
  id: string;
  name: string;
}

interface PieChartDataItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface BarChartDataItem {
  diagnosis: string;
  count: number;
  percentage: number;
}

interface DiagnosisTrend {
  month: string;
  diagnoses: DiagnosisItem[];
}

export default function DiagnosisAnalysis() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [organizationId, setOrganizationId] = useState('test-org-001-agent-mediflow');
  const [chartType, setChartType] = useState('pie');

  // Fetch diagnosis analysis data
  const { data: diagnosisData, isLoading, error, refetch } = useQuery<DiagnosisData>({
    queryKey: ['diagnosis-analysis', organizationId, dateRange],
    queryFn: () => clinicalDataAggregator.getDiagnosisAnalysis(organizationId, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch organizations for filter
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      // Mock implementation - Base44 integration removed
      console.warn('Mock organization list call - Base44 integration removed');
      const result = [];
      return result as Organization[];
    },
  });

  const handleRefresh = async () => {
    clinicalDataAggregator.clearCache();
    await refetch();
  };

  const exportChart = () => {
    console.log('Exporting diagnosis analysis chart...');
  };

  const formatPieChartData = (distribution: DiagnosisItem[]): PieChartDataItem[] => {
    if (!distribution) return [];

    return distribution.slice(0, 10).map((item: DiagnosisItem, index: number) => ({
      name: item.diagnosis,
      value: item.count,
      percentage: item.percentage,
      color: COLORS[index % COLORS.length] || '#3b82f6'
    }));
  };

  const formatBarChartData = (distribution: DiagnosisItem[]): BarChartDataItem[] => {
    if (!distribution) return [];

    return distribution.slice(0, 15).map((item: DiagnosisItem) => ({
      diagnosis: item.diagnosis.length > 15 ? item.diagnosis.substring(0, 15) + '...' : item.diagnosis,
      count: item.count,
      percentage: item.percentage
    }));
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Stethoscope className="h-5 w-5" />
            Error Loading Diagnosis Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={() => void handleRefresh()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pieChartData = formatPieChartData(diagnosisData?.distribution || []);
  const barChartData = formatBarChartData(diagnosisData?.distribution || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diagnosis Analysis</h2>
          <p className="text-gray-600">Diagnosis patterns and distribution analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportChart} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Chart
          </Button>
          <Button onClick={() => void handleRefresh()} variant="outline" size="sm" disabled={isLoading}>
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
                {organizations?.map((org: Organization) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
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
                <option value="pie">Pie Chart</option>
                <option value="bar">Bar Chart</option>
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
            <CardTitle className="text-sm font-medium">Total Diagnoses</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{diagnosisData?.totalDiagnoses || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Unique diagnoses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Diagnosis</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {diagnosisData?.distribution?.[0]?.diagnosis || 'N/A'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Most common
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Count</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {diagnosisData?.distribution?.[0]?.count || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Percentage</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {diagnosisData?.distribution?.[0]?.percentage ?
                  `${diagnosisData.distribution[0].percentage.toFixed(1)}%` : 'N/A'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Of total cases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {chartType === 'pie' ? <PieChart className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
            Diagnosis Distribution
          </CardTitle>
          <CardDescription>
            Distribution of diagnoses by frequency
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
                {chartType === 'pie' ? (
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, _name: string, props: any) => [
                      `${value} cases (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                      props.payload?.name || ''
                    ]} />
                  </RechartsPieChart>
                ) : (
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="diagnosis"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, _name: string, props: any) => [
                        `${value} cases (${props.payload?.percentage?.toFixed(1) || 0}%)`,
                        'Count'
                      ]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnosis List and Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Diagnoses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
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
                {diagnosisData?.distribution?.slice(0, 10).map((diagnosis: DiagnosisItem, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={styles.colorIndicator}
                        style={{ '--color': COLORS[index % COLORS.length] } as React.CSSProperties}
                      />
                      <span className="text-sm text-gray-600">{diagnosis.diagnosis}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{diagnosis.count} cases</Badge>
                      <span className="text-xs text-gray-500">{diagnosis.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                )) || (
                    <p className="text-gray-500 text-sm">No diagnosis data available</p>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demographics
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
              <div className="space-y-4">
                {/* Age Groups */}
                {diagnosisData?.demographics?.ageGroups && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Age Groups</h4>
                    <div className="space-y-2">
                      {Object.entries(diagnosisData.demographics.ageGroups).map(([age, percentage]: [string, number]) => (
                        <div key={age} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{age}</span>
                          <div className="flex items-center gap-2">
                            <div className={styles.progressBar}>
                              <div
                                className={`${styles.progressBarFill} ${styles.progressBarFillBlue}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gender Distribution */}
                {diagnosisData?.demographics?.genderDistribution && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Gender Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(diagnosisData.demographics.genderDistribution).map(([gender, percentage]: [string, number]) => (
                        <div key={gender} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{gender}</span>
                          <div className="flex items-center gap-2">
                            <div className={styles.progressBar}>
                              <div
                                className={`${styles.progressBarFill} ${styles.progressBarFillGreen}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trends Over Time */}
      {diagnosisData?.trends && diagnosisData.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Diagnosis Trends Over Time
            </CardTitle>
            <CardDescription>
              Top diagnoses by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnosisData.trends.map((trend: DiagnosisTrend, index: number) => (
                <div key={index} className={styles['trendCard']}>
                  <h4 className="font-semibold text-sm mb-2">{trend.month}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {trend.diagnoses.map((diagnosis: DiagnosisItem, diagIndex: number) => (
                      <div key={diagIndex} className="text-xs">
                        <span className="font-medium">{diagnosis.diagnosis}</span>
                        <span className="text-gray-500 ml-1">({diagnosis.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>{"Diagnosis Analysis Insights"}</CardTitle>
          <CardDescription>
            Key insights from the diagnosis analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`${styles['insightCard']} ${styles['insightCardBlue']}`}>
              <h4 className={styles['insightTitleBlue']}>Pattern Analysis</h4>
              <ul className={`${styles['insightListBlue']} space-y-1`}>
                <li className={styles['insightListItem']}>• Diagnosis patterns help identify common health issues</li>
                <li className={styles['insightListItem']}>• Demographic analysis reveals population health trends</li>
                <li className={styles['insightListItem']}>• Seasonal patterns may indicate environmental factors</li>
                <li className={styles['insightListItem']}>• Top diagnoses guide resource allocation and training needs</li>
              </ul>
            </div>

            <div className={`${styles['insightCard']} ${styles['insightCardGreen']}`}>
              <h4 className={styles['insightTitleGreen']}>Clinical Insights</h4>
              <ul className={`${styles['insightListGreen']} space-y-1`}>
                <li className={styles['insightListItem']}>• Monitor diagnosis trends for early detection of outbreaks</li>
                <li className={styles['insightListItem']}>• Use demographic data for targeted health interventions</li>
                <li className={styles['insightListItem']}>• Analyze patterns to improve diagnostic accuracy</li>
                <li className={styles['insightListItem']}>• Share insights with clinical teams for better patient care</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
