import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pill,
  AlertTriangle,
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Bell,
  Activity,
  BarChart3,
  Users,
  FileText,
  Shield,
  RefreshCw
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays, isAfter, isBefore, subDays } from "date-fns";

export default function PrescriptionDashboard({ prescriptions = [], patients = [] }: any) {
  const [dashboardData, setDashboardData] = useState({
    totalPrescriptions: 0,
    activePrescriptions: 0,
    criticalAlerts: 0,
    adherenceRate: 0,
    refillsDue: 0,
    expiredPrescriptions: 0,
    newPrescriptions: 0,
    discontinuedPrescriptions: 0
  });

  const [adherenceTrends, setAdherenceTrends] = useState([]);
  const [topMedications, setTopMedications] = useState([]);
  const [alertSummary, setAlertSummary] = useState([]);
  const [refillSchedule, setRefillSchedule] = useState([]);

  useEffect(() => {
    if (prescriptions.length > 0) {
      calculateDashboardMetrics();
      generateAdherenceTrends();
      analyzeTopMedications();
      generateAlertSummary();
      generateRefillSchedule();
    }
  }, [prescriptions]);

  const calculateDashboardMetrics = () => {
    const today = new Date();
    const lastWeek = subDays(today, 7);

    const metrics = {
      totalPrescriptions: prescriptions.length,
      activePrescriptions: prescriptions.filter(rx => rx.status === 'active').length,
      criticalAlerts: 0, // Will be calculated based on adherence and interactions
      adherenceRate: 0,
      refillsDue: 0,
      expiredPrescriptions: prescriptions.filter(rx => {
        if (!rx.end_date) return false;
        return isBefore(parseISO(rx.end_date), today) && rx.status === 'active';
      }).length,
      newPrescriptions: prescriptions.filter(rx => {
        return isAfter(parseISO(rx.start_date), lastWeek);
      }).length,
      discontinuedPrescriptions: prescriptions.filter(rx => rx.status === 'discontinued').length
    };

    // Calculate adherence rate (mock data for demonstration)
    const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');
    if (activePrescriptions.length > 0) {
      const totalAdherence = activePrescriptions.reduce((sum: any, rx: any) => {
        // Mock adherence calculation
        return sum + (Math.random() * 0.4 + 0.6) * 100; // 60-100% adherence
      }, 0);
      metrics.adherenceRate = Math.round(totalAdherence / activePrescriptions.length);
    }

    // Calculate refills due
    metrics.refillsDue = prescriptions.filter(rx => {
      if (rx.status !== 'active' || !rx.refills || rx.refills <= 0) return false;
      const startDate = parseISO(rx.start_date);
      const durationDays = parseInt(rx.duration_days) || 30;
      const nextRefillDate = addDays(startDate, durationDays);
      return differenceInDays(nextRefillDate, today) <= 3 && differenceInDays(nextRefillDate, today) >= 0;
    }).length;

    // Calculate critical alerts
    metrics.criticalAlerts = prescriptions.filter(rx => {
      if (rx.status !== 'active') return false;
      // Mock critical alert conditions
      const adherenceRate = Math.random() * 100;
      return adherenceRate < 60; // Low adherence
    }).length;

    setDashboardData(metrics);
  };

  const generateAdherenceTrends = () => {
    const trends = [];
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));

    last30Days.reverse().forEach(date => {
      const dayPrescriptions = prescriptions.filter(rx => {
        const startDate = parseISO(rx.start_date);
        return isAfter(date, startDate) && (rx.status === 'active' || rx.status === 'completed');
      });

      if (dayPrescriptions.length > 0) {
        const avgAdherence = dayPrescriptions.reduce((sum: any, rx: any) => {
          return sum + (Math.random() * 0.4 + 0.6) * 100; // Mock adherence
        }, 0) / dayPrescriptions.length;

        trends.push({
          date: format(date, 'MMM dd'),
          adherence: Math.round(avgAdherence),
          prescriptions: dayPrescriptions.length
        });
      }
    });

    setAdherenceTrends(trends.slice(-7)); // Last 7 days
  };

  const analyzeTopMedications = () => {
    const medicationCount = {};

    prescriptions.forEach(rx => {
      const med = rx.medication_name;
      if (!medicationCount[med]) {
        medicationCount[med] = {
          name: med,
          count: 0,
          activeCount: 0,
          avgAdherence: 0
        };
      }
      medicationCount[med].count++;
      if (rx.status === 'active') {
        medicationCount[med].activeCount++;
        medicationCount[med].avgAdherence += Math.random() * 0.4 + 0.6; // Mock adherence
      }
    });

    const topMeds = Object.values(medicationCount)
      .map(med => ({
        ...med,
        avgAdherence: Math.round((med.avgAdherence / med.activeCount) * 100) || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopMedications(topMeds);
  };

  const generateAlertSummary = () => {
    const alerts = [];

    prescriptions.forEach(rx => {
      if (rx.status === 'active') {
        // Mock adherence-based alerts
        const adherenceRate = Math.random() * 100;

        if (adherenceRate < 60) {
          alerts.push({
            type: 'critical',
            medication: rx.medication_name,
            message: `Critical: Low adherence (${Math.round(adherenceRate)}%)`,
            patient: patients.find(p => p.id === rx.patient_id)?.name || 'Unknown Patient'
          });
        } else if (adherenceRate < 80) {
          alerts.push({
            type: 'warning',
            medication: rx.medication_name,
            message: `Warning: Moderate adherence (${Math.round(adherenceRate)}%)`,
            patient: patients.find(p => p.id === rx.patient_id)?.name || 'Unknown Patient'
          });
        }

        // Refill alerts
        const startDate = parseISO(rx.start_date);
        const durationDays = parseInt(rx.duration_days) || 30;
        const nextRefillDate = addDays(startDate, durationDays);
        const daysUntilRefill = differenceInDays(nextRefillDate, new Date());

        if (daysUntilRefill <= 3 && daysUntilRefill >= 0) {
          alerts.push({
            type: 'info',
            medication: rx.medication_name,
            message: `Refill due in ${daysUntilRefill} day(s)`,
            patient: patients.find(p => p.id === rx.patient_id)?.name || 'Unknown Patient'
          });
        }
      }
    });

    setAlertSummary(alerts);
  };

  const generateRefillSchedule = () => {
    const schedule = [];
    const today = new Date();

    prescriptions.forEach(rx => {
      if (rx.status === 'active' && rx.refills > 0) {
        const startDate = parseISO(rx.start_date);
        const durationDays = parseInt(rx.duration_days) || 30;
        const nextRefillDate = addDays(startDate, durationDays);
        const daysUntilRefill = differenceInDays(nextRefillDate, today);

        if (daysUntilRefill <= 7) {
          schedule.push({
            prescription: rx,
            refillDate: nextRefillDate,
            daysUntil: daysUntilRefill,
            patient: patients.find(p => p.id === rx.patient_id)?.name || 'Unknown Patient',
            urgency: daysUntilRefill <= 1 ? 'urgent' : daysUntilRefill <= 3 ? 'soon' : 'upcoming'
          });
        }
      }
    });

    schedule.sort((a, b) => a.daysUntil - b.daysUntil);
    setRefillSchedule(schedule);
  };

  const getUrgencyColor = (urgency: any) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'soon': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeColor = (type: any) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.totalPrescriptions}</p>
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
                <p className="text-2xl font-bold text-green-600">{dashboardData.activePrescriptions}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{dashboardData.criticalAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Adherence</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardData.adherenceRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refills Due</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardData.refillsDue}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{dashboardData.expiredPrescriptions}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Week</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.newPrescriptions}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discontinued</p>
                <p className="text-2xl font-bold text-gray-600">{dashboardData.discontinuedPrescriptions}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {alertSummary.filter(alert => alert.type === 'critical').length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Alerts - Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertSummary.filter(alert => alert.type === 'critical').map((alert, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{alert.message}</p>
                      <p className="text-sm mt-1">Patient: {alert.patient}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {alert.medication}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adherence">Adherence</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="refills">Refills</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Prescribed Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topMedications.map((med, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.activeCount} active prescriptions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{med.count} total</p>
                      <p className="text-xs text-gray-500">{med.avgAdherence}% adherence</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prescriptions.slice(0, 5).map((rx, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{rx.medication_name}</p>
                      <p className="text-sm text-gray-600">
                        {rx.prescribing_doctor} • {format(parseISO(rx.start_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className={rx.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                      {rx.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="adherence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Adherence Trends (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adherenceTrends.map((trend, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{trend.date}</span>
                    <div className="flex items-center gap-3">
                      <Progress value={trend.adherence} className="w-32 h-2" />
                      <span className="text-sm font-semibold w-12 text-right">{trend.adherence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                All Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertSummary.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No alerts at this time</p>
                </div>
              ) : (
                alertSummary.map((alert, index) => (
                  <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{alert.message}</p>
                          <p className="text-sm mt-1">Patient: {alert.patient}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getAlertTypeColor(alert.type)}>
                            {alert.type}
                          </Badge>
                          <Badge variant="outline">
                            {alert.medication}
                          </Badge>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Refill Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {refillSchedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No refills scheduled</p>
                </div>
              ) : (
                refillSchedule.map((refill, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{refill.prescription.medication_name}</h4>
                        <p className="text-sm text-gray-600">
                          Patient: {refill.patient}
                        </p>
                        <p className="text-sm text-gray-600">
                          Refill due: {format(refill.refillDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge className={getUrgencyColor(refill.urgency)}>
                        {refill.urgency === 'urgent' ? 'Due Today' :
                          refill.urgency === 'soon' ? 'Due Soon' : 'Upcoming'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        Contact Patient
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule Refill
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Prescription Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Active</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">{dashboardData.activePrescriptions}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">{prescriptions.filter(rx => rx.status === 'completed').length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Discontinued</span>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">{dashboardData.discontinuedPrescriptions}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">On Hold</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{prescriptions.filter(rx => rx.status === 'on_hold').length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Critical Alerts</span>
                  <Badge className="bg-red-100 text-red-800 border-red-200">{dashboardData.criticalAlerts}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Expired Prescriptions</span>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">{dashboardData.expiredPrescriptions}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Refills Due</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{dashboardData.refillsDue}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Adherence</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">{dashboardData.adherenceRate}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => {
          calculateDashboardMetrics();
          generateAdherenceTrends();
          analyzeTopMedications();
          generateAlertSummary();
          generateRefillSchedule();
        }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Dashboard
        </Button>
      </div>
    </div>
  );
}
