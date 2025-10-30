import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pill,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Download,
  FileText,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  Stethoscope,
  Database,
  BarChart3,
  Settings
} from 'lucide-react';
import { format, parseISO, differenceInDays, isToday, isAfter } from 'date-fns';
import PrescriptionManagement from '@/components/prescriptions/PrescriptionManagement';
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';
import EnhancedPrescriptionForm from '@/components/prescriptions/EnhancedPrescriptionForm';
import PrescriptionDataGrid from '@/components/prescriptions/PrescriptionDataGrid';
import PrescriptionWizard from '@/components/prescriptions/PrescriptionWizard';
import CollapsibleAlertBanner from '@/components/prescriptions/CollapsibleAlertBanner';
import PrescriptionAnalytics from '@/components/prescriptions/PrescriptionAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function PrescriptionManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState({
    status: 'all',
    patient: 'all',
    search: ''
  });
  const [showWizard, setShowWizard] = useState(false);
  const queryClient = useQueryClient();

  // Fetch prescription data
  const { data: prescriptions, isLoading: loadingPrescriptions } = useQuery({
    queryKey: ['prescriptions', filters],
    queryFn: () => mockApiClient.entities.Prescription?.list() || Promise.resolve([]),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
  });

  // Calculate dashboard metrics for doctors/clinicians
  const dashboardMetrics = React.useMemo(() => {
    if (!prescriptions) return {};

    const today = new Date();
    const totalPrescriptions = prescriptions.length;
    const activePrescriptions = prescriptions.filter(pres => pres.status === 'active').length;
    const pendingPrescriptions = prescriptions.filter(pres => pres.status === 'pending').length;
    const completedPrescriptions = prescriptions.filter(pres => pres.status === 'completed').length;

    const prescriptionsToday = prescriptions.filter(pres =>
      pres.created_date &&
      isToday(parseISO(pres.created_date))
    ).length;

    const refillsDue = prescriptions.filter(pres => {
      if (pres.status !== 'active' || !pres.refills) return false;
      const startDate = new Date(pres.start_date);
      const durationDays = parseInt(pres.duration_days) || 30;
      const nextRefillDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      return nextRefillDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    }).length;

    const criticalAlerts = prescriptions.filter(pres => {
      // Mock critical alert logic - in real app, this would check for drug interactions, allergies, etc.
      return pres.status === 'active' && Math.random() < 0.1; // 10% chance of critical alert
    }).length;

    return {
      totalPrescriptions,
      activePrescriptions,
      pendingPrescriptions,
      completedPrescriptions,
      prescriptionsToday,
      refillsDue,
      criticalAlerts,
      completionRate: prescriptions.length > 0 ? Math.round((completedPrescriptions / prescriptions.length) * 100) : 0
    };
  }, [prescriptions]);

  // Filter prescriptions based on current filters
  const filteredPrescriptions = React.useMemo(() => {
    if (!prescriptions) return [];

    return prescriptions.filter(prescription => {
      if (filters.status !== 'all' && prescription.status !== filters.status) return false;
      if (filters.patient !== 'all' && prescription.patient_id !== filters.patient) return false;
      if (filters.search && !prescription.medication_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [prescriptions, filters]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-blue-600" />
              Prescription Management
              <Badge variant="outline" className="ml-2 text-blue-600 border-blue-200">
                Doctor/Clinician View
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
                  toast.success('Prescriptions refreshed');
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalPrescriptions || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                <p className="text-2xl font-bold text-green-600">{dashboardMetrics.activePrescriptions || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prescribed Today</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardMetrics.prescriptionsToday || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refills Due</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardMetrics.refillsDue || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{dashboardMetrics.criticalAlerts || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{dashboardMetrics.completionRate || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Alerts Banner */}
      {(dashboardMetrics.criticalAlerts > 0 || dashboardMetrics.refillsDue > 0) && (
        <CollapsibleAlertBanner
          alerts={[
            ...(dashboardMetrics.criticalAlerts > 0 ? [{
              id: 'critical-alerts',
              type: 'critical' as const,
              title: 'Critical Prescriptions Require Attention',
              message: `${dashboardMetrics.criticalAlerts} prescriptions require immediate attention due to drug interactions or patient allergies.`,
              count: dashboardMetrics.criticalAlerts,
              actionLabel: 'Review Now',
              onAction: () => {
                setActiveTab('prescriptions');
              },
            }] : []),
            ...(dashboardMetrics.refillsDue > 0 ? [{
              id: 'refills-due',
              type: 'warning' as const,
              title: 'Refills Due Soon',
              message: `${dashboardMetrics.refillsDue} prescriptions are due for refills within the next 3 days.`,
              count: dashboardMetrics.refillsDue,
            }] : []),
          ]}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" colorScheme="ANALYTICS" icon={BarChart3}>
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="prescriptions" colorScheme="PHARMACY" icon={"Pill"}>
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="new-prescription" colorScheme="PHARMACY" icon={"Plus"}>
            New Rx
          </TabsTrigger>
          <TabsTrigger value="medication-database" colorScheme="ADMIN" icon={"Database"}>
            Medication DB
          </TabsTrigger>
          <TabsTrigger value="monitoring" colorScheme="EMERGENCY" icon={"Activity"}>
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="analytics" colorScheme="ANALYTICS" icon={"TrendingUp"}>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" colorScheme="SETTINGS" icon={"Settings"}>
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Recent Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prescriptions?.slice(0, 5).map((prescription: any) => (
                    <div key={prescription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{prescription.medication_name}</p>
                        <p className="text-sm text-gray-600">
                          {prescription.dosage} {prescription.dosage_unit} - {prescription.frequency}
                        </p>
                        <p className="text-xs text-gray-500">
                          Patient: {patients?.find(p => p.id === prescription.patient_id)?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge className={
                        prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                          prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                      }>
                        {prescription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prescription Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Prescription Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Prescriptions</span>
                    <span className="font-medium">{dashboardMetrics.activePrescriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed This Month</span>
                    <span className="font-medium">{dashboardMetrics.completedPrescriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Duration</span>
                    <span className="font-medium">30 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Most Prescribed</span>
                    <span className="font-medium">Amoxicillin</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                All Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrescriptionDataGrid
                prescriptions={prescriptions || []}
                patients={patients || []}
                onView={(prescription) => {
                  // Handle view action
                  console.log('View prescription:', prescription);
                }}
                onEdit={(prescription) => {
                  // Handle edit action - could open wizard in edit mode
                  setActiveTab('new-prescription');
                }}
                onBulkAction={(action, ids) => {
                  console.log('Bulk action:', action, ids);
                  // Handle bulk actions
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-prescription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                New Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedPrescriptionForm
                onSubmit={(data) => {
                  console.log('Enhanced prescription submitted:', data);
                  toast.success('Prescription created successfully');
                  queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
                  setActiveTab('prescriptions'); // Switch back to prescriptions tab
                }}
                onCancel={() => setActiveTab('prescriptions')}
                isSubmitting={false}
                patient={patients?.[0]} // Use first patient as default, in real app this would be selected
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medication-database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Medication Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Medication database integration coming soon</p>
                <p className="text-sm">Access comprehensive medication information, dosages, and interactions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Prescription Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Prescription monitoring dashboard coming soon</p>
                <p className="text-sm">Track patient adherence, side effects, and treatment outcomes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <PrescriptionAnalytics
            prescriptions={prescriptions || []}
            patients={patients || []}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Prescription Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Settings panel coming soon</p>
                <p className="text-sm">Configure prescription defaults, alerts, and preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prescription Wizard Modal */}
      <PrescriptionWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onSubmit={(data) => {
          console.log('Wizard prescription submitted:', data);
          toast.success('Prescription created successfully');
          queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
          setShowWizard(false);
        }}
        patients={patients || []}
      />
    </div>
  );
}
