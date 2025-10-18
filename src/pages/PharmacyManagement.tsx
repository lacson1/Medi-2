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
  Package,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Shield,
  FileText,
  Settings,
  Zap,
  ArrowRight,
  Bell,
  Target
} from 'lucide-react';
import { format, parseISO, differenceInDays, isToday, isAfter } from 'date-fns';
import PharmacyInventoryManager from '@/components/pharmacy/PharmacyInventoryManager';
import MedicationDispensing from '@/components/pharmacy/MedicationDispensing';
import PharmacyReports from '@/components/pharmacy/PharmacyReports';
import PrescriptionVerification from '@/components/pharmacy/PrescriptionVerification';
import PharmacyActivityLog from '@/components/pharmacy/PharmacyActivityLog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Medication } from '@/api/entities';

export default function PharmacyDispensary() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const medications = [
    {
      id: 1,
      name: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      stock: 150,
      minStock: 50,
      status: 'in_stock',
      expiryDate: '2024-12-15',
      cost: 2.50
    },
    {
      id: 2,
      name: 'Metformin 1000mg',
      category: 'Diabetes',
      stock: 25,
      minStock: 30,
      status: 'low_stock',
      expiryDate: '2025-03-20',
      cost: 1.80
    },
    {
      id: 3,
      name: 'Lisinopril 10mg',
      category: 'Cardiovascular',
      stock: 0,
      minStock: 20,
      status: 'out_of_stock',
      expiryDate: '2024-11-30',
      cost: 3.20
    }
  ];

  const prescriptions = [
    {
      id: 1,
      patient: 'John Doe',
      medication: 'Amoxicillin 500mg',
      status: 'pending',
      priority: 'normal',
      prescribedDate: '2024-01-15',
      doctor: 'Dr. Smith'
    },
    {
      id: 2,
      patient: 'Jane Smith',
      medication: 'Metformin 1000mg',
      status: 'verified',
      priority: 'high',
      prescribedDate: '2024-01-14',
      doctor: 'Dr. Johnson'
    }
  ];

  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });

  // Calculate key metrics
  const metrics = {
    totalMedications: medications.length,
    lowStock: medications.filter(m => m.status === 'low_stock').length,
    outOfStock: medications.filter(m => m.status === 'out_of_stock').length,
    pendingPrescriptions: prescriptions.filter(p => p.status === 'pending').length,
    urgentPrescriptions: prescriptions.filter(p => p.priority === 'urgent').length,
    totalValue: medications.reduce((sum: any, med: any) => sum + (med.stock * med.cost), 0)
  };

  const filteredMedications = medications.filter(medication => {
    if (filters.status !== 'all' && medication.status !== filters.status) return false;
    if (filters.category !== 'all' && medication.category !== filters.category) return false;
    if (filters.search && !medication.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleFormSubmit = (data: any) => {
    // Handle medication form submission
    console.log('Form submitted:', data);
  };

  const openModal = (type, item = null) => {
    setSelectedMedication(item);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedMedication(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Modern Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              Pharmacy Dispensary
            </h1>
            <p className="text-gray-600 mt-1">Manage medications, prescriptions, and inventory</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={() => openModal('medication')} className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Plus className="w-4 h-4" />
              Add Medication
            </Button>
          </div>
        </div>

        {/* Key Metrics - Cleaner Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Medications</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalMedications}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.lowStock}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.outOfStock}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Rx</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.pendingPrescriptions}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.urgentPrescriptions}</p>
                </div>
                <Zap className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-green-600">${metrics.totalValue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Alerts */}
        {(metrics.outOfStock > 0 || metrics.urgentPrescriptions > 0) && (
          <div className="space-y-3">
            {metrics.outOfStock > 0 && (
              <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Critical:</strong> {metrics.outOfStock} medications are out of stock and need immediate restocking.
                </AlertDescription>
              </Alert>
            )}
            {metrics.urgentPrescriptions > 0 && (
              <Alert className="border-orange-200 bg-orange-50/80 backdrop-blur-sm">
                <Zap className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Urgent:</strong> {metrics.urgentPrescriptions} prescriptions require immediate attention.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <TabsTrigger value="dashboard" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="dispensing" className="gap-2">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Dispensing</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-3 h-12" variant="outline">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Verify Prescriptions</div>
                      <div className="text-sm text-gray-500">{metrics.pendingPrescriptions} pending</div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button className="w-full justify-start gap-3 h-12" variant="outline">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Dispense Medications</div>
                      <div className="text-sm text-gray-500">Ready for dispensing</div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button className="w-full justify-start gap-3 h-12" variant="outline">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <div className="font-medium">Restock Inventory</div>
                      <div className="text-sm text-gray-500">{metrics.lowStock + metrics.outOfStock} items need attention</div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.slice(0, 3).map((prescription: any) => (
                      <div key={prescription.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{prescription.patient}</p>
                          <p className="text-xs text-gray-500">{prescription.medication}</p>
                        </div>
                        <Badge className={
                          prescription.status === 'verified' ? 'bg-green-100 text-green-800' :
                            prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                        }>
                          {prescription.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <PharmacyInventoryManager />
          </TabsContent>

          <TabsContent value="dispensing">
            <MedicationDispensing />
          </TabsContent>

          <TabsContent value="verification">
            <PrescriptionVerification />
          </TabsContent>

          <TabsContent value="activities">
            <PharmacyActivityLog />
          </TabsContent>

          <TabsContent value="reports">
            <PharmacyReports />
          </TabsContent>
        </Tabs>

        {/* Medication Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedMedication ? 'Edit Medication' : 'Add New Medication'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-600">Medication form component will be implemented here.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}