import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Users,
  Pill,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { format, parseISO, subDays, startOfYear, isAfter, isBefore } from "date-fns";

export default function PrescriptionAnalytics({ prescriptions = [], patients = [] }: any) {
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeRange, setTimeRange] = useState('last_month');
  const [selectedMetric, setSelectedMetric] = useState('prescriptions');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    calculateAnalytics();
  }, [prescriptions, timeRange]);

  const calculateAnalytics = () => {
    const today = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'last_week':
        startDate = subDays(today, 7);
        endDate = today;
        break;
      case 'last_month':
        startDate = subDays(today, 30);
        endDate = today;
        break;
      case 'last_quarter':
        startDate = subDays(today, 90);
        endDate = today;
        break;
      case 'last_year':
        startDate = subDays(today, 365);
        endDate = today;
        break;
      case 'this_year':
        startDate = startOfYear(today);
        endDate = today;
        break;
      default:
        startDate = subDays(today, 30);
        endDate = today;
    }

    const filteredPrescriptions = prescriptions.filter(rx =>
      isAfter(parseISO(rx.start_date), startDate) && isBefore(parseISO(rx.start_date), endDate)
    );

    const analytics = {
      // Basic metrics
      totalPrescriptions: filteredPrescriptions.length,
      activePrescriptions: filteredPrescriptions.filter(rx => rx.status === 'active').length,
      completedPrescriptions: filteredPrescriptions.filter(rx => rx.status === 'completed').length,
      discontinuedPrescriptions: filteredPrescriptions.filter(rx => rx.status === 'discontinued').length,

      // Patient metrics
      uniquePatients: new Set(filteredPrescriptions.map(rx => rx.patient_id)).size,
      avgPrescriptionsPerPatient: filteredPrescriptions.length / Math.max(new Set(filteredPrescriptions.map(rx => rx.patient_id)).size, 1),

      // Medication metrics
      uniqueMedications: new Set(filteredPrescriptions.map(rx => rx.medication_name)).size,
      mostPrescribedMedication: getMostPrescribedMedication(filteredPrescriptions),
      leastPrescribedMedication: getLeastPrescribedMedication(filteredPrescriptions),

      // Adherence metrics (mock data)
      avgAdherenceRate: calculateAverageAdherence(filteredPrescriptions),
      lowAdherenceCount: filteredPrescriptions.filter(() => Math.random() < 0.2).length, // Mock 20% low adherence

      // Time-based metrics
      prescriptionsByMonth: getPrescriptionsByMonth(filteredPrescriptions),
      prescriptionsByDay: getPrescriptionsByDay(filteredPrescriptions),

      // Status distribution
      statusDistribution: getStatusDistribution(filteredPrescriptions),

      // Doctor metrics
      prescriptionsByDoctor: getPrescriptionsByDoctor(filteredPrescriptions),

      // Medication categories (mock)
      medicationCategories: getMedicationCategories(filteredPrescriptions),

      // Trends
      prescriptionTrend: calculatePrescriptionTrend(filteredPrescriptions),
      adherenceTrend: calculateAdherenceTrend(filteredPrescriptions)
    };

    setAnalyticsData(analytics);
    generateChartData(analytics);
  };

  const getMostPrescribedMedication = (prescriptions: any) => {
    const medicationCount = {};
    prescriptions.forEach(rx => {
      medicationCount[rx.medication_name] = (medicationCount[rx.medication_name] || 0) + 1;
    });

    const sorted = Object.entries(medicationCount).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : { name: 'None', count: 0 };
  };

  const getLeastPrescribedMedication = (prescriptions: any) => {
    const medicationCount = {};
    prescriptions.forEach(rx => {
      medicationCount[rx.medication_name] = (medicationCount[rx.medication_name] || 0) + 1;
    });

    const sorted = Object.entries(medicationCount).sort((a, b) => a[1] - b[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : { name: 'None', count: 0 };
  };

  const calculateAverageAdherence = (prescriptions: any) => {
    const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');
    if (activePrescriptions.length === 0) return 0;

    const totalAdherence = activePrescriptions.reduce((sum: any, rx: any) => {
      return sum + (Math.random() * 0.4 + 0.6) * 100; // Mock 60-100% adherence
    }, 0);

    return Math.round(totalAdherence / activePrescriptions.length);
  };

  const getPrescriptionsByMonth = (prescriptions: any) => {
    const monthCount = {};
    prescriptions.forEach(rx => {
      const month = format(parseISO(rx.start_date), 'MMM yyyy');
      monthCount[month] = (monthCount[month] || 0) + 1;
    });

    return Object.entries(monthCount).map(([month, count]: any) => ({ month, count }));
  };

  const getPrescriptionsByDay = (prescriptions: any) => {
    const dayCount = {};
    prescriptions.forEach(rx => {
      const day = format(parseISO(rx.start_date), 'EEE');
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    return Object.entries(dayCount).map(([day, count]: any) => ({ day, count }));
  };

  const getStatusDistribution = (prescriptions: any) => {
    const statusCount = {};
    prescriptions.forEach(rx => {
      statusCount[rx.status] = (statusCount[rx.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]: any) => ({ status, count }));
  };

  const getPrescriptionsByDoctor = (prescriptions: any) => {
    const doctorCount = {};
    prescriptions.forEach(rx => {
      const doctor = rx.prescribing_doctor || 'Unknown';
      doctorCount[doctor] = (doctorCount[doctor] || 0) + 1;
    });

    return Object.entries(doctorCount)
      .map(([doctor, count]: any) => ({ doctor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getMedicationCategories = (prescriptions: any) => {
    // Mock medication categories
    const categories = {
      'Antibiotics': prescriptions.filter(rx =>
        rx.medication_name.toLowerCase().includes('amoxicillin') ||
        rx.medication_name.toLowerCase().includes('penicillin') ||
        rx.medication_name.toLowerCase().includes('cephalexin')
      ).length,
      'Pain Management': prescriptions.filter(rx =>
        rx.medication_name.toLowerCase().includes('ibuprofen') ||
        rx.medication_name.toLowerCase().includes('acetaminophen') ||
        rx.medication_name.toLowerCase().includes('morphine')
      ).length,
      'Cardiovascular': prescriptions.filter(rx =>
        rx.medication_name.toLowerCase().includes('lisinopril') ||
        rx.medication_name.toLowerCase().includes('metoprolol') ||
        rx.medication_name.toLowerCase().includes('warfarin')
      ).length,
      'Diabetes': prescriptions.filter(rx =>
        rx.medication_name.toLowerCase().includes('metformin') ||
        rx.medication_name.toLowerCase().includes('insulin')
      ).length,
      'Other': prescriptions.length - Object.values({
        'Antibiotics': prescriptions.filter(rx =>
          rx.medication_name.toLowerCase().includes('amoxicillin') ||
          rx.medication_name.toLowerCase().includes('penicillin') ||
          rx.medication_name.toLowerCase().includes('cephalexin')
        ).length,
        'Pain Management': prescriptions.filter(rx =>
          rx.medication_name.toLowerCase().includes('ibuprofen') ||
          rx.medication_name.toLowerCase().includes('acetaminophen') ||
          rx.medication_name.toLowerCase().includes('morphine')
        ).length,
        'Cardiovascular': prescriptions.filter(rx =>
          rx.medication_name.toLowerCase().includes('lisinopril') ||
          rx.medication_name.toLowerCase().includes('metoprolol') ||
          rx.medication_name.toLowerCase().includes('warfarin')
        ).length,
        'Diabetes': prescriptions.filter(rx =>
          rx.medication_name.toLowerCase().includes('metformin') ||
          rx.medication_name.toLowerCase().includes('insulin')
        ).length
      }).reduce((sum: any, count: any) => sum + count, 0)
    };

    return Object.entries(categories).map(([category, count]: any) => ({ category, count }));
  };

  const calculatePrescriptionTrend = (prescriptions: any) => {
    // Mock trend calculation
    const currentPeriod = prescriptions.length;
    const previousPeriod = Math.floor(currentPeriod * (0.8 + Math.random() * 0.4)); // Mock previous period

    return {
      current: currentPeriod,
      previous: previousPeriod,
      change: currentPeriod - previousPeriod,
      changePercent: Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100)
    };
  };

  const calculateAdherenceTrend = (prescriptions: any) => {
    // Mock adherence trend
    const currentAdherence = calculateAverageAdherence(prescriptions);
    const previousAdherence = Math.max(0, currentAdherence + (Math.random() - 0.5) * 20);

    return {
      current: currentAdherence,
      previous: previousAdherence,
      change: currentAdherence - previousAdherence,
      changePercent: Math.round(((currentAdherence - previousAdherence) / previousAdherence) * 100)
    };
  };

  const generateChartData = (analytics: any) => {
    const charts = {
      prescriptions: analytics.prescriptionsByMonth,
      adherence: analytics.adherenceTrend,
      status: analytics.statusDistribution,
      medications: analytics.prescriptionsByDoctor.slice(0, 5),
      categories: analytics.medicationCategories
    };

    setChartData(charts);
  };

  const exportAnalytics = () => {
    const csvContent = [
      ['Metric', 'Value', 'Time Range'],
      ['Total Prescriptions', analyticsData.totalPrescriptions, timeRange],
      ['Active Prescriptions', analyticsData.activePrescriptions, timeRange],
      ['Completed Prescriptions', analyticsData.completedPrescriptions, timeRange],
      ['Discontinued Prescriptions', analyticsData.discontinuedPrescriptions, timeRange],
      ['Unique Patients', analyticsData.uniquePatients, timeRange],
      ['Unique Medications', analyticsData.uniqueMedications, timeRange],
      ['Average Adherence Rate', `${analyticsData.avgAdherenceRate}%`, timeRange],
      ['Most Prescribed Medication', analyticsData.mostPrescribedMedication.name, timeRange],
      ['Prescription Trend', `${analyticsData.prescriptionTrend.changePercent}%`, timeRange]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-analytics-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Prescription Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_quarter">Last Quarter</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescriptions">Prescriptions</SelectItem>
                  <SelectItem value="adherence">Adherence</SelectItem>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="medications">Medications</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={calculateAnalytics}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportAnalytics}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.totalPrescriptions}</p>
                <p className="text-xs text-gray-500">
                  {analyticsData.prescriptionTrend?.changePercent > 0 ? (
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{analyticsData.prescriptionTrend.changePercent}%
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {analyticsData.prescriptionTrend?.changePercent}%
                    </span>
                  )}
                </p>
              </div>
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.activePrescriptions}</p>
                <p className="text-xs text-gray-500">
                  {Math.round((analyticsData.activePrescriptions / Math.max(analyticsData.totalPrescriptions, 1)) * 100)}% of total
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Patients</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.uniquePatients}</p>
                <p className="text-xs text-gray-500">
                  Avg: {Math.round(analyticsData.avgPrescriptionsPerPatient * 10) / 10} per patient
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Adherence</p>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.avgAdherenceRate}%</p>
                <p className="text-xs text-gray-500">
                  {analyticsData.adherenceTrend?.changePercent > 0 ? (
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{analyticsData.adherenceTrend.changePercent}%
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {analyticsData.adherenceTrend?.changePercent}%
                    </span>
                  )}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.statusDistribution?.map((status: any) => (
                  <div key={status.status} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status.status === 'active' ? 'bg-green-500' :
                          status.status === 'completed' ? 'bg-blue-500' :
                            status.status === 'discontinued' ? 'bg-red-500' :
                              'bg-yellow-500'
                        }`} />
                      <span className="text-sm capitalize">{status.status}</span>
                    </div>
                    <span className="font-semibold">{status.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Medication Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.medicationCategories?.map((category: any) => (
                  <div key={category.category} className="flex justify-between items-center">
                    <span className="text-sm">{category.category}</span>
                    <span className="font-semibold">{category.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Prescription Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Period</span>
                    <span className="font-semibold">{analyticsData.prescriptionTrend?.current}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Previous Period</span>
                    <span className="font-semibold">{analyticsData.prescriptionTrend?.previous}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Change</span>
                    <span className={`font-semibold ${analyticsData.prescriptionTrend?.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {analyticsData.prescriptionTrend?.changePercent > 0 ? '+' : ''}{analyticsData.prescriptionTrend?.changePercent}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Adherence Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Rate</span>
                    <span className="font-semibold">{analyticsData.adherenceTrend?.current}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Previous Rate</span>
                    <span className="font-semibold">{analyticsData.adherenceTrend?.previous}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Change</span>
                    <span className={`font-semibold ${analyticsData.adherenceTrend?.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {analyticsData.adherenceTrend?.changePercent > 0 ? '+' : ''}{analyticsData.adherenceTrend?.changePercent}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Top Prescribed Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.prescriptionsByDoctor?.slice(0, 10).map((medication, index) => (
                <div key={medication.doctor} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-semibold">{medication.doctor}</span>
                  </div>
                  <span className="font-semibold">{medication.count} prescriptions</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Patient Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Patient Metrics</h4>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Patients</span>
                    <span className="font-semibold">{analyticsData.uniquePatients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Prescriptions per Patient</span>
                    <span className="font-semibold">{Math.round(analyticsData.avgPrescriptionsPerPatient * 10) / 10}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Most Prescribed Medication</span>
                    <span className="font-semibold">{analyticsData.mostPrescribedMedication?.name}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Adherence Insights</h4>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Adherence Rate</span>
                    <span className="font-semibold">{analyticsData.avgAdherenceRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Low Adherence Cases</span>
                    <span className="font-semibold text-red-600">{analyticsData.lowAdherenceCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Adherence Trend</span>
                    <span className={`font-semibold ${analyticsData.adherenceTrend?.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {analyticsData.adherenceTrend?.changePercent > 0 ? '+' : ''}{analyticsData.adherenceTrend?.changePercent}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Doctor Prescription Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.prescriptionsByDoctor?.map((doctor, index) => (
                <div key={doctor.doctor} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-semibold">{doctor.doctor}</span>
                  </div>
                  <span className="font-semibold">{doctor.count} prescriptions</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
