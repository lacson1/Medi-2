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
  Activity
} from 'lucide-react';
import { format, parseISO, differenceInDays, isAfter } from 'date-fns';

const MEDICATION_CATEGORIES = {
  antibiotics: { label: 'Antibiotics', color: 'bg-blue-100 text-blue-800' },
  analgesics: { label: 'Analgesics', color: 'bg-red-100 text-red-800' },
  cardiovascular: { label: 'Cardiovascular', color: 'bg-purple-100 text-purple-800' },
  diabetes: { label: 'Diabetes', color: 'bg-green-100 text-green-800' },
  respiratory: { label: 'Respiratory', color: 'bg-cyan-100 text-cyan-800' },
  gastrointestinal: { label: 'Gastrointestinal', color: 'bg-orange-100 text-orange-800' },
  dermatology: { label: 'Dermatology', color: 'bg-pink-100 text-pink-800' },
  neurology: { label: 'Neurology', color: 'bg-indigo-100 text-indigo-800' },
  psychiatry: { label: 'Psychiatry', color: 'bg-yellow-100 text-yellow-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

const STOCK_STATUS = {
  in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-800' },
  low_stock: { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-800' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800' }
};

export default function PharmacyInventoryManager() {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Amoxicillin 500mg',
      generic_name: 'Amoxicillin',
      category: 'antibiotics',
      current_stock: 150,
      minimum_stock: 50,
      maximum_stock: 500,
      cost_per_unit: 2.50,
      selling_price: 5.00,
      expiry_date: '2024-12-15',
      batch_number: 'AMX2024001',
      supplier: 'MedSupply Inc.',
      storage_location: 'A1-B2',
      status: 'in_stock',
      last_restocked: '2024-01-15',
      notes: 'Store in cool, dry place'
    },
    {
      id: 2,
      name: 'Metformin 1000mg',
      generic_name: 'Metformin HCl',
      category: 'diabetes',
      current_stock: 25,
      minimum_stock: 30,
      maximum_stock: 200,
      cost_per_unit: 1.80,
      selling_price: 3.60,
      expiry_date: '2025-03-20',
      batch_number: 'MET2024002',
      supplier: 'PharmaCorp',
      storage_location: 'B1-C3',
      status: 'low_stock',
      last_restocked: '2024-01-10',
      notes: 'Monitor blood glucose levels'
    },
    {
      id: 3,
      name: 'Lisinopril 10mg',
      generic_name: 'Lisinopril',
      category: 'cardiovascular',
      current_stock: 0,
      minimum_stock: 20,
      maximum_stock: 100,
      cost_per_unit: 3.20,
      selling_price: 6.40,
      expiry_date: '2024-11-30',
      batch_number: 'LIS2024003',
      supplier: 'CardioMed',
      storage_location: 'C2-D1',
      status: 'out_of_stock',
      last_restocked: '2023-12-20',
      notes: 'Monitor blood pressure'
    }
  ]);

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Filter medications
  const filteredMedications = medications.filter(medication => {
    if (filters.category !== 'all' && medication.category !== filters.category) return false;
    if (filters.status !== 'all' && medication.status !== filters.status) return false;
    if (filters.search && !medication.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Calculate inventory metrics
  const inventoryMetrics = {
    totalMedications: medications.length,
    totalValue: medications.reduce((sum: any, med: any) => sum + (med.current_stock * med.cost_per_unit), 0),
    lowStockCount: medications.filter(med => med.status === 'low_stock').length,
    outOfStockCount: medications.filter(med => med.status === 'out_of_stock').length,
    expiringSoonCount: medications.filter(med => {
      const daysUntilExpiry = differenceInDays(parseISO(med.expiry_date), new Date());
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length
  };

  const getStockStatus = (medication: any) => {
    if (medication.current_stock === 0) return 'out_of_stock';
    if (medication.current_stock <= medication.minimum_stock) return 'low_stock';
    if (isAfter(new Date(), parseISO(medication.expiry_date))) return 'expired';
    return 'in_stock';
  };

  const getCategoryConfig = (category: any) => {
    return MEDICATION_CATEGORIES[category] || MEDICATION_CATEGORIES.other;
  };

  const getStatusConfig = (status: any) => {
    return STOCK_STATUS[status] || STOCK_STATUS.in_stock;
  };

  const openForm = (medication = null) => {
    setSelectedMedication(medication);
    setIsFormOpen(true);
  };

  const openView = (medication: any) => {
    setSelectedMedication(medication);
    setIsViewOpen(true);
  };

  const closeModals = () => {
    setIsFormOpen(false);
    setIsViewOpen(false);
    setSelectedMedication(null);
  };

  const handleDelete = (id: any) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  };

  const handleFormSubmit = (formData: any) => {
    if (selectedMedication) {
      // Update existing medication
      setMedications(prev => prev.map(med =>
        med.id === selectedMedication.id ? { ...med, ...formData } : med
      ));
    } else {
      // Add new medication
      const newMedication = {
        id: Date.now(),
        ...formData,
        status: getStockStatus({ ...formData, current_stock: formData.current_stock || 0 })
      };
      setMedications(prev => [...prev, newMedication]);
    }
    closeModals();
  };

  return (
    <div className="space-y-6">
      {/* Inventory Metrics - Cleaner Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medications</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryMetrics.totalMedications}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">${inventoryMetrics.totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{inventoryMetrics.lowStockCount}</p>
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
                <p className="text-2xl font-bold text-red-600">{inventoryMetrics.outOfStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{inventoryMetrics.expiringSoonCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {(inventoryMetrics.lowStockCount > 0 || inventoryMetrics.outOfStockCount > 0 || inventoryMetrics.expiringSoonCount > 0) && (
        <div className="space-y-3">
          {inventoryMetrics.outOfStockCount > 0 && (
            <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Critical:</strong> {inventoryMetrics.outOfStockCount} medications are out of stock and need immediate restocking.
              </AlertDescription>
            </Alert>
          )}

          {inventoryMetrics.lowStockCount > 0 && (
            <Alert className="border-orange-200 bg-orange-50/80 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Warning:</strong> {inventoryMetrics.lowStockCount} medications are running low on stock.
              </AlertDescription>
            </Alert>
          )}

          {inventoryMetrics.expiringSoonCount > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50/80 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Notice:</strong> {inventoryMetrics.expiringSoonCount} medications will expire within 30 days.
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
              Medication Inventory
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button onClick={() => openForm()} className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Plus className="w-4 h-4" />
                Add Medication
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(MEDICATION_CATEGORIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Stock Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STOCK_STATUS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search medications..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications Table */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedications.map((medication: any) => {
                  const categoryConfig = getCategoryConfig(medication.category);
                  const statusConfig = getStatusConfig(medication.status);
                  const daysUntilExpiry = differenceInDays(parseISO(medication.expiry_date), new Date());

                  return (
                    <tr key={medication.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{medication.name}</p>
                          <p className="text-sm text-gray-500">{medication.generic_name}</p>
                          <p className="text-xs text-gray-400">Batch: {medication.batch_number}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={categoryConfig.color}>
                          {categoryConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{medication.current_stock}</p>
                          <p className="text-sm text-gray-500">Min: {medication.minimum_stock}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">${medication.cost_per_unit}</p>
                          <p className="text-sm text-gray-500">Sell: ${medication.selling_price}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{format(parseISO(medication.expiry_date), 'MMM d, yyyy')}</p>
                          <p className={`text-sm ${daysUntilExpiry <= 30 ? 'text-red-600' : 'text-gray-500'}`}>
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openView(medication)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openForm(medication)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(medication.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Medication Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={closeModals}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMedication ? 'Edit Medication' : 'Add New Medication'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  defaultValue={selectedMedication?.name || ''}
                  placeholder="e.g., Amoxicillin 500mg"
                />
              </div>
              <div>
                <Label htmlFor="generic_name">Generic Name</Label>
                <Input
                  id="generic_name"
                  defaultValue={selectedMedication?.generic_name || ''}
                  placeholder="e.g., Amoxicillin"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={selectedMedication?.category || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEDICATION_CATEGORIES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  defaultValue={selectedMedication?.batch_number || ''}
                  placeholder="e.g., AMX2024001"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current_stock">Current Stock</Label>
                <Input
                  id="current_stock"
                  type="number"
                  defaultValue={selectedMedication?.current_stock || ''}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock">Minimum Stock</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  defaultValue={selectedMedication?.minimum_stock || ''}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="maximum_stock">Maximum Stock</Label>
                <Input
                  id="maximum_stock"
                  type="number"
                  defaultValue={selectedMedication?.maximum_stock || ''}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost_per_unit">Cost per Unit</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  defaultValue={selectedMedication?.cost_per_unit || ''}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="selling_price">Selling Price</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  defaultValue={selectedMedication?.selling_price || ''}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  defaultValue={selectedMedication?.expiry_date || ''}
                />
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  defaultValue={selectedMedication?.supplier || ''}
                  placeholder="Supplier name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="storage_location">Storage Location</Label>
              <Input
                id="storage_location"
                defaultValue={selectedMedication?.storage_location || ''}
                placeholder="e.g., A1-B2"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                defaultValue={selectedMedication?.notes || ''}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModals}>
                Cancel
              </Button>
              <Button onClick={() => handleFormSubmit({})}>
                {selectedMedication ? 'Update' : 'Add'} Medication
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medication View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={closeModals}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{"Medication Details"}</DialogTitle>
          </DialogHeader>
          {selectedMedication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Medication Name</Label>
                  <p className="font-medium">{selectedMedication.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Generic Name</Label>
                  <p className="font-medium">{selectedMedication.generic_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <Badge className={getCategoryConfig(selectedMedication.category).color}>
                    {getCategoryConfig(selectedMedication.category).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusConfig(selectedMedication.status).color}>
                    {getStatusConfig(selectedMedication.status).label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Current Stock</Label>
                  <p className="font-medium">{selectedMedication.current_stock}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Minimum Stock</Label>
                  <p className="font-medium">{selectedMedication.minimum_stock}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Maximum Stock</Label>
                  <p className="font-medium">{selectedMedication.maximum_stock}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cost per Unit</Label>
                  <p className="font-medium">${selectedMedication.cost_per_unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Selling Price</Label>
                  <p className="font-medium">${selectedMedication.selling_price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                  <p className="font-medium">{format(parseISO(selectedMedication.expiry_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Batch Number</Label>
                  <p className="font-medium">{selectedMedication.batch_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Supplier</Label>
                  <p className="font-medium">{selectedMedication.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Storage Location</Label>
                  <p className="font-medium">{selectedMedication.storage_location}</p>
                </div>
              </div>

              {selectedMedication.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-gray-700">{selectedMedication.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
