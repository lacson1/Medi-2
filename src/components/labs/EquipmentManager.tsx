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
  Settings,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Wrench,
  Activity,
  AlertCircle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { format, parseISO, addDays, isAfter, isBefore, differenceInDays } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

const EQUIPMENT_STATUS = {
  operational: { label: 'Operational', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  maintenance: { label: 'Under Maintenance', color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
  out_of_order: { label: 'Out of Order', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  calibration: { label: 'Calibration Due', color: 'bg-orange-100 text-orange-800', icon: Settings },
  retired: { label: 'Retired', color: 'bg-gray-100 text-gray-800', icon: Shield }
};

const EQUIPMENT_TYPES = {
  analyzer: { label: 'Analyzer', color: 'bg-blue-100 text-blue-800' },
  microscope: { label: 'Microscope', color: 'bg-purple-100 text-purple-800' },
  centrifuge: { label: 'Centrifuge', color: 'bg-green-100 text-green-800' },
  incubator: { label: 'Incubator', color: 'bg-orange-100 text-orange-800' },
  refrigerator: { label: 'Refrigerator', color: 'bg-cyan-100 text-cyan-800' },
  autoclave: { label: 'Autoclave', color: 'bg-red-100 text-red-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

const MAINTENANCE_TYPES = {
  preventive: { label: 'Preventive', color: 'bg-blue-100 text-blue-800' },
  corrective: { label: 'Corrective', color: 'bg-red-100 text-red-800' },
  calibration: { label: 'Calibration', color: 'bg-orange-100 text-orange-800' },
  inspection: { label: 'Inspection', color: 'bg-green-100 text-green-800' }
};

export default function EquipmentManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    type: '',
    model: '',
    serial_number: '',
    manufacturer: '',
    purchase_date: '',
    warranty_expiry: '',
    location: '',
    status: 'operational',
    description: '',
    notes: ''
  });
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    equipment_id: '',
    type: '',
    description: '',
    scheduled_date: '',
    completed_date: '',
    technician: '',
    cost: 0,
    notes: '',
    status: 'scheduled'
  });

  const queryClient = useQueryClient();

  // Mock equipment data
  const { data: equipment = [], isLoading: loadingEquipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        name: 'Hematology Analyzer',
        type: 'analyzer',
        model: 'Sysmex XN-1000',
        serial_number: 'SYM001234',
        manufacturer: 'Sysmex Corporation',
        purchase_date: '2022-03-15',
        warranty_expiry: '2025-03-15',
        location: 'Lab Room A',
        status: 'operational',
        description: 'Automated hematology analyzer for complete blood count',
        notes: 'Regular maintenance every 3 months',
        last_maintenance: '2024-01-10',
        next_maintenance: '2024-04-10',
        utilization_rate: 85,
        created_at: '2022-03-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Compound Microscope',
        type: 'microscope',
        model: 'Olympus BX53',
        serial_number: 'OLY005678',
        manufacturer: 'Olympus Corporation',
        purchase_date: '2021-08-20',
        warranty_expiry: '2024-08-20',
        location: 'Microscopy Lab',
        status: 'calibration',
        description: 'High-resolution compound microscope for pathology',
        notes: 'Calibration due every 6 months',
        last_maintenance: '2023-12-15',
        next_maintenance: '2024-02-15',
        utilization_rate: 92,
        created_at: '2021-08-20T14:30:00Z'
      },
      {
        id: '3',
        name: 'High-Speed Centrifuge',
        type: 'centrifuge',
        model: 'Eppendorf 5424',
        serial_number: 'EPP009876',
        manufacturer: 'Eppendorf AG',
        purchase_date: '2023-01-10',
        warranty_expiry: '2026-01-10',
        location: 'Sample Processing Room',
        status: 'maintenance',
        description: 'High-speed refrigerated centrifuge for sample processing',
        notes: 'Under preventive maintenance',
        last_maintenance: '2024-01-20',
        next_maintenance: '2024-04-20',
        utilization_rate: 78,
        created_at: '2023-01-10T09:15:00Z'
      },
      {
        id: '4',
        name: 'Chemistry Analyzer',
        type: 'analyzer',
        model: 'Roche Cobas 6000',
        serial_number: 'ROC012345',
        manufacturer: 'Roche Diagnostics',
        purchase_date: '2023-06-01',
        warranty_expiry: '2026-06-01',
        location: 'Chemistry Lab',
        status: 'operational',
        description: 'Automated chemistry analyzer for clinical chemistry tests',
        notes: 'Daily QC required',
        last_maintenance: '2024-01-05',
        next_maintenance: '2024-04-05',
        utilization_rate: 95,
        created_at: '2023-06-01T08:00:00Z'
      },
      {
        id: '5',
        name: 'Incubator',
        type: 'incubator',
        model: 'Thermo Scientific Heratherm',
        serial_number: 'THM056789',
        manufacturer: 'Thermo Fisher Scientific',
        purchase_date: '2022-11-15',
        warranty_expiry: '2025-11-15',
        location: 'Microbiology Lab',
        status: 'operational',
        description: 'General purpose incubator for bacterial culture',
        notes: 'Temperature monitoring required',
        last_maintenance: '2024-01-12',
        next_maintenance: '2024-04-12',
        utilization_rate: 88,
        created_at: '2022-11-15T12:00:00Z'
      },
      {
        id: '6',
        name: 'Refrigerated Centrifuge',
        type: 'centrifuge',
        model: 'Beckman Coulter Allegra X-30R',
        serial_number: 'BCK078901',
        manufacturer: 'Beckman Coulter',
        purchase_date: '2021-12-10',
        warranty_expiry: '2024-12-10',
        location: 'Sample Processing Room',
        status: 'out_of_order',
        description: 'Refrigerated centrifuge for temperature-sensitive samples',
        notes: 'Motor failure - awaiting repair',
        last_maintenance: '2023-11-20',
        next_maintenance: '2024-02-20',
        utilization_rate: 0,
        created_at: '2021-12-10T10:30:00Z'
      }
    ])
  });

  // Mock maintenance records
  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        equipment_id: '1',
        type: 'preventive',
        description: 'Routine cleaning and calibration',
        scheduled_date: '2024-04-10',
        completed_date: null,
        technician: 'John Smith',
        cost: 150,
        notes: 'Scheduled maintenance',
        status: 'scheduled'
      },
      {
        id: '2',
        equipment_id: '2',
        type: 'calibration',
        description: 'Annual calibration check',
        scheduled_date: '2024-02-15',
        completed_date: null,
        technician: 'Sarah Johnson',
        cost: 300,
        notes: 'Calibration due',
        status: 'scheduled'
      },
      {
        id: '3',
        equipment_id: '3',
        type: 'corrective',
        description: 'Motor replacement and testing',
        scheduled_date: '2024-01-20',
        completed_date: '2024-01-22',
        technician: 'Mike Wilson',
        cost: 800,
        notes: 'Motor replaced successfully',
        status: 'completed'
      },
      {
        id: '4',
        equipment_id: '4',
        type: 'preventive',
        description: 'Monthly preventive maintenance',
        scheduled_date: '2024-04-05',
        completed_date: null,
        technician: 'John Smith',
        cost: 200,
        notes: 'Routine maintenance',
        status: 'scheduled'
      },
      {
        id: '5',
        equipment_id: '5',
        type: 'inspection',
        description: 'Temperature calibration check',
        scheduled_date: '2024-04-12',
        completed_date: null,
        technician: 'Sarah Johnson',
        cost: 100,
        notes: 'Temperature monitoring',
        status: 'scheduled'
      },
      {
        id: '6',
        equipment_id: '6',
        type: 'corrective',
        description: 'Motor failure repair',
        scheduled_date: '2024-02-20',
        completed_date: null,
        technician: 'Mike Wilson',
        cost: 1200,
        notes: 'Motor replacement required',
        status: 'in_progress'
      }
    ])
  });

  // Equipment mutations
  const equipmentMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return mockApiClient.entities.Equipment.update(data.id, data);
      } else {
        return mockApiClient.entities.Equipment.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsFormOpen(false);
      setSelectedEquipment(null);
      resetEquipmentForm();
    }
  });

  // Maintenance mutations
  const maintenanceMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return mockApiClient.entities.MaintenanceRecord.update(data.id, data);
      } else {
        return mockApiClient.entities.MaintenanceRecord.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setIsMaintenanceFormOpen(false);
      setSelectedMaintenance(null);
      resetMaintenanceForm();
    }
  });

  const resetEquipmentForm = () => {
    setEquipmentFormData({
      name: '',
      type: '',
      model: '',
      serial_number: '',
      manufacturer: '',
      purchase_date: '',
      warranty_expiry: '',
      location: '',
      status: 'operational',
      description: '',
      notes: ''
    });
  };

  const resetMaintenanceForm = () => {
    setMaintenanceFormData({
      equipment_id: '',
      type: '',
      description: '',
      scheduled_date: '',
      completed_date: '',
      technician: '',
      cost: 0,
      notes: '',
      status: 'scheduled'
    });
  };

  const getEquipmentMetrics = () => {
    const totalEquipment = equipment.length;
    const operationalEquipment = equipment.filter(eq => eq.status === 'operational').length;
    const maintenanceDue = equipment.filter(eq => {
      if (!eq.next_maintenance) return false;
      return isAfter(new Date(), parseISO(eq.next_maintenance));
    }).length;
    const underMaintenance = equipment.filter(eq => eq.status === 'maintenance').length;
    const outOfOrder = equipment.filter(eq => eq.status === 'out_of_order').length;
    const calibrationDue = equipment.filter(eq => eq.status === 'calibration').length;

    const totalMaintenanceCost = maintenanceRecords
      .filter(m => m.status === 'completed')
      .reduce((sum: any, m: any) => sum + m.cost, 0);

    const pendingMaintenanceCost = maintenanceRecords
      .filter(m => m.status === 'scheduled' || m.status === 'in_progress')
      .reduce((sum: any, m: any) => sum + m.cost, 0);

    // Calculate average utilization
    const avgUtilization = equipment.length > 0
      ? Math.round(equipment.reduce((sum: any, eq: any) => sum + eq.utilization_rate, 0) / equipment.length)
      : 0;

    // Calculate equipment age distribution
    const currentDate = new Date();
    const equipmentAges = equipment.map(eq => {
      const purchaseDate = parseISO(eq.purchase_date);
      return Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    });

    const avgAge = equipmentAges.length > 0
      ? Math.round(equipmentAges.reduce((sum, age) => sum + age, 0) / equipmentAges.length)
      : 0;

    return {
      totalEquipment,
      operationalEquipment,
      maintenanceDue,
      underMaintenance,
      outOfOrder,
      calibrationDue,
      totalMaintenanceCost,
      pendingMaintenanceCost,
      avgUtilization,
      avgAge,
      operationalRate: totalEquipment > 0 ? Math.round((operationalEquipment / totalEquipment) * 100) : 0
    };
  };

  const filteredEquipment = equipment.filter(item => {
    if (filters.type !== 'all' && item.type !== filters.type) return false;
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const metrics = getEquipmentMetrics();

  const handleEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    equipmentMutation.mutate(equipmentFormData);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    maintenanceMutation.mutate(maintenanceFormData);
  };

  const handleEditEquipment = (item: any) => {
    setEquipmentFormData(item);
    setSelectedEquipment(item);
    setIsFormOpen(true);
  };

  const handleScheduleMaintenance = (equipmentId: any) => {
    setMaintenanceFormData({ ...maintenanceFormData, equipment_id: equipmentId });
    setIsMaintenanceFormOpen(true);
  };

  const getMaintenanceStatus = (equipment: any) => {
    if (!equipment.next_maintenance) return 'unknown';
    if (isAfter(new Date(), parseISO(equipment.next_maintenance))) return 'overdue';
    if (differenceInDays(parseISO(equipment.next_maintenance), new Date()) <= 7) return 'due_soon';
    return 'scheduled';
  };

  if (loadingEquipment) {
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
      {/* Equipment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalEquipment}</p>
                <p className="text-xs text-gray-500">All equipment</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operational</p>
                <p className="text-2xl font-bold text-green-600">{metrics.operationalEquipment}</p>
                <p className="text-xs text-gray-500">{metrics.operationalRate}% operational</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance Due</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.maintenanceDue}</p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.underMaintenance}</p>
                <p className="text-xs text-gray-500">In service</p>
              </div>
              <Wrench className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Order</p>
                <p className="text-2xl font-bold text-red-600">{metrics.outOfOrder}</p>
                <p className="text-xs text-gray-500">Needs repair</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calibration Due</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.calibrationDue}</p>
                <p className="text-xs text-gray-500">Needs calibration</p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Average Utilization</span>
              <span className="text-lg font-bold">{metrics.avgUtilization}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.avgUtilization}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Equipment usage efficiency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maintenance Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm font-bold text-green-600">${metrics.totalMaintenanceCost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending</span>
                <span className="text-sm font-bold text-orange-600">${metrics.pendingMaintenanceCost}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium">Total Budget</span>
                <span className="text-sm font-bold">${metrics.totalMaintenanceCost + metrics.pendingMaintenanceCost}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipment Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Average Age</span>
              <span className="text-lg font-bold">{metrics.avgAge} years</span>
            </div>
            <div className="text-xs text-gray-500">
              <p>Equipment lifecycle management</p>
              <p className="mt-1">Consider replacement planning</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {metrics.maintenanceDue > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Warning:</strong> You have {metrics.maintenanceDue} equipment items with overdue maintenance.
            <div className="mt-2">
              {equipment.filter(eq => {
                if (!eq.next_maintenance) return false;
                return isAfter(new Date(), parseISO(eq.next_maintenance));
              }).map(eq => (
                <div key={eq.id} className="text-sm">
                  • {eq.name} - Due on {eq.next_maintenance}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {metrics.outOfOrder > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical:</strong> You have {metrics.outOfOrder} equipment items out of order.
            <div className="mt-2">
              {equipment.filter(eq => eq.status === 'out_of_order').map(eq => (
                <div key={eq.id} className="text-sm">
                  • {eq.name} - {eq.notes}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {metrics.calibrationDue > 0 && (
        <Alert className="border-purple-200 bg-purple-50">
          <AlertTriangle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Alert:</strong> You have {metrics.calibrationDue} equipment items requiring calibration.
            <div className="mt-2">
              {equipment.filter(eq => eq.status === 'calibration').map(eq => (
                <div key={eq.id} className="text-sm">
                  • {eq.name} - Calibration required
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {metrics.underMaintenance > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Info:</strong> You have {metrics.underMaintenance} equipment items currently under maintenance.
            <div className="mt-2">
              {equipment.filter(eq => eq.status === 'maintenance').map(eq => (
                <div key={eq.id} className="text-sm">
                  • {eq.name} - {eq.notes}
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
              <Settings className="w-5 h-5" />
              Equipment Management
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsMaintenanceFormOpen(true)}>
                <Wrench className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Equipment Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(EQUIPMENT_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(EQUIPMENT_STATUS).map(([key, config]) => (
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
                  placeholder="Search equipment..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item: any) => {
          const statusConfig = EQUIPMENT_STATUS[item.status];
          const typeConfig = EQUIPMENT_TYPES[item.type];
          const maintenanceStatus = getMaintenanceStatus(item);
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={typeConfig.color} variant="outline">
                        {typeConfig.label}
                      </Badge>
                      <Badge className={statusConfig.color} variant="outline">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditEquipment(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleScheduleMaintenance(item.id)}>
                      <Wrench className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Model:</span> {item.model}</p>
                  <p><span className="font-medium">Serial:</span> {item.serial_number}</p>
                  <p><span className="font-medium">Location:</span> {item.location}</p>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Utilization:</span>
                    <span>{item.utilization_rate}%</span>
                  </div>
                  <Progress value={item.utilization_rate} className="mt-1" />
                </div>

                {item.next_maintenance && (
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Next Maintenance:</span>
                      <span className={maintenanceStatus === 'overdue' ? 'text-red-600 font-medium' : ''}>
                        {format(parseISO(item.next_maintenance), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {maintenanceStatus === 'overdue' && (
                      <Badge className="bg-red-100 text-red-800 mt-1" variant="outline">
                        Overdue
                      </Badge>
                    )}
                    {maintenanceStatus === 'due_soon' && (
                      <Badge className="bg-orange-100 text-orange-800 mt-1" variant="outline">
                        Due Soon
                      </Badge>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p><span className="font-medium">Manufacturer:</span> {item.manufacturer}</p>
                  <p><span className="font-medium">Warranty:</span> {format(parseISO(item.warranty_expiry), 'MMM yyyy')}</p>
                </div>

                {item.description && (
                  <div className="text-sm text-gray-600">
                    <p>{item.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No equipment found matching your criteria</p>
        </div>
      )}

      {/* Add/Edit Equipment Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEquipmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  value={equipmentFormData.name}
                  onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Equipment Type *</Label>
                <Select value={equipmentFormData.type} onValueChange={(value) => setEquipmentFormData({ ...equipmentFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EQUIPMENT_TYPES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={equipmentFormData.model}
                  onChange={(e) => setEquipmentFormData({ ...equipmentFormData, model: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={equipmentFormData.serial_number}
                  onChange={(e) => setEquipmentFormData({ ...equipmentFormData, serial_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={equipmentFormData.manufacturer}
                  onChange={(e) => setEquipmentFormData({ ...equipmentFormData, manufacturer: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={equipmentFormData.location}
                  onChange={(e) => setEquipmentFormData({ ...equipmentFormData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={equipmentFormData.purchase_date}
                  onChange={(e) => setEquipmentFormData({ ...equipmentFormData, purchase_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={equipmentFormData.warranty_expiry}
                  onChange={(e) => setEquipmentFormData({ ...equipmentFormData, warranty_expiry: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={equipmentFormData.status} onValueChange={(value) => setEquipmentFormData({ ...equipmentFormData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EQUIPMENT_STATUS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={equipmentFormData.description}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={equipmentFormData.notes}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsFormOpen(false);
                setSelectedEquipment(null);
                resetEquipmentForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={equipmentMutation.isPending}>
                {equipmentMutation.isPending ? 'Saving...' : 'Save Equipment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Maintenance Dialog */}
      <Dialog open={isMaintenanceFormOpen} onOpenChange={setIsMaintenanceFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{"Schedule Maintenance"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
            <div>
              <Label htmlFor="equipment_id">Equipment</Label>
              <Select value={maintenanceFormData.equipment_id} onValueChange={(value) => setMaintenanceFormData({ ...maintenanceFormData, equipment_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq: any) => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Maintenance Type</Label>
              <Select value={maintenanceFormData.type} onValueChange={(value) => setMaintenanceFormData({ ...maintenanceFormData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MAINTENANCE_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={maintenanceFormData.description}
                onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={maintenanceFormData.scheduled_date}
                  onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, scheduled_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="technician">Technician</Label>
                <Input
                  id="technician"
                  value={maintenanceFormData.technician}
                  onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, technician: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cost">Estimated Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={maintenanceFormData.cost}
                onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={maintenanceFormData.notes}
                onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsMaintenanceFormOpen(false);
                setSelectedMaintenance(null);
                resetMaintenanceForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={maintenanceMutation.isPending}>
                {maintenanceMutation.isPending ? 'Scheduling...' : 'Schedule Maintenance'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
