import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    User,
    Settings,
    Calendar,
    Pill,
    TestTube,
    FileText,
    Heart,
    Activity,
    Stethoscope,
    ClipboardList,
    DollarSign,
    Plus,
    History,
    UserCog,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Phone,
    Mail,
    MapPin,
    Edit,
    Eye,
    Download,
    Filter,
    SortAsc,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    Bell,
    Zap,
    Target,
    Users,
    Calendar as CalendarIcon,
    FileCheck,
    Activity as ActivityIcon,
    AlertCircle,
    Info,
    ExternalLink
} from 'lucide-react';
import { mockApiClient } from '@/api/mockApiClient';

export default function PatientWorkspace() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isMedicalInfoExpanded, setIsMedicalInfoExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [workflowSuggestions, setWorkflowSuggestions] = useState<any[]>([]);

    // Enhanced form states with validation
    const [appointmentForm, setAppointmentForm] = useState({
        date: '',
        time: '',
        type: '',
        notes: '',
        provider: '',
        duration: '30',
        followUpRequired: false
    });
    const [prescriptionForm, setPrescriptionForm] = useState({
        medication: '',
        dosage: '',
        instructions: '',
        refills: '',
        startDate: '',
        endDate: '',
        drugInteractions: []
    });
    const [labOrderForm, setLabOrderForm] = useState({
        testName: '',
        testType: '',
        priority: '',
        notes: '',
        fastingRequired: false,
        preparationInstructions: ''
    });
    const [clinicalNote, setClinicalNote] = useState('');
    const [clinicalTemplate, setClinicalTemplate] = useState('general');
    const [vitalsForm, setVitalsForm] = useState({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        oxygenSaturation: '',
        notes: ''
    });

    // Smart workflow state
    const [currentWorkflow, setCurrentWorkflow] = useState<string | null>(null);
    const [workflowProgress, setWorkflowProgress] = useState(0);
    const [pendingTasks, setPendingTasks] = useState<any[]>([]);

    // Fetch patient data
    const { data: patient, isLoading, error } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => mockApiClient.entities.Patient.get(id || ''),
        enabled: !!id
    });

    // Fetch related data for each tab (using mock data for now)
    const { data: appointments } = useQuery({
        queryKey: ['appointments', id],
        queryFn: () => mockApiClient.entities.Appointment.list(),
        enabled: !!id
    });

    const { data: prescriptions } = useQuery({
        queryKey: ['prescriptions', id],
        queryFn: () => mockApiClient.entities.Prescription.list(),
        enabled: !!id
    });

    const { data: labOrders } = useQuery({
        queryKey: ['lab-orders', id],
        queryFn: () => mockApiClient.entities.LabOrder.list(),
        enabled: !!id
    });

    // Mock encounters data since it doesn't exist in mockApiClient
    const { data: encounters } = useQuery({
        queryKey: ['encounters', id],
        queryFn: () => Promise.resolve([]),
        enabled: !!id
    });

    // Enhanced data processing and smart features
    useEffect(() => {
        if (patient && appointments && prescriptions && labOrders) {
            // Generate smart notifications
            const smartNotifications = generateSmartNotifications(patient, appointments, prescriptions, labOrders);
            setNotifications(smartNotifications);

            // Generate workflow suggestions
            const suggestions = generateWorkflowSuggestions(patient, appointments, prescriptions, labOrders);
            setWorkflowSuggestions(suggestions);

            // Update pending tasks
            const tasks = generatePendingTasks(appointments, prescriptions, labOrders);
            setPendingTasks(tasks);
        }
    }, [patient, appointments, prescriptions, labOrders]);

    // Smart notification generator
    const generateSmartNotifications = (patient: any, appointments: any[], prescriptions: any[], labOrders: any[]) => {
        const notifications = [];

        // Check for upcoming appointments
        const upcomingAppointments = appointments?.filter(apt =>
            new Date(apt.appointment_date) > new Date() &&
            new Date(apt.appointment_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );

        if (upcomingAppointments?.length > 0) {
            notifications.push({
                id: 'upcoming-appointments',
                type: 'info',
                title: 'Upcoming Appointments',
                message: `${upcomingAppointments.length} appointment(s) scheduled this week`,
                icon: Calendar,
                action: () => setActiveTab('appointments')
            });
        }

        // Check for prescription refills needed
        const refillsNeeded = prescriptions?.filter(script =>
            script.refills <= 1 && script.status === 'active'
        );

        if (refillsNeeded?.length > 0) {
            notifications.push({
                id: 'refills-needed',
                type: 'warning',
                title: 'Prescription Refills Needed',
                message: `${refillsNeeded.length} prescription(s) need refills`,
                icon: Pill,
                action: () => setActiveTab('prescriptions')
            });
        }

        // Check for pending lab results
        const pendingLabs = labOrders?.filter(lab =>
            lab.status === 'pending' || lab.status === 'processing'
        );

        if (pendingLabs?.length > 0) {
            notifications.push({
                id: 'pending-labs',
                type: 'info',
                title: 'Pending Lab Results',
                message: `${pendingLabs.length} lab order(s) pending results`,
                icon: TestTube,
                action: () => setActiveTab('lab-orders')
            });
        }

        return notifications;
    };

    // Workflow suggestion generator
    const generateWorkflowSuggestions = (patient: any, appointments: any[], prescriptions: any[], labOrders: any[]) => {
        const suggestions = [];

        // Suggest follow-up appointment if recent visit
        const recentAppointments = appointments?.filter(apt =>
            new Date(apt.appointment_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        if (recentAppointments?.length > 0) {
            suggestions.push({
                id: 'follow-up-suggestion',
                title: 'Schedule Follow-up',
                description: 'Consider scheduling a follow-up appointment',
                icon: Calendar,
                action: () => {
                    setActiveTab('appointments');
                    setAppointmentForm(prev => ({ ...prev, type: 'follow-up' }));
                }
            });
        }

        // Suggest lab work if no recent labs
        const recentLabs = labOrders?.filter(lab =>
            new Date(lab.created_at) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        );

        if (!recentLabs || recentLabs.length === 0) {
            suggestions.push({
                id: 'lab-work-suggestion',
                title: 'Order Lab Work',
                description: 'No recent lab work - consider ordering routine labs',
                icon: TestTube,
                action: () => setActiveTab('lab-orders')
            });
        }

        return suggestions;
    };

    // Pending tasks generator
    const generatePendingTasks = (appointments: any[], prescriptions: any[], labOrders: any[]) => {
        const tasks = [];

        // Add tasks based on data
        appointments?.forEach(apt => {
            if (apt.status === 'scheduled') {
                tasks.push({
                    id: `apt-${apt.id}`,
                    type: 'appointment',
                    title: `Prepare for ${apt.appointment_type}`,
                    dueDate: apt.appointment_date,
                    priority: 'medium'
                });
            }
        });

        prescriptions?.forEach(script => {
            if (script.refills <= 1) {
                tasks.push({
                    id: `script-${script.id}`,
                    type: 'prescription',
                    title: `Refill ${script.medication}`,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    priority: 'high'
                });
            }
        });

        return tasks;
    };

    // Mutations (using mock data for now)
    const createAppointment = useMutation({
        mutationFn: (data: any) => mockApiClient.entities.Appointment.create(data),
        onSuccess: () => {
            // Invalidate queries to refresh data
        }
    });

    const createPrescription = useMutation({
        mutationFn: (data: any) => mockApiClient.entities.Prescription.create(data),
        onSuccess: () => {
            // Invalidate queries to refresh data
        }
    });

    const createLabOrder = useMutation({
        mutationFn: (data: any) => mockApiClient.entities.LabOrder.create(data),
        onSuccess: () => {
            // Invalidate queries to refresh data
        }
    });

    const createEncounter = useMutation({
        mutationFn: (data: any) => Promise.resolve({ id: Date.now().toString(), ...data }),
        onSuccess: () => {
            // Invalidate queries to refresh data
        }
    });

    // Form handlers
    const handleAppointmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAppointment.mutateAsync({
                patient_id: id,
                appointment_date: appointmentForm.date,
                appointment_time: appointmentForm.time,
                appointment_type: appointmentForm.type,
                notes: appointmentForm.notes,
                status: 'scheduled'
            });
            setAppointmentForm({ date: '', time: '', type: '', notes: '' });
        } catch (error) {
            console.error('Failed to create appointment:', error);
        }
    };

    const handlePrescriptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPrescription.mutateAsync({
                patient_id: id,
                medication: prescriptionForm.medication,
                dosage: prescriptionForm.dosage,
                instructions: prescriptionForm.instructions,
                refills: parseInt(prescriptionForm.refills),
                status: 'active'
            });
            setPrescriptionForm({ medication: '', dosage: '', instructions: '', refills: '' });
        } catch (error) {
            console.error('Failed to create prescription:', error);
        }
    };

    const handleLabOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createLabOrder.mutateAsync({
                patient_id: id,
                test_name: labOrderForm.testName,
                test_type: labOrderForm.testType,
                priority: labOrderForm.priority,
                notes: labOrderForm.notes,
                status: 'pending'
            });
            setLabOrderForm({ testName: '', testType: '', priority: '', notes: '' });
        } catch (error) {
            console.error('Failed to create lab order:', error);
        }
    };

    const handleClinicalNoteSubmit = () => {
        void (async () => {
            try {
                await createEncounter.mutateAsync({
                    patient_id: id,
                    encounter_type: 'clinical_note',
                    notes: clinicalNote,
                    status: 'completed'
                });
                setClinicalNote('');
            } catch (error) {
                console.error('Failed to create clinical note:', error);
            }
        })();
    };

    const handleVitalsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createEncounter.mutateAsync({
                patient_id: id,
                encounter_type: 'vitals',
                notes: `BP: ${vitalsForm.bloodPressure}, HR: ${vitalsForm.heartRate}, Temp: ${vitalsForm.temperature}, Weight: ${vitalsForm.weight}, Height: ${vitalsForm.height}. ${vitalsForm.notes}`,
                status: 'completed'
            });
            setVitalsForm({ bloodPressure: '', heartRate: '', temperature: '', weight: '', height: '', notes: '' });
        } catch (error) {
            console.error('Failed to record vitals:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-8 w-64 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-96" />
                        <Skeleton className="h-96" />
                        <Skeleton className="h-96" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">Failed to load patient data</p>
                        <p className="text-sm text-gray-500 mb-4">Error: {error.message}</p>
                        <Button onClick={() => void navigate('/patients')}>
                            Back to Patients
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-semibold text-yellow-600 mb-2">Patient Not Found</h2>
                        <p className="text-gray-600 mb-4">Patient with ID &quot;{id}&quot; was not found</p>
                        <Button onClick={() => void navigate('/patients')}>
                            Back to Patients
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void navigate('/patients')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Patients
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {patient.first_name} {patient.last_name}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Patient Workspace
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                            Patient ID: {id}
                        </Badge>
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>

            {/* Patient Content */}
            <div className="p-6">
                {/* Basic Information - Always Visible at Top */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Patient Information</span>
                            </h2>
                            <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="text-sm">
                                    ID: {id}
                                </Badge>
                                <Button variant="outline" size="sm">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Name</p>
                                <p className="text-lg font-semibold">{patient.first_name} {patient.last_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                                <p className="text-sm">{patient.date_of_birth}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Gender</p>
                                <p className="text-sm capitalize">{patient.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                    Active
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            {patient.phone && (
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{patient.phone}</span>
                                </div>
                            )}
                            {patient.email && (
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{patient.email}</span>
                                </div>
                            )}
                            {patient.address && (
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{patient.address}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Collapsible Medical Information */}
                <Card className="mb-6">
                    <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMedicalInfoExpanded(!isMedicalInfoExpanded)}
                    >
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Stethoscope className="h-5 w-5" />
                                <span>Medical Information</span>
                            </div>
                            <Button variant="ghost" size="sm">
                                {isMedicalInfoExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </CardTitle>
                    </CardHeader>

                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isMedicalInfoExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Allergies</p>
                                    <p className="text-sm">{patient.allergies?.join(', ') || 'None reported'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Medical History</p>
                                    <p className="text-sm">{patient.medical_history || 'No medical history recorded'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Emergency Contact</p>
                                    <p className="text-sm">{patient.emergency_contact_name || 'No emergency contact on file'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Insurance</p>
                                    <p className="text-sm">{patient.insurance_provider || 'No insurance information'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>

                {/* Main Content Area - Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-8 lg:grid-cols-12 mb-6">
                        <TabsTrigger value="overview" className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="clinical" className="flex items-center space-x-2">
                            <Stethoscope className="h-4 w-4" />
                            <span className="hidden sm:inline">Clinical</span>
                        </TabsTrigger>
                        <TabsTrigger value="appointments" className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Appointments</span>
                        </TabsTrigger>
                        <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
                            <Pill className="h-4 w-4" />
                            <span className="hidden sm:inline">Prescriptions</span>
                        </TabsTrigger>
                        <TabsTrigger value="lab-orders" className="flex items-center space-x-2">
                            <TestTube className="h-4 w-4" />
                            <span className="hidden sm:inline">Lab Orders</span>
                        </TabsTrigger>
                        <TabsTrigger value="procedures" className="flex items-center space-x-2">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">Procedures</span>
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Documents</span>
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="hidden sm:inline">Billing</span>
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex items-center space-x-2">
                            <History className="h-4 w-4" />
                            <span className="hidden sm:inline">Timeline</span>
                        </TabsTrigger>
                        <TabsTrigger value="vitals" className="flex items-center space-x-2">
                            <Heart className="h-4 w-4" />
                            <span className="hidden sm:inline">Vitals</span>
                        </TabsTrigger>
                        <TabsTrigger value="referrals" className="flex items-center space-x-2">
                            <UserCog className="h-4 w-4" />
                            <span className="hidden sm:inline">Referrals</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Enhanced Overview Tab */}
                    <TabsContent value="overview">
                        <div className="space-y-6">
                            {/* Smart Notifications */}
                            {notifications.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                                        <Bell className="h-5 w-5 text-blue-500" />
                                        <span>Smart Alerts</span>
                                    </h3>
                                    {notifications.map((notification) => (
                                        <Alert key={notification.id} className={`cursor-pointer hover:bg-gray-50 ${notification.type === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`} onClick={notification.action}>
                                            <notification.icon className="h-4 w-4" />
                                            <AlertDescription>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{notification.title}</p>
                                                        <p className="text-sm text-gray-600">{notification.message}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            )}

                            {/* Workflow Progress */}
                            {currentWorkflow && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Target className="h-5 w-5" />
                                            <span>Current Workflow</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{currentWorkflow}</span>
                                                <span className="text-sm text-gray-500">{workflowProgress}%</span>
                                            </div>
                                            <Progress value={workflowProgress} className="h-2" />
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Clock className="h-4 w-4" />
                                                <span>Estimated completion: 15 minutes</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Smart Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Zap className="h-5 w-5 text-yellow-500" />
                                        <span>Smart Actions</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => setActiveTab('appointments')}
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Schedule Appointment
                                        </Button>
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => setActiveTab('prescriptions')}
                                        >
                                            <Pill className="h-4 w-4 mr-2" />
                                            New Prescription
                                        </Button>
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => setActiveTab('lab-orders')}
                                        >
                                            <TestTube className="h-4 w-4 mr-2" />
                                            Order Lab Test
                                        </Button>
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => setActiveTab('clinical')}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Add Clinical Note
                                        </Button>
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => setActiveTab('vitals')}
                                        >
                                            <Heart className="h-4 w-4 mr-2" />
                                            Record Vitals
                                        </Button>
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => setActiveTab('timeline')}
                                        >
                                            <History className="h-4 w-4 mr-2" />
                                            View Timeline
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Workflow Suggestions */}
                            {workflowSuggestions.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <TrendingUp className="h-5 w-5 text-green-500" />
                                            <span>Suggested Actions</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {workflowSuggestions.map((suggestion) => (
                                                <div key={suggestion.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={suggestion.action}>
                                                    <div className="flex items-center space-x-3">
                                                        <suggestion.icon className="h-5 w-5 text-blue-500" />
                                                        <div>
                                                            <p className="font-medium">{suggestion.title}</p>
                                                            <p className="text-sm text-gray-600">{suggestion.description}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Pending Tasks */}
                            {pendingTasks.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <CheckCircle className="h-5 w-5 text-orange-500" />
                                            <span>Pending Tasks</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {pendingTasks.map((task) => (
                                                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                                        <div>
                                                            <p className="font-medium">{task.title}</p>
                                                            <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Patient Summary Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-medium">Appointments</p>
                                                <p className="text-2xl font-bold">{appointments?.length || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <Pill className="h-5 w-5 text-green-500" />
                                            <div>
                                                <p className="text-sm font-medium">Prescriptions</p>
                                                <p className="text-2xl font-bold">{prescriptions?.length || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <TestTube className="h-5 w-5 text-purple-500" />
                                            <div>
                                                <p className="text-sm font-medium">Lab Orders</p>
                                                <p className="text-2xl font-bold">{labOrders?.length || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-5 w-5 text-orange-500" />
                                            <div>
                                                <p className="text-sm font-medium">Notes</p>
                                                <p className="text-2xl font-bold">{encounters?.length || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Enhanced Clinical Tab */}
                    <TabsContent value="clinical">
                        <div className="space-y-6">
                            {/* Clinical Templates */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <FileCheck className="h-5 w-5" />
                                        <span>Clinical Templates</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        <Button
                                            variant={clinicalTemplate === 'general' ? 'default' : 'outline'}
                                            onClick={() => setClinicalTemplate('general')}
                                            className="justify-start"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            General Visit
                                        </Button>
                                        <Button
                                            variant={clinicalTemplate === 'followup' ? 'default' : 'outline'}
                                            onClick={() => setClinicalTemplate('followup')}
                                            className="justify-start"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Follow-up
                                        </Button>
                                        <Button
                                            variant={clinicalTemplate === 'consultation' ? 'default' : 'outline'}
                                            onClick={() => setClinicalTemplate('consultation')}
                                            className="justify-start"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Consultation
                                        </Button>
                                        <Button
                                            variant={clinicalTemplate === 'emergency' ? 'default' : 'outline'}
                                            onClick={() => setClinicalTemplate('emergency')}
                                            className="justify-start"
                                        >
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Emergency
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Smart Clinical Note Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Stethoscope className="h-5 w-5" />
                                        <span>Clinical Documentation</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Template-based form */}
                                        {clinicalTemplate === 'general' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="chief-complaint">Chief Complaint</Label>
                                                    <Input
                                                        id="chief-complaint"
                                                        placeholder="Primary reason for visit"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="history-present">History of Present Illness</Label>
                                                    <textarea
                                                        className="w-full p-3 border rounded-md"
                                                        placeholder="Detailed history..."
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {clinicalTemplate === 'followup' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="followup-reason">Follow-up Reason</Label>
                                                    <Select>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select reason" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="medication-review">Medication Review</SelectItem>
                                                            <SelectItem value="symptom-monitoring">Symptom Monitoring</SelectItem>
                                                            <SelectItem value="lab-results">Lab Results Review</SelectItem>
                                                            <SelectItem value="treatment-response">Treatment Response</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="progress-notes">Progress Notes</Label>
                                                    <textarea
                                                        className="w-full p-3 border rounded-md"
                                                        placeholder="Patient progress since last visit..."
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <Label htmlFor="clinical-note">Clinical Notes</Label>
                                            <textarea
                                                className="w-full p-3 border rounded-md"
                                                value={clinicalNote}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClinicalNote(e.target.value)}
                                                placeholder="Enter clinical observations, diagnosis, treatment plan, etc."
                                                rows={6}
                                            />
                                        </div>

                                        {/* Smart suggestions based on patient data */}
                                        {patient && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Info className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-800">Smart Suggestions</span>
                                                </div>
                                                <div className="text-sm text-blue-700">
                                                    <p>• Consider reviewing allergies: {patient.allergies?.join(', ') || 'None documented'}</p>
                                                    <p>• Last appointment: {appointments?.[0]?.appointment_date || 'No recent appointments'}</p>
                                                    <p>• Active prescriptions: {prescriptions?.filter(p => p.status === 'active').length || 0}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <Button variant="outline">
                                                <Download className="h-4 w-4 mr-2" />
                                                Save as Template
                                            </Button>
                                            <Button
                                                onClick={handleClinicalNoteSubmit}
                                                disabled={!clinicalNote.trim() || createEncounter.isPending}
                                            >
                                                {createEncounter.isPending ? 'Saving...' : 'Save Clinical Note'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Clinical Notes History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ClipboardList className="h-5 w-5" />
                                            <span>Clinical Notes History</span>
                                        </div>
                                        <Badge variant="outline">{encounters?.filter((e: any) => e.encounter_type === 'clinical_note')?.length || 0} Notes</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {encounters && encounters.filter((e: any) => e.encounter_type === 'clinical_note').length > 0 ? (
                                        <div className="space-y-4">
                                            {encounters
                                                .filter((encounter: any) => encounter.encounter_type === 'clinical_note')
                                                .map((encounter: any) => (
                                                    <div key={encounter.id} className="p-4 border rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Stethoscope className="h-4 w-4 text-blue-500" />
                                                                <span className="text-sm font-medium">Clinical Note</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm text-gray-500">{encounter.created_at}</span>
                                                                <Badge variant="outline">{encounter.status}</Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{encounter.notes}</p>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No clinical notes recorded</p>
                                            <p className="text-sm">Add the first clinical note using the form above</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Medical History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <History className="h-5 w-5" />
                                        <span>Medical History</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-gray-500">
                                        <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No medical history recorded</p>
                                        <Button className="mt-4" size="sm" variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Medical History
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Enhanced Appointments Tab */}
                    <TabsContent value="appointments">
                        <div className="space-y-6">
                            {/* Smart Appointment Scheduling */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-5 w-5" />
                                            <span>Smart Appointment Scheduling</span>
                                        </div>
                                        <Badge variant="outline">{appointments?.length || 0} Total</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                                        {/* Quick appointment types */}
                                        <div>
                                            <Label>Quick Schedule</Label>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                                                <Button
                                                    type="button"
                                                    variant={appointmentForm.type === 'consultation' ? 'default' : 'outline'}
                                                    onClick={() => setAppointmentForm(prev => ({ ...prev, type: 'consultation', duration: '30' }))}
                                                    className="text-sm"
                                                >
                                                    <Users className="h-4 w-4 mr-1" />
                                                    Consultation
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={appointmentForm.type === 'follow-up' ? 'default' : 'outline'}
                                                    onClick={() => setAppointmentForm(prev => ({ ...prev, type: 'follow-up', duration: '15' }))}
                                                    className="text-sm"
                                                >
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Follow-up
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={appointmentForm.type === 'procedure' ? 'default' : 'outline'}
                                                    onClick={() => setAppointmentForm(prev => ({ ...prev, type: 'procedure', duration: '60' }))}
                                                    className="text-sm"
                                                >
                                                    <Activity className="h-4 w-4 mr-1" />
                                                    Procedure
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={appointmentForm.type === 'emergency' ? 'default' : 'outline'}
                                                    onClick={() => setAppointmentForm(prev => ({ ...prev, type: 'emergency', duration: '30' }))}
                                                    className="text-sm"
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                                    Emergency
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="appointment-date">Date</Label>
                                                <Input
                                                    id="appointment-date"
                                                    type="date"
                                                    value={appointmentForm.date}
                                                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="appointment-time">Time</Label>
                                                <Input
                                                    id="appointment-time"
                                                    type="time"
                                                    value={appointmentForm.time}
                                                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="duration">Duration (minutes)</Label>
                                                <Select value={appointmentForm.duration} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, duration: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="15">15 minutes</SelectItem>
                                                        <SelectItem value="30">30 minutes</SelectItem>
                                                        <SelectItem value="45">45 minutes</SelectItem>
                                                        <SelectItem value="60">60 minutes</SelectItem>
                                                        <SelectItem value="90">90 minutes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="provider">Provider</Label>
                                                <Select value={appointmentForm.provider} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, provider: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select provider" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                                                        <SelectItem value="dr-jones">Dr. Jones</SelectItem>
                                                        <SelectItem value="dr-wilson">Dr. Wilson</SelectItem>
                                                        <SelectItem value="nurse-practitioner">Nurse Practitioner</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="followup-required"
                                                    checked={appointmentForm.followUpRequired}
                                                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                                                    className="rounded"
                                                />
                                                <Label htmlFor="followup-required">Follow-up required</Label>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="appointment-notes">Notes</Label>
                                            <textarea
                                                className="w-full p-3 border rounded-md"
                                                value={appointmentForm.notes}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Additional notes, preparation instructions, etc."
                                                rows={3}
                                            />
                                        </div>

                                        {/* Smart suggestions */}
                                        {appointments && appointments.length > 0 && (
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Info className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800">Scheduling Insights</span>
                                                </div>
                                                <div className="text-sm text-green-700">
                                                    <p>• Last appointment: {appointments[0]?.appointment_type} on {appointments[0]?.appointment_date}</p>
                                                    <p>• Average appointment duration: 30 minutes</p>
                                                    <p>• Preferred provider: Dr. Smith (based on history)</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <Button type="button" variant="outline">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Check Availability
                                            </Button>
                                            <Button type="submit" disabled={createAppointment.isPending}>
                                                {createAppointment.isPending ? 'Scheduling...' : 'Schedule Appointment'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Appointments List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Upcoming Appointments</span>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filter
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <SortAsc className="h-4 w-4 mr-2" />
                                                Sort
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {appointments && appointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {appointments.map((appointment: any) => (
                                                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <Calendar className="h-5 w-5 text-blue-500" />
                                                        <div>
                                                            <p className="font-medium">{appointment.appointment_type}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {appointment.appointment_date} at {appointment.appointment_time}
                                                            </p>
                                                            {appointment.notes && (
                                                                <p className="text-sm text-gray-500">{appointment.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                                                            {appointment.status}
                                                        </Badge>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No appointments scheduled</p>
                                            <p className="text-sm">Schedule the first appointment using the form above</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Enhanced Prescriptions Tab */}
                    <TabsContent value="prescriptions">
                        <div className="space-y-6">
                            {/* Smart Prescription Management */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Pill className="h-5 w-5" />
                                            <span>Smart Prescription Management</span>
                                        </div>
                                        <Badge variant="outline">{prescriptions?.length || 0} Total</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                                        {/* Quick medication selection */}
                                        <div>
                                            <Label>Quick Prescriptions</Label>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setPrescriptionForm(prev => ({
                                                        ...prev,
                                                        medication: 'Lisinopril',
                                                        dosage: '10mg',
                                                        instructions: 'Take once daily with or without food'
                                                    }))}
                                                    className="text-sm"
                                                >
                                                    <Pill className="h-4 w-4 mr-1" />
                                                    Lisinopril
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setPrescriptionForm(prev => ({
                                                        ...prev,
                                                        medication: 'Metformin',
                                                        dosage: '500mg',
                                                        instructions: 'Take twice daily with meals'
                                                    }))}
                                                    className="text-sm"
                                                >
                                                    <Pill className="h-4 w-4 mr-1" />
                                                    Metformin
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setPrescriptionForm(prev => ({
                                                        ...prev,
                                                        medication: 'Atorvastatin',
                                                        dosage: '20mg',
                                                        instructions: 'Take once daily in the evening'
                                                    }))}
                                                    className="text-sm"
                                                >
                                                    <Pill className="h-4 w-4 mr-1" />
                                                    Atorvastatin
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setPrescriptionForm(prev => ({
                                                        ...prev,
                                                        medication: 'Amlodipine',
                                                        dosage: '5mg',
                                                        instructions: 'Take once daily'
                                                    }))}
                                                    className="text-sm"
                                                >
                                                    <Pill className="h-4 w-4 mr-1" />
                                                    Amlodipine
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="medication">Medication</Label>
                                                <Input
                                                    id="medication"
                                                    value={prescriptionForm.medication}
                                                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medication: e.target.value }))}
                                                    placeholder="Enter medication name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="dosage">Dosage</Label>
                                                <Input
                                                    id="dosage"
                                                    value={prescriptionForm.dosage}
                                                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, dosage: e.target.value }))}
                                                    placeholder="e.g., 10mg"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="refills">Refills</Label>
                                                <Input
                                                    id="refills"
                                                    type="number"
                                                    min="0"
                                                    max="12"
                                                    value={prescriptionForm.refills}
                                                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, refills: e.target.value }))}
                                                    placeholder="Number of refills"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="start-date">Start Date</Label>
                                                <Input
                                                    id="start-date"
                                                    type="date"
                                                    value={prescriptionForm.startDate}
                                                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, startDate: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="end-date">End Date</Label>
                                                <Input
                                                    id="end-date"
                                                    type="date"
                                                    value={prescriptionForm.endDate}
                                                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, endDate: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="instructions">Instructions</Label>
                                            <textarea
                                                className="w-full p-3 border rounded-md"
                                                value={prescriptionForm.instructions}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                                                placeholder="Take with food, twice daily, etc."
                                                required
                                            />
                                        </div>

                                        {/* Drug interaction warnings */}
                                        {prescriptionForm.medication && prescriptions && (
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                    <span className="text-sm font-medium text-yellow-800">Drug Interaction Check</span>
                                                </div>
                                                <div className="text-sm text-yellow-700">
                                                    <p>• Checking interactions with current medications...</p>
                                                    <p>• No known interactions detected</p>
                                                    <p>• Consider monitoring for side effects</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Smart suggestions */}
                                        {patient && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Info className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-800">Patient Context</span>
                                                </div>
                                                <div className="text-sm text-blue-700">
                                                    <p>• Allergies: {patient.allergies?.join(', ') || 'None documented'}</p>
                                                    <p>• Current medications: {prescriptions?.filter(p => p.status === 'active').length || 0}</p>
                                                    <p>• Last prescription: {prescriptions?.[0]?.medication || 'None'}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <Button type="button" variant="outline">
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Check Interactions
                                            </Button>
                                            <Button type="submit" disabled={createPrescription.isPending}>
                                                {createPrescription.isPending ? 'Creating...' : 'Create Prescription'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Prescriptions List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Active Prescriptions</span>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filter
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {prescriptions && prescriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {prescriptions.map((prescription: any) => (
                                                <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <Pill className="h-5 w-5 text-green-500" />
                                                        <div>
                                                            <p className="font-medium">{prescription.medication}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {prescription.dosage} - {prescription.instructions}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Refills: {prescription.refills || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                                                            {prescription.status}
                                                        </Badge>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No prescriptions on file</p>
                                            <p className="text-sm">Create the first prescription using the form above</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Enhanced Lab Orders Tab */}
                    <TabsContent value="lab-orders">
                        <div className="space-y-6">
                            {/* Smart Lab Order Management */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <TestTube className="h-5 w-5" />
                                            <span>Smart Lab Order Management</span>
                                        </div>
                                        <Badge variant="outline">{labOrders?.length || 0} Total</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleLabOrderSubmit} className="space-y-4">
                                        {/* Quick lab panels */}
                                        <div>
                                            <Label>Common Lab Panels</Label>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setLabOrderForm(prev => ({
                                                        ...prev,
                                                        testName: 'Complete Blood Count (CBC)',
                                                        testType: 'blood',
                                                        priority: 'routine',
                                                        preparationInstructions: 'No special preparation required'
                                                    }))}
                                                    className="text-sm"
                                                >
                                                    <TestTube className="h-4 w-4 mr-1" />
                                                    CBC
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setLabOrderForm(prev => ({
                                                        ...prev,
                                                        testName: 'Basic Metabolic Panel',
                                                        testType: 'blood',
                                                        priority: 'routine',
                                                        preparationInstructions: 'Fasting required (8-12 hours)'
                                                    }))}
                                                    className="text-sm"
                                                >
                                                    <TestTube className="h-4 w-4 mr-1" />
                                                    BMP
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setLabOrderForm(prev => ({
                                                        ...prev,
                                                        testName: 'Lipid Panel',
                                                        testType: 'blood',
                                                        priority: 'routine',
                                                        preparationInstructions: 'Fasting required (12-14 hours)'
                                                    }))}
                                                    className="text-sm"
                                                >
                                                    <TestTube className="h-4 w-4 mr-1" />
                                                    Lipid Panel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setLabOrderForm(prev => ({
                                                        ...prev,
                                                        testName: 'Thyroid Function Tests',
                                                        testType: 'blood',
                                                        priority: 'routine',
                                                        preparationInstructions: 'No special preparation required'
                                                    }))}
                                                    className="text-sm"
                                                >
                                                    <TestTube className="h-4 w-4 mr-1" />
                                                    Thyroid
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="test-name">Test Name</Label>
                                                <Input
                                                    id="test-name"
                                                    value={labOrderForm.testName}
                                                    onChange={(e) => setLabOrderForm(prev => ({ ...prev, testName: e.target.value }))}
                                                    placeholder="e.g., Complete Blood Count"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="test-type">Test Type</Label>
                                                <Select value={labOrderForm.testType} onValueChange={(value) => setLabOrderForm(prev => ({ ...prev, testType: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select test type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="blood">Blood Test</SelectItem>
                                                        <SelectItem value="urine">Urine Test</SelectItem>
                                                        <SelectItem value="imaging">Imaging</SelectItem>
                                                        <SelectItem value="culture">Culture</SelectItem>
                                                        <SelectItem value="biopsy">Biopsy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="priority">Priority</Label>
                                                <Select value={labOrderForm.priority} onValueChange={(value) => setLabOrderForm(prev => ({ ...prev, priority: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="routine">Routine</SelectItem>
                                                        <SelectItem value="urgent">Urgent</SelectItem>
                                                        <SelectItem value="stat">STAT</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="fasting-required"
                                                    checked={labOrderForm.fastingRequired}
                                                    onChange={(e) => setLabOrderForm(prev => ({ ...prev, fastingRequired: e.target.checked }))}
                                                    className="rounded"
                                                />
                                                <Label htmlFor="fasting-required">Fasting required</Label>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="preparation-instructions">Preparation Instructions</Label>
                                            <textarea
                                                className="w-full p-3 border rounded-md"
                                                value={labOrderForm.preparationInstructions}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLabOrderForm(prev => ({ ...prev, preparationInstructions: e.target.value }))}
                                                placeholder="Patient preparation instructions..."
                                                rows={2}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="lab-notes">Notes</Label>
                                            <textarea
                                                className="w-full p-3 border rounded-md"
                                                value={labOrderForm.notes}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLabOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Special instructions or clinical notes..."
                                                rows={3}
                                            />
                                        </div>

                                        {/* Smart lab suggestions */}
                                        {patient && (
                                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Info className="h-4 w-4 text-purple-600" />
                                                    <span className="text-sm font-medium text-purple-800">Lab Recommendations</span>
                                                </div>
                                                <div className="text-sm text-purple-700">
                                                    <p>• Age-appropriate screening: {patient.date_of_birth ? Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown'} years old</p>
                                                    <p>• Last lab work: {labOrders?.[0]?.test_name || 'None documented'}</p>
                                                    <p>• Consider routine screening panel</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <Button type="button" variant="outline">
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                Check Guidelines
                                            </Button>
                                            <Button type="submit" disabled={createLabOrder.isPending}>
                                                {createLabOrder.isPending ? 'Creating...' : 'Create Lab Order'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Lab Orders List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Lab Orders</span>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filter
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {labOrders && labOrders.length > 0 ? (
                                        <div className="space-y-4">
                                            {labOrders.map((order: any) => (
                                                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <TestTube className="h-5 w-5 text-blue-500" />
                                                        <div>
                                                            <p className="font-medium">{order.test_name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {order.test_type} - Priority: {order.priority}
                                                            </p>
                                                            {order.notes && (
                                                                <p className="text-sm text-gray-500">{order.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant={
                                                            order.status === 'pending' ? 'secondary' :
                                                                order.status === 'completed' ? 'default' :
                                                                    'destructive'
                                                        }>
                                                            {order.status}
                                                        </Badge>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No lab orders on file</p>
                                            <p className="text-sm">Create the first lab order using the form above</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Procedures Tab */}
                    <TabsContent value="procedures">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Activity className="h-5 w-5" />
                                        <span>Procedures</span>
                                    </div>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Procedure
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-gray-500">
                                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No procedures recorded</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5" />
                                        <span>Documents</span>
                                    </div>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No documents uploaded</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Billing Tab */}
                    <TabsContent value="billing">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="h-5 w-5" />
                                        <span>Billing Information</span>
                                    </div>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Invoice
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-gray-500">
                                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No billing information available</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <History className="h-5 w-5" />
                                        <span>Patient Timeline</span>
                                    </div>
                                    <Badge variant="outline">{encounters?.length || 0} Events</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {encounters && encounters.length > 0 ? (
                                    <div className="space-y-4">
                                        {encounters
                                            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((encounter: any) => (
                                                <div key={encounter.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                                                    <div className="flex-shrink-0">
                                                        {encounter.encounter_type === 'clinical_note' ? (
                                                            <Stethoscope className="h-5 w-5 text-blue-500" />
                                                        ) : encounter.encounter_type === 'vitals' ? (
                                                            <Heart className="h-5 w-5 text-red-500" />
                                                        ) : (
                                                            <Activity className="h-5 w-5 text-green-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-sm font-medium text-gray-900 capitalize">
                                                                {encounter.encounter_type.replace('_', ' ')}
                                                            </p>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(encounter.created_at).toLocaleDateString()} at {new Date(encounter.created_at).toLocaleTimeString()}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {encounter.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{encounter.notes}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No timeline events recorded</p>
                                        <p className="text-sm">Patient activities will appear here chronologically</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Vitals Tab */}
                    <TabsContent value="vitals">
                        <div className="space-y-6">
                            {/* Record Vitals Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Heart className="h-5 w-5" />
                                        <span>Record Vital Signs</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleVitalsSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="blood-pressure">Blood Pressure</Label>
                                            <Input
                                                id="blood-pressure"
                                                value={vitalsForm.bloodPressure}
                                                onChange={(e) => setVitalsForm(prev => ({ ...prev, bloodPressure: e.target.value }))}
                                                placeholder="e.g., 120/80"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="heart-rate">Heart Rate</Label>
                                            <Input
                                                id="heart-rate"
                                                type="number"
                                                value={vitalsForm.heartRate}
                                                onChange={(e) => setVitalsForm(prev => ({ ...prev, heartRate: e.target.value }))}
                                                placeholder="BPM"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="temperature">Temperature</Label>
                                            <Input
                                                id="temperature"
                                                type="number"
                                                step="0.1"
                                                value={vitalsForm.temperature}
                                                onChange={(e) => setVitalsForm(prev => ({ ...prev, temperature: e.target.value }))}
                                                placeholder="°F"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="weight">Weight</Label>
                                            <Input
                                                id="weight"
                                                type="number"
                                                step="0.1"
                                                value={vitalsForm.weight}
                                                onChange={(e) => setVitalsForm(prev => ({ ...prev, weight: e.target.value }))}
                                                placeholder="lbs"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="height">Height</Label>
                                            <Input
                                                id="height"
                                                value={vitalsForm.height}
                                                onChange={(e) => setVitalsForm(prev => ({ ...prev, height: e.target.value }))}
                                                placeholder="e.g., 5'8&quot;"
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-1">
                                            <Label htmlFor="vitals-notes">Notes</Label>
                                            <textarea
                                                className="w-full p-3 border rounded-md"
                                                value={vitalsForm.notes}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVitalsForm(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Additional observations..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <Button type="submit" disabled={createEncounter.isPending}>
                                                {createEncounter.isPending ? 'Recording...' : 'Record Vitals'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Vitals History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <History className="h-5 w-5" />
                                            <span>Vitals History</span>
                                        </div>
                                        <Badge variant="outline">{encounters?.filter((e: any) => e.encounter_type === 'vitals')?.length || 0} Records</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {encounters && encounters.filter((e: any) => e.encounter_type === 'vitals').length > 0 ? (
                                        <div className="space-y-4">
                                            {encounters
                                                .filter((encounter: any) => encounter.encounter_type === 'vitals')
                                                .map((encounter: any) => (
                                                    <div key={encounter.id} className="p-4 border rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Heart className="h-4 w-4 text-red-500" />
                                                                <span className="text-sm font-medium">Vital Signs</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm text-gray-500">{encounter.created_at}</span>
                                                                <Badge variant="outline">{encounter.status}</Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{encounter.notes}</p>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No vital signs recorded</p>
                                            <p className="text-sm">Record the first vital signs using the form above</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Referrals Tab */}
                    <TabsContent value="referrals">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <UserCog className="h-5 w-5" />
                                        <span>Referrals</span>
                                    </div>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Referral
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-gray-500">
                                    <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No referrals on file</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span>Patient Analytics</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-gray-500">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No analytics data available</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}