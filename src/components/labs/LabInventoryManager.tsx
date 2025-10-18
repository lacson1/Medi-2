import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from '@/api/mockApiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Calendar,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { format, parseISO, addDays, isAfter, isBefore } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const INVENTORY_CATEGORIES = {
  reagents: { label: 'Reagents', color: 'bg-blue-100 text-blue-800' },
  consumables: { label: 'Consumables', color: 'bg-green-100 text-green-800' },
  equipment: { label: 'Equipment', color: 'bg-purple-100 text-purple-800' },
  supplies: { label: 'Supplies', color: 'bg-orange-100 text-orange-800' },
  chemicals: { label: 'Chemicals', color: 'bg-red-100 text-red-800' }
};

const STOCK_STATUS = {
  in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-800' },
  low_stock: { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-800' },
  expired: { label: 'Expired', color: 'bg-red-200 text-red-900' },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-orange-100 text-orange-800' }
};

export default function LabInventoryManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    unit: '',
    cost_per_unit: 0,
    supplier: '',
    expiry_date: '',
    lot_number: '',
    storage_location: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Mock inventory data - in real app, this would come from API
  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        name: 'Blood Collection Tubes',
        category: 'consumables',
        description: 'Sterile blood collection tubes',
        current_stock: 150,
        minimum_stock: 50,
        maximum_stock: 500,
        unit: 'pieces',
        cost_per_unit: 2.50,
        supplier: 'MedSupply Co.',
        expiry_date: '2024-12-31',
        lot_number: 'BC2024001',
        storage_location: 'Room A-1',
        notes: 'Store at room temperature',
        last_updated: '2024-01-15T10:30:00Z',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Glucose Test Strips',
        category: 'reagents',
        description: 'Glucose testing strips for blood glucose monitoring',
        current_stock: 25,
        minimum_stock: 100,
        maximum_stock: 1000,
        unit: 'strips',
        cost_per_unit: 1.20,
        supplier: 'LabTech Solutions',
        expiry_date: '2024-06-15',
        lot_number: 'GS2024002',
        storage_location: 'Refrigerator B-2',
        notes: 'Store in refrigerator, avoid light',
        last_updated: '2024-01-14T14:20:00Z',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Microscope Slides',
        category: 'supplies',
        description: 'Glass microscope slides for specimen examination',
        current_stock: 0,
        minimum_stock: 200,
        maximum_stock: 2000,
        unit: 'pieces',
        cost_per_unit: 0.50,
        supplier: 'Scientific Supplies Inc.',
        expiry_date: null,
        lot_number: 'MS2024003',
        storage_location: 'Room C-3',
        notes: 'Handle with care',
        last_updated: '2024-01-13T09:15:00Z',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'Hemoglobin Reagent',
        category: 'reagents',
        description: 'Hemoglobin testing reagent for hematology analyzer',
        current_stock: 45,
        minimum_stock: 50,
        maximum_stock: 200,
        unit: 'ml',
        cost_per_unit: 15.75,
        supplier: 'Diagnostic Solutions',
        expiry_date: '2024-03-20',
        lot_number: 'HB2024004',
        storage_location: 'Refrigerator A-1',
        notes: 'Store at 2-8°C, protect from light',
        last_updated: '2024-01-12T11:45:00Z',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        name: 'Disposable Pipette Tips',
        category: 'consumables',
        description: 'Sterile pipette tips for liquid handling',
        current_stock: 5000,
        minimum_stock: 1000,
        maximum_stock: 10000,
        unit: 'pieces',
        cost_per_unit: 0.08,
        supplier: 'Lab Essentials',
        expiry_date: null,
        lot_number: 'PT2024005',
        storage_location: 'Room B-2',
        notes: 'Sterile packaging',
        last_updated: '2024-01-11T16:20:00Z',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        name: 'Calcium Control Solution',
        category: 'reagents',
        description: 'Calcium control solution for quality control',
        current_stock: 8,
        minimum_stock: 20,
        maximum_stock: 100,
        unit: 'ml',
        cost_per_unit: 25.00,
        supplier: 'Quality Controls Inc.',
        expiry_date: '2024-02-28',
        lot_number: 'CA2024006',
        storage_location: 'Refrigerator C-1',
        notes: 'Expires soon - order replacement',
        last_updated: '2024-01-10T09:30:00Z',
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
  });

  // Create/Update inventory item
  const inventoryMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return mockApiClient.entities.InventoryItem.update(data.id, data);
      } else {
        return mockApiClient.entities.InventoryItem.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsFormOpen(false);
      setSelectedItem(null);
      resetForm();
    }
  });

  // Delete inventory item
  const deleteMutation = useMutation({
    mutationFn: (id: any) => mockApiClient.entities.InventoryItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      current_stock: 0,
      minimum_stock: 0,
      maximum_stock: 0,
      unit: '',
      cost_per_unit: 0,
      supplier: '',
      expiry_date: '',
      lot_number: '',
      storage_location: '',
      notes: ''
    });
  };

  const getStockStatus = (item: any) => {
    if (item.current_stock === 0) return 'out_of_stock';
    if (item.current_stock <= item.minimum_stock) return 'low_stock';
    if (item.expiry_date && isAfter(new Date(), parseISO(item.expiry_date))) return 'expired';
    if (item.expiry_date && isBefore(new Date(), addDays(parseISO(item.expiry_date), 30))) return 'expiring_soon';
    return 'in_stock';
  };

  const getProgressClass = (percentage: number) => {
    // Round to nearest 5% for CSS class matching
    const rounded = Math.round(percentage / 5) * 5;
    return `progress-${Math.min(Math.max(rounded, 0), 100)}`;
  };

  const getInventoryMetrics = () => {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => getStockStatus(item) === 'low_stock').length;
    const outOfStockItems = inventoryItems.filter(item => getStockStatus(item) === 'out_of_stock').length;
    const expiringSoonItems = inventoryItems.filter(item => getStockStatus(item) === 'expiring_soon').length;
    const expiredItems = inventoryItems.filter(item => getStockStatus(item) === 'expired').length;
    const totalValue = inventoryItems.reduce((sum: any, item: any) => sum + (item.current_stock * item.cost_per_unit), 0);

    // Calculate category breakdown
    const categoryBreakdown = inventoryItems.reduce((acc: any, item: any) => {
      const category = INVENTORY_CATEGORIES[item.category]?.label || 'Other';
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 };
      }
      acc[category].count += 1;
      acc[category].value += item.current_stock * item.cost_per_unit;
      return acc;
    }, {});

    // Calculate stock utilization
    const stockUtilization = inventoryItems.reduce((acc: any, item: any) => {
      if (item.maximum_stock > 0) {
        acc.total += (item.current_stock / item.maximum_stock) * 100;
        acc.count += 1;
      }
      return acc;
    }, { total: 0, count: 0 });

    const avgStockUtilization = stockUtilization.count > 0 ? stockUtilization.total / stockUtilization.count : 0;

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      expiringSoonItems,
      expiredItems,
      totalValue,
      categoryBreakdown,
      avgStockUtilization: Math.round(avgStockUtilization)
    };
  };

  const filteredItems = inventoryItems.filter(item => {
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.status !== 'all' && getStockStatus(item) !== filters.status) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        item.name,
        item.description,
        item.supplier,
        item.lot_number,
        item.storage_location,
        item.notes
      ].join(' ').toLowerCase();
      if (!searchableFields.includes(searchTerm)) return false;
    }
    return true;
  });

  const metrics = getInventoryMetrics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inventoryMutation.mutate(formData);
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: any) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalItems}</p>
                <p className="text-xs text-gray-500">All inventory items</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.lowStockItems}</p>
                <p className="text-xs text-gray-500">Below minimum</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{metrics.outOfStockItems}</p>
                <p className="text-xs text-gray-500">Zero inventory</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.expiringSoonItems}</p>
                <p className="text-xs text-gray-500">Within 30 days</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-800">{metrics.expiredItems}</p>
                <p className="text-xs text-gray-500">Past expiry date</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">${metrics.totalValue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Inventory worth</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Average Utilization</span>
              <span className="text-lg font-bold">{metrics.avgStockUtilization}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${getProgressClass(metrics.avgStockUtilization)}`}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Based on current vs maximum stock levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.categoryBreakdown).map(([category, data]: [string, any]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{data.count} items</span>
                    <p className="text-xs text-gray-500">${data.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {metrics.outOfStockItems > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical:</strong> You have {metrics.outOfStockItems} items out of stock that need immediate attention.
            <div className="mt-2">
              {inventoryItems.filter(item => getStockStatus(item) === 'out_of_stock').map(item => (
                <div key={item.id} className="text-sm">
                  • {item.name} - {item.current_stock} {item.unit} remaining
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {metrics.expiredItems > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical:</strong> You have {metrics.expiredItems} expired items that must be removed from inventory.
            <div className="mt-2">
              {inventoryItems.filter(item => getStockStatus(item) === 'expired').map(item => (
                <div key={item.id} className="text-sm">
                  • {item.name} - Expired on {item.expiry_date}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {metrics.expiringSoonItems > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Warning:</strong> You have {metrics.expiringSoonItems} items expiring within 30 days.
            <div className="mt-2">
              {inventoryItems.filter(item => getStockStatus(item) === 'expiring_soon').map(item => (
                <div key={item.id} className="text-sm">
                  • {item.name} - Expires on {item.expiry_date}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {metrics.lowStockItems > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Alert:</strong> You have {metrics.lowStockItems} items with low stock levels.
            <div className="mt-2">
              {inventoryItems.filter(item => getStockStatus(item) === 'low_stock').map(item => (
                <div key={item.id} className="text-sm">
                  • {item.name} - {item.current_stock}/{item.minimum_stock} {item.unit}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Management
            </CardTitle>
            <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(INVENTORY_CATEGORIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Stock Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
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
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Search Items</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, supplier, lot..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Reorder
              </Button>
              <Button variant="outline" className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                Advanced
              </Button>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Showing {filteredItems.length} of {inventoryItems.length} items</p>
                <p className="text-xs">Total value: ${filteredItems.reduce((sum: any, item: any) => sum + (item.current_stock * item.cost_per_unit), 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item: any) => {
          const stockStatus = getStockStatus(item);
          const statusConfig = STOCK_STATUS[stockStatus];
          const categoryConfig = INVENTORY_CATEGORIES[item.category];

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={categoryConfig.color} variant="outline">
                        {categoryConfig.label}
                      </Badge>
                      <Badge className={statusConfig.color} variant="outline">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p>{item.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Current Stock:</span>
                    <p className="text-lg font-bold">{item.current_stock} {item.unit}</p>
                  </div>
                  <div>
                    <span className="font-medium">Min Stock:</span>
                    <p>{item.minimum_stock} {item.unit}</p>
                  </div>
                </div>

                {/* Stock Level Progress Bar */}
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Stock Level</span>
                    <span className="text-xs text-gray-500">
                      {item.maximum_stock > 0 ? Math.round((item.current_stock / item.maximum_stock) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${stockStatus === 'out_of_stock' ? 'bg-red-500' :
                        stockStatus === 'low_stock' ? 'bg-yellow-500' :
                          'bg-green-500'
                        } ${getProgressClass(item.maximum_stock > 0 ? Math.min((item.current_stock / item.maximum_stock) * 100, 100) : 0)}`}
                    ></div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Cost per unit:</span>
                    <span>${item.cost_per_unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total value:</span>
                    <span className="font-medium">${(item.current_stock * item.cost_per_unit).toFixed(2)}</span>
                  </div>
                </div>

                {item.expiry_date && (
                  <div className="text-sm">
                    <span className="font-medium">Expires:</span>
                    <p className={stockStatus === 'expired' ? 'text-red-600 font-medium' :
                      stockStatus === 'expiring_soon' ? 'text-orange-600 font-medium' : ''}>
                      {format(parseISO(item.expiry_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p><span className="font-medium">Location:</span> {item.storage_location}</p>
                  <p><span className="font-medium">Supplier:</span> {item.supplier}</p>
                  {item.lot_number && (
                    <p><span className="font-medium">Lot:</span> {item.lot_number}</p>
                  )}
                </div>

                {item.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Notes:</span>
                    <p className="text-xs mt-1">{item.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No inventory items found matching your criteria</p>
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INVENTORY_CATEGORIES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current_stock">Current Stock *</Label>
                <Input
                  id="current_stock"
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock">Minimum Stock *</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maximum_stock">Maximum Stock</Label>
                <Input
                  id="maximum_stock"
                  type="number"
                  value={formData.maximum_stock}
                  onChange={(e) => setFormData({ ...formData, maximum_stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., pieces, ml, kg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost_per_unit">Cost per Unit</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_unit}
                  onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lot_number">Lot Number</Label>
                <Input
                  id="lot_number"
                  value={formData.lot_number}
                  onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="storage_location">Storage Location</Label>
                <Input
                  id="storage_location"
                  value={formData.storage_location}
                  onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsFormOpen(false);
                setSelectedItem(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={inventoryMutation.isPending}>
                {inventoryMutation.isPending ? 'Saving...' : 'Save Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
