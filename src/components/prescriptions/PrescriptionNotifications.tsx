import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Settings,
  Plus,
  Edit,
  Trash2,
  Send,
  Calendar,
  User,
  Pill
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays } from "date-fns";

export default function PrescriptionNotifications({ prescriptions = [], patients = [] }: any) {
  const [notifications, setNotifications] = useState([]);
  const [notificationTemplates, setNotificationTemplates] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    phoneEnabled: true,
    autoReminders: true,
    reminderFrequency: 'daily',
    criticalAlerts: true,
    refillReminders: true,
    adherenceAlerts: true
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    generateNotifications();
    loadNotificationTemplates();
  }, [prescriptions]);

  const generateNotifications = () => {
    const generatedNotifications = [];
    const today = new Date();
    
    prescriptions.forEach(rx => {
      if (rx.status === 'active') {
        const patient = patients.find(p => p.id === rx.patient_id);
        
        // Refill reminders
        if (rx.refills > 0) {
          const startDate = parseISO(rx.start_date);
          const durationDays = parseInt(rx.duration_days) || 30;
          const nextRefillDate = addDays(startDate, durationDays);
          const daysUntilRefill = differenceInDays(nextRefillDate, today);
          
          if (daysUntilRefill <= 7 && daysUntilRefill >= 0) {
            generatedNotifications.push({
              id: `refill-${rx.id}`,
              type: 'refill_reminder',
              priority: daysUntilRefill <= 1 ? 'critical' : daysUntilRefill <= 3 ? 'high' : 'medium',
              title: 'Prescription Refill Due',
              message: `${rx.medication_name} refill is due in ${daysUntilRefill === 0 ? 'today' : `${daysUntilRefill} days`}`,
              prescription: rx,
              patient: patient,
              dueDate: nextRefillDate,
              status: 'pending',
              createdAt: new Date(),
              channels: ['email', 'sms']
            });
          }
        }
        
        // Adherence alerts (mock data)
        const adherenceRate = Math.random() * 100;
        if (adherenceRate < 80) {
          generatedNotifications.push({
            id: `adherence-${rx.id}`,
            type: 'adherence_alert',
            priority: adherenceRate < 60 ? 'critical' : 'high',
            title: 'Low Medication Adherence',
            message: `Patient adherence for ${rx.medication_name} is ${Math.round(adherenceRate)}%`,
            prescription: rx,
            patient: patient,
            dueDate: today,
            status: 'pending',
            createdAt: new Date(),
            channels: ['email', 'phone']
          });
        }
        
        // Lab monitoring reminders
        if (rx.lab_monitoring) {
          generatedNotifications.push({
            id: `lab-${rx.id}`,
            type: 'lab_monitoring',
            priority: 'medium',
            title: 'Lab Monitoring Required',
            message: `Lab monitoring needed for ${rx.medication_name}: ${rx.lab_monitoring}`,
            prescription: rx,
            patient: patient,
            dueDate: addDays(today, 7),
            status: 'pending',
            createdAt: new Date(),
            channels: ['email']
          });
        }
        
        // Side effect monitoring
        if (rx.side_effects_to_watch) {
          generatedNotifications.push({
            id: `side-effects-${rx.id}`,
            type: 'side_effect_monitoring',
            priority: 'medium',
            title: 'Side Effect Monitoring',
            message: `Monitor patient for: ${rx.side_effects_to_watch}`,
            prescription: rx,
            patient: patient,
            dueDate: addDays(today, 3),
            status: 'pending',
            createdAt: new Date(),
            channels: ['email']
          });
        }
      }
    });
    
    setNotifications(generatedNotifications);
  };

  const loadNotificationTemplates = () => {
    const templates = [
      {
        id: 'refill-reminder',
        name: 'Refill Reminder',
        subject: 'Prescription Refill Due - {medication_name}',
        body: 'Dear {patient_name},\n\nYour prescription for {medication_name} is due for a refill on {due_date}.\n\nPlease contact your pharmacy or schedule an appointment to renew your prescription.\n\nBest regards,\n{doctor_name}',
        channels: ['email', 'sms']
      },
      {
        id: 'adherence-alert',
        name: 'Adherence Alert',
        subject: 'Medication Adherence Concern - {medication_name}',
        body: 'Dear {patient_name},\n\nWe have noticed that your adherence to {medication_name} may need attention.\n\nPlease contact us if you are experiencing any difficulties with your medication.\n\nBest regards,\n{doctor_name}',
        channels: ['email', 'phone']
      },
      {
        id: 'lab-monitoring',
        name: 'Lab Monitoring',
        subject: 'Lab Monitoring Required - {medication_name}',
        body: 'Dear {patient_name},\n\nLab monitoring is required for your medication {medication_name}.\n\nPlease schedule the following tests: {lab_monitoring}\n\nBest regards,\n{doctor_name}',
        channels: ['email']
      }
    ];
    
    setNotificationTemplates(templates);
  };

  const sendNotification = async (notificationId, channel) => {
    setIsSending(true);
    
    // Simulate sending notification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, status: 'sent', sentAt: new Date(), sentVia: channel }
        : notification
    ));
    
    setIsSending(false);
  };

  const markAsRead = (notificationId: any) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, status: 'read' }
        : notification
    ));
  };

  const dismissNotification = (notificationId: any) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, status: 'dismissed' }
        : notification
    ));
  };

  const getPriorityColor = (priority: any) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'read': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChannelIcon = (channel: any) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const criticalNotifications = notifications.filter(n => n.priority === 'critical');
  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const sentNotifications = notifications.filter(n => n.status === 'sent');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalNotifications.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingNotifications.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">{sentNotifications.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Notifications Alert */}
      {criticalNotifications.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Notifications - Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalNotifications.map((notification: any) => (
              <Alert key={notification.id} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <p className="text-sm">Patient: {notification.patient?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => sendNotification(notification.id, 'email')}>
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendNotification(notification.id, 'phone')}>
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Notification Management Tabs */}
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Active Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No notifications at this time</p>
                </div>
              ) : (
                notifications.map((notification: any) => (
                  <div key={notification.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{notification.title}</h4>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-sm text-gray-600">
                          Patient: {notification.patient?.name || 'Unknown'} • 
                          Medication: {notification.prescription.medication_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {format(notification.dueDate, 'MMM d, yyyy')} • 
                          Created: {format(notification.createdAt, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      {notification.channels.map((channel: any) => (
                        <Button 
                          key={channel}
                          size="sm" 
                          variant="outline" 
                          onClick={() => sendNotification(notification.id, channel)}
                          disabled={isSending || notification.status === 'sent'}
                        >
                          {getChannelIcon(channel)}
                          <span className="ml-1 capitalize">{channel}</span>
                        </Button>
                      ))}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => markAsRead(notification.id)}
                        disabled={notification.status === 'read'}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Read
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Dismiss
                      </Button>
                    </div>

                    {notification.sentAt && (
                      <p className="text-xs text-gray-500">
                        Sent: {format(notification.sentAt, 'MMM d, yyyy h:mm a')} via {notification.sentVia}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationTemplates.map((template: any) => (
                <div key={template.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-600">Subject: {template.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Template Body:</Label>
                    <Textarea 
                      value={template.body}
                      readOnly
                      rows={6}
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {template.channels.map((channel: any) => (
                      <Badge key={channel} variant="outline">
                        {getChannelIcon(channel)}
                        <span className="ml-1 capitalize">{channel}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              
              <Button className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add New Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications via email</p>
                  </div>
                  <Button 
                    variant={notificationSettings.emailEnabled ? "default" : "outline"}
                    onClick={() => setNotificationSettings({...notificationSettings, emailEnabled: !notificationSettings.emailEnabled})}
                  >
                    {notificationSettings.emailEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications via SMS</p>
                  </div>
                  <Button 
                    variant={notificationSettings.smsEnabled ? "default" : "outline"}
                    onClick={() => setNotificationSettings({...notificationSettings, smsEnabled: !notificationSettings.smsEnabled})}
                  >
                    {notificationSettings.smsEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Phone Notifications</Label>
                    <p className="text-sm text-gray-500">Make phone calls for critical alerts</p>
                  </div>
                  <Button 
                    variant={notificationSettings.phoneEnabled ? "default" : "outline"}
                    onClick={() => setNotificationSettings({...notificationSettings, phoneEnabled: !notificationSettings.phoneEnabled})}
                  >
                    {notificationSettings.phoneEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Reminders</Label>
                    <p className="text-sm text-gray-500">Automatically send reminders</p>
                  </div>
                  <Button 
                    variant={notificationSettings.autoReminders ? "default" : "outline"}
                    onClick={() => setNotificationSettings({...notificationSettings, autoReminders: !notificationSettings.autoReminders})}
                  >
                    {notificationSettings.autoReminders ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Reminder Frequency</Label>
                  <Select value={notificationSettings.reminderFrequency} onValueChange={v => setNotificationSettings({...notificationSettings, reminderFrequency: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Notification History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.filter(n => n.status === 'sent' || n.status === 'read').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No notification history</p>
                </div>
              ) : (
                notifications
                  .filter(n => n.status === 'sent' || n.status === 'read')
                  .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt))
                  .map((notification: any) => (
                    <div key={notification.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-sm text-gray-600">
                            Patient: {notification.patient?.name || 'Unknown'} • 
                            Medication: {notification.prescription.medication_name}
                          </p>
                          {notification.sentAt && (
                            <p className="text-sm text-gray-500">
                              Sent: {format(notification.sentAt, 'MMM d, yyyy h:mm a')} via {notification.sentVia}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
