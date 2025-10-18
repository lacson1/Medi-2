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
  Shield,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Activity,
  AlertCircle,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  Target,
  Zap
} from 'lucide-react';
import { format, parseISO, addDays, isAfter, isBefore, differenceInDays } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const QC_STATUS = {
  passed: { label: 'Passed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Activity },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
};

const QC_TYPES = {
  internal: { label: 'Internal QC', color: 'bg-blue-100 text-blue-800' },
  external: { label: 'External QC', color: 'bg-purple-100 text-purple-800' },
  proficiency: { label: 'Proficiency Testing', color: 'bg-green-100 text-green-800' },
  calibration: { label: 'Calibration', color: 'bg-orange-100 text-orange-800' },
  maintenance: { label: 'Maintenance QC', color: 'bg-cyan-100 text-cyan-800' }
};

const COMPLIANCE_STATUS = {
  compliant: { label: 'Compliant', color: 'bg-green-100 text-green-800' },
  non_compliant: { label: 'Non-Compliant', color: 'bg-red-100 text-red-800' },
  warning: { label: 'Warning', color: 'bg-yellow-100 text-yellow-800' },
  pending_review: { label: 'Pending Review', color: 'bg-blue-100 text-blue-800' }
};

export default function QualityControl({ labOrders = [] }: any) {
  const [activeTab, setActiveTab] = useState('qc_tests');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [formData, setFormData] = useState({
    test_name: '',
    type: '',
    description: '',
    target_value: '',
    acceptable_range_min: '',
    acceptable_range_max: '',
    actual_value: '',
    status: 'pending',
    performed_by: '',
    performed_date: '',
    notes: '',
    corrective_action: ''
  });

  const queryClient = useQueryClient();

  // Mock QC data
  const { data: qcTests = [], isLoading: loadingQC } = useQuery({
    queryKey: ['qcTests'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        test_name: 'Glucose Control',
        type: 'internal',
        description: 'Daily glucose control testing',
        target_value: 100,
        acceptable_range_min: 95,
        acceptable_range_max: 105,
        actual_value: 98,
        status: 'passed',
        performed_by: 'John Smith',
        performed_date: '2024-01-15',
        notes: 'Within acceptable range',
        corrective_action: '',
        created_at: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        test_name: 'Hematology Control',
        type: 'internal',
        description: 'Weekly hematology control testing',
        target_value: 7.2,
        acceptable_range_min: 6.8,
        acceptable_range_max: 7.6,
        actual_value: 7.8,
        status: 'failed',
        performed_by: 'Sarah Johnson',
        performed_date: '2024-01-14',
        notes: 'Value outside acceptable range',
        corrective_action: 'Recalibrated analyzer and retested',
        created_at: '2024-01-14T10:30:00Z'
      },
      {
        id: '3',
        test_name: 'Proficiency Test - Chemistry',
        type: 'proficiency',
        description: 'Monthly proficiency testing for chemistry panel',
        target_value: 0,
        acceptable_range_min: 0,
        acceptable_range_max: 0,
        actual_value: 0,
        status: 'pending',
        performed_by: '',
        performed_date: '',
        notes: 'Scheduled for next week',
        corrective_action: '',
        created_at: '2024-01-10T09:00:00Z'
      },
      {
        id: '4',
        test_name: 'Hemoglobin Control',
        type: 'internal',
        description: 'Daily hemoglobin control testing',
        target_value: 12.5,
        acceptable_range_min: 12.0,
        acceptable_range_max: 13.0,
        actual_value: 12.3,
        status: 'passed',
        performed_by: 'Mike Wilson',
        performed_date: '2024-01-15',
        notes: 'Within acceptable range',
        corrective_action: '',
        created_at: '2024-01-15T09:30:00Z'
      },
      {
        id: '5',
        test_name: 'Chemistry Panel Control',
        type: 'internal',
        description: 'Daily chemistry panel control testing',
        target_value: 140,
        acceptable_range_min: 135,
        acceptable_range_max: 145,
        actual_value: 142,
        status: 'passed',
        performed_by: 'John Smith',
        performed_date: '2024-01-15',
        notes: 'All parameters within range',
        corrective_action: '',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '6',
        test_name: 'Calibration Verification',
        type: 'calibration',
        description: 'Monthly calibration verification',
        target_value: 0,
        acceptable_range_min: -2,
        acceptable_range_max: 2,
        actual_value: 1.2,
        status: 'passed',
        performed_by: 'Sarah Johnson',
        performed_date: '2024-01-12',
        notes: 'Calibration within acceptable limits',
        corrective_action: '',
        created_at: '2024-01-12T14:00:00Z'
      },
      {
        id: '7',
        test_name: 'Temperature Monitoring',
        type: 'maintenance',
        description: 'Daily temperature monitoring for refrigerators',
        target_value: 4,
        acceptable_range_min: 2,
        acceptable_range_max: 6,
        actual_value: 5.5,
        status: 'failed',
        performed_by: 'Mike Wilson',
        performed_date: '2024-01-14',
        notes: 'Temperature slightly above acceptable range',
        corrective_action: 'Adjusted thermostat and monitored for 24 hours',
        created_at: '2024-01-14T16:00:00Z'
      }
    ])
  });

  // Mock compliance data
  const { data: complianceRecords = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        area: 'Personnel Training',
        requirement: 'Annual competency assessment',
        status: 'compliant',
        last_review: '2024-01-01',
        next_review: '2025-01-01',
        responsible_person: 'Lab Manager',
        notes: 'All staff completed annual competency assessment'
      },
      {
        id: '2',
        area: 'Equipment Calibration',
        requirement: 'Quarterly calibration verification',
        status: 'warning',
        last_review: '2023-12-15',
        next_review: '2024-03-15',
        responsible_person: 'Equipment Technician',
        notes: 'Calibration due within 30 days'
      },
      {
        id: '3',
        area: 'Documentation',
        requirement: 'Monthly documentation review',
        status: 'non_compliant',
        last_review: '2023-11-30',
        next_review: '2024-01-30',
        responsible_person: 'Quality Manager',
        notes: 'Documentation review overdue'
      },
      {
        id: '4',
        area: 'Quality Control',
        requirement: 'Daily QC testing',
        status: 'compliant',
        last_review: '2024-01-15',
        next_review: '2024-01-16',
        responsible_person: 'Lab Technicians',
        notes: 'Daily QC tests completed successfully'
      },
      {
        id: '5',
        area: 'Safety Protocols',
        requirement: 'Monthly safety training',
        status: 'compliant',
        last_review: '2024-01-01',
        next_review: '2024-02-01',
        responsible_person: 'Safety Officer',
        notes: 'All staff completed safety training'
      },
      {
        id: '6',
        area: 'Sample Handling',
        requirement: 'Chain of custody documentation',
        status: 'warning',
        last_review: '2024-01-10',
        next_review: '2024-02-10',
        responsible_person: 'Sample Coordinator',
        notes: 'Some documentation gaps identified'
      }
    ])
  });

  // QC mutations
  const qcMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return mockApiClient.entities.QCTest.update(data.id, data);
      } else {
        return mockApiClient.entities.QCTest.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qcTests'] });
      setIsFormOpen(false);
      setSelectedQC(null);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      test_name: '',
      type: '',
      description: '',
      target_value: '',
      acceptable_range_min: '',
      acceptable_range_max: '',
      actual_value: '',
      status: 'pending',
      performed_by: '',
      performed_date: '',
      notes: '',
      corrective_action: ''
    });
  };

  const getQCMetrics = () => {
    const totalTests = qcTests.length;
    const passedTests = qcTests.filter(test => test.status === 'passed').length;
    const failedTests = qcTests.filter(test => test.status === 'failed').length;
    const pendingTests = qcTests.filter(test => test.status === 'pending').length;
    const inProgressTests = qcTests.filter(test => test.status === 'in_progress').length;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    // Calculate trends (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentTests = qcTests.filter(test =>
      test.performed_date && parseISO(test.performed_date) >= sevenDaysAgo
    );
    const previousTests = qcTests.filter(test =>
      test.performed_date &&
      parseISO(test.performed_date) >= fourteenDaysAgo &&
      parseISO(test.performed_date) < sevenDaysAgo
    );

    const recentPassRate = recentTests.length > 0
      ? Math.round((recentTests.filter(t => t.status === 'passed').length / recentTests.length) * 100)
      : 0;
    const previousPassRate = previousTests.length > 0
      ? Math.round((previousTests.filter(t => t.status === 'passed').length / previousTests.length) * 100)
      : 0;

    const trendDirection = recentPassRate > previousPassRate ? 'up' :
      recentPassRate < previousPassRate ? 'down' : 'stable';

    return {
      totalTests,
      passedTests,
      failedTests,
      pendingTests,
      inProgressTests,
      passRate,
      recentPassRate,
      previousPassRate,
      trendDirection
    };
  };

  const getComplianceMetrics = () => {
    const totalAreas = complianceRecords.length;
    const compliantAreas = complianceRecords.filter(area => area.status === 'compliant').length;
    const nonCompliantAreas = complianceRecords.filter(area => area.status === 'non_compliant').length;
    const warningAreas = complianceRecords.filter(area => area.status === 'warning').length;
    const complianceRate = totalAreas > 0 ? Math.round((compliantAreas / totalAreas) * 100) : 0;

    return {
      totalAreas,
      compliantAreas,
      nonCompliantAreas,
      warningAreas,
      complianceRate
    };
  };

  const filteredQCTests = qcTests.filter(test => {
    if (filters.type !== 'all' && test.type !== filters.type) return false;
    if (filters.status !== 'all' && test.status !== filters.status) return false;
    if (filters.search && !test.test_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const qcMetrics = getQCMetrics();
  const complianceMetrics = getComplianceMetrics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    qcMutation.mutate(formData);
  };

  const handleEdit = (test: any) => {
    setFormData(test);
    setSelectedQC(test);
    setIsFormOpen(true);
  };

  const isWithinRange = (actual, min, max) => {
    return actual >= min && actual <= max;
  };

  if (loadingQC) {
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
      {/* QC Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{qcMetrics.totalTests}</p>
                <p className="text-xs text-gray-500">All QC tests</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{qcMetrics.passedTests}</p>
                <p className="text-xs text-gray-500">{qcMetrics.passRate}% pass rate</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{qcMetrics.failedTests}</p>
                <p className="text-xs text-gray-500">Need attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{qcMetrics.pendingTests}</p>
                <p className="text-xs text-gray-500">Awaiting results</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{qcMetrics.inProgressTests}</p>
                <p className="text-xs text-gray-500">Currently running</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trend</p>
                <div className="flex items-center gap-1">
                  {qcMetrics.trendDirection === 'up' && <TrendingUp className="w-5 h-5 text-green-600" />}
                  {qcMetrics.trendDirection === 'down' && <TrendingDown className="w-5 h-5 text-red-600" />}
                  {qcMetrics.trendDirection === 'stable' && <Target className="w-5 h-5 text-gray-600" />}
                  <span className="text-lg font-bold">
                    {qcMetrics.trendDirection === 'up' ? '+' : qcMetrics.trendDirection === 'down' ? '-' : '='}
                  </span>
                </div>
                <p className="text-xs text-gray-500">vs last week</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional QC Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pass Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">This Week</span>
                <span className="text-sm font-bold text-green-600">{qcMetrics.recentPassRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Last Week</span>
                <span className="text-sm font-bold text-gray-600">{qcMetrics.previousPassRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${qcMetrics.recentPassRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">Quality performance over time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(QC_TYPES).map(([type, config]) => {
                const count = qcTests.filter(test => test.type === type).length;
                const percentage = qcTests.length > 0 ? Math.round((count / qcTests.length) * 100) : 0;
                return (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{config.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">{count}</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-green-600">{complianceMetrics.complianceRate}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliant Areas</p>
                <p className="text-2xl font-bold text-green-600">{complianceMetrics.compliantAreas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">{complianceMetrics.nonCompliantAreas}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{complianceMetrics.warningAreas}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {qcMetrics.failedTests > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical:</strong> You have {qcMetrics.failedTests} failed QC tests that require immediate attention.
            <div className="mt-2">
              {qcTests.filter(test => test.status === 'failed').map(test => (
                <div key={test.id} className="text-sm">
                  • {test.test_name} - {test.notes}
                  {test.corrective_action && (
                    <div className="ml-4 text-xs text-orange-700">
                      Action: {test.corrective_action}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {complianceMetrics.nonCompliantAreas > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical:</strong> You have {complianceMetrics.nonCompliantAreas} non-compliant areas that need corrective action.
            <div className="mt-2">
              {complianceRecords.filter(record => record.status === 'non_compliant').map(record => (
                <div key={record.id} className="text-sm">
                  • {record.area} - {record.notes}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {complianceMetrics.warningAreas > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Warning:</strong> You have {complianceMetrics.warningAreas} areas with compliance warnings.
            <div className="mt-2">
              {complianceRecords.filter(record => record.status === 'warning').map(record => (
                <div key={record.id} className="text-sm">
                  • {record.area} - {record.notes}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {qcMetrics.pendingTests > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Info:</strong> You have {qcMetrics.pendingTests} QC tests pending completion.
            <div className="mt-2">
              {qcTests.filter(test => test.status === 'pending').map(test => (
                <div key={test.id} className="text-sm">
                  • {test.test_name} - {test.notes}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="qc_tests">QC Tests</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
        </TabsList>

        {/* QC Tests Tab */}
        <TabsContent value="qc_tests" className="space-y-6">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Quality Control Tests
                </CardTitle>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add QC Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">Test Type</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(QC_TYPES).map(([key, config]) => (
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
                      {Object.entries(QC_STATUS).map(([key, config]) => (
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

          {/* QC Tests List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQCTests.map((test: any) => {
              const statusConfig = QC_STATUS[test.status];
              const typeConfig = QC_TYPES[test.type];
              const StatusIcon = statusConfig.icon;
              const withinRange = isWithinRange(test.actual_value, test.acceptable_range_min, test.acceptable_range_max);

              return (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{test.test_name}</CardTitle>
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
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(test)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p>{test.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Target:</span>
                        <p>{test.target_value}</p>
                      </div>
                      <div>
                        <span className="font-medium">Actual:</span>
                        <p className={withinRange ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {test.actual_value}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Acceptable Range:</span>
                      <p>{test.acceptable_range_min} - {test.acceptable_range_max}</p>
                    </div>

                    {test.performed_by && (
                      <div className="text-sm text-gray-500">
                        <p><span className="font-medium">Performed by:</span> {test.performed_by}</p>
                        <p><span className="font-medium">Date:</span> {format(parseISO(test.performed_date), 'MMM d, yyyy')}</p>
                      </div>
                    )}

                    {test.corrective_action && (
                      <div className="text-sm">
                        <span className="font-medium text-orange-600">Corrective Action:</span>
                        <p className="text-orange-600">{test.corrective_action}</p>
                      </div>
                    )}

                    {test.notes && (
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Notes:</span> {test.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredQCTests.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No QC tests found matching your criteria</p>
            </div>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceRecords.map((record: any) => {
              const statusConfig = COMPLIANCE_STATUS[record.status];
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{record.area}</CardTitle>
                        <Badge className={statusConfig.color} variant="outline">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Requirement:</span> {record.requirement}</p>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p><span className="font-medium">Last Review:</span> {format(parseISO(record.last_review), 'MMM d, yyyy')}</p>
                      <p><span className="font-medium">Next Review:</span> {format(parseISO(record.next_review), 'MMM d, yyyy')}</p>
                      <p><span className="font-medium">Responsible:</span> {record.responsible_person}</p>
                    </div>

                    {record.notes && (
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Notes:</span> {record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Trends & Analytics Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                QC Trends & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">QC trends and analytics will be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">This feature will show historical QC data, trends, and performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit QC Test Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQC ? 'Edit QC Test' : 'Add New QC Test'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test_name">Test Name *</Label>
                <Input
                  id="test_name"
                  value={formData.test_name}
                  onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Test Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QC_TYPES).map(([key, config]) => (
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
                <Label htmlFor="target_value">Target Value</Label>
                <Input
                  id="target_value"
                  type="number"
                  step="0.01"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="acceptable_range_min">Min Range</Label>
                <Input
                  id="acceptable_range_min"
                  type="number"
                  step="0.01"
                  value={formData.acceptable_range_min}
                  onChange={(e) => setFormData({ ...formData, acceptable_range_min: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="acceptable_range_max">Max Range</Label>
                <Input
                  id="acceptable_range_max"
                  type="number"
                  step="0.01"
                  value={formData.acceptable_range_max}
                  onChange={(e) => setFormData({ ...formData, acceptable_range_max: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actual_value">Actual Value</Label>
                <Input
                  id="actual_value"
                  type="number"
                  step="0.01"
                  value={formData.actual_value}
                  onChange={(e) => setFormData({ ...formData, actual_value: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QC_STATUS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="performed_by">Performed By</Label>
                <Input
                  id="performed_by"
                  value={formData.performed_by}
                  onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="performed_date">Performed Date</Label>
                <Input
                  id="performed_date"
                  type="date"
                  value={formData.performed_date}
                  onChange={(e) => setFormData({ ...formData, performed_date: e.target.value })}
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

            <div>
              <Label htmlFor="corrective_action">Corrective Action</Label>
              <Textarea
                id="corrective_action"
                value={formData.corrective_action}
                onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsFormOpen(false);
                setSelectedQC(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={qcMutation.isPending}>
                {qcMutation.isPending ? 'Saving...' : 'Save QC Test'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
