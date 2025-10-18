import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Pill,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays, subDays, isAfter, isBefore } from "date-fns";

export default function PrescriptionHistory({ prescriptions = [], patients = [] }: any) {
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [historyStats, setHistoryStats] = useState({});

  useEffect(() => {
    applyFilters();
    calculateHistoryStats();
  }, [prescriptions, searchTerm, statusFilter, dateRange, patientFilter]);

  const applyFilters = () => {
    let filtered = [...prescriptions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rx => 
        rx.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.prescribing_doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.indication?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rx => rx.status === statusFilter);
    }

    // Patient filter
    if (patientFilter !== 'all') {
      filtered = filtered.filter(rx => rx.patient_id === patientFilter);
    }

    // Date range filter
    const today = new Date();
    if (dateRange === 'last_week') {
      const lastWeek = subDays(today, 7);
      filtered = filtered.filter(rx => isAfter(parseISO(rx.start_date), lastWeek));
    } else if (dateRange === 'last_month') {
      const lastMonth = subDays(today, 30);
      filtered = filtered.filter(rx => isAfter(parseISO(rx.start_date), lastMonth));
    } else if (dateRange === 'last_year') {
      const lastYear = subDays(today, 365);
      filtered = filtered.filter(rx => isAfter(parseISO(rx.start_date), lastYear));
    }

    // Sort by start date (newest first)
    filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    setFilteredPrescriptions(filtered);
  };

  const calculateHistoryStats = () => {
    const stats = {
      totalPrescriptions: prescriptions.length,
      activePrescriptions: prescriptions.filter(rx => rx.status === 'active').length,
      completedPrescriptions: prescriptions.filter(rx => rx.status === 'completed').length,
      discontinuedPrescriptions: prescriptions.filter(rx => rx.status === 'discontinued').length,
      onHoldPrescriptions: prescriptions.filter(rx => rx.status === 'on_hold').length,
      totalPatients: new Set(prescriptions.map(rx => rx.patient_id)).size,
      avgPrescriptionsPerPatient: prescriptions.length / Math.max(new Set(prescriptions.map(rx => rx.patient_id)).size, 1),
      mostPrescribedMedication: getMostPrescribedMedication(),
      adherenceRate: calculateAverageAdherence()
    };

    setHistoryStats(stats);
  };

  const getMostPrescribedMedication = () => {
    const medicationCount = {};
    prescriptions.forEach(rx => {
      medicationCount[rx.medication_name] = (medicationCount[rx.medication_name] || 0) + 1;
    });
    
    const sorted = Object.entries(medicationCount).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : { name: 'None', count: 0 };
  };

  const calculateAverageAdherence = () => {
    // Mock adherence calculation
    const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');
    if (activePrescriptions.length === 0) return 0;
    
    const totalAdherence = activePrescriptions.reduce((sum: any, rx: any) => {
      return sum + (Math.random() * 0.4 + 0.6) * 100; // Mock 60-100% adherence
    }, 0);
    
    return Math.round(totalAdherence / activePrescriptions.length);
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'discontinued': return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'discontinued': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'on_hold': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const exportHistory = () => {
    const csvContent = [
      ['Medication', 'Patient', 'Doctor', 'Status', 'Start Date', 'End Date', 'Dosage', 'Frequency', 'Indication'],
      ...filteredPrescriptions.map(rx => [
        rx.medication_name,
        patients.find(p => p.id === rx.patient_id)?.name || 'Unknown',
        rx.prescribing_doctor,
        rx.status,
        format(parseISO(rx.start_date), 'yyyy-MM-dd'),
        rx.end_date ? format(parseISO(rx.end_date), 'yyyy-MM-dd') : '',
        `${rx.dosage} ${rx.dosage_unit}`,
        `${rx.frequency} ${rx.frequency_unit}`,
        rx.indication || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-blue-600">{historyStats.totalPrescriptions}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{historyStats.activePrescriptions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{historyStats.completedPrescriptions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Adherence</p>
                <p className="text-2xl font-bold text-purple-600">{historyStats.adherenceRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{"Search"}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search medications, doctors..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{"Status"}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{"Date Range"}</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{"Patient"}</Label>
              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
            </p>
            <Button variant="outline" onClick={exportHistory}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescription History Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Prescription List</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Prescription History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No prescriptions found</p>
                </div>
              ) : (
                filteredPrescriptions.map((rx: any) => {
                  const patient = patients.find(p => p.id === rx.patient_id);
                  return (
                    <div key={rx.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(rx.status)}
                            <h4 className="font-semibold text-lg">{rx.medication_name}</h4>
                            <Badge className={getStatusColor(rx.status)}>
                              {rx.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Patient:</strong> {patient?.name || 'Unknown'}</p>
                              <p><strong>Doctor:</strong> {rx.prescribing_doctor}</p>
                              <p><strong>Indication:</strong> {rx.indication || 'Not specified'}</p>
                            </div>
                            <div>
                              <p><strong>Dosage:</strong> {rx.dosage} {rx.dosage_unit}</p>
                              <p><strong>Frequency:</strong> {rx.frequency} {rx.frequency_unit}</p>
                              <p><strong>Route:</strong> {rx.route}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Start: {format(parseISO(rx.start_date), 'MMM d, yyyy')}</span>
                            </div>
                            {rx.end_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>End: {format(parseISO(rx.end_date), 'MMM d, yyyy')}</span>
                              </div>
                            )}
                            {rx.refills > 0 && (
                              <div className="flex items-center gap-1">
                                <Pill className="w-4 h-4" />
                                <span>Refills: {rx.refills}</span>
                              </div>
                            )}
                          </div>

                          {rx.notes && (
                            <p className="text-sm italic text-gray-500 mt-2">{rx.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedPrescription(rx)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Prescription Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPrescriptions.slice(0, 10).map((rx, index) => {
                  const patient = patients.find(p => p.id === rx.patient_id);
                  return (
                    <div key={rx.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Pill className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{rx.medication_name}</h4>
                            <p className="text-sm text-gray-600">
                              {patient?.name || 'Unknown'} • {rx.prescribing_doctor}
                            </p>
                            <p className="text-sm text-gray-500">
                              {rx.dosage} {rx.dosage_unit} • {rx.frequency} {rx.frequency_unit}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getStatusColor(rx.status)}>
                              {rx.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(parseISO(rx.start_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Prescription Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Prescriptions</span>
                  <span className="font-semibold">{historyStats.totalPrescriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Prescriptions</span>
                  <span className="font-semibold text-green-600">{historyStats.activePrescriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed Prescriptions</span>
                  <span className="font-semibold text-blue-600">{historyStats.completedPrescriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Discontinued Prescriptions</span>
                  <span className="font-semibold text-red-600">{historyStats.discontinuedPrescriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">On Hold Prescriptions</span>
                  <span className="font-semibold text-yellow-600">{historyStats.onHoldPrescriptions}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Patient Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Patients</span>
                  <span className="font-semibold">{historyStats.totalPatients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Prescriptions per Patient</span>
                  <span className="font-semibold">{Math.round(historyStats.avgPrescriptionsPerPatient * 10) / 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Most Prescribed Medication</span>
                  <span className="font-semibold">{historyStats.mostPrescribedMedication.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Times Prescribed</span>
                  <span className="font-semibold">{historyStats.mostPrescribedMedication.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Adherence Rate</span>
                  <span className="font-semibold">{historyStats.adherenceRate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Prescription Details</span>
              <Button variant="outline" onClick={() => setSelectedPrescription(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Medication</Label>
                  <p className="text-lg font-semibold">{selectedPrescription.medication_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p>{patients.find(p => p.id === selectedPrescription.patient_id)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prescribing Doctor</Label>
                  <p>{selectedPrescription.prescribing_doctor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Indication</Label>
                  <p>{selectedPrescription.indication || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Dosage</Label>
                  <p>{selectedPrescription.dosage} {selectedPrescription.dosage_unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Frequency</Label>
                  <p>{selectedPrescription.frequency} {selectedPrescription.frequency_unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Route</Label>
                  <p>{selectedPrescription.route}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedPrescription.status)}>
                    {selectedPrescription.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Dates</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Start Date:</span> {format(parseISO(selectedPrescription.start_date), 'MMM d, yyyy')}
                  </div>
                  {selectedPrescription.end_date && (
                    <div>
                      <span className="font-medium">End Date:</span> {format(parseISO(selectedPrescription.end_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedPrescription.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm">{selectedPrescription.notes}</p>
                </div>
              )}
              
              {selectedPrescription.special_instructions && (
                <div>
                  <Label className="text-sm font-medium">Special Instructions</Label>
                  <p className="text-sm">{selectedPrescription.special_instructions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
