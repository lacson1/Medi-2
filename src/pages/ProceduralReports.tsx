import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { ProceduralReport, Appointment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Stethoscope,
  Activity,
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  FileSignature,
  Bell,
  DollarSign,
  Target,
  Award
} from 'lucide-react';
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { toast } from 'sonner';

const PROCEDURE_TYPES = [
  'Biopsy', 'Endoscopy', 'Colonoscopy', 'Bronchoscopy', 'Arthroscopy',
  'Laparoscopy', 'Cardiac Catheterization', 'Angiography', 'Ultrasound',
  'CT Scan', 'MRI', 'X-Ray', 'Blood Draw', 'IV Insertion', 'Surgery',
  'Minor Surgery', 'Dental Procedure', 'Physical Therapy', 'Other'
];

const REPORT_STATUS = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Activity },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
};

export default function ProceduralReports() {
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    procedure_type: 'all',
    date_range: '30d',
    search: ''
  });
  const queryClient = useQueryClient();

  // Fetch procedural reports
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['proceduralReports', filters],
    queryFn: () => ProceduralReport.list(),
  });

  // Calculate analytics and metrics
  const analytics = useMemo(() => {
    if (!reports.length) return null;

    const now = new Date();
    const thisMonth = reports.filter(r => {
      const reportDate = parseISO(r.procedure_date);
      return reportDate >= startOfMonth(now) && reportDate <= endOfMonth(now);
    });

    const lastMonth = reports.filter(r => {
      const reportDate = parseISO(r.procedure_date);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      return reportDate >= lastMonthStart && reportDate <= lastMonthEnd;
    });

    // Procedure type distribution
    const procedureTypes = reports.reduce((acc: any, report) => {
      const type = report.procedure_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Status distribution
    const statusDistribution = reports.reduce((acc: any, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly trends
    const monthlyTrends = reports.reduce((acc: any, report) => {
      const month = format(parseISO(report.procedure_date), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = { total: 0, completed: 0, complications: 0 };
      }
      acc[month].total += 1;
      if (report.status === 'completed') acc[month].completed += 1;
      if (report.complications) acc[month].complications += 1;
      return acc;
    }, {});

    // Success rate calculation
    const successRate = reports.length > 0
      ? ((statusDistribution.completed || 0) / reports.length * 100).toFixed(1)
      : 0;

    // Complication rate
    const complicationRate = reports.length > 0
      ? (reports.filter(r => r.complications).length / reports.length * 100).toFixed(1)
      : 0;

    // Follow-up rate
    const followUpRate = reports.length > 0
      ? (reports.filter(r => r.follow_up_required).length / reports.length * 100).toFixed(1)
      : 0;

    return {
      totalReports: reports.length,
      thisMonth: thisMonth.length,
      lastMonth: lastMonth.length,
      monthlyGrowth: lastMonth.length > 0
        ? (((thisMonth.length - lastMonth.length) / lastMonth.length) * 100).toFixed(1)
        : 0,
      successRate: parseFloat(successRate),
      complicationRate: parseFloat(complicationRate),
      followUpRate: parseFloat(followUpRate),
      procedureTypes,
      statusDistribution,
      monthlyTrends,
      topProcedureTypes: Object.entries(procedureTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    };
  }, [reports]);

  // Fetch patients for selection
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
  });

  // Fetch appointments for follow-up scheduling
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => Appointment.list(),
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data) => {
      const reportData = { ...data };

      // If follow-up is required, create appointment
      if (data.follow_up_required && data.follow_up_details) {
        const appointmentData = {
          patient_id: data.patient_id,
          date: data.follow_up_details.date,
          time: data.follow_up_details.time,
          doctor: data.follow_up_details.doctor,
          type: 'follow_up',
          notes: `Follow-up for procedure: ${data.procedure_name}`,
          status: 'scheduled'
        };

        const appointment = await Appointment.create(appointmentData);
        reportData.follow_up_appointment_id = appointment.id;
      }

      return ProceduralReport.create(reportData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proceduralReports'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Procedural report created successfully');
      setIsFormOpen(false);
      setSelectedReport(null);
    },
    onError: (error: any) => {
      toast.error('Failed to create procedural report');
      console.error('Error creating report:', error);
    }
  });

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: (data: any) => ProceduralReport.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proceduralReports'] });
      toast.success('Procedural report updated successfully');
      setIsFormOpen(false);
      setSelectedReport(null);
    },
    onError: (error: any) => {
      toast.error('Failed to update procedural report');
      console.error('Error updating report:', error);
    }
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (id: any) => ProceduralReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proceduralReports'] });
      toast.success('Procedural report deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete procedural report');
      console.error('Error deleting report:', error);
    }
  });

  // Filter reports based on tab and filters
  const filteredReports = React.useMemo(() => {
    let filtered = reports.filter(report => {
      // Status filter
      if (filters.status !== 'all' && report.status !== filters.status) {
        return false;
      }

      // Procedure type filter
      if (filters.procedure_type !== 'all' && report.procedure_type !== filters.procedure_type) {
        return false;
      }

      // Search filter
      if (filters.search && !report.procedure_name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.date_range !== 'all') {
        const reportDate = parseISO(report.procedure_date);
        const now = new Date();
        const daysAgo = parseInt(filters.date_range.replace('d', ''));

        if (daysAgo && (now - reportDate) > (daysAgo * 24 * 60 * 60 * 1000)) {
          return false;
        }
      }

      return true;
    });

    // Filter by tab
    switch (activeTab) {
      case 'scheduled':
        return filtered.filter(report => report.status === 'scheduled');
      case 'completed':
        return filtered.filter(report => report.status === 'completed');
      default:
        return filtered;
    }
  }, [reports, filters, activeTab]);

  const handleFormSubmit = (data: any) => {
    if (selectedReport) {
      updateReportMutation.mutate({ ...data, id: selectedReport.id });
    } else {
      createReportMutation.mutate(data);
    }
  };

  const handleDelete = (id: any) => {
    if (window.confirm('Are you sure you want to delete this procedural report?')) {
      deleteReportMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedReport(null);
  };

  const openEditModal = (report: any) => {
    setSelectedReport(report);
    setIsFormOpen(true);
  };

  const getStatusConfig = (status: any) => {
    return REPORT_STATUS[status] || REPORT_STATUS.scheduled;
  };

  if (loadingReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Procedural Reports
            </h1>
            <p className="text-gray-600 mt-1">Document and track medical procedures with follow-up scheduling</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Procedural Report
          </Button>
        </div>

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
                <Label>{"Status"}</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(REPORT_STATUS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{"Procedure Type"}</Label>
                <Select value={filters.procedure_type} onValueChange={(value) => setFilters({ ...filters, procedure_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PROCEDURE_TYPES.map((type: any) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{"Date Range"}</Label>
                <Select value={filters.date_range} onValueChange={(value) => setFilters({ ...filters, date_range: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{"Search"}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search reports..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ status: 'all', procedure_type: 'all', date_range: '30d', search: '' })}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Key Metrics */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalReports}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">
                      {analytics.monthlyGrowth > 0 ? '+' : ''}{analytics.monthlyGrowth}%
                    </span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.successRate}%</p>
                  </div>
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <Progress value={analytics.successRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Complication Rate</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.complicationRate}%</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="mt-4">
                  <Progress value={analytics.complicationRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Follow-up Rate</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.followUpRate}%</p>
                  </div>
                  <Bell className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="mt-4">
                  <Progress value={analytics.followUpRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Procedure Type Distribution */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Procedure Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProcedureTypes.map(([type, count]) => {
                    const percentage = (count / analytics.totalReports * 100).toFixed(1);
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{type}</span>
                            <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                          </div>
                          <Progress value={parseFloat(percentage)} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                    const statusConfig = getStatusConfig(status);
                    const percentage = (count / analytics.totalReports * 100).toFixed(1);
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <statusConfig.icon className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">{statusConfig.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{count}</span>
                          <span className="text-sm text-gray-400">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Advanced Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Advanced Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Monthly Trends */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.monthlyTrends).slice(-6).map(([month, data]) => (
                        <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{month}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Total: {data.total}</span>
                            <span className="text-sm text-green-600">Completed: {data.completed}</span>
                            <span className="text-sm text-red-600">Complications: {data.complications}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Success Rate</span>
                          <span className="text-lg font-bold text-green-600">{analytics.successRate}%</span>
                        </div>
                        <Progress value={analytics.successRate} className="mt-2 h-2" />
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-800">Complication Rate</span>
                          <span className="text-lg font-bold text-red-600">{analytics.complicationRate}%</span>
                        </div>
                        <Progress value={analytics.complicationRate} className="mt-2 h-2" />
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">Follow-up Rate</span>
                          <span className="text-lg font-bold text-blue-600">{analytics.followUpRate}%</span>
                        </div>
                        <Progress value={analytics.followUpRate} className="mt-2 h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export and Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export & Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Reports
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print Summary
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Reports List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Procedural Reports ({filteredReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredReports.length > 0 ? (
                  <div className="space-y-4">
                    {filteredReports.map((report: any) => {
                      const statusConfig = getStatusConfig(report.status);
                      const patient = patients.find(p => p.id === report.patient_id);

                      return (
                        <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg">{report.procedure_name}</h4>
                                <Badge className={statusConfig.color}>
                                  <statusConfig.icon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                                {report.procedure_type && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {report.procedure_type}
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span><strong>Patient:</strong> {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span><strong>Date:</strong> {format(parseISO(report.procedure_date), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span><strong>Performed by:</strong> {report.performed_by || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Stethoscope className="w-4 h-4" />
                                  <span><strong>Location:</strong> {report.location || 'N/A'}</span>
                                </div>
                              </div>

                              {report.findings && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Findings:</span> {report.findings}
                                  </p>
                                </div>
                              )}

                              {report.follow_up_required && (
                                <div className="mb-3">
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                    Follow-up Required
                                  </Badge>
                                </div>
                              )}

                              {report.notes && (
                                <p className="text-sm text-gray-600 italic">
                                  <span className="font-medium">Notes:</span> {report.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(report)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/patients/${report.patient_id}?tab=procedures`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(report.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No procedural reports found matching your criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Procedural Report Form Modal */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                {selectedReport ? 'Edit Procedural Report' : 'Create Procedural Report'}
              </DialogTitle>
            </DialogHeader>
            <ProceduralReportForm
              report={selectedReport}
              patients={patients}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
              isSubmitting={createReportMutation.isPending || updateReportMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Procedural Report Form Component
function ProceduralReportForm({ report, patients, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(report || {
    patient_id: '',
    procedure_name: '',
    procedure_type: '',
    procedure_date: new Date().toISOString().split('T')[0],
    performed_by: '',
    location: '',
    indication: '',
    procedure_details: '',
    findings: '',
    complications: '',
    specimens_collected: '',
    status: 'completed',
    follow_up_required: false,
    follow_up_details: {
      date: '',
      time: '',
      doctor: '',
      notes: ''
    },
    notes: '',
    cost: '',
    duration_minutes: '',
    anesthesia_used: false,
    anesthesia_type: '',
    pre_procedure_medications: '',
    post_procedure_medications: '',
    discharge_instructions: '',
    digital_signature: '',
    signed_by: '',
    signature_date: ''
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Please select a patient';
    }

    if (!formData.procedure_name.trim()) {
      newErrors.procedure_name = 'Please enter procedure name';
    }

    if (!formData.procedure_date) {
      newErrors.procedure_date = 'Please select procedure date';
    }

    if (!formData.performed_by.trim()) {
      newErrors.performed_by = 'Please enter who performed the procedure';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Please enter procedure location';
    }

    if (!formData.indication.trim()) {
      newErrors.indication = 'Please enter procedure indication';
    }

    if (formData.follow_up_required) {
      if (!formData.follow_up_details.date) {
        newErrors['follow_up_details.date'] = 'Please select follow-up date';
      }
      if (!formData.follow_up_details.doctor.trim()) {
        newErrors['follow_up_details.doctor'] = 'Please enter follow-up doctor';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error('Please fix the errors before submitting');
    }
    setIsValidating(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    const errorKey = `${parentField}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection */}
      <div className="space-y-2">
        <Label>{"Patient *"}</Label>
        <Select
          value={formData.patient_id}
          onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient: any) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name} - {patient.date_of_birth}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Procedure Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Procedure Name *"}</Label>
          <Input
            value={formData.procedure_name}
            onChange={(e) => setFormData({ ...formData, procedure_name: e.target.value })}
            placeholder="e.g., Colonoscopy"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>{"Procedure Type"}</Label>
          <Select
            value={formData.procedure_type}
            onValueChange={(value) => setFormData({ ...formData, procedure_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select procedure type" />
            </SelectTrigger>
            <SelectContent>
              {PROCEDURE_TYPES.map((type: any) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date and Performer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Procedure Date *"}</Label>
          <Input
            type="date"
            value={formData.procedure_date}
            onChange={(e) => setFormData({ ...formData, procedure_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>{"Performed By"}</Label>
          <Input
            value={formData.performed_by}
            onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
            placeholder="Doctor or practitioner name"
          />
        </div>
      </div>

      {/* Location and Indication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Location"}</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Operating Room 1"
          />
        </div>

        <div className="space-y-2">
          <Label>{"Indication"}</Label>
          <Input
            value={formData.indication}
            onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
            placeholder="Reason for procedure"
          />
        </div>
      </div>

      {/* Procedure Details */}
      <div className="space-y-2">
        <Label>{"Procedure Details"}</Label>
        <Textarea
          value={formData.procedure_details}
          onChange={(e) => setFormData({ ...formData, procedure_details: e.target.value })}
          placeholder="Detailed description of the procedure performed..."
          rows={3}
        />
      </div>

      {/* Findings */}
      <div className="space-y-2">
        <Label>{"Findings"}</Label>
        <Textarea
          value={formData.findings}
          onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
          placeholder="What was found during the procedure..."
          rows={3}
        />
      </div>

      {/* Complications */}
      <div className="space-y-2">
        <Label>{"Complications"}</Label>
        <Textarea
          value={formData.complications}
          onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
          placeholder="Any complications encountered..."
          rows={2}
        />
      </div>

      {/* Specimens Collected */}
      <div className="space-y-2">
        <Label>{"Specimens Collected"}</Label>
        <Input
          value={formData.specimens_collected}
          onChange={(e) => setFormData({ ...formData, specimens_collected: e.target.value })}
          placeholder="e.g., Biopsy samples, Blood samples"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>{"Status"}</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REPORT_STATUS).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Follow-up Required */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="follow_up_required"
            checked={formData.follow_up_required}
            onCheckedChange={(checked) => setFormData({ ...formData, follow_up_required: checked })}
          />
          <Label htmlFor="follow_up_required">Follow-up Required</Label>
        </div>

        {formData.follow_up_required && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-4">
            <h4 className="font-medium text-yellow-800">Follow-up Appointment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{"Follow - up Date"}</Label>
                <Input
                  type="date"
                  value={formData.follow_up_details.date}
                  onChange={(e) => setFormData({
                    ...formData,
                    follow_up_details: { ...formData.follow_up_details, date: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{"Follow - up Time"}</Label>
                <Input
                  type="time"
                  value={formData.follow_up_details.time}
                  onChange={(e) => setFormData({
                    ...formData,
                    follow_up_details: { ...formData.follow_up_details, time: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{"Follow - up Doctor"}</Label>
                <Input
                  value={formData.follow_up_details.doctor}
                  onChange={(e) => setFormData({
                    ...formData,
                    follow_up_details: { ...formData.follow_up_details, doctor: e.target.value }
                  })}
                  placeholder="Doctor name"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Follow - up Notes"}</Label>
                <Input
                  value={formData.follow_up_details.notes}
                  onChange={(e) => setFormData({
                    ...formData,
                    follow_up_details: { ...formData.follow_up_details, notes: e.target.value }
                  })}
                  placeholder="Follow-up instructions"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>{"Additional Notes"}</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional notes or observations..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? 'Saving...' : 'Create Report'}
        </Button>
      </div>
    </form>
  );
}
