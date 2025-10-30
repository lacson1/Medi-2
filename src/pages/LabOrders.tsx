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
  TestTube,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Download,
  RefreshCw,
  FileText,
  Beaker,
  Microscope,
  Camera,
  Upload as UploadIcon,
  Printer
} from 'lucide-react';
import { format, parseISO, differenceInDays, isToday, isAfter } from 'date-fns';
import LabOrderForm from '@/components/labs/LabOrderForm';
import LabWorkflowManager from '@/components/labs/LabWorkflowManager';
import LabReports from '@/components/labs/LabReports';
import UploadLabResultModal from '@/components/labs/UploadLabResultModal';
import AddLabResultModal from '@/components/labs/AddLabResultModal';
import PrintableLabReport from '@/components/labs/PrintableLabReport';
import LabAnalytics from '@/components/labs/LabAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LabResult } from '@/api/entities';
import LabOrdersDashboard from '@/components/labs/LabOrdersDashboard';

const TEST_CATEGORIES = {
  hematology: { label: 'Hematology', icon: TestTube, color: 'bg-red-100 text-red-800' },
  chemistry: { label: 'Chemistry', icon: Beaker, color: 'bg-blue-100 text-blue-800' },
  microbiology: { label: 'Microbiology', icon: Microscope, color: 'bg-green-100 text-green-800' },
  immunology: { label: 'Immunology', icon: Activity, color: 'bg-purple-100 text-purple-800' },
  pathology: { label: 'Pathology', icon: Eye, color: 'bg-orange-100 text-orange-800' },
  imaging: { label: 'Imaging', icon: Camera, color: 'bg-cyan-100 text-cyan-800' },
  other: { label: 'Other', icon: FileText, color: 'bg-gray-100 text-gray-800' }
};

export default function LabOrders() {
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedLabOrder, setSelectedLabOrder] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddResultModalOpen, setIsAddResultModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedTestName, setSelectedTestName] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    dateRange: 'all',
    search: ''
  });
  const queryClient = useQueryClient();

  // Fetch lab orders with comprehensive data
  const { data: labOrders, isLoading: loadingLabOrders } = useQuery({
    queryKey: ['labOrders', filters],
    queryFn: () => mockApiClient.entities.LabOrder.list(),
  });

  // Fetch patients for lab order context
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
  });

  // Fetch lab results
  const { data: labResults = [] } = useQuery({
    queryKey: ['labResults'],
    queryFn: () => LabResult.list(),
  });

  // Lab order mutations
  const labOrderMutation = useMutation({
    mutationFn: (data: any) =>
      data.id ? mockApiClient.entities.LabOrder.update(data.id, data) : mockApiClient.entities.LabOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labOrders'] });
      queryClient.invalidateQueries({ queryKey: ['labResults'] });
      setIsFormOpen(false);
      setSelectedLabOrder(null);
    }
  });

  // Calculate dashboard metrics
  const dashboardMetrics = React.useMemo(() => {
    if (!labOrders) return {};

    const today = new Date();
    const totalOrders = labOrders.length;
    const pendingOrders = labOrders.filter(order => order.status === 'pending').length;
    const completedToday = labOrders.filter(order =>
      order.status === 'completed' &&
      order.completed_date &&
      isToday(parseISO(order.completed_date))
    ).length;
    const urgentOrders = labOrders.filter(order => order.priority === 'urgent').length;
    const statOrders = labOrders.filter(order => order.priority === 'stat').length;
    const overdueOrders = labOrders.filter(order => {
      if (!order.due_date) return false;
      try {
        return isAfter(today, parseISO(order.due_date)) && order.status !== 'completed';
      } catch (error) {
        console.warn('Invalid due_date format:', order.due_date);
        return false;
      }
    }).length;

    return {
      totalOrders,
      pendingOrders,
      completedToday,
      urgentOrders,
      statOrders,
      overdueOrders,
      completionRate: totalOrders > 0 ? Math.round((completedToday / totalOrders) * 100) : 0
    };
  }, [labOrders]);

  // Filter lab orders based on current filters
  const filteredLabOrders = React.useMemo(() => {
    if (!labOrders) return [];

    return labOrders.filter(order => {
      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) return false;

      // Priority filter
      if (filters.priority !== 'all' && order.priority !== filters.priority) return false;

      // Category filter
      if (filters.category !== 'all' && order.test_category !== filters.category) return false;

      // Search filter
      if (filters.search && !order.test_name.toLowerCase().includes(filters.search.toLowerCase())) return false;

      // Date range filter
      if (filters.dateRange !== 'all') {
        if (!order.date_ordered) return false;
        try {
          const orderDate = parseISO(order.date_ordered);
          const now = new Date();

          switch (filters.dateRange) {
            case 'today':
              return isToday(orderDate);
            case 'week':
              return differenceInDays(now, orderDate) <= 7;
            case 'month':
              return differenceInDays(now, orderDate) <= 30;
            default:
              return true;
          }
        } catch (error) {
          console.warn('Invalid date_ordered format:', order.date_ordered);
          return false;
        }
      }

      return true;
    });
  }, [labOrders, filters]);

  const handleFormSubmit = (data: any) => {
    labOrderMutation.mutate(data);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedLabOrder(null);
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const openAddResultModal = (testName: any) => {
    setSelectedTestName(testName);
    setIsAddResultModalOpen(true);
  };

  const closeAddResultModal = () => {
    setIsAddResultModalOpen(false);
    setSelectedTestName('');
  };

  const openPrintModal = (order: any) => {
    setSelectedLabOrder(order);
    setIsPrintModalOpen(true);
  };

  const closePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedLabOrder(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate PDF download logic here
    console.log('Download lab report as PDF');
  };

  const getStatusConfig = (status: any) => {
    const configs = {
      requested: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Requested' },
      ordered: { icon: FileText, color: 'bg-gray-100 text-gray-800', label: 'Ordered' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      specimen_collected: { icon: TestTube, color: 'bg-purple-100 text-purple-800', label: 'Specimen Collected' },
      in_progress: { icon: Activity, color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
      reviewed: { icon: Eye, color: 'bg-purple-100 text-purple-800', label: 'Reviewed' },
      cancelled: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return configs[status] || configs.ordered;
  };

  const getPriorityConfig = (priority: any) => {
    const configs = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      routine: { color: 'bg-blue-100 text-blue-800', label: 'Routine' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
      stat: { color: 'bg-red-200 text-red-900', label: 'STAT' }
    };
    return configs[priority] || configs.routine;
  };

  const getTestCategoryConfig = (category: any) => {
    return TEST_CATEGORIES[category] || TEST_CATEGORIES.other;
  };

  if (loadingLabOrders) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Modernized Dashboard (2025 UI) */}
        <div className="mb-8">
          <LabOrdersDashboard onNavigateToPatient={(id) => (window.location.href = `/patients/${id}?tab=labs`)} />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TestTube className="w-8 h-8 text-blue-600" />
              Lab Orders & Tests
            </h1>
            <p className="text-gray-600 mt-1">Manage laboratory orders, tests, and results</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={openUploadModal} variant="outline" className="flex items-center gap-2">
              <UploadIcon className="w-4 h-4" />
              Upload Existing Results
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Lab Order
            </Button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalOrders}</p>
                </div>
                <TestTube className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardMetrics.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardMetrics.completedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">STAT Orders</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardMetrics.statOrders}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-orange-600">{dashboardMetrics.urgentOrders}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardMetrics.overdueOrders}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {dashboardMetrics.overdueOrders > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You have {dashboardMetrics.overdueOrders} overdue lab orders that require immediate attention.
            </AlertDescription>
          </Alert>
        )}

        {dashboardMetrics.statOrders > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You have {dashboardMetrics.statOrders} STAT orders that need immediate processing.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Lab Orders</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Lab Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="specimen_collected">Specimen Collected</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                    <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="stat">STAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                    <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(TEST_CATEGORIES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="w-4 h-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search tests..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lab Orders List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Lab Orders ({filteredLabOrders.length})
                  </span>
                  <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['labOrders'] })}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLabOrders.map((order: any) => {
                    const statusConfig = getStatusConfig(order.status);
                    const priorityConfig = getPriorityConfig(order.priority);
                    const categoryConfig = getTestCategoryConfig(order.test_category);
                    const patient = patients?.find(p => p.id === order.patient_id);

                    return (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{order.test_name}</h4>
                              <Badge className={statusConfig.color}>
                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                              <Badge className={priorityConfig.color}>
                                {priorityConfig.label}
                              </Badge>
                              {order.test_category && (
                                <Badge className={categoryConfig.color} variant="outline">
                                  <categoryConfig.icon className="w-3 h-3 mr-1" />
                                  {categoryConfig.label}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Patient:</span> {patient?.name || 'Unknown'}
                              </div>
                              <div>
                                <span className="font-medium">Ordered:</span> {order.date_ordered ? (() => {
                                  try {
                                    return format(parseISO(order.date_ordered), 'MMM d, yyyy');
                                  } catch (error) {
                                    return 'Invalid Date';
                                  }
                                })() : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Doctor:</span> {order.ordering_doctor || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Due:</span> {order.due_date ? (() => {
                                  try {
                                    return format(parseISO(order.due_date), 'MMM d, yyyy');
                                  } catch (error) {
                                    return 'Invalid Date';
                                  }
                                })() : 'N/A'}
                              </div>
                            </div>

                            {order.clinical_indication && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Indication:</span> {order.clinical_indication}
                              </p>
                            )}

                            {order.results_summary && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                <span className="font-medium">Results:</span> {order.results_summary}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            {order.status !== 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAddResultModal(order.test_name)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Result
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPrintModal(order)}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            {order.result_file_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={order.result_file_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedLabOrder(order);
                              setIsFormOpen(true);
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedLabOrder(order);
                              // Navigate to patient profile with lab order context
                              window.location.href = `/patients/${order.patient_id}?tab=labs&order=${order.id}`;
                            }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredLabOrders.length === 0 && (
                    <div className="text-center py-12">
                      <TestTube className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No lab orders found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow">
            <LabWorkflowManager labOrders={labOrders} patients={patients} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <LabReports labOrders={labOrders} patients={patients} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <LabAnalytics labOrders={labOrders} />
          </TabsContent>
        </Tabs>

        {/* Lab Order Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedLabOrder ? 'Edit Lab Order' : 'New Lab Order'}
              </DialogTitle>
            </DialogHeader>
            <LabOrderForm
              labOrder={selectedLabOrder}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedLabOrder(null);
              }}
              isSubmitting={labOrderMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Upload Lab Result Modal */}
        <UploadLabResultModal
          isOpen={isUploadModalOpen}
          onClose={closeUploadModal}
        />

        {/* Add Lab Result Modal */}
        <AddLabResultModal
          isOpen={isAddResultModalOpen}
          onClose={closeAddResultModal}
          labOrder={selectedLabOrder}
          testName={selectedTestName}
        />

        {/* Print Lab Report Modal */}
        <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{"Lab Report"}</DialogTitle>
            </DialogHeader>
            {selectedLabOrder && (
              <PrintableLabReport
                labOrder={selectedLabOrder}
                labResults={labResults.filter(result => result.lab_order_id === selectedLabOrder.id)}
                patient={patients?.find(p => p.id === selectedLabOrder.patient_id)}
                onPrint={handlePrint}
                onDownload={handleDownload}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
