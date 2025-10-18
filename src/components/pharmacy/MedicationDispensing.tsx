import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  User,
  FileText,
  Pill
} from 'lucide-react';
import { format, parseISO, differenceInDays, isAfter, isToday } from 'date-fns';

const DISPENSING_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  verified: { label: 'Verified', color: 'bg-blue-100 text-blue-800' },
  dispensed: { label: 'Dispensed', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  partial: { label: 'Partial', color: 'bg-orange-100 text-orange-800' }
};

const PRIORITY_LEVELS = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
};

export default function MedicationDispensing() {
  const [dispensingOrders, setDispensingOrders] = useState([
    {
      id: 1,
      prescription_id: 'RX001',
      patient_name: 'John Doe',
      patient_id: 'P001',
      medication_name: 'Amoxicillin 500mg',
      dosage: '500mg',
      frequency: 'Every 8 hours',
      quantity_prescribed: 30,
      quantity_dispensed: 0,
      status: 'pending',
      priority: 'normal',
      prescribed_date: '2024-01-15',
      prescribed_by: 'Dr. Smith',
      verification_notes: '',
      dispensing_notes: '',
      pharmacist: '',
      dispensed_date: null,
      expiry_date: '2024-12-15',
      batch_number: 'AMX2024001',
      cost_per_unit: 2.50,
      total_cost: 75.00
    },
    {
      id: 2,
      prescription_id: 'RX002',
      patient_name: 'Jane Smith',
      patient_id: 'P002',
      medication_name: 'Metformin 1000mg',
      dosage: '1000mg',
      frequency: 'Twice daily',
      quantity_prescribed: 60,
      quantity_dispensed: 30,
      status: 'partial',
      priority: 'high',
      prescribed_date: '2024-01-14',
      prescribed_by: 'Dr. Johnson',
      verification_notes: 'Patient has diabetes - monitor blood glucose',
      dispensing_notes: 'Partial dispense due to stock limitations',
      pharmacist: 'Sarah Wilson',
      dispensed_date: '2024-01-14',
      expiry_date: '2025-03-20',
      batch_number: 'MET2024002',
      cost_per_unit: 1.80,
      total_cost: 108.00
    },
    {
      id: 3,
      prescription_id: 'RX003',
      patient_name: 'Bob Johnson',
      patient_id: 'P003',
      medication_name: 'Lisinopril 10mg',
      dosage: '10mg',
      frequency: 'Once daily',
      quantity_prescribed: 30,
      quantity_dispensed: 30,
      status: 'dispensed',
      priority: 'normal',
      prescribed_date: '2024-01-13',
      prescribed_by: 'Dr. Brown',
      verification_notes: 'Monitor blood pressure',
      dispensing_notes: 'Patient counseled on side effects',
      pharmacist: 'Mike Davis',
      dispensed_date: '2024-01-13',
      expiry_date: '2024-11-30',
      batch_number: 'LIS2024003',
      cost_per_unit: 3.20,
      total_cost: 96.00
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    pharmacist: 'all',
    search: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isDispensingOpen, setIsDispensingOpen] = useState(false);

  // Filter dispensing orders
  const filteredOrders = dispensingOrders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.priority !== 'all' && order.priority !== filters.priority) return false;
    if (filters.pharmacist !== 'all' && order.pharmacist !== filters.pharmacist) return false;
    if (filters.search && !order.patient_name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !order.medication_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Calculate dispensing metrics
  const dispensingMetrics = {
    totalOrders: dispensingOrders.length,
    pendingOrders: dispensingOrders.filter(order => order.status === 'pending').length,
    dispensedToday: dispensingOrders.filter(order =>
      order.status === 'dispensed' &&
      order.dispensed_date &&
      isToday(parseISO(order.dispensed_date))
    ).length,
    urgentOrders: dispensingOrders.filter(order => order.priority === 'urgent').length,
    totalValue: dispensingOrders.reduce((sum: any, order: any) => sum + order.total_cost, 0),
    avgProcessingTime: '15 minutes' // Mock data
  };

  const getStatusConfig = (status: any) => {
    return DISPENSING_STATUS[status] || DISPENSING_STATUS.pending;
  };

  const getPriorityConfig = (priority: any) => {
    return PRIORITY_LEVELS[priority] || PRIORITY_LEVELS.normal;
  };

  const openVerification = (order: any) => {
    setSelectedOrder(order);
    setIsVerificationOpen(true);
  };

  const openDispensing = (order: any) => {
    setSelectedOrder(order);
    setIsDispensingOpen(true);
  };

  const closeModals = () => {
    setIsVerificationOpen(false);
    setIsDispensingOpen(false);
    setSelectedOrder(null);
  };

  const handleVerification = (verificationData: any) => {
    setDispensingOrders(prev => prev.map(order =>
      order.id === selectedOrder.id ? {
        ...order,
        ...verificationData,
        status: 'verified',
        pharmacist: 'Current Pharmacist' // In real app, this would be the logged-in pharmacist
      } : order
    ));
    closeModals();
  };

  const handleDispensing = (dispensingData: any) => {
    setDispensingOrders(prev => prev.map(order =>
      order.id === selectedOrder.id ? {
        ...order,
        ...dispensingData,
        status: dispensingData.quantity_dispensed < order.quantity_prescribed ? 'partial' : 'dispensed',
        dispensed_date: new Date().toISOString().split('T')[0]
      } : order
    ));
    closeModals();
  };

  return (
    <div className="space-y-6">
      {/* Dispensing Metrics - Cleaner Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dispensingMetrics.totalOrders}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{dispensingMetrics.pendingOrders}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dispensed Today</p>
                <p className="text-2xl font-bold text-green-600">{dispensingMetrics.dispensedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{dispensingMetrics.urgentOrders}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">${dispensingMetrics.totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                <p className="text-2xl font-bold text-indigo-600">{dispensingMetrics.avgProcessingTime}</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {(dispensingMetrics.pendingOrders > 0 || dispensingMetrics.urgentOrders > 0) && (
        <div className="space-y-3">
          {dispensingMetrics.urgentOrders > 0 && (
            <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Urgent:</strong> {dispensingMetrics.urgentOrders} prescriptions require immediate attention.
              </AlertDescription>
            </Alert>
          )}

          {dispensingMetrics.pendingOrders > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50/80 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Pending:</strong> {dispensingMetrics.pendingOrders} prescriptions are waiting for verification and dispensing.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Dispensing Orders
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(DISPENSING_STATUS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {Object.entries(PRIORITY_LEVELS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Pharmacist</Label>
              <Select value={filters.pharmacist} onValueChange={(value) => setFilters({ ...filters, pharmacist: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pharmacists</SelectItem>
                  <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                  <SelectItem value="Mike Davis">Mike Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dispensing Orders Table */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order: any) => {
                  const statusConfig = getStatusConfig(order.status);
                  const priorityConfig = getPriorityConfig(order.priority);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.prescription_id}</p>
                          <p className="text-sm text-gray-500">{format(parseISO(order.prescribed_date), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-gray-400">By: {order.prescribed_by}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.patient_name}</p>
                          <p className="text-sm text-gray-500">ID: {order.patient_id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.medication_name}</p>
                          <p className="text-sm text-gray-500">{order.dosage} - {order.frequency}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{order.quantity_dispensed}/{order.quantity_prescribed}</p>
                          <p className="text-sm text-gray-500">${order.total_cost.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={priorityConfig.color}>
                          {priorityConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openVerification(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'verified' && (
                            <Button variant="outline" size="sm" onClick={() => openDispensing(order)}>
                              <Package className="w-4 h-4" />
                            </Button>
                          )}
                          {order.status === 'pending' && (
                            <Button size="sm" onClick={() => openVerification(order)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={isVerificationOpen} onOpenChange={closeModals}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{"Prescription Verification"}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Prescription ID</Label>
                  <p className="font-medium">{selectedOrder.prescription_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient</Label>
                  <p className="font-medium">{selectedOrder.patient_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Medication</Label>
                  <p className="font-medium">{selectedOrder.medication_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Dosage</Label>
                  <p className="font-medium">{selectedOrder.dosage} - {selectedOrder.frequency}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="verification_notes">Verification Notes</Label>
                <Textarea
                  id="verification_notes"
                  defaultValue={selectedOrder.verification_notes}
                  placeholder="Add verification notes, drug interactions, allergies, etc."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModals}>
                  Cancel
                </Button>
                <Button onClick={() => handleVerification({ verification_notes: 'Verified by pharmacist' })}>
                  Verify Prescription
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispensing Dialog */}
      <Dialog open={isDispensingOpen} onOpenChange={closeModals}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{"Medication Dispensing"}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Prescription ID</Label>
                  <p className="font-medium">{selectedOrder.prescription_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient</Label>
                  <p className="font-medium">{selectedOrder.patient_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Medication</Label>
                  <p className="font-medium">{selectedOrder.medication_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Batch Number</Label>
                  <p className="font-medium">{selectedOrder.batch_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity_dispensed">Quantity to Dispense</Label>
                  <Input
                    id="quantity_dispensed"
                    type="number"
                    defaultValue={selectedOrder.quantity_prescribed - selectedOrder.quantity_dispensed}
                    max={selectedOrder.quantity_prescribed - selectedOrder.quantity_dispensed}
                    min="1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                  <p className="font-medium">{format(parseISO(selectedOrder.expiry_date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="dispensing_notes">Dispensing Notes</Label>
                <Textarea
                  id="dispensing_notes"
                  defaultValue={selectedOrder.dispensing_notes}
                  placeholder="Add dispensing notes, patient counseling, etc."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModals}>
                  Cancel
                </Button>
                <Button onClick={() => handleDispensing({
                  quantity_dispensed: selectedOrder.quantity_prescribed,
                  dispensing_notes: 'Dispensed by pharmacist'
                })}>
                  Dispense Medication
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
