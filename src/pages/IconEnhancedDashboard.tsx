import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { format, isToday, isTomorrow, startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    LayoutDashboard, Users, Calendar, Stethoscope, Pill, Beaker, Activity, Video,
    FileText, DollarSign, BarChart3, ArrowUpRightSquare, ClipboardList, TestTube,
    Settings, HelpCircle, Bell, Search, Filter, MoreHorizontal, ChevronDown,
    ChevronUp, ChevronLeft, ChevronRight, Home, Menu, X, Plus, Minus,
    HeartPulse, Syringe, Scissors, UserCog, FileHeart, FileSignature, Calculator,
    Shield, CheckCircle, XCircle, PauseCircle, PlayCircle,
    Clock, Timer, CalendarDays, CalendarCheck, CalendarX, CalendarPlus,
    User, UserPlus, UserCheck, UserX, UserCog2, UserSearch, Edit,
    Phone, Mail, MapPin, Globe, Building2, Hospital, Ambulance,
    Database, Download, Upload, Share2, Copy, Trash2, Save, RefreshCw,
    Eye, EyeOff, Lock, Unlock, Key, Fingerprint, ShieldCheck,
    Star, StarOff, Bookmark, BookmarkCheck, Flag, FlagOff, Target, Zap,
    TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    RotateCcw, RotateCw, Maximize2, Minimize2, Move, GripVertical,
    MessageCircle, MessageSquare, Send, Reply, Forward, Archive,
    Volume2, VolumeX, Mic, MicOff, Headphones, Camera, CameraOff,
    Check, CheckSquare, Square, Circle, CircleCheck, CircleX,
    Radio, ToggleLeft, ToggleRight,
    File, FileImage, FileVideo, FileAudio,
    FileCode, FileArchive, Folder, FolderOpen, FolderPlus, FolderMinus,
    PieChart, LineChart, BarChart, Microscope, FlaskConical, TestTube2, Droplets, Thermometer,
    Scale, Ruler, Compass, Map, Navigation, Route, AlertCircle, AlertTriangle,
    Siren, Megaphone, PhoneCall, PhoneOff, PhoneIncoming, Workflow, GitBranch, GitCommit,
    GitMerge, GitPullRequest, ArrowUpDown, ArrowLeftRight, ArrowUpLeft, ArrowUpRight,
    ArrowDownLeft, ArrowDownRight
} from 'lucide-react';

// Super Compact Notification Component for Top Bar
const TopBarNotificationIcon = ({ alert, onClick }: any) => {
    const IconComponent = alert.icon;
    const getIconColor = () => {
        switch (alert.severity) {
            case 'high': return 'text-red-500 hover:text-red-600';
            case 'medium': return 'text-amber-500 hover:text-amber-600';
            case 'low': return 'text-blue-500 hover:text-blue-600';
            default: return 'text-slate-500 hover:text-slate-600';
        }
    };

    return (
        <button
            onClick={onClick}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${getIconColor()} group hover:bg-white/40`}
            title={alert.title}
        >
            <IconComponent className="w-4 h-4" />
            {alert.severity === 'high' && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
            )}
        </button>
    );
};

// Compact Notification Component (for main content if needed)
const CompactNotificationIcon = ({ alert, onClick }: any) => {
    const IconComponent = alert.icon;
    const getIconColor = () => {
        switch (alert.severity) {
            case 'high': return 'text-red-600 bg-red-100 hover:bg-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200';
            case 'low': return 'text-blue-600 bg-blue-100 hover:bg-blue-200';
            default: return 'text-gray-600 bg-gray-100 hover:bg-gray-200';
        }
    };

    return (
        <button
            onClick={onClick}
            className={`relative p-2 rounded-full transition-all duration-200 ${getIconColor()} group`}
            title={alert.title}
        >
            <IconComponent className="w-5 h-5" />
            {alert.severity === 'high' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
        </button>
    );
};

// Notification Details Modal
const NotificationDetailsModal = ({ alert, isOpen, onClose }: any) => {
    if (!alert) return null;

    const IconComponent = alert.icon;
    const getAlertColor = () => {
        switch (alert.severity) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        {alert.title}
                    </DialogTitle>
                </DialogHeader>
                <div className={`p-4 rounded-lg border ${getAlertColor()}`}>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}>
                                {alert.severity}
                            </Badge>
                            <span className="text-sm text-gray-500">{alert.type}</span>
                        </div>
                        <p className="text-sm">{alert.description}</p>
                        {alert.timestamp && (
                            <p className="text-xs text-gray-500">
                                {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {alert.action && (
                        <Button onClick={alert.action}>
                            {alert.actionText || 'Take Action'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Enhanced Dashboard with extensive iconography
export default function IconEnhancedDashboard() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('overview');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState('');

    // Handler for notification click
    const handleNotificationClick = (alert: any) => {
        setSelectedAlert(alert);
        setIsNotificationModalOpen(true);
    };

    // Handler for name editing
    const handleNameEdit = () => {
        setIsEditingName(true);
        setEditingName(user?.first_name || '');
    };

    const handleNameSave = async () => {
        if (!editingName.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        try {
            // Update user name via API
            const updatedUser = await mockApiClient.auth.updateMe({
                first_name: editingName.trim()
            });

            // Update the user context
            queryClient.invalidateQueries({ queryKey: ['current_user'] });

            setIsEditingName(false);
            toast.success('Name updated successfully');
        } catch (error) {
            console.error('Error updating name:', error);
            toast.error('Failed to update name');
        }
    };

    const handleNameCancel = () => {
        setIsEditingName(false);
        setEditingName('');
    };

    const [quickFilters, setQuickFilters] = useState({
        status: 'all',
        priority: 'all',
        department: 'all'
    });

    // Fetch dashboard data
    const { data: patients, isLoading: patientsLoading } = useQuery({
        queryKey: ['patients'],
        queryFn: () => mockApiClient.entities.Patient.list("-created_date"),
    });

    const { data: appointments, isLoading: appointmentsLoading } = useQuery({
        queryKey: ['appointments', selectedDate],
        queryFn: () => mockApiClient.entities.Appointment.list({
            appointment_date: {
                $gte: startOfDay(selectedDate).toISOString(),
                $lte: endOfDay(selectedDate).toISOString()
            }
        }),
    });

    const { data: encounters, isLoading: encountersLoading } = useQuery({
        queryKey: ['encounters', selectedDate],
        queryFn: () => mockApiClient.entities.Encounter.list({
            visit_date: {
                $gte: startOfDay(selectedDate).toISOString(),
                $lte: endOfDay(selectedDate).toISOString()
            }
        }),
    });

    const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
        queryKey: ['prescriptions'],
        queryFn: () => mockApiClient.entities.Prescription.list("-created_date"),
    });

    const { data: labOrders, isLoading: labOrdersLoading } = useQuery({
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
            totalPatients: {
                value: patients.length,
                icon: Users,
                color: 'bg-blue-100',
                iconColor: 'text-blue-600',
                change: '+12%',
                trend: 'up'
            },
            todayAppointments: {
                value: todayAppointments.length,
                icon: Calendar,
                color: 'bg-green-100',
                iconColor: 'text-green-600',
                change: '+5',
                trend: 'up'
            },
            activePrescriptions: {
                value: activePrescriptions.length,
                icon: Pill,
                color: 'bg-purple-100',
                iconColor: 'text-purple-600',
                change: '0%',
                trend: 'stable'
            },
            pendingLabOrders: {
                value: pendingLabOrders.length,
                icon: Beaker,
                color: 'bg-orange-100',
                iconColor: 'text-orange-600',
                change: '-2',
                trend: 'down'
            },
            completedEncounters: {
                value: completedEncounters.length,
                icon: CheckCircle,
                color: 'bg-green-100',
                iconColor: 'text-green-600',
                change: '+8',
                trend: 'up'
            },
            newPatientsThisWeek: {
                value: patients.filter(p =>
                    new Date(p.created_date) >= subDays(today, 7)
                ).length,
                icon: UserPlus,
                color: 'bg-cyan-100',
                iconColor: 'text-cyan-600',
                change: '+3',
                trend: 'up'
            }
        };
    }, [patients, appointments, encounters, prescriptions, labOrders]);

    // Quick actions
    const quickActions = [
        {
            id: 'new-patient',
            label: 'New Patient',
            icon: UserPlus,
            color: 'bg-blue-500 hover:bg-blue-600',
            url: '/Patients',
            description: 'Register a new patient'
        },
        {
            id: 'new-appointment',
            label: 'Schedule',
            icon: CalendarPlus,
            color: 'bg-green-500 hover:bg-green-600',
            url: '/Appointments',
            description: 'Book a new appointment'
        },
        {
            id: 'prescribe',
            label: 'Prescribe',
            icon: Pill,
            color: 'bg-purple-500 hover:bg-purple-600',
            url: '/PrescriptionManagement',
            description: 'Create new prescription'
        },
        {
            id: 'lab-order',
            label: 'Lab Order',
            icon: Beaker,
            color: 'bg-orange-500 hover:bg-orange-600',
            url: '/LabOrders',
            description: 'Request laboratory test'
        },
        {
            id: 'telemedicine',
            label: 'Telemedicine',
            icon: Video,
            color: 'bg-cyan-500 hover:bg-cyan-600',
            url: '/Telemedicine',
            description: 'Begin virtual consultation'
        },
        {
            id: 'generate-report',
            label: 'Report',
            icon: FileText,
            color: 'bg-gray-500 hover:bg-gray-600',
            url: '/ProceduralReports',
            description: 'Create clinical report'
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
            color: 'text-blue-600',
            status: 'completed'
        },
        {
            id: 2,
            type: 'prescription',
            title: 'Prescription created',
            description: 'Metformin 500mg for Sarah Wilson',
            timestamp: '15 minutes ago',
            icon: Pill,
            color: 'text-green-600',
            status: 'active'
        },
        {
            id: 3,
            type: 'lab_result',
            title: 'Lab results available',
            description: 'Blood work completed for Mike Johnson',
            timestamp: '1 hour ago',
            icon: Beaker,
            color: 'text-purple-600',
            status: 'ready'
        },
        {
            id: 4,
            type: 'patient_update',
            title: 'Patient information updated',
            description: 'Emergency contact updated for Lisa Brown',
            timestamp: '2 hours ago',
            icon: Edit,
            color: 'text-orange-600',
            status: 'completed'
        }
    ];

    // Alerts and notifications
    const alerts = [
        {
            id: 1,
            type: 'urgent',
            title: 'High Priority Alert',
            description: 'Patient John Smith has critical lab values that require immediate attention. Hemoglobin levels are critically low at 6.2 g/dL.',
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50 border-red-200',
            severity: 'high',
            timestamp: new Date().toISOString(),
            action: () => {
                toast.success('Navigating to patient lab results');
                // Navigate to patient lab results
            },
            actionText: 'View Lab Results'
        },
        {
            id: 2,
            type: 'warning',
            title: 'Medication Interaction',
            description: 'Potential drug interaction detected between Warfarin and Aspirin for patient Sarah Johnson. Review medication list.',
            icon: AlertCircle,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            severity: 'medium',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            action: () => {
                toast.info('Opening medication review');
                // Navigate to medication review
            },
            actionText: 'Review Medications'
        },
        {
            id: 3,
            type: 'info',
            title: 'Appointment Reminder',
            description: '3 appointments scheduled for tomorrow: Dr. Smith at 9:00 AM, Dr. Johnson at 2:00 PM, and Dr. Brown at 4:30 PM.',
            icon: Bell,
            color: 'text-blue-600 bg-blue-50 border-blue-200',
            severity: 'low',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            action: () => {
                toast.info('Opening appointments');
                // Navigate to appointments
            },
            actionText: 'View Appointments'
        },
        {
            id: 4,
            type: 'system',
            title: 'System Maintenance',
            description: 'Scheduled system maintenance will occur tonight from 11:00 PM to 1:00 AM. Some features may be temporarily unavailable.',
            icon: Settings,
            color: 'text-gray-600 bg-gray-50 border-gray-200',
            severity: 'low',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            action: null,
            actionText: null
        }
    ];

    // Today's schedule
    const todaysSchedule = appointments?.slice(0, 10).map((appointment: any) => ({
        id: appointment.id,
        title: appointment.patient_name || 'Patient',
        time: format(new Date(appointment.appointment_date), 'HH:mm'),
        type: appointment.appointment_type || 'Consultation',
        status: appointment.status,
        icon: Calendar,
        color: appointment.status === 'completed' ? 'text-green-600' : 'text-blue-600'
    }));

    if (patientsLoading || appointmentsLoading || encountersLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50">
            {/* Clean Header */}
            <div className="bg-gradient-to-r from-blue-100 via-blue-200 to-cyan-200 border-b border-blue-300/60 backdrop-blur-sm px-6 py-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-semibold text-slate-800">
                                    Welcome to the
                                </span>
                                <Input
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="text-xl font-semibold text-slate-800 border-blue-300 focus:border-blue-500 h-8 px-2"
                                    placeholder="Your name"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleNameSave();
                                        if (e.key === 'Escape') handleNameCancel();
                                    }}
                                />
                                <span className="text-xl font-semibold text-slate-800">
                                    Dashboard
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        onClick={handleNameSave}
                                        className="h-6 px-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleNameCancel}
                                        className="h-6 px-2"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-semibold text-slate-800">
                                    Welcome, {user?.first_name || 'User'}
                                </h1>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleNameEdit}
                                    className="h-6 px-2 text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                >
                                    <Edit className="w-3 h-3" />
                                </Button>
                                {user?.organization && (
                                    <div className="flex items-center gap-2 px-2 py-1 bg-white/80 rounded-md border border-blue-200/70">
                                        <Building2 className="w-3 h-3 text-blue-600" />
                                        <span className="text-sm font-medium text-slate-700">
                                            {user.organization}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg border border-blue-200/70 shadow-sm">
                            <Bell className="w-4 h-4 text-blue-600" />
                            <div className="flex items-center gap-1">
                                {alerts.map((alert: any) => (
                                    <TopBarNotificationIcon
                                        key={alert.id}
                                        alert={alert}
                                        onClick={() => handleNotificationClick(alert)}
                                    />
                                ))}
                            </div>
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 border-0">
                                {alerts.length}
                            </Badge>
                        </div>

                        <Button variant="outline" size="sm" className="bg-white/80 border-blue-200/70 hover:bg-white/90 text-slate-700 shadow-sm">
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
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="clinical" className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Clinical
                        </TabsTrigger>
                        <TabsTrigger value="administrative" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Administrative
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.entries(metrics || {}).map(([key, metric]) => {
                                const IconComponent = metric.icon;
                                return (
                                    <Card key={key}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </p>
                                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                                    <div className="flex items-center text-sm mt-1">
                                                        {metric.trend === 'up' ? (
                                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                                        ) : metric.trend === 'down' ? (
                                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                                        ) : (
                                                            <Target className="w-4 h-4 text-gray-600" />
                                                        )}
                                                        <span className={`ml-1 ${metric.trend === 'up' ? 'text-green-600' :
                                                            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                            {metric.change}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.color}`}>
                                                    <IconComponent className={`w-6 h-6 ${metric.iconColor}`} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 card-title">
                                    <Zap className="w-5 h-5 text-yellow-600" />
                                    <span>Quick Actions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    {quickActions.map((action: any) => {
                                        const IconComponent = action.icon;
                                        return (
                                            <Link key={action.id} to={action.url}>
                                                <div className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors ${action.color} text-white`}>
                                                    <IconComponent className="w-6 h-6 mb-2" />
                                                    <span className="btn-text text-center">{action.label}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions and Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 card-title">
                                        <Zap className="w-5 h-5 text-purple-600" />
                                        <span>Quick Actions</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                                            <Plus className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm">New Patient</span>
                                        </Button>
                                        <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                            <span className="text-sm">Schedule</span>
                                        </Button>
                                        <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                                            <Pill className="w-5 h-5 text-orange-600" />
                                            <span className="text-sm">Prescription</span>
                                        </Button>
                                        <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                                            <TestTube className="w-5 h-5 text-red-600" />
                                            <span className="text-sm">Lab Order</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 card-title">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        <span>Recent Activity</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentActivities.map((activity: any) => {
                                            const IconComponent = activity.icon;
                                            return (
                                                <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                                    <IconComponent className={`w-4 h-4 ${activity.color}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-body-medium font-medium text-gray-900 truncate">
                                                            {activity.title}
                                                        </p>
                                                        <p className="text-body-small text-gray-500 truncate">
                                                            {activity.description}
                                                        </p>
                                                    </div>
                                                    <span className="text-body-small text-gray-400">{activity.timestamp}</span>
                                                </div>
                                            );
                                        })}
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
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="w-5 h-5 text-blue-600" />
                                        <span>Today's Clinical Schedule</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <div className="space-y-3">
                                            {todaysSchedule?.map((appointment: any) => {
                                                const IconComponent = appointment.icon;
                                                return (
                                                    <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <IconComponent className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">{appointment.title}</h4>
                                                            <p className="text-sm text-gray-600">{appointment.type}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">{appointment.time}</p>
                                                            <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                                                                {appointment.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HeartPulse className="w-5 h-5 text-red-600" />
                                        <span>Clinical Metrics</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-600">Completed Encounters</span>
                                            </div>
                                            <span className="font-semibold">{metrics?.completedEncounters?.value || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Pill className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-600">Active Prescriptions</span>
                                            </div>
                                            <span className="font-semibold">{metrics?.activePrescriptions?.value || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Beaker className="w-4 h-4 text-yellow-600" />
                                                <span className="text-sm text-gray-600">Pending Lab Orders</span>
                                            </div>
                                            <span className="font-semibold">{metrics?.pendingLabOrders?.value || 0}</span>
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
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <span>Financial Overview</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-600">Total Patients</span>
                                            </div>
                                            <span className="font-semibold">{metrics?.totalPatients?.value || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-600">Today's Appointments</span>
                                            </div>
                                            <span className="font-semibold">{metrics?.todayAppointments?.value || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <UserPlus className="w-4 h-4 text-cyan-600" />
                                                <span className="text-sm text-gray-600">New This Week</span>
                                            </div>
                                            <span className="font-semibold">{metrics?.newPatientsThisWeek?.value || 0}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart className="w-5 h-5 text-blue-600" />
                                        <span>Performance Metrics</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-600">Appointment Completion</span>
                                            </div>
                                            <span className="font-semibold">95%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-yellow-600" />
                                                <span className="text-sm text-gray-600">Patient Satisfaction</span>
                                            </div>
                                            <span className="font-semibold">4.8/5</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-600">System Uptime</span>
                                            </div>
                                            <span className="font-semibold">99.9%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Notification Details Modal */}
            <NotificationDetailsModal
                alert={selectedAlert}
                isOpen={isNotificationModalOpen}
                onClose={() => {
                    setIsNotificationModalOpen(false);
                    setSelectedAlert(null);
                }}
            />
        </div>
    );
}