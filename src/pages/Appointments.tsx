import { useState, useMemo } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Grid3X3,
  List,
  Download,
  Database,
  FileText,
  MoreVertical
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseISO, isToday, isThisWeek } from "date-fns";
import { toast } from "sonner";

import AppointmentForm from "../components/appointments/AppointmentForm";
import AppointmentList from "../components/appointments/AppointmentList";
import AppointmentCalendar from "../components/appointments/AppointmentCalendar";

export default function AppointmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => mockApiClient.entities.Appointment.list("-appointment_date"),
    initialData: [],
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowForm(false);
      setEditingAppointment(null);
      toast.success("Appointment scheduled successfully!");
    },
    onError: (error: any) => {
      console.error('Error creating appointment:', error);
      toast.error("Failed to schedule appointment");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => mockApiClient.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowForm(false);
      setEditingAppointment(null);
      toast.success("Appointment updated successfully!");
    },
    onError: (error: any) => {
      console.error('Error updating appointment:', error);
      toast.error("Failed to update appointment");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => mockApiClient.entities.Appointment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Appointment cancelled successfully!");
    },
    onError: (error: any) => {
      console.error('Error deleting appointment:', error);
      toast.error("Failed to cancel appointment");
    }
  });

  const handleSubmit = (data: any) => {
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleDelete = (appointmentId: any) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      deleteMutation.mutate(appointmentId);
    }
  };

  const handleCreateFromCalendar = (date: Date) => {
    setEditingAppointment({
      appointment_date: date.toISOString().split('T')[0],
      appointment_time: '09:00',
      type: 'consultation',
      status: 'scheduled',
      priority: 'normal'
    });
    setShowForm(true);
  };

  // Enhanced filtering and statistics
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = !searchTerm ||
        apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.provider?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
      const matchesType = typeFilter === "all" || apt.type === typeFilter;
      const matchesProvider = providerFilter === "all" || apt.provider === providerFilter;

      return matchesSearch && matchesStatus && matchesType && matchesProvider;
    });
  }, [appointments, searchTerm, statusFilter, typeFilter, providerFilter]);

  // Statistics
  const stats = useMemo(() => {
    const today = appointments.filter(apt => isToday(parseISO(apt.appointment_date)));
    const thisWeek = appointments.filter(apt => isThisWeek(parseISO(apt.appointment_date)));
    const upcoming = appointments.filter(apt => parseISO(apt.appointment_date) > new Date());
    const overdue = appointments.filter(apt =>
      parseISO(apt.appointment_date) < new Date() && apt.status === 'scheduled'
    );

    return {
      total: appointments.length,
      today: today.length,
      thisWeek: thisWeek.length,
      upcoming: upcoming.length,
      overdue: overdue.length
    };
  }, [appointments]);

  // Get unique providers and types for filters
  const providers = useMemo(() => {
    const uniqueProviders = [...new Set(appointments.map(apt => apt.provider).filter(Boolean))];
    return uniqueProviders;
  }, [appointments]);

  const appointmentTypes = useMemo(() => {
    const uniqueTypes = [...new Set(appointments.map(apt => apt.type))];
    return uniqueTypes;
  }, [appointments]);

  // Export functions
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

  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers,
      ...data.map(item => headers.map(header => {
        const value = item[header.toLowerCase().replace(/\s+/g, '_')] || '';
        return `"${value}"`;
      }))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportAppointments = (format = 'json') => {
    if (format === 'json') {
      const appointmentData = {
        exportDate: new Date().toISOString(),
        totalAppointments: filteredAppointments.length,
        appointments: filteredAppointments.map(apt => ({
          id: apt.id,
          patientName: apt.patient_name,
          appointmentDate: apt.appointment_date,
          appointmentTime: apt.appointment_time,
          type: apt.type,
          reason: apt.reason,
          status: apt.status,
          provider: apt.provider,
          notes: apt.notes,
          priority: apt.priority,
          duration: apt.duration,
          location: apt.location,
          createdDate: apt.created_date,
          lastUpdated: apt.updated_date
        })),
        summary: {
          total: filteredAppointments.length,
          scheduled: filteredAppointments.filter(apt => apt.status === 'scheduled').length,
          confirmed: filteredAppointments.filter(apt => apt.status === 'confirmed').length,
          completed: filteredAppointments.filter(apt => apt.status === 'completed').length,
          cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled').length,
          today: filteredAppointments.filter(apt => isToday(parseISO(apt.appointment_date))).length,
          thisWeek: filteredAppointments.filter(apt => isThisWeek(parseISO(apt.appointment_date))).length
        }
      };
      exportToJSON(appointmentData, 'appointments');
    } else if (format === 'csv') {
      const headers = ['Patient Name', 'Appointment Date', 'Appointment Time', 'Type', 'Reason', 'Status', 'Provider', 'Priority'];
      exportToCSV(filteredAppointments, 'appointments', headers);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
                Appointments
              </h1>
              <p className="text-gray-600 mt-1">Schedule and manage patient appointments</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
                className="flex items-center gap-2"
              >
                {viewMode === "list" ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                {viewMode === "list" ? "Calendar View" : "List View"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MoreVertical className="w-4 h-4" />
                    More Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleExportAppointments('json')}>
                    <Database className="w-4 h-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportAppointments('csv')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    // Future: Add print functionality
                    toast.info("Print functionality coming soon!");
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Print Schedule
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => {
                  setEditingAppointment(null);
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Today</p>
                  <p className="text-2xl font-bold text-green-900">{stats.today}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">This Week</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.thisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Upcoming</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.upcoming}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">Overdue</p>
                  <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search patients, reasons, or providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {appointmentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {showForm && (
            <AppointmentForm
              appointment={editingAppointment}
              patients={patients}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAppointment(null);
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        {/* Quick Status Filter Tabs */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Confirmed
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                In Progress
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Appointments Content */}
        {viewMode === "list" ? (
          <AppointmentList
            appointments={filteredAppointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={(apt, status) => updateMutation.mutate({ id: apt.id, data: { ...apt, status } })}
            isLoading={isLoading}
          />
        ) : (
          <AppointmentCalendar
            appointments={filteredAppointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={(apt, status) => updateMutation.mutate({ id: apt.id, data: { ...apt, status } })}
            onCreateNew={handleCreateFromCalendar}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}