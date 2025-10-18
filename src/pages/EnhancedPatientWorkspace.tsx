import { useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { mockPatients, mockAppointments, mockPrescriptions, mockLabOrders } from '@/data/mockData.js';
import {
    ArrowLeft,
    Calendar,
    Edit,
    Pill,
    Beaker,
    Phone,
    Mail,
    AlertTriangle,
    Activity,
    History,
    Video,
    FileHeart,
    ArrowUpRightSquare,
    UserCog,
    FileText,
    DollarSign,
    Clock,
    User,
    MapPin,
    TrendingUp,
    Star,
    Share2,
    Zap,
    Stethoscope
} from 'lucide-react';
import { differenceInYears, parseISO, format } from 'date-fns';

// Import existing components
import PatientAppointments from '../components/patient-profile/PatientAppointments';
import PatientEncounters from '../components/patient-profile/PatientEncounters';
import PatientPrescriptions from '../components/patient-profile/PatientPrescriptions';
import PatientLabOrders from '../components/patient-profile/PatientLabOrders';
import PatientTelemedicine from '../components/patient-profile/PatientTelemedicine';
import PatientVaccinations from '../components/patient-profile/PatientVaccinations';
import PatientSpecialtyConsultations from '../components/patient-profile/PatientSpecialtyConsultations';
import PatientConsents from '../components/patient-profile/PatientConsents';
import PatientSurgeries from '../components/patient-profile/PatientSurgeries';
import PatientProcedures from '../components/patient-profile/PatientProcedures';
import PatientDischargeSummaries from '../components/patient-profile/PatientDischargeSummaries';
import ClinicalCalculators from '../components/patient-profile/ClinicalCalculators';
import PatientReferrals from '../components/patient-profile/PatientReferrals';
import PatientDocuments from '../components/patient-profile/PatientDocuments';
import PatientBilling from '../components/patient-profile/PatientBilling';
import PatientMedicalDocuments from '../components/patient-profile/PatientMedicalDocuments';
import PatientTimeline from '../components/patient-profile/PatientTimeline';
import ClinicalAlerts from '../components/patient-profile/ClinicalAlerts';

// Import forms
import PatientForm from '../components/patients/PatientForm';
import AppointmentForm from '../components/appointments/AppointmentForm';
import EncounterForm from '../components/encounters/EncounterForm';
import PrescriptionForm from '../components/prescriptions/PrescriptionForm';
import EnhancedPrescriptionForm from '../components/prescriptions/EnhancedPrescriptionForm';
import LabOrderForm from '../components/labs/LabOrderForm';
import TelemedicineForm from '../components/telemedicine/TelemedicineForm';
import VaccinationForm from '../components/vaccinations/VaccinationForm';
import SpecialtyConsultationForm from '../components/specialty-consultations/SpecialtyConsultationForm';
import ConsentForm from '../components/consents/ConsentForm';
import SurgeryForm from '../components/surgeries/SurgeryForm';
import ProcedureForm from '../components/procedures/ProcedureForm';
import DischargeSummaryForm from '../components/discharge/DischargeSummaryForm';
import ReferralForm from '../components/referrals/ReferralForm';
import DocumentForm from '../components/documents/DocumentForm';
import BillingForm from '../components/billing/BillingForm';
import MedicalDocumentForm from '../components/medical-documents/MedicalDocumentForm';

// Enhanced workspace configuration
const WORKSPACE_SECTIONS = {
    overview: {
        title: 'Overview',
        icon: User,
        description: 'Patient summary and key information',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        priority: 1
    },
    timeline: {
        title: 'Timeline',
        icon: History,
        description: 'Chronological view of all events',
        color: 'bg-green-50 text-green-700 border-green-200',
        priority: 2
    },
    clinical: {
        title: 'Clinical',
        icon: Stethoscope,
        description: 'Medical records and encounters',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        priority: 3
    },
    orders: {
        title: 'Orders',
        icon: Pill,
        description: 'Prescriptions and lab orders',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        priority: 4
    },
    procedures: {
        title: 'Procedures',
        icon: Activity,
        description: 'Procedures and treatments',
        color: 'bg-red-50 text-red-700 border-red-200',
        priority: 5
    },
    specialty: {
        title: 'Specialty',
        icon: UserCog,
        description: 'Specialist consultations',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        priority: 6
    },
    documents: {
        title: 'Documents',
        icon: FileText,
        description: 'Legal documents and forms',
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        priority: 7
    },
    billing: {
        title: 'Billing',
        icon: DollarSign,
        description: 'Financial information',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        priority: 8
    }
};

// Quick actions configuration
const QUICK_ACTIONS = [
    { id: 'appointment', label: 'New Appointment', icon: Calendar, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'prescription', label: 'Prescribe Medication', icon: Pill, color: 'bg-green-500 hover:bg-green-600' },
    { id: 'lab_order', label: 'Order Lab Test', icon: Beaker, color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'encounter', label: 'New Encounter', icon: FileHeart, color: 'bg-orange-500 hover:bg-orange-600' },
    { id: 'telemedicine', label: 'Telemedicine', icon: Video, color: 'bg-cyan-500 hover:bg-cyan-600' },
    { id: 'referral', label: 'Create Referral', icon: ArrowUpRightSquare, color: 'bg-pink-500 hover:bg-pink-600' }
];

export default function EnhancedPatientWorkspace() {
    const { id: routePatientId } = useParams<{ id?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const queryPatientId = searchParams.get('id');
    const patientId = routePatientId ?? queryPatientId ?? undefined;
    const hasPatientId = Boolean(patientId);
    const activeTab = searchParams.get('tab') || 'overview';
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [recentActions, setRecentActions] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Fetch patient data
    const { data: patient, isLoading: patientLoading, error: patientError } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            if (!patientId) return null;
            const found = mockPatients.find(p => p.id === patientId);
            if (!found) {
                console.warn(`Patient with ID ${patientId} not found in mock data`);
                return null;
            }
            return found;
        },
        enabled: hasPatientId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });

    // Fetch related data
    const { data: appointments = [] } = useQuery({
        queryKey: ['patient-appointments', patientId],
        queryFn: async () => {
            if (!patientId) return [];
            return mockAppointments.filter(appointment => appointment.patient_id === patientId);
        },
        enabled: hasPatientId
    });

    const { data: prescriptions = [] } = useQuery({
        queryKey: ['patient-prescriptions', patientId],
        queryFn: async () => {
            if (!patientId) return [];
            return mockPrescriptions.filter(prescription => prescription.patient_id === patientId);
        },
        enabled: hasPatientId
    });

    const { data: encounters = [] } = useQuery({
        queryKey: ['patient-encounters', patientId],
        queryFn: async () => {
            return [];
        },
        enabled: hasPatientId
    });

    const { data: labOrders = [] } = useQuery({
        queryKey: ['patient-lab-orders', patientId],
        queryFn: async () => {
            if (!patientId) return [];
            return mockLabOrders.filter(order => order.patient_id === patientId);
        },
        enabled: hasPatientId
    });

    // Calculate patient age
    const patientAge = (patient as any)?.date_of_birth
        ? differenceInYears(new Date(), parseISO((patient as any).date_of_birth))
        : null;

    // Handle tab change
    const handleTabChange = useCallback((tab: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('tab', tab);
            if (routePatientId) {
                next.delete('id');
            } else if (patientId) {
                next.set('id', patientId);
            }
            return next;
        });
    }, [patientId, routePatientId, setSearchParams]);

    // Handle quick action
    const handleQuickAction = useCallback((actionId: string) => {
        const action = QUICK_ACTIONS.find(a => a.id === actionId);
        if (action) {
            setRecentActions((prev: any[]) => [
                { ...action, timestamp: new Date(), patientId },
                ...prev.slice(0, 4)
            ]);
            // Navigate to appropriate form or action
            // This would be implemented based on the specific action
        }
    }, []);

    // Toggle favorite
    const toggleFavorite = useCallback((sectionId: string) => {
        setFavorites((prev: any[]) =>
            prev.includes(sectionId)
                ? prev.filter((id: string) => id !== sectionId)
                : [...prev, sectionId]
        );
    }, []);

    if (!hasPatientId) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select a Patient</h3>
                        <p className="text-gray-600 mb-4">
                            Choose a patient from the directory to open their workspace.
                        </p>
                        <Button onClick={() => navigate(createPageUrl('Patients'))}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Patients
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (patientLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="space-y-4 w-full max-w-md">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!patientLoading && hasPatientId && (patientError || !patient)) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
                        <p className="text-gray-600 mb-4">The requested patient could not be found.</p>
                        <Button onClick={() => navigate(createPageUrl('Patients'))}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Patients
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50">
            {/* Enhanced Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/Patients')}
                            className="flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Patients
                        </Button>

                        <Separator className="h-6" />

                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {(patient as any).first_name} {(patient as any).last_name}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>{patientAge ? `${patientAge} years old` : 'Age unknown'}</span>
                                    <span>•</span>
                                    <span>{(patient as any).gender || 'Gender not specified'}</span>
                                    <span>•</span>
                                    <Badge variant={(patient as any).status === 'active' ? 'default' : 'secondary'}>
                                        {(patient as any).status || 'Unknown'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Quick Actions Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQuickActions(!showQuickActions)}
                            className="flex items-center"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Quick Actions
                        </Button>

                        {/* Patient Actions */}
                        <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Patient
                        </Button>

                        <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <AnimatePresence>
                    {showQuickActions && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {QUICK_ACTIONS.map((action: any) => (
                                    <Button
                                        key={action.id}
                                        onClick={() => handleQuickAction(action.id)}
                                        className={`${action.color} text-white flex flex-col items-center p-4 h-20`}
                                    >
                                        <action.icon className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-medium">{action.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex h-[calc(100vh-120px)]">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    {/* Left Sidebar - Patient Info & Navigation */}
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                        <div className="h-full bg-white border-r border-gray-200 flex flex-col">
                            {/* Patient Summary Card */}
                            <div className="p-4 border-b border-gray-200">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900">Patient Summary</h3>
                                                <Button variant="ghost" size="sm">
                                                    <Star className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <span>{(patient as any).phone || 'No phone'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span>{(patient as any).email || 'No email'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                    <span className="truncate">{(patient as any).address || 'No address'}</span>
                                                </div>
                                            </div>

                                            {/* Key Metrics */}
                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-blue-600">
                                                        {(appointments as any)?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Appointments</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-green-600">
                                                        {(prescriptions as any)?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Prescriptions</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Navigation */}
                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-2">
                                    <h4 className="font-medium text-gray-900 mb-3">Workspace Sections</h4>
                                    {Object.entries(WORKSPACE_SECTIONS)
                                        .sort(([, a], [, b]) => a.priority - b.priority)
                                        .map(([sectionId, section]) => (
                                            <Button
                                                key={sectionId}
                                                variant={activeTab === sectionId ? 'default' : 'ghost'}
                                                className={`w-full justify-start ${activeTab === sectionId ? '' : 'hover:bg-gray-50'}`}
                                                onClick={() => handleTabChange(sectionId)}
                                            >
                                                <section.icon className="w-4 h-4 mr-3" />
                                                <span className="flex-1 text-left">{section.title}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(sectionId);
                                                    }}
                                                    className="p-1 h-auto"
                                                >
                                                    <Star className={`w-3 h-3 ${favorites.includes(sectionId) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                                                </Button>
                                            </Button>
                                        ))}
                                </div>
                            </ScrollArea>

                            {/* Recent Actions */}
                            {recentActions.length > 0 && (
                                <div className="p-4 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-3">Recent Actions</h4>
                                    <div className="space-y-2">
                                        {recentActions.slice(0, 3).map((action: any, index: number) => (
                                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                                <action.icon className="w-3 h-3" />
                                                <span className="truncate">{action.label}</span>
                                                <Clock className="w-3 h-3 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Main Content Area */}
                    <ResizablePanel defaultSize={75}>
                        <div className="h-full bg-gray-50">
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
                                <div className="bg-white border-b border-gray-200 px-6 py-3">
                                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                                        {Object.entries(WORKSPACE_SECTIONS).map(([sectionId, section]) => (
                                            <TabsTrigger
                                                key={sectionId}
                                                value={sectionId}
                                                className="flex items-center space-x-2"
                                            >
                                                <section.icon className="w-4 h-4" />
                                                <span className="hidden sm:inline">{section.title}</span>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <TabsContent value="overview" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                                {/* Patient Overview */}
                                                <div className="lg:col-span-2 space-y-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center space-x-2">
                                                                <User className="w-5 h-5" />
                                                                <span>Patient Information</span>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                                                    <p className="text-sm">{(patient as any).date_of_birth ? format(parseISO((patient as any).date_of_birth), 'MMM dd, yyyy') : 'Not provided'}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500">Blood Type</label>
                                                                    <p className="text-sm">{(patient as any).blood_type || 'Not provided'}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500">Insurance Provider</label>
                                                                    <p className="text-sm">{(patient as any).insurance_provider || 'Not provided'}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500">Insurance ID</label>
                                                                    <p className="text-sm">{(patient as any).insurance_id || 'Not provided'}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Clinical Alerts */}
                                                    <ClinicalAlerts patientId={patientId} />
                                                </div>

                                                {/* Quick Stats */}
                                                <div className="space-y-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center space-x-2">
                                                                <TrendingUp className="w-5 h-5" />
                                                                <span>Quick Stats</span>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600">Total Visits</span>
                                                                    <Badge variant="outline">{(encounters as any)?.length || 0}</Badge>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600">Active Prescriptions</span>
                                                                    <Badge variant="outline">{(prescriptions as any)?.filter((p: any) => p.status === 'active').length || 0}</Badge>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600">Upcoming Appointments</span>
                                                                    <Badge variant="outline">{(appointments as any)?.filter((a: any) => new Date(a.appointment_date) > new Date()).length || 0}</Badge>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Allergies & Conditions */}
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center space-x-2">
                                                                <AlertTriangle className="w-5 h-5" />
                                                                <span>Allergies & Conditions</span>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500">Allergies</label>
                                                                    <div className="mt-1">
                                                                        {(patient as any).allergies && (patient as any).allergies.length > 0 ? (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {(patient as any).allergies.map((allergy: any, index: number) => (
                                                                                    <Badge key={index} variant="destructive" className="text-xs">
                                                                                        {allergy}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-gray-500">No known allergies</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500">Medical Conditions</label>
                                                                    <div className="mt-1">
                                                                        {(patient as any).medical_conditions && (patient as any).medical_conditions.length > 0 ? (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {(patient as any).medical_conditions.map((condition: any, index: number) => (
                                                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                                                        {condition}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-gray-500">No known conditions</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="timeline" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <PatientTimeline patientId={patientId} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="clinical" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <div className="space-y-6">
                                                <PatientEncounters patientId={patientId} />
                                                <PatientAppointments
                                                    appointments={appointments || []}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                    onStatusChange={() => { }}
                                                />
                                                <PatientTelemedicine
                                                    sessions={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                    onJoin={() => { }}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="orders" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <div className="space-y-6">
                                                <PatientPrescriptions
                                                    prescriptions={prescriptions || []}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                    patient={patient}
                                                    onAction={() => { }}
                                                />
                                                <PatientLabOrders
                                                    labOrders={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                    onAddNew={() => { }}
                                                    patient={patient}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="procedures" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <div className="space-y-6">
                                                <PatientProcedures
                                                    procedures={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                />
                                                <PatientSurgeries
                                                    surgeries={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                />
                                                <PatientVaccinations
                                                    vaccinations={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="specialty" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <div className="space-y-6">
                                                <PatientSpecialtyConsultations
                                                    consultations={[]}
                                                    templates={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                />
                                                <PatientReferrals
                                                    referrals={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="documents" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <div className="space-y-6">
                                                <PatientDocuments
                                                    documents={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                />
                                                <PatientMedicalDocuments
                                                    documents={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                    patient={patient}
                                                />
                                                <PatientConsents
                                                    consents={[]}
                                                    isLoading={false}
                                                    onEdit={() => { }}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="billing" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <PatientBilling
                                                billings={[]}
                                                isLoading={false}
                                                onEdit={() => { }}
                                            />
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
