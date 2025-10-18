import React from "react";
import { mockApiClient as base44 } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isToday, parseISO, format } from "date-fns";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Calendar, FileHeart, Clock, Activity, Pill, Beaker, ArrowRight, Stethoscope, TrendingUp, Database, FileText, User, Shield, Building2, Star, Award, CreditCard, Settings, Zap, BarChart3, Grid3X3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPersonalizedGreeting } from "@/utils/greeting";
import PatientForm from "@/components/patients/PatientForm";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
// import { Patient, Appointment, Encounter, Prescription, LabOrder, Billing } from "@/types";
import { toast } from "sonner";
import SmartSearch from "@/components/SmartSearch";

export default function Dashboard() {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all required data
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list("-created_date"),
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list("-appointment_date"),
  });

  const { data: encounters, isLoading: encountersLoading } = useQuery({
    queryKey: ['encounters'],
    queryFn: () => base44.entities.Encounter.list("-visit_date"),
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => base44.entities.Prescription.list("-created_date"),
  });

  const { data: labOrders, isLoading: labOrdersLoading } = useQuery({
    queryKey: ['labOrders'],
    queryFn: () => base44.entities.LabOrder.list("-created_date"),
  });

  const { data: billings } = useQuery({
    queryKey: ['billings'],
    queryFn: () => base44.entities.Billing.list("-invoice_date"),
  });

  const createPatientMutation = useMutation({
    mutationFn: (data) => base44.entities.Patient.create(data),
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
      setShowPatientModal(false);
    },
  });

  const handlePatientSubmit = (data) => {
    createPatientMutation.mutate(data);
  };

  // Export functions
  const exportToJSON = (data, filename) => {
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

  const handleExportDashboardData = () => {
    const dashboardData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalPatients: (patients || []).length,
        activePatients: activePatients,
        todayAppointments: todayAppointments.length,
        activePrescriptions: (prescriptions || []).filter(rx => rx.status === 'active').length,
        pendingLabOrders: pendingLabOrders.length,
        followUpAppointments: followUps.length
      },
      todayActivities: todayActivities,
      recentPrescriptions: recentPrescriptions,
      pendingLabOrders: pendingLabOrders,
      followUpAppointments: followUps,
      statistics: {
        patients: {
          total: (patients || []).length,
          active: activePatients,
          inactive: (patients || []).filter(p => p.status === 'inactive').length
        },
        appointments: {
          total: (appointments || []).length,
          today: todayAppointments.length,
          upcoming: (appointments || []).filter(apt => parseISO(apt.appointment_date) > new Date()).length
        },
        prescriptions: {
          total: (prescriptions || []).length,
          active: (prescriptions || []).filter(rx => rx.status === 'active').length,
          recent: recentPrescriptions.length
        },
        labOrders: {
          total: (labOrders || []).length,
          pending: pendingLabOrders.length,
          completed: (labOrders || []).filter(order => order.status === 'completed').length
        }
      }
    };
    exportToJSON(dashboardData, 'dashboard-summary');
  };

  const handleExportTodayActivities = () => {
    const todayData = {
      exportDate: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      activities: todayActivities,
      summary: {
        totalActivities: todayActivities.length,
        appointments: todayActivities.filter(a => a.type === 'appointment').length,
        encounters: todayActivities.filter(a => a.type === 'encounter').length
      }
    };
    exportToJSON(todayData, 'today-activities');
  };

  // Calculate metrics
  const activePatients = (patients || []).filter(p => p.status === 'active').length;

  const todayAppointments = (appointments || []).filter(apt => {
    if (!apt.appointment_date) return false;
    return isToday(parseISO(apt.appointment_date));
  });

  const todayActivities = [
    ...todayAppointments.map(apt => ({
      id: apt.id,
      type: 'appointment',
      title: `${apt.patient_name || 'Patient'} - ${apt.type || 'Consultation'}`,
      time: apt.appointment_date,
      status: apt.status,
      provider: apt.provider || 'Dr. Smith',
      priority: apt.priority || 'normal'
    })),
    ...(encounters || []).filter(enc => {
      if (!enc.visit_date) return false;
      return isToday(parseISO(enc.visit_date));
    }).map(enc => ({
      id: enc.id,
      type: 'encounter',
      title: `${enc.patient_name || 'Patient'} - Clinical Note`,
      time: enc.visit_date,
      status: enc.status || 'completed',
      provider: enc.provider_name || 'Dr. Smith',
      priority: 'normal'
    }))
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const recentPrescriptions = (prescriptions || [])
    .filter(rx => rx.status === 'active')
    .slice(0, 5);

  const pendingLabOrders = (labOrders || [])
    .filter(order => ['pending', 'in_progress', 'collected'].includes(order.status))
    .slice(0, 5);

  const followUps = (appointments || [])
    .filter(apt => apt.type === 'follow_up' && apt.status === 'scheduled')
    .slice(0, 5);

  const overdueAppointments = useMemo(() => {
    return (appointments || []).filter(apt => {
      if (!apt.appointment_date) return false;
      const appointmentDate = parseISO(apt.appointment_date);
      return apt.status === 'scheduled' && appointmentDate < new Date();
    });
  }, [appointments]);

  const overdueInvoices = useMemo(() => {
    return (billings || []).filter(bill => bill.status === 'overdue');
  }, [billings]);

  const isLoading = patientsLoading || appointmentsLoading || encountersLoading || prescriptionsLoading || labOrdersLoading;

  const alertsShownRef = useRef({ labs: false, appointments: false, billing: false });

  useEffect(() => {
    if (pendingLabOrders.length >= 5 && !alertsShownRef.current.labs) {
      toast.warning(`There are ${pendingLabOrders.length} lab orders awaiting action.`, {
        description: "Prioritize processing high-priority labs.",
      });
      alertsShownRef.current.labs = true;
    }

    if (overdueAppointments.length > 0 && !alertsShownRef.current.appointments) {
      toast.warning(`${overdueAppointments.length} appointments are past due.`, {
        description: "Review and reschedule overdue appointments.",
      });
      alertsShownRef.current.appointments = true;
    }

    if (overdueInvoices.length > 0 && !alertsShownRef.current.billing) {
      toast.info(`${overdueInvoices.length} invoices are marked as overdue.`, {
        description: "Follow up with patients or payers to resolve outstanding balances.",
      });
      alertsShownRef.current.billing = true;
    }
  }, [pendingLabOrders.length, overdueAppointments.length, overdueInvoices.length]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'collected': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // const getPriorityColor = (priority) => {
  //   switch (priority) {
  //     case 'urgent': return 'text-red-600';
  //     case 'high': return 'text-orange-600';
  //     case 'normal': return 'text-gray-600';
  //     case 'low': return 'text-green-600';
  //     default: return 'text-gray-600';
  //   }
  // };


  // Role-based dashboard content
  const getRoleBasedQuickActions = () => {
    const baseActions = [
      {
        title: "Appointments",
        description: "Manage consultations",
        icon: Calendar,
        color: "text-blue-600",
        link: createPageUrl("Appointments"),
        roles: ["SuperAdmin", "Doctor", "Nurse", "Admin"]
      },
      {
        title: "Patient Registry",
        description: "View all patients",
        icon: Users,
        color: "text-green-600",
        link: createPageUrl("Patients"),
        roles: ["SuperAdmin", "Doctor", "Nurse", "Admin"]
      },
      {
        title: "Prescriptions",
        description: "Medication management",
        icon: Pill,
        color: "text-purple-600",
        link: createPageUrl("PharmacyManagement"),
        roles: ["SuperAdmin", "Doctor", "Nurse", "Admin"]
      },
      {
        title: "Lab Orders",
        description: "Laboratory management",
        icon: Beaker,
        color: "text-orange-600",
        link: createPageUrl("LabManagement"),
        roles: ["SuperAdmin", "Doctor", "Nurse", "LabTech", "Admin"]
      }
    ];

    const adminActions = [
      {
        title: "Billing Management",
        description: "Financial overview",
        icon: CreditCard,
        color: "text-emerald-600",
        link: createPageUrl("Billing"),
        roles: ["SuperAdmin", "Admin", "Billing"]
      },
      {
        title: "User Management",
        description: "Staff administration",
        icon: User,
        color: "text-indigo-600",
        link: createPageUrl("UserManagement"),
        roles: ["SuperAdmin", "Admin"]
      },
      {
        title: "System Settings",
        description: "Configuration",
        icon: Settings,
        color: "text-gray-600",
        link: createPageUrl("Settings"),
        roles: ["SuperAdmin", "Admin"]
      }
    ];

    const superAdminActions = [
      {
        title: "Super Admin",
        description: "System administration",
        icon: Shield,
        color: "text-red-600",
        link: createPageUrl("SuperAdminDashboard"),
        roles: ["SuperAdmin"]
      },
      {
        title: "Organizations",
        description: "Multi-org management",
        icon: Building2,
        color: "text-cyan-600",
        link: createPageUrl("Organizations"),
        roles: ["SuperAdmin"]
      }
    ];

    const allActions = [...baseActions, ...adminActions, ...superAdminActions];
    return allActions.filter(action =>
      action.roles.includes(user?.role || "User")
    );
  };

  const getRoleBasedMetrics = () => {
    const baseMetrics = [
      {
        title: "Total Patients",
        value: isLoading ? '...' : (patients || []).length,
        subtitle: `${activePatients} active`,
        icon: Users,
        color: "text-blue-600",
        roles: ["SuperAdmin", "Doctor", "Nurse", "Admin"]
      },
      {
        title: "Today&apos;s Appointments",
        value: isLoading ? '...' : todayAppointments.length,
        subtitle: "Scheduled",
        icon: Calendar,
        color: "text-purple-600",
        roles: ["SuperAdmin", "Doctor", "Nurse", "Admin"]
      },
      {
        title: "Active Prescriptions",
        value: isLoading ? '...' : (prescriptions || []).filter(rx => rx.status === 'active').length,
        subtitle: "Current medications",
        icon: Pill,
        color: "text-green-600",
        roles: ["SuperAdmin", "Doctor", "Nurse", "Admin"]
      },
      {
        title: "Pending Lab Orders",
        value: isLoading ? '...' : pendingLabOrders.length,
        subtitle: "Awaiting results",
        icon: Beaker,
        color: "text-orange-600",
        roles: ["SuperAdmin", "Doctor", "Nurse", "LabTech", "Admin"]
      }
    ];

    const adminMetrics = [
      {
        title: "Total Revenue",
        value: isLoading ? '...' : `$${((billings || []).reduce((sum, bill) => sum + (bill.amount || 0), 0)).toLocaleString()}`,
        subtitle: "This month",
        icon: CreditCard,
        color: "text-emerald-600",
        roles: ["SuperAdmin", "Admin", "Billing"]
      },
      {
        title: "System Users",
        value: isLoading ? '...' : "12", // This would come from user data
        subtitle: "Active staff",
        icon: User,
        color: "text-indigo-600",
        roles: ["SuperAdmin", "Admin"]
      }
    ];

    const superAdminMetrics = [
      {
        title: "Organizations",
        value: isLoading ? '...' : "3", // This would come from org data
        subtitle: "Managed",
        icon: Building2,
        color: "text-cyan-600",
        roles: ["SuperAdmin"]
      },
      {
        title: "System Health",
        value: "98%",
        subtitle: "Uptime",
        icon: Shield,
        color: "text-green-600",
        roles: ["SuperAdmin"]
      }
    ];

    const allMetrics = [...baseMetrics, ...adminMetrics, ...superAdminMetrics];
    return allMetrics.filter(metric =>
      metric.roles.includes(user?.role || "User")
    );
  };

  const roleMetrics = getRoleBasedMetrics();
  const quickActions = getRoleBasedQuickActions();
  const quickActionHighlights = quickActions.slice(0, 4);
  const remainingQuickActions = quickActions.slice(quickActionHighlights.length);
  const roleMessage = (() => {
    switch (user?.role) {
      case 'SuperAdmin':
        return "You have full visibility across every organization today.";
      case 'Doctor':
        return `You have ${todayAppointments.length} appointments and ${followUps.length} follow-up visits scheduled.`;
      case 'Nurse':
        return `Supporting ${activePatients} active patients across today&apos;s schedule.`;
      case 'Admin':
        return `Keep an eye on ${(billings || []).length} billing records and team activity across the system.`;
      case 'LabTech':
        return `${pendingLabOrders.length} lab orders are waiting for review and processing.`;
      case 'Billing':
        return `${(billings || []).length} invoices ready for reconciliation and payment tracking.`;
      default:
        return "Welcome to your personalized clinical workspace.";
    }
  })();

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user?.name?.charAt(0) || user?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  Welcome back, {user?.name || user?.full_name || "User"}!
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-700">Clinical Activity</p>
                  <Badge variant="outline" className="text-xs font-semibold px-2 py-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
                    {user?.role || "User"}
                  </Badge>
                  {user?.organization && (
                    <Badge variant="secondary" className="text-xs font-medium cursor-pointer hover:bg-blue-50 transition-colors px-2 py-1">
                      <Building2 className="w-3 h-3 mr-1.5" />
                      {user.organization}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SmartSearch
                patients={patients || []}
                appointments={appointments || []}
                labOrders={labOrders || []}
                prescriptions={prescriptions || []}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportDashboardData}
                className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                title="Export Dashboard Data"
              >
                <Database className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTodayActivities}
                className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                title="Export Today's Activities"
              >
                <FileText className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                onClick={() => setShowPatientModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold px-4 py-2 h-9 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today&apos;s Activity
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Recent Prescriptions
            </TabsTrigger>
            <TabsTrigger value="labs" className="flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Pending Lab Orders
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roleMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
                      <IconComponent className={`h-4 w-4 ${metric.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </div>
                      <p className="text-xs text-gray-500">{metric.subtitle}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6 space-y-6 lg:space-y-0">
              <div className="space-y-6">
                {/* Personalized Welcome Section */}
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                          {user?.first_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-1">
                            {getPersonalizedGreeting(user?.first_name)}
                          </h2>
                          <p className="text-gray-600 mb-2">{roleMessage}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              {user?.role || "User"} Role
                            </Badge>
                            {user?.organization && (
                              <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-blue-100 transition-colors">
                                <Building2 className="w-3 h-3 mr-1" />
                                {user.organization}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Last login</p>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.last_login ? new Date(user.last_login).toLocaleDateString() : "Just now"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Role-Specific Navigation Shortcuts */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      Your Quick Access
                    </CardTitle>
                    <p className="text-sm text-gray-600">Top destinations for {user?.role || "your role"}.</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {quickActionHighlights.length === 0 ? (
                      <p className="text-sm text-gray-500">No shortcuts available yet for your role.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickActionHighlights.map((action, index) => {
                          const IconComponent = action.icon;
                          return (
                            <Link key={index} to={action.link}>
                              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${action.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                                  <IconComponent className={`h-5 w-5 ${action.color}`} />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                                  <p className="text-xs text-gray-500">{action.description}</p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Personalized Metrics & KPIs */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Your Performance Insights
                    </CardTitle>
                    <p className="text-sm text-gray-600">Personalized metrics based on your role and activities</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {user?.role === 'Doctor' && (
                        <>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-blue-900">Patient Satisfaction</h4>
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-900">94%</p>
                            <p className="text-xs text-blue-700">+2% from last month</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-green-900">Avg. Consultation Time</h4>
                              <Clock className="h-4 w-4 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-900">18 min</p>
                            <p className="text-xs text-green-700">Optimal range</p>
                          </div>
                        </>
                      )}
                      {user?.role === 'Nurse' && (
                        <>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-purple-900">Patients Cared For</h4>
                              <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-purple-900">24</p>
                            <p className="text-xs text-purple-700">This week</p>
                          </div>
                          <div className="p-4 bg-orange-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-orange-900">Care Quality Score</h4>
                              <Star className="h-4 w-4 text-orange-600" />
                            </div>
                            <p className="text-2xl font-bold text-orange-900">4.8/5</p>
                            <p className="text-xs text-orange-700">Excellent</p>
                          </div>
                        </>
                      )}
                      {user?.role === 'Admin' && (
                        <>
                          <div className="p-4 bg-emerald-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-emerald-900">Revenue Growth</h4>
                              <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-900">+12%</p>
                            <p className="text-xs text-emerald-700">This quarter</p>
                          </div>
                          <div className="p-4 bg-indigo-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-indigo-900">System Efficiency</h4>
                              <Activity className="h-4 w-4 text-indigo-600" />
                            </div>
                            <p className="text-2xl font-bold text-indigo-900">96%</p>
                            <p className="text-xs text-indigo-700">Uptime</p>
                          </div>
                        </>
                      )}
                      {user?.role === 'SuperAdmin' && (
                        <>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-red-900">Organizations Managed</h4>
                              <Building2 className="h-4 w-4 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold text-red-900">3</p>
                            <p className="text-xs text-red-700">Active</p>
                          </div>
                          <div className="p-4 bg-cyan-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-cyan-900">System Health</h4>
                              <Shield className="h-4 w-4 text-cyan-600" />
                            </div>
                            <p className="text-2xl font-bold text-cyan-900">98%</p>
                            <p className="text-xs text-cyan-700">Optimal</p>
                          </div>
                        </>
                      )}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">This Week&apos;s Activity</h4>
                          <Activity className="h-4 w-4 text-gray-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {user?.role === 'Doctor' && `${todayAppointments.length * 7}`}
                          {user?.role === 'Nurse' && '24'}
                          {user?.role === 'Admin' && '156'}
                          {user?.role === 'SuperAdmin' && '89'}
                          {!['Doctor', 'Nurse', 'Admin', 'SuperAdmin'].includes(user?.role) && '12'}
                        </p>
                        <p className="text-xs text-gray-700">Actions completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quick Actions Sidebar */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Essential shortcuts tailored for {user?.role || 'your role'}.
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {quickActions.length === 0 ? (
                      <p className="text-sm text-gray-500">No shortcuts available for your role yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {quickActions.map((action, index) => {
                          const IconComponent = action.icon;
                          return (
                            <Link key={index} to={action.link}>
                              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-9 w-9 items-center justify-center rounded-md ${action.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                                    <IconComponent className={`h-4 w-4 ${action.color}`} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                                    <p className="text-xs text-gray-500">{action.description}</p>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Dashboard Preferences */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      Dashboard Preferences
                    </CardTitle>
                    <p className="text-sm text-gray-600">Customize your dashboard experience</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Default View</label>
                        <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                          <option value="overview">Overview</option>
                          <option value="today">Today&apos;s Activity</option>
                          <option value="prescriptions">Prescriptions</option>
                          <option value="labs">Lab Orders</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Widget Layout</label>
                        <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                          <option value="compact">Compact</option>
                          <option value="spacious">Spacious</option>
                          <option value="grid">Grid</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Notifications</label>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm text-gray-600">Show alerts</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {remainingQuickActions.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-blue-600" />
                    Additional Shortcuts
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Explore more tools available for {user?.role || 'your role'}.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {remainingQuickActions.map((action, index) => {
                      const IconComponent = action.icon;
                      return (
                        <Link key={index} to={action.link}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-5 text-center">
                              <IconComponent className={`h-8 w-8 mx-auto mb-2 ${action.color}`} />
                              <h3 className="font-semibold text-gray-900">{action.title}</h3>
                              <p className="text-sm text-gray-500">{action.description}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

          </TabsContent>

          {/* Today's Activity Tab */}
          <TabsContent value="today" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Today&apos;s Clinical Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : todayActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No activities scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${activity.type === 'appointment' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                            {activity.type === 'appointment' ? (
                              <Calendar className="h-4 w-4 text-blue-600" />
                            ) : (
                              <FileHeart className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(activity.time), 'h:mm a')}
                              <span className="mx-1">•</span>
                              <Stethoscope className="h-3 w-3" />
                              {activity.provider}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                          <Link to={createPageUrl("Appointments")}>
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Recent Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : recentPrescriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent prescriptions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPrescriptions.map((rx) => (
                      <div key={rx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-green-100">
                            <Pill className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{rx.medication_name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Users className="h-3 w-3" />
                              {rx.patient_name || 'Patient'}
                              <span className="mx-1">•</span>
                              <Stethoscope className="h-3 w-3" />
                              {rx.prescribing_doctor || 'Dr. Smith'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(rx.status)}>
                            {rx.status}
                          </Badge>
                          <Link to={createPageUrl("PharmacyManagement")}>
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Lab Orders Tab */}
          <TabsContent value="labs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Pending Lab Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingLabOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Beaker className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending lab orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingLabOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-orange-100">
                            <Beaker className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{order.test_name || 'Lab Test'}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Users className="h-3 w-3" />
                              {order.patient_name || 'Patient'}
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3" />
                              {order.created_date ? format(parseISO(order.created_date), 'MMM d, yyyy') : 'Recent'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Link to={createPageUrl("LabManagement")}>
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Follow-ups Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : followUps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No follow-up appointments scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {followUps.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {apt.patient_name || 'Patient'} - Follow-up
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {apt.appointment_date ? format(parseISO(apt.appointment_date), 'MMM d, yyyy h:mm a') : 'TBD'}
                          <span className="mx-1">•</span>
                          <Stethoscope className="h-3 w-3" />
                          {apt.provider_name || 'Dr. Smith'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                      <Link to={createPageUrl("Appointments")}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Modal */}
      <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <PatientForm
            onSubmit={handlePatientSubmit}
            onCancel={() => setShowPatientModal(false)}
            isSubmitting={createPatientMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
