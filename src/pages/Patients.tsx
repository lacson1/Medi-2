
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, LayoutGrid, List, Filter, Download, Users, Calendar, AlertCircle, CheckCircle, XCircle, SortAsc, SortDesc, Database, FileText, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, parseISO } from "date-fns";
import { Patient } from "@/types";

import PatientCard from "../components/patients/PatientCard";
import PatientListItem from "../components/patients/PatientListItem";
import PatientForm from "../components/patients/PatientForm";
import { useNavigate } from "react-router-dom";

export default function PatientsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [view, setView] = useState("list");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
  });

  // Enhanced filtering and sorting logic
  const filteredAndSortedPatients = useMemo(() => {
    if (!patients) return [];

    let filtered = patients.filter(patient => {
      // Search filter
      const matchesSearch = searchTerm === "" ||
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.address?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || patient.status === statusFilter;

      // Age filter
      const age = patient.date_of_birth ? differenceInYears(new Date(), parseISO(patient.date_of_birth)) : null;
      let matchesAge = true;
      if (ageFilter !== "all" && age !== null) {
        switch (ageFilter) {
          case "pediatric":
            matchesAge = age < 18;
            break;
          case "adult":
            matchesAge = age >= 18 && age < 65;
            break;
          case "senior":
            matchesAge = age >= 65;
            break;
          case "infant":
            matchesAge = age < 2;
            break;
          case "child":
            matchesAge = age >= 2 && age < 12;
            break;
          case "teen":
            matchesAge = age >= 12 && age < 18;
            break;
        }
      }

      // Blood type filter
      const matchesBloodType = bloodTypeFilter === "all" || patient.blood_type === bloodTypeFilter;

      return matchesSearch && matchesStatus && matchesAge && matchesBloodType;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name": {
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          break;
        }
        case "age": {
          const ageA = a.date_of_birth ? differenceInYears(new Date(), parseISO(a.date_of_birth)) : 0;
          const ageB = b.date_of_birth ? differenceInYears(new Date(), parseISO(b.date_of_birth)) : 0;
          comparison = ageA - ageB;
          break;
        }
        case "created": {
          const dateA = (a as any).created_date || a.created_at;
          const dateB = (b as any).created_date || b.created_at;
          comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
          break;
        }
        case "status": {
          comparison = (a.status || "").localeCompare(b.status || "");
          break;
        }
        case "email": {
          comparison = (a.email || "").localeCompare(b.email || "");
          break;
        }
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [patients, searchTerm, statusFilter, ageFilter, bloodTypeFilter, sortBy, sortOrder]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && filteredAndSortedPatients.length > 0) {
        e.preventDefault();
        if (selectedPatients.length === filteredAndSortedPatients.length) {
          setSelectedPatients([]);
        } else {
          setSelectedPatients(filteredAndSortedPatients.map(p => p.id));
        }
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        setSelectedPatients([]);
        setShowBulkActions(false);
      }

      // Ctrl/Cmd + E to export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const csvContent = [
          ['Name', 'Email', 'Phone', 'Age', 'Gender', 'Status', 'Blood Type', 'Allergies', 'Medical Conditions'],
          ...filteredAndSortedPatients.map(patient => [
            `${patient.first_name} ${patient.last_name}`,
            patient.email || '',
            patient.phone || '',
            patient.date_of_birth ? differenceInYears(new Date(), parseISO(patient.date_of_birth)) : '',
            patient.gender || '',
            patient.status || 'active',
            patient.blood_type || '',
            patient.allergies?.join('; ') || '',
            (patient as any).medical_conditions?.join('; ') || ''
          ])
        ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredAndSortedPatients, selectedPatients.length]);

  const createMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Patient.create(data),
    onSuccess: () => {
      // Invalidate all patient-related queries across the application
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['labOrders'] });
      queryClient.invalidateQueries({ queryKey: ['billings'] });
      // Also invalidate any patient-specific queries
      queryClient.invalidateQueries({ queryKey: ['patient'] });
      queryClient.invalidateQueries({ queryKey: ['patient_appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient_encounters'] });
      queryClient.invalidateQueries({ queryKey: ['patient_prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['patient_labOrders'] });
      queryClient.invalidateQueries({ queryKey: ['patient_billings'] });
      setShowForm(false);
      setEditingPatient(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => mockApiClient.entities.Patient.update(id, data),
    onSuccess: () => {
      // Invalidate all patient-related queries across the application
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['labOrders'] });
      queryClient.invalidateQueries({ queryKey: ['billings'] });
      // Also invalidate any patient-specific queries
      queryClient.invalidateQueries({ queryKey: ['patient'] });
      queryClient.invalidateQueries({ queryKey: ['patient_appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient_encounters'] });
      queryClient.invalidateQueries({ queryKey: ['patient_prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['patient_labOrders'] });
      queryClient.invalidateQueries({ queryKey: ['patient_billings'] });
      setShowForm(false);
      setEditingPatient(null);
    },
  });

  const handleSubmit = (data: any) => {
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  // Bulk actions
  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredAndSortedPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredAndSortedPatients.map(p => p.id));
    }
  };

  const handleBulkStatusUpdate = (status: any) => {
    // Implementation for bulk status update
    console.log('Bulk status update:', status, selectedPatients);
    setSelectedPatients([]);
    setShowBulkActions(false);
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Age', 'Gender', 'Status', 'Blood Type', 'Allergies', 'Medical Conditions'],
      ...filteredAndSortedPatients.map(patient => [
        `${patient.first_name} ${patient.last_name}`,
        patient.email || '',
        patient.phone || '',
        patient.date_of_birth ? differenceInYears(new Date(), parseISO(patient.date_of_birth)) : '',
        patient.gender || '',
        patient.status || 'active',
        patient.blood_type || '',
        patient.allergies?.join('; ') || '',
        (patient as any).medical_conditions?.join('; ') || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Enhanced export functions
  const exportToJSON = (data: any, filename: any) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const patientData = {
      exportDate: new Date().toISOString(),
      totalPatients: filteredAndSortedPatients.length,
      patients: filteredAndSortedPatients.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        email: patient.email,
        phone: patient.phone,
        age: patient.date_of_birth ? differenceInYears(new Date(), parseISO(patient.date_of_birth)) : null,
        gender: patient.gender,
        status: patient.status,
        bloodType: patient.blood_type,
        allergies: patient.allergies || [],
        medicalConditions: (patient as any).medical_conditions || [],
        address: patient.address,
        emergencyContact: (patient as any).emergency_contact,
        insurance: (patient as any).insurance,
        createdDate: (patient as any).created_date || patient.created_at,
        lastUpdated: (patient as any).updated_date || patient.updated_at
      })),
      summary: {
        total: filteredAndSortedPatients.length,
        active: filteredAndSortedPatients.filter(p => p.status === 'active').length,
        inactive: filteredAndSortedPatients.filter(p => p.status === 'inactive').length,
        pediatric: filteredAndSortedPatients.filter(p => {
          const age = p.date_of_birth ? differenceInYears(new Date(), parseISO(p.date_of_birth)) : null;
          return age !== null && age < 18;
        }).length,
        adult: filteredAndSortedPatients.filter(p => {
          const age = p.date_of_birth ? differenceInYears(new Date(), parseISO(p.date_of_birth)) : null;
          return age !== null && age >= 18 && age < 65;
        }).length,
        senior: filteredAndSortedPatients.filter(p => {
          const age = p.date_of_birth ? differenceInYears(new Date(), parseISO(p.date_of_birth)) : null;
          return age !== null && age >= 65;
        }).length
      }
    };
    exportToJSON(patientData, 'patients');
  };

  const handleExportSelectedJSON = () => {
    if (selectedPatients.length === 0) {
      return;
    }

    const selectedPatientData = filteredAndSortedPatients.filter(p => selectedPatients.includes(p.id));
    const patientData = {
      exportDate: new Date().toISOString(),
      selectedCount: selectedPatients.length,
      patients: selectedPatientData.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        email: patient.email,
        phone: patient.phone,
        age: patient.date_of_birth ? differenceInYears(new Date(), parseISO(patient.date_of_birth)) : null,
        gender: patient.gender,
        status: patient.status,
        bloodType: patient.blood_type,
        allergies: patient.allergies || [],
        medicalConditions: (patient as any).medical_conditions || [],
        address: patient.address,
        emergencyContact: (patient as any).emergency_contact,
        insurance: (patient as any).insurance,
        createdDate: (patient as any).created_date || patient.created_at,
        lastUpdated: (patient as any).updated_date || patient.updated_at
      }))
    };
    exportToJSON(patientData, 'selected-patients');
  };

  // Statistics
  const stats = useMemo(() => {
    if (!patients) return { total: 0, active: 0, inactive: 0, pediatric: 0, adult: 0, senior: 0 };

    const total = patients.length;
    const active = patients.filter(p => p.status === "active").length;
    const inactive = patients.filter(p => p.status === "inactive").length;

    const pediatric = patients.filter(p => {
      const age = p.date_of_birth ? differenceInYears(new Date(), parseISO(p.date_of_birth)) : null;
      return age !== null && age < 18;
    }).length;

    const adult = patients.filter(p => {
      const age = p.date_of_birth ? differenceInYears(new Date(), parseISO(p.date_of_birth)) : null;
      return age !== null && age >= 18 && age < 65;
    }).length;

    const senior = patients.filter(p => {
      const age = p.date_of_birth ? differenceInYears(new Date(), parseISO(p.date_of_birth)) : null;
      return age !== null && age >= 65;
    }).length;

    return { total, active, inactive, pediatric, adult, senior };
  }, [patients]);

  const renderView = () => {
    const patientList = (
      <AnimatePresence>
        {filteredAndSortedPatients.map((patient: any) =>
          view === 'grid' ? (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <PatientCard
                patient={patient}
                onEdit={handleEdit}
                isSelected={selectedPatients.includes(patient.id)}
                onSelect={handleSelectPatient}
              />
            </motion.div>
          ) : (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <PatientListItem
                patient={patient}
                onEdit={handleEdit}
                isSelected={selectedPatients.includes(patient.id)}
                onSelect={handleSelectPatient}
              />
            </motion.div >
          )
        )
        }
      </AnimatePresence >
    );

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading patients...</p>
        </div>
      );
    }

    if (filteredAndSortedPatients.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== "all" || ageFilter !== "all" || bloodTypeFilter !== "all"
              ? "Try adjusting your search criteria"
              : "Get started by adding your first patient"}
          </p>
          {!searchTerm && statusFilter === "all" && ageFilter === "all" && bloodTypeFilter === "all" && (
            <Button
              onClick={() => {
                setEditingPatient(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Patient
            </Button>
          )}
        </div>
      );
    }

    if (view === 'grid') {
      return <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{patientList}</div>;
    }
    return <div className="space-y-3">{patientList}</div>;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="md-headline-large text-gray-900 mb-2">Patients</h1>
            <p className="md-body-large text-gray-600">Manage your patient records</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
              aria-label="Export patients to CSV"
            >
              <FileText className="w-4 h-4" />
              Export CSV
              <span className="text-xs text-gray-500">(Ctrl+E)</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportJSON}
              className="flex items-center gap-2"
              aria-label="Export patients to JSON"
            >
              <Database className="w-4 h-4" />
              Export JSON
            </Button>
            {selectedPatients.length > 0 && (
              <Button
                variant="outline"
                onClick={handleExportSelectedJSON}
                className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200"
                aria-label="Export selected patients to JSON"
              >
                <Database className="w-4 h-4" />
                Export Selected ({selectedPatients.length})
              </Button>
            )}
            {selectedPatients.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200"
              >
                <Users className="w-4 h-4" />
                {selectedPatients.length} Selected
              </Button>
            )}
            <Button
              onClick={() => {
                setEditingPatient(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-5 mb-10">
          <div className="md-card p-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-500" />
              <div>
                <p className="md-headline-medium text-gray-900">{stats.total}</p>
                <p className="md-body-medium text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="md-card p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="md-headline-medium text-gray-900">{stats.active}</p>
                <p className="md-body-medium text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="md-card p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-gray-400" />
              <div>
                <p className="md-headline-medium text-gray-900">{stats.inactive}</p>
                <p className="md-body-medium text-gray-500">Inactive</p>
              </div>
            </div>
          </div>
          <div className="md-card p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-500" />
              <div>
                <p className="md-headline-medium text-gray-900">{stats.pediatric}</p>
                <p className="md-body-medium text-gray-500">Pediatric</p>
              </div>
            </div>
          </div>
          <div className="md-card p-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-500" />
              <div>
                <p className="md-headline-medium text-gray-900">{stats.adult}</p>
                <p className="md-body-medium text-gray-500">Adult</p>
              </div>
            </div>
          </div>
          <div className="md-card p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="md-headline-medium text-gray-900">{stats.senior}</p>
                <p className="md-body-medium text-gray-500">Senior</p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <PatientForm
              patient={editingPatient}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPatient(null);
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        {/* Search and Controls */}
        <div className="md-card p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search patients by name, email, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 md-body-large"
                aria-label="Search patients"
                role="searchbox"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-12" aria-label="Sort by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="age">Age</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              >
                {sortOrder === "asc" ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <Button
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-10 w-10"
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-10 w-10"
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="md-label-large text-gray-700 mb-3 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="md-label-large text-gray-700 mb-3 block">Age Group</label>
                    <Select value={ageFilter} onValueChange={setAgeFilter}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="infant">Infant (0-2)</SelectItem>
                        <SelectItem value="child">Child (2-12)</SelectItem>
                        <SelectItem value="teen">Teen (12-18)</SelectItem>
                        <SelectItem value="pediatric">Pediatric (0-18)</SelectItem>
                        <SelectItem value="adult">Adult (18-65)</SelectItem>
                        <SelectItem value="senior">Senior (65+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="md-label-large text-gray-700 mb-3 block">Blood Type</label>
                    <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Blood Types</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions Panel */}
        <AnimatePresence>
          {showBulkActions && selectedPatients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-medium text-blue-900">
                    {selectedPatients.length} patient{selectedPatients.length !== 1 ? 's' : ''} selected
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate('active')}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      Mark Active
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate('inactive')}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      Mark Inactive
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatients([]);
                    setShowBulkActions(false);
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-6">
            <p className="md-body-large text-gray-600">
              Showing {filteredAndSortedPatients.length} of {patients?.length || 0} patients
              {(searchTerm || statusFilter !== "all" || ageFilter !== "all" || bloodTypeFilter !== "all") && (
                <span className="ml-3">
                  <Badge variant="secondary" className="md-label-large">
                    Filtered
                  </Badge>
                </span>
              )}
            </p>
            {filteredAndSortedPatients.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700 md-label-large"
                aria-label={`${selectedPatients.length === filteredAndSortedPatients.length ? 'Deselect' : 'Select'} all patients`}
              >
                {selectedPatients.length === filteredAndSortedPatients.length ? 'Deselect All' : 'Select All'}
                <span className="ml-2 text-xs text-gray-500">(Ctrl+A)</span>
              </Button>
            )}
          </div>
        </div>

        {/* Patient List */}
        {renderView()}
      </div>
    </div>
  );
}
