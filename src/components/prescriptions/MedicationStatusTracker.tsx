import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Pill, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Building2,
  FileText
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays } from "date-fns";
import PropTypes from "prop-types";

export default function MedicationStatusTracker({ prescriptions = [] }: any) {
  const [trackingData, setTrackingData] = useState({
    adherenceRate: 0,
    refillSchedule: [],
    upcomingExpirations: [],
    medicationHistory: [],
    statusAlerts: []
  });

  const calculateTrackingData = useCallback(() => {
    const today = new Date();
    
    // Calculate adherence rate (mock calculation)
    const adherenceRate = Math.floor(Math.random() * 20) + 80; // 80-100%
    
    // Generate refill schedule
    const refillSchedule = prescriptions
      .filter(rx => rx.status === 'active' && rx.refills > 0)
      .map(rx => {
        const startDate = parseISO(rx.start_date);
        const durationDays = parseInt(rx.duration_days) || 30;
        const nextRefillDate = addDays(startDate, durationDays);
        const daysUntilRefill = differenceInDays(nextRefillDate, today);
        
        return {
          ...rx,
          nextRefillDate,
          daysUntilRefill,
          urgency: daysUntilRefill <= 1 ? 'critical' : 
                  daysUntilRefill <= 3 ? 'urgent' : 
                  daysUntilRefill <= 7 ? 'soon' : 'upcoming'
        };
      })
      .filter(rx => rx.daysUntilRefill <= 14)
      .sort((a, b) => a.daysUntilRefill - b.daysUntilRefill);

    // Find upcoming expirations
    const upcomingExpirations = prescriptions
      .filter(rx => rx.end_date && rx.status === 'active')
      .map(rx => {
        const endDate = parseISO(rx.end_date);
        const daysUntilExpiry = differenceInDays(endDate, today);
        return {
          ...rx,
          daysUntilExpiry,
          isExpired: daysUntilExpiry < 0,
          isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry >= 0
        };
      })
      .filter(rx => rx.daysUntilExpiry <= 14)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    // Generate status alerts
    const statusAlerts = [];
    
    if (adherenceRate < 85) {
      statusAlerts.push({
        type: 'warning',
        message: `Patient adherence rate is ${adherenceRate}%. Consider follow-up.`,
        icon: AlertTriangle
      });
    }
    
    if (upcomingExpirations.some(rx => rx.isExpired)) {
      statusAlerts.push({
        type: 'error',
        message: `${upcomingExpirations.filter(rx => rx.isExpired).length} prescription(s) have expired.`,
        icon: AlertTriangle
      });
    }
    
    if (upcomingExpirations.some(rx => rx.isExpiringSoon)) {
      statusAlerts.push({
        type: 'warning',
        message: `${upcomingExpirations.filter(rx => rx.isExpiringSoon).length} prescription(s) expiring soon.`,
        icon: Clock
      });
    }

    setTrackingData({
      adherenceRate,
      refillSchedule,
      upcomingExpirations,
      medicationHistory: prescriptions.slice(0, 5), // Recent 5 prescriptions
      statusAlerts
    });
  }, [prescriptions]);

  useEffect(() => {
    calculateTrackingData();
  }, [calculateTrackingData]);

  const getUrgencyColor = (urgency: any) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'soon': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getAdherenceIcon = (rate: any) => {
    if (rate >= 90) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (rate >= 80) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold">Adherence Rate</h4>
            <div className="flex items-center justify-center gap-1 mt-1">
              {getAdherenceIcon(trackingData.adherenceRate)}
              <p className="text-2xl font-bold text-green-600">{trackingData.adherenceRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold">Refills Due</h4>
            <p className="text-2xl font-bold text-blue-600">{trackingData.refillSchedule.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold">Expiring Soon</h4>
            <p className="text-2xl font-bold text-orange-600">
              {trackingData.upcomingExpirations.filter(rx => rx.isExpiringSoon).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="font-semibold">Expired</h4>
            <p className="text-2xl font-bold text-red-600">
              {trackingData.upcomingExpirations.filter(rx => rx.isExpired).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Alerts */}
      {trackingData.statusAlerts.length > 0 && (
        <div className="space-y-2">
          {trackingData.statusAlerts.map((alert, index) => (
            <Alert key={index} className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
              <alert.icon className="h-4 w-4" />
              <AlertDescription className={alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'}>
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Refill Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Refill Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackingData.refillSchedule.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No refills scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trackingData.refillSchedule.map((rx: any) => (
                <Card key={rx.id} className={`border-2 ${getUrgencyColor(rx.urgency)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{rx.medication_name}</h4>
                          <p className="text-sm text-gray-600">{rx.dosage} • {rx.frequency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getUrgencyColor(rx.urgency)}>
                          {rx.urgency}
                        </Badge>
                        <p className="text-sm mt-1">
                          {rx.daysUntilRefill <= 0 ? 'Overdue' : `${rx.daysUntilRefill} days`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(rx.nextRefillDate, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiration Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Expiration Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackingData.upcomingExpirations.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No expirations in the next 14 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trackingData.upcomingExpirations.map((rx: any) => (
                <Card key={rx.id} className={`border-2 ${
                  rx.isExpired ? 'border-red-200 bg-red-50' : 
                  rx.isExpiringSoon ? 'border-orange-200 bg-orange-50' : 
                  'border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{rx.medication_name}</h4>
                          <p className="text-sm text-gray-600">{rx.dosage} • {rx.frequency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          rx.isExpired ? 'bg-red-100 text-red-800 border-red-200' :
                          rx.isExpiringSoon ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }>
                          {rx.isExpired ? 'Expired' : 
                           rx.isExpiringSoon ? 'Expiring Soon' : 
                           'Active'}
                        </Badge>
                        <p className="text-sm mt-1">
                          {rx.daysUntilExpiry < 0 ? `${Math.abs(rx.daysUntilExpiry)} days overdue` :
                           rx.daysUntilExpiry === 0 ? 'Expires today' :
                           `${rx.daysUntilExpiry} days remaining`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(rx.end_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medication Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Medication Flow Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescriptions.slice(0, 3).map((rx, index) => (
              <div key={rx.id} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rx.status === 'active' ? 'bg-green-100 text-green-600' :
                    rx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {rx.status === 'active' ? <CheckCircle className="w-4 h-4" /> :
                     rx.status === 'pending' ? <Clock className="w-4 h-4" /> :
                     <AlertTriangle className="w-4 h-4" />}
                  </div>
                  {index < prescriptions.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{rx.medication_name}</h4>
                      <p className="text-sm text-gray-600">{rx.dosage} • {rx.frequency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        rx.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                        rx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }>
                        {rx.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                          <Building2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Started: {format(parseISO(rx.start_date), "MMM d, yyyy")}</span>
                      {rx.end_date && (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          <span>Ends: {format(parseISO(rx.end_date), "MMM d, yyyy")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

MedicationStatusTracker.propTypes = {
  prescriptions: PropTypes.array.isRequired,
};
