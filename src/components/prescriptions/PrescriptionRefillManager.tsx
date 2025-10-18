import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Phone,
  Mail,
  MessageSquare,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Bell,
  FileText,
  User
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays, isAfter, isBefore } from "date-fns";

export default function PrescriptionRefillManager({ prescriptions = [], patients = [] }: any) {
  const [refillSchedule, setRefillSchedule] = useState([]);
  const [refillHistory, setRefillHistory] = useState([]);
  const [refillSettings, setRefillSettings] = useState({
    autoReminderDays: 7,
    criticalAlertDays: 3,
    maxRefills: 5,
    reminderMethod: 'email'
  });
  const [selectedRefill, setSelectedRefill] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    generateRefillSchedule();
    generateRefillHistory();
  }, [prescriptions]);

  const generateRefillSchedule = () => {
    const schedule = [];
    const today = new Date();
    
    prescriptions.forEach(rx => {
      if (rx.status === 'active' && rx.refills > 0) {
        const startDate = parseISO(rx.start_date);
        const durationDays = parseInt(rx.duration_days) || 30;
        const nextRefillDate = addDays(startDate, durationDays);
        const daysUntilRefill = differenceInDays(nextRefillDate, today);
        
        if (daysUntilRefill <= 14) { // Show refills due within 2 weeks
          const patient = patients.find(p => p.id === rx.patient_id);
          
          schedule.push({
            id: `refill-${rx.id}`,
            prescription: rx,
            patient: patient,
            refillDate: nextRefillDate,
            daysUntil: daysUntilRefill,
            urgency: daysUntilRefill <= 1 ? 'critical' : 
                    daysUntilRefill <= 3 ? 'urgent' : 
                    daysUntilRefill <= 7 ? 'soon' : 'upcoming',
            status: 'pending',
            reminderSent: false,
            lastContact: null,
            notes: ''
          });
        }
      }
    });

    schedule.sort((a, b) => a.daysUntil - b.daysUntil);
    setRefillSchedule(schedule);
  };

  const generateRefillHistory = () => {
    // Mock refill history data
    const history = [
      {
        id: 'hist-1',
        prescription: prescriptions[0],
        patient: patients[0],
        refillDate: addDays(new Date(), -5),
        status: 'completed',
        method: 'phone',
        notes: 'Patient confirmed refill needed'
      },
      {
        id: 'hist-2',
        prescription: prescriptions[1],
        patient: patients[1],
        refillDate: addDays(new Date(), -10),
        status: 'cancelled',
        method: 'email',
        notes: 'Patient no longer needs medication'
      }
    ];
    
    setRefillHistory(history);
  };

  const handleRefillAction = async (refillId, action) => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (action === 'contact') {
      setRefillSchedule(prev => prev.map(refill => 
        refill.id === refillId 
          ? { ...refill, lastContact: new Date(), reminderSent: true }
          : refill
      ));
    } else if (action === 'schedule') {
      setRefillSchedule(prev => prev.map(refill => 
        refill.id === refillId 
          ? { ...refill, status: 'scheduled' }
          : refill
      ));
    } else if (action === 'complete') {
      setRefillSchedule(prev => prev.filter(refill => refill.id !== refillId));
      // Add to history
      const refill = refillSchedule.find(r => r.id === refillId);
      if (refill) {
        setRefillHistory(prev => [{
          id: `hist-${Date.now()}`,
          prescription: refill.prescription,
          patient: refill.patient,
          refillDate: new Date(),
          status: 'completed',
          method: refillSettings.reminderMethod,
          notes: refill.notes
        }, ...prev]);
      }
    } else if (action === 'cancel') {
      setRefillSchedule(prev => prev.map(refill => 
        refill.id === refillId 
          ? { ...refill, status: 'cancelled' }
          : refill
      ));
    }
    
    setIsProcessing(false);
  };

  const sendReminder = async (refillId) => {
    setIsProcessing(true);
    
    // Simulate sending reminder
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefillSchedule(prev => prev.map(refill => 
      refill.id === refillId 
        ? { ...refill, reminderSent: true, lastContact: new Date() }
        : refill
    ));
    
    setIsProcessing(false);
  };

  const getUrgencyColor = (urgency: any) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const criticalRefills = refillSchedule.filter(r => r.urgency === 'critical');
  const urgentRefills = refillSchedule.filter(r => r.urgency === 'urgent');
  const upcomingRefills = refillSchedule.filter(r => ['soon', 'upcoming'].includes(r.urgency));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalRefills.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-orange-600">{urgentRefills.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingRefills.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{refillHistory.filter(r => r.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Refills Alert */}
      {criticalRefills.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Critical Refills - Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalRefills.map((refill: any) => (
              <Alert key={refill.id} variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{refill.prescription.medication_name}</p>
                      <p className="text-sm mt-1">Patient: {refill.patient?.name || 'Unknown'}</p>
                      <p className="text-sm">Due: {format(refill.refillDate, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleRefillAction(refill.id, 'contact')}>
                        <Phone className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRefillAction(refill.id, 'schedule')}>
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Refill Management Tabs */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
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
                refillSchedule.map((refill: any) => (
                  <div key={refill.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{refill.prescription.medication_name}</h4>
                        <p className="text-sm text-gray-600">
                          Patient: {refill.patient?.name || 'Unknown'} • 
                          Dosage: {refill.prescription.dosage} {refill.prescription.dosage_unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          Refill due: {format(refill.refillDate, 'MMM d, yyyy')} 
                          ({refill.daysUntil === 0 ? 'Today' : `${refill.daysUntil} days`})
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getUrgencyColor(refill.urgency)}>
                          {refill.urgency}
                        </Badge>
                        <Badge className={getStatusColor(refill.status)}>
                          {refill.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRefillAction(refill.id, 'contact')}
                        disabled={isProcessing}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Contact Patient
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => sendReminder(refill.id)}
                        disabled={isProcessing || refill.reminderSent}
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        {refill.reminderSent ? 'Reminder Sent' : 'Send Reminder'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRefillAction(refill.id, 'schedule')}
                        disabled={isProcessing}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule Refill
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={() => handleRefillAction(refill.id, 'complete')}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    </div>

                    {refill.lastContact && (
                      <p className="text-xs text-gray-500">
                        Last contact: {format(refill.lastContact, 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Refill History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {refillHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No refill history</p>
                </div>
              ) : (
                refillHistory.map((refill: any) => (
                  <div key={refill.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{refill.prescription.medication_name}</h4>
                        <p className="text-sm text-gray-600">
                          Patient: {refill.patient?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {format(refill.refillDate, 'MMM d, yyyy')}
                        </p>
                        {refill.notes && (
                          <p className="text-sm text-gray-500 mt-1 italic">{refill.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(refill.status)}>
                          {refill.status}
                        </Badge>
                        <Badge variant="outline">
                          {refill.method}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Refill Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Auto Reminder Days</Label>
                <Input 
                  type="number"
                  value={refillSettings.autoReminderDays}
                  onChange={e => setRefillSettings({...refillSettings, autoReminderDays: parseInt(e.target.value)})}
                  placeholder="7"
                />
                <p className="text-xs text-gray-500">Days before refill due to send automatic reminder</p>
              </div>

              <div className="space-y-2">
                <Label>Critical Alert Days</Label>
                <Input 
                  type="number"
                  value={refillSettings.criticalAlertDays}
                  onChange={e => setRefillSettings({...refillSettings, criticalAlertDays: parseInt(e.target.value)})}
                  placeholder="3"
                />
                <p className="text-xs text-gray-500">Days before refill due to trigger critical alert</p>
              </div>

              <div className="space-y-2">
                <Label>Maximum Refills</Label>
                <Input 
                  type="number"
                  value={refillSettings.maxRefills}
                  onChange={e => setRefillSettings({...refillSettings, maxRefills: parseInt(e.target.value)})}
                  placeholder="5"
                />
                <p className="text-xs text-gray-500">Maximum number of refills allowed per prescription</p>
              </div>

              <div className="space-y-2">
                <Label>Default Reminder Method</Label>
                <Select value={refillSettings.reminderMethod} onValueChange={v => setRefillSettings({...refillSettings, reminderMethod: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="mail">Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Refill Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Refill Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Refills Processed</span>
                      <span className="font-semibold">{refillHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completed Refills</span>
                      <span className="font-semibold text-green-600">{refillHistory.filter(r => r.status === 'completed').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cancelled Refills</span>
                      <span className="font-semibold text-red-600">{refillHistory.filter(r => r.status === 'cancelled').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending Refills</span>
                      <span className="font-semibold text-yellow-600">{refillSchedule.filter(r => r.status === 'pending').length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Contact Methods</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Phone Calls</span>
                      <span className="font-semibold">{refillHistory.filter(r => r.method === 'phone').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Email</span>
                      <span className="font-semibold">{refillHistory.filter(r => r.method === 'email').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SMS</span>
                      <span className="font-semibold">{refillHistory.filter(r => r.method === 'sms').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Mail</span>
                      <span className="font-semibold">{refillHistory.filter(r => r.method === 'mail').length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
