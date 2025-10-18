import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from '@/api/mockApiClient';
import { format, isToday, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Users,
    Pill,
    Beaker,
    Activity,
    TrendingUp,
    AlertTriangle,
    Clock,
    Plus,
    Download,
    Bell,
    HeartPulse,
    Stethoscope,
    FileText,
    DollarSign,
    ArrowUpRight,
    CheckCircle,
    XCircle,
    PauseCircle,
    RefreshCw,
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Workspace Dashboard Component
export default function WorkspaceDashboard() {
    const [selectedDate] = useState(new Date());
    const [viewMode] = useState('overview'); // overview, clinical, administrative

    // Fetch dashboard data
    const { data: patients } = useQuery({
        queryKey: ['patients'],
        queryFn: () => mockApiClient.entities.Patient.list("-created_date"),
    });

    const { data: appointments } = useQuery({
        queryKey: ['appointments', selectedDate],
        queryFn: () => mockApiClient.entities.Appointment.list({
            appointment_date: {
                $gte: startOfDay(selectedDate).toISOString(),
                $lte: endOfDay(selectedDate).toISOString()
            }
        }),
    });

    const { data: encounters } = useQuery({
        queryKey: ['encounters', selectedDate],
        queryFn: () => mockApiClient.entities.Encounter.list({
            visit_date: {
                $gte: startOfDay(selectedDate).toISOString(),
                $lte: endOfDay(selectedDate).toISOString()
            }
        }),
    });

    const { data: prescriptions } = useQuery({
        queryKey: ['prescriptions'],
        queryFn: () => mockApiClient.entities.Prescription.list("-created_date"),
    });

    const { data: labOrders } = useQuery({
        queryKey: ['labOrders'],
        queryFn: () => mockApiClient.entities.LabOrder.list("-created_date"),
    });

    // Calculate dashboard metrics
    const metrics = useMemo(() => {
        if (!patients || !appointments || !encounters || !prescriptions || !labOrders) {
            return null;
        }

        const today = new Date();
        const todayAppointments = appointments.filter(apt =>
            isToday(new Date(apt.appointment_date))
        );

        const upcomingAppointments = appointments.filter(apt =>
            new Date(apt.appointment_date) > today
        );

        const activePrescriptions = prescriptions.filter(pres =>
            pres.status === 'active'
        );

        const pendingLabOrders = labOrders.filter(lab =>
            lab.status === 'pending' || lab.status === 'in_progress'
        );

        const completedEncounters = encounters.filter(enc =>
            enc.status === 'completed'
        );

        return {
            totalPatients: patients.length,
            todayAppointments: todayAppointments.length,
            upcomingAppointments: upcomingAppointments.length,
            activePrescriptions: activePrescriptions.length,
            pendingLabOrders: pendingLabOrders.length,
            completedEncounters: completedEncounters.length,
            newPatientsThisWeek: patients.filter(p =>
                new Date(p.created_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length
        };
    }, [patients, appointments, encounters, prescriptions, labOrders]);

    // Quick actions
    const quickActions = [
        {
            id: 'new-patient',
            title: 'New Patient',
            description: 'Register a new patient',
            icon: Users,
            color: 'bg-blue-500 hover:bg-blue-600',
            url: '/Patients'
        },
        {
            id: 'new-appointment',
            title: 'Schedule Appointment',
            description: 'Book a new appointment',
            icon: Calendar,
            color: 'bg-green-500 hover:bg-green-600',
            url: '/Appointments'
        },
        {
            id: 'prescribe',
            title: 'Prescribe Medication',
            description: 'Create new prescription',
            icon: Pill,
            color: 'bg-purple-500 hover:bg-purple-600',
            url: '/PrescriptionManagement'
        },
        {
            id: 'lab-order',
            title: 'Order Lab Test',
            description: 'Request laboratory test',
            icon: Beaker,
            color: 'bg-orange-500 hover:bg-orange-600',
            url: '/LabOrders'
        },
        {
            id: 'telemedicine',
            title: 'Start Telemedicine',
            description: 'Begin virtual consultation',
            icon: Activity,
            color: 'bg-cyan-500 hover:bg-cyan-600',
            url: '/Telemedicine'
        },
        {
            id: 'generate-report',
            title: 'Generate Report',
            description: 'Create clinical report',
            icon: FileText,
            color: 'bg-gray-500 hover:bg-gray-600',
            url: '/ProceduralReports'
        }
    ];

    // Recent activities
    const recentActivities = [
        {
            id: 1,
            type: 'appointment',
            title: 'Appointment scheduled',
            description: 'John Doe - Cardiology consultation',
            timestamp: '2 minutes ago',
            icon: Calendar,
            color: 'text-blue-600'
        },
        {
            id: 2,
            type: 'prescription',
            title: 'Prescription created',
            description: 'Metformin 500mg for Sarah Wilson',
            timestamp: '15 minutes ago',
            icon: Pill,
            color: 'text-green-600'
        },
        {
            id: 3,
            type: 'lab_result',
            title: 'Lab results available',
            description: 'Blood work completed for Mike Johnson',
            timestamp: '1 hour ago',
            icon: Beaker,
            color: 'text-purple-600'
        },
        {
            id: 4,
            type: 'patient_update',
            title: 'Patient information updated',
            description: 'Emergency contact updated for Lisa Brown',
            timestamp: '2 hours ago',
            icon: Users,
            color: 'text-orange-600'
        }
    ];

    // Alerts and notifications
    const alerts = [
        {
            id: 1,
            type: 'urgent',
            title: 'High Priority Alert',
            description: 'Patient John Smith has critical lab values',
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50 border-red-200'
        },
        {
            id: 2,
            type: 'warning',
            title: 'Medication Interaction',
            description: 'Potential drug interaction detected',
            icon: AlertTriangle,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        },
        {
            id: 3,
            type: 'info',
            title: 'Appointment Reminder',
            description: '3 appointments scheduled for tomorrow',
            icon: Bell,
            color: 'text-blue-600 bg-blue-50 border-blue-200'
        }
    ];

    if (!patients || !appointments || !encounters) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Workspace Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back! Here's what's happening in your practice today.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Select value={viewMode} onValueChange={setViewMode}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="overview">Overview</SelectItem>
                                <SelectItem value="clinical">Clinical</SelectItem>
                                <SelectItem value="administrative">Administrative</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="clinical">Clinical</TabsTrigger>
                        <TabsTrigger value="administrative">Administrative</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Patients</p>
                                            <p className="text-2xl font-bold text-gray-900">{metrics?.totalPatients || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-green-600">
                                        <ArrowUpRight className="w-4 h-4 mr-1" />
                                        <span>+{metrics?.newPatientsThisWeek || 0} this week</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                                            <p className="text-2xl font-bold text-gray-900">{metrics?.todayAppointments || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{metrics?.upcomingAppointments || 0} upcoming</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                                            <p className="text-2xl font-bold text-gray-900">{metrics?.activePrescriptions || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Pill className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        <span>All current</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Pending Lab Orders</p>
                                            <p className="text-2xl font-bold text-gray-900">{metrics?.pendingLabOrders || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Beaker className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-gray-600">
                                        <PauseCircle className="w-4 h-4 mr-1" />
                                        <span>Awaiting results</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <span>Quick Actions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {quickActions.map((action: any) => (
                                        <Link key={action.id} to={action.url}>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`${action.color} text-white rounded-lg p-4 h-24 flex flex-col items-center justify-center cursor-pointer transition-all duration-200`}
                                            >
                                                <action.icon className="w-6 h-6 mb-2" />
                                                <span className="text-sm font-medium text-center">{action.title}</span>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Alerts and Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Alerts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        <span>Alerts & Notifications</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {alerts.map((alert: any) => (
                                            <div key={alert.id} className={`p-3 rounded-lg border ${alert.color}`}>
                                                <div className="flex items-start space-x-3">
                                                    <alert.icon className="w-5 h-5 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{alert.title}</h4>
                                                        <p className="text-sm opacity-90">{alert.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Activity className="w-5 h-5 text-blue-500" />
                                        <span>Recent Activity</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentActivities.map((activity: any) => (
                                            <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                                                <activity.icon className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{activity.title}</h4>
                                                    <p className="text-xs text-gray-600">{activity.description}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="clinical" className="space-y-6">
                        {/* Clinical Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Stethoscope className="w-5 h-5 text-blue-500" />
                                        <span>Today's Clinical Schedule</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <div className="space-y-3">
                                            {appointments?.slice(0, 10).map((appointment: any) => (
                                                <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{appointment.patient_name || 'Patient'}</h4>
                                                        <p className="text-sm text-gray-600">{appointment.appointment_type || 'Consultation'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{format(new Date(appointment.appointment_date), 'HH:mm')}</p>
                                                        <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                                                            {appointment.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <HeartPulse className="w-5 h-5 text-red-500" />
                                        <span>Clinical Metrics</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Completed Encounters</span>
                                            <span className="font-semibold">{metrics?.completedEncounters || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Active Prescriptions</span>
                                            <span className="font-semibold">{metrics?.activePrescriptions || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Pending Lab Orders</span>
                                            <span className="font-semibold">{metrics?.pendingLabOrders || 0}</span>
                                        </div>
                                        <Separator />
                                        <div className="text-center">
                                            <Button size="sm" className="w-full">
                                                <Plus className="w-4 h-4 mr-2" />
                                                New Encounter
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="administrative" className="space-y-6">
                        {/* Administrative Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <DollarSign className="w-5 h-5 text-green-500" />
                                        <span>Financial Overview</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Total Patients</span>
                                            <span className="font-semibold">{metrics?.totalPatients || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Today's Appointments</span>
                                            <span className="font-semibold">{metrics?.todayAppointments || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">New This Week</span>
                                            <span className="font-semibold">{metrics?.newPatientsThisWeek || 0}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <BarChart3 className="w-5 h-5 text-purple-500" />
                                        <span>Performance Metrics</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Appointment Completion</span>
                                            <span className="font-semibold">95%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Patient Satisfaction</span>
                                            <span className="font-semibold">4.8/5</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">System Uptime</span>
                                            <span className="font-semibold">99.9%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div >
    );
}
