import React, { useState, useEffect, useCallback } from 'react';
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
  BarChart3
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays, isAfter, isBefore } from "date-fns";

export default function PrescriptionMonitoring({ prescriptions, patient }: any) {
  const [adherenceData, setAdherenceData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [refillAlerts, setRefillAlerts] = useState([]);
  const [expirationAlerts, setExpirationAlerts] = useState([]);

  const calculateAdherence = useCallback(() => {
    const adherence = {};

    prescriptions.forEach(rx => {
      if (rx.status === 'active') {
        const startDate = parseISO(rx.start_date);
        const endDate = rx.end_date ? parseISO(rx.end_date) : addDays(startDate, parseInt(rx.duration_days) || 30);
        const today = new Date();

        // Calculate expected vs actual adherence (mock data for demonstration)
        const totalDays = differenceInDays(endDate, startDate);
        const daysPassed = Math.min(differenceInDays(today, startDate), totalDays);

        // Mock adherence calculation (in real implementation, this would come from patient reporting or pharmacy data)
        const adherenceRate = Math.random() * 0.4 + 0.6; // 60-100% adherence
        const missedDoses = Math.floor(daysPassed * (1 - adherenceRate));

        adherence[rx.id] = {
          adherenceRate: Math.round(adherenceRate * 100),
          missedDoses,
          daysPassed,
          totalDays,
          lastTaken: addDays(today, -Math.floor(Math.random() * 3)), // Mock last taken date
          nextDue: addDays(today, Math.floor(Math.random() * 2) + 1) // Mock next due date
        };
      }
    });

    setAdherenceData(adherence);
  }, [prescriptions]);

  const generateAlerts = useCallback(() => {
    const newAlerts = [];

    prescriptions.forEach(rx => {
      if (rx.status === 'active') {
        const adherence = adherenceData[rx.id];

        // Low adherence alert
        if (adherence && adherence.adherenceRate < 80) {
          newAlerts.push({
            type: 'warning',
            severity: adherence.adherenceRate < 60 ? 'high' : 'medium',
            prescription: rx,
            message: `Low adherence: ${adherence.adherenceRate}% for ${rx.medication_name}`,
            action: 'Contact patient to discuss medication adherence'
          });
        }

        // Missed doses alert
        if (adherence && adherence.missedDoses > 3) {
          newAlerts.push({
            type: 'critical',
            severity: 'high',
            prescription: rx,
            message: `${adherence.missedDoses} missed doses for ${rx.medication_name}`,
            action: 'Urgent follow-up required'
          });
        }

        // Side effects monitoring
        if (rx.side_effects_to_watch) {
          newAlerts.push({
            type: 'info',
            severity: 'low',
            prescription: rx,
            message: `Monitor for: ${rx.side_effects_to_watch}`,
            action: 'Regular patient check-ins recommended'
          });
        }

        // Lab monitoring alerts
        if (rx.lab_monitoring) {
          newAlerts.push({
            type: 'info',
            severity: 'medium',
            prescription: rx,
            message: `Lab monitoring required: ${rx.lab_monitoring}`,
            action: 'Schedule lab work'
          });
        }
      }
    });

    setAlerts(newAlerts);
  }, [prescriptions, adherenceData]);

  const checkExpirationDates = useCallback(() => {
    const expirationAlerts = [];
    const today = new Date();

    prescriptions.forEach(rx => {
      if (rx.status === 'active' && rx.end_date) {
        const endDate = parseISO(rx.end_date);
        const daysUntilExpiry = differenceInDays(endDate, today);

        // Check if prescription is expiring soon or has expired
        if (daysUntilExpiry <= 7) {
          const urgency = daysUntilExpiry < 0 ? 'expired' :
            daysUntilExpiry <= 1 ? 'critical' :
              daysUntilExpiry <= 3 ? 'urgent' : 'soon';

          expirationAlerts.push({
            prescription: rx,
            endDate: endDate,
            daysUntilExpiry: daysUntilExpiry,
            urgency: urgency,
            isExpired: daysUntilExpiry < 0,
            isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry >= 0
          });
        }
      }
    });

    // Sort by urgency (expired first, then by days until expiry)
    expirationAlerts.sort((a, b) => {
      if (a.isExpired && !b.isExpired) return -1;
      if (!a.isExpired && b.isExpired) return 1;
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });

    setExpirationAlerts(expirationAlerts);
  }, [prescriptions]);

  const checkRefillNeeds = useCallback(() => {
    const refillAlerts = [];

    prescriptions.forEach(rx => {
      if (rx.status === 'active' && rx.refills > 0) {
        const startDate = parseISO(rx.start_date);
        const durationDays = parseInt(rx.duration_days) || 30;
        const nextRefillDate = addDays(startDate, durationDays);
        const today = new Date();

        // Check if refill is needed soon (within 3 days)
        if (differenceInDays(nextRefillDate, today) <= 3 && differenceInDays(nextRefillDate, today) >= 0) {
          refillAlerts.push({
            prescription: rx,
            refillDate: nextRefillDate,
            urgency: differenceInDays(nextRefillDate, today) === 0 ? 'urgent' : 'soon'
          });
        }
      }
    });

    setRefillAlerts(refillAlerts);
  }, [prescriptions]);

  useEffect(() => {
    if (prescriptions) {
      calculateAdherence();
      generateAlerts();
      checkRefillNeeds();
      checkExpirationDates();
    }
  }, [prescriptions, calculateAdherence, generateAlerts, checkRefillNeeds, checkExpirationDates]);

  const getSeverityColor = (severity: any) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');
  const criticalAlerts = alerts.filter(alert => alert.severity === 'high');
  const warningAlerts = alerts.filter(alert => alert.severity === 'medium');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                <p className="text-2xl font-bold text-blue-600">{activePrescriptions.length}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refills Due</p>
                <p className="text-2xl font-bold text-orange-600">{refillAlerts.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Adherence</p>
                <p className="text-2xl font-bold text-green-600">
                  {activePrescriptions.length > 0
                    ? Math.round(activePrescriptions.reduce((sum: any, rx: any) => sum + (adherenceData[rx.id]?.adherenceRate || 0), 0) / activePrescriptions.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Alerts - Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalAlerts.map((alert, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{alert.message}</p>
                      <p className="text-sm mt-1">{alert.action}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {alert.prescription.medication_name}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Monitoring Tabs */}
      <Tabs defaultValue="adherence" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="adherence">Adherence</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="refills">Refills</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="adherence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Medication Adherence Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activePrescriptions.map(rx => {
                const adherence = adherenceData[rx.id];
                if (!adherence) return null;

                return (
                  <div key={rx.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{rx.medication_name}</h4>
                        <p className="text-sm text-gray-600">{rx.dosage} {rx.dosage_unit} • {rx.frequency} {rx.frequency_unit}</p>
                      </div>
                      <Badge className={getSeverityColor(adherence.adherenceRate >= 90 ? 'low' : adherence.adherenceRate >= 80 ? 'medium' : 'high')}>
                        {adherence.adherenceRate}% Adherence
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Adherence Rate</span>
                        <span className={getAdherenceColor(adherence.adherenceRate)}>{adherence.adherenceRate}%</span>
                      </div>
                      <Progress value={adherence.adherenceRate} className="h-2" />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Missed Doses:</span>
                          <span className="ml-2 font-semibold">{adherence.missedDoses}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Days Passed:</span>
                          <span className="ml-2 font-semibold">{adherence.daysPassed}/{adherence.totalDays}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Last Taken: {format(adherence.lastTaken, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>Next Due: {format(adherence.nextDue, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                All Monitoring Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No alerts at this time</p>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{alert.message}</p>
                          <p className="text-sm mt-1">{alert.action}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">
                            {alert.prescription.medication_name}
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
                <Calendar className="w-5 h-5" />
                Refill Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {refillAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No refills needed at this time</p>
                </div>
              ) : (
                refillAlerts.map((refill, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{refill.prescription.medication_name}</h4>
                        <p className="text-sm text-gray-600">
                          Refill due: {format(refill.refillDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge className={refill.urgency === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-orange-100 text-orange-800 border-orange-200'}>
                        {refill.urgency === 'urgent' ? 'Due Today' : 'Due Soon'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        Contact Pharmacy
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Prescription Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Adherence Trends</h4>
                  <div className="space-y-2">
                    {activePrescriptions.map(rx => {
                      const adherence = adherenceData[rx.id];
                      if (!adherence) return null;

                      return (
                        <div key={rx.id} className="flex justify-between items-center">
                          <span className="text-sm">{rx.medication_name}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={adherence.adherenceRate} className="w-20 h-2" />
                            <span className="text-sm font-semibold">{adherence.adherenceRate}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Alert Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Critical Alerts</span>
                      <Badge className="bg-red-100 text-red-800 border-red-200">{criticalAlerts.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Warning Alerts</span>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{warningAlerts.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Info Alerts</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{alerts.filter(a => a.severity === 'low').length}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
