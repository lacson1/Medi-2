import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { mockSpecialtyConsultations, mockSpecialists } from '@/data/consultationData';

interface ConsultationAnalyticsProps {
  consultations?: any[];
  specialists?: any[];
}

export default function ConsultationAnalytics({
  consultations = mockSpecialtyConsultations,
  specialists = mockSpecialists
}: ConsultationAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    generateAnalytics();
  }, [selectedPeriod, consultations]);

  const generateAnalytics = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'daily':
        startDate = subDays(now, 7);
        break;
      case 'weekly':
        startDate = subWeeks(now, 4);
        break;
      case 'monthly':
        startDate = subMonths(now, 6);
        break;
      case 'yearly':
        startDate = subYears(now, 1);
        break;
      default:
        startDate = subMonths(now, 6);
    }

    const filteredConsultations = consultations.filter(consultation => {
      const consultationDate = new Date(consultation.consultation_date);
      return consultationDate >= startDate && consultationDate <= now;
    });

    // Calculate metrics
    const totalConsultations = filteredConsultations.length;
    const completedConsultations = filteredConsultations.filter(c => c.status === 'completed').length;
    const pendingConsultations = filteredConsultations.filter(c => c.status === 'pending').length;
    const cancelledConsultations = filteredConsultations.filter(c => c.status === 'cancelled').length;

    // Specialist utilization
    const specialistUtilization = {};
    specialists.forEach(specialist => {
      const specialistConsultations = filteredConsultations.filter(c => c.specialist_id === specialist.id);
      specialistUtilization[specialist.full_name] = specialistConsultations.length;
    });

    // Specialty distribution
    const specialtyDistribution = {};
    specialists.forEach(specialist => {
      const specialtyConsultations = filteredConsultations.filter(c => c.specialist_id === specialist.id);
      specialtyDistribution[specialist.specialty] = (specialtyDistribution[specialist.specialty] || 0) + specialtyConsultations.length;
    });

    // Calculate average duration (mock data)
    const averageDuration = Math.round(Math.random() * 60 + 30); // 30-90 minutes

    // Calculate patient satisfaction (mock data)
    const patientSatisfaction = Math.round(Math.random() * 20 + 80); // 80-100%

    setAnalyticsData({
      period: selectedPeriod,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      metrics: {
        total_consultations: totalConsultations,
        completed_consultations: completedConsultations,
        pending_consultations: pendingConsultations,
        cancelled_consultations: cancelledConsultations,
        average_duration: averageDuration,
        specialist_utilization: specialistUtilization,
        specialty_distribution: specialtyDistribution,
        patient_satisfaction: patientSatisfaction
      }
    });
  };

  const getCompletionRate = () => {
    if (!analyticsData || analyticsData.metrics.total_consultations === 0) return 0;
    return Math.round((analyticsData.metrics.completed_consultations / analyticsData.metrics.total_consultations) * 100);
  };

  const getCancellationRate = () => {
    if (!analyticsData || analyticsData.metrics.total_consultations === 0) return 0;
    return Math.round((analyticsData.metrics.cancelled_consultations / analyticsData.metrics.total_consultations) * 100);
  };

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultation Analytics</h2>
          <p className="text-gray-600">Comprehensive analysis of specialty consultations</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Last 7 Days</SelectItem>
            <SelectItem value="weekly">Last 4 Weeks</SelectItem>
            <SelectItem value="monthly">Last 6 Months</SelectItem>
            <SelectItem value="yearly">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.metrics.total_consultations}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.metrics.completed_consultations}</p>
                <p className="text-xs text-gray-500">{getCompletionRate()}% completion rate</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{analyticsData.metrics.pending_consultations}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.metrics.average_duration}m</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specialists">Specialists</TabsTrigger>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Consultation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{analyticsData.metrics.completed_consultations}</p>
                      <p className="text-xs text-gray-500">{getCompletionRate()}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">{analyticsData.metrics.pending_consultations}</p>
                      <p className="text-xs text-gray-500">
                        {analyticsData.metrics.total_consultations > 0 ?
                          Math.round((analyticsData.metrics.pending_consultations / analyticsData.metrics.total_consultations) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Cancelled</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{analyticsData.metrics.cancelled_consultations}</p>
                      <p className="text-xs text-gray-500">{getCancellationRate()}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Patient Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {analyticsData.metrics.patient_satisfaction}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Duration</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{analyticsData.metrics.average_duration} minutes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">{getCompletionRate()}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specialists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Specialist Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.metrics.specialist_utilization)
                  .sort(([, a], [, b]) => b - a)
                  .map(([specialist, count]) => (
                    <div key={specialist} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{specialist}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${analyticsData.metrics.total_consultations > 0 ?
                                (count / analyticsData.metrics.total_consultations) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Specialty Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.metrics.specialty_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([specialty, count]) => (
                    <div key={specialty} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{specialty}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${analyticsData.metrics.total_consultations > 0 ?
                                (count / analyticsData.metrics.total_consultations) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Consultation Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LineChart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Trend analysis will be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">This section will show consultation trends over time</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
