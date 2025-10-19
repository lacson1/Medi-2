import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { differenceInYears, parseISO, format } from 'date-fns';

// Import new components
import {
    useResponsiveDesign,
    MobileButton,
    MobileNavigation
} from '@/components/mobile/MobileOptimizedComponents';
import { EnhancedMobileTabs, type EnhancedMobileTab } from '@/components/ui/enhanced-mobile-tabs';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

// Icons
import {
    ArrowLeft,
    User,
    Calendar,
    Pill,
    TestTube,
    Heart,
    Activity,
    Stethoscope,
    AlertTriangle,
    Bell,
    Target,
    Users,
    AlertCircle,
    Info,
    Phone,
    Mail,
    MapPin,
    BarChart3,
    Settings,
    MessageCircle,
    FileText,
    ArrowUpRightSquare,
    Thermometer,
    Scale,
    Ruler,
    FileHeart,
    Video
} from 'lucide-react';

// Mock data and API
import { mockApiClient } from '@/api/mockApiClient';

// Types
interface ClinicalAlert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    category: 'drug-interaction' | 'allergy' | 'lab-value' | 'medication-adherence' | 'appointment';
    title: string;
    description: string;
    severity: number;
    timestamp: string;
    actionable: boolean;
    actionRequired?: string;
}

interface VitalSign {
    id: string;
    type: 'blood-pressure' | 'heart-rate' | 'temperature' | 'weight' | 'height' | 'oxygen-saturation';
    value: string;
    unit: string;
    timestamp: string;
    normalRange: { min: number; max: number };
    status: 'normal' | 'elevated' | 'critical';
}

interface QuickAction {
    id: string;
    label: string;
    icon: any;
    category: 'prescription' | 'lab-order' | 'appointment' | 'communication' | 'documentation';
    priority: 'high' | 'medium' | 'low';
    description: string;
    shortcut?: string;
}

// Clinical Decision Support System
const CLINICAL_DECISION_RULES = {
    drugInteractions: [
        {
            medications: ['warfarin', 'aspirin'],
            severity: 'critical',
            message: 'High risk of bleeding - monitor INR closely'
        }
    ],
    allergyWarnings: [
        {
            allergen: 'penicillin',
            severity: 'critical',
            message: 'Patient has documented penicillin allergy'
        }
    ],
    labAlerts: [
        {
            test: 'creatinine',
            threshold: 2.0,
            severity: 'warning',
            message: 'Elevated creatinine - consider dose adjustment'
        }
    ]
};


// Quick Actions Configuration
const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'prescribe',
        label: 'Prescribe',
        icon: Pill,
        category: 'prescription',
        priority: 'high',
        description: 'Create new prescription',
        shortcut: 'Ctrl+P'
    },
    {
        id: 'lab-order',
        label: 'Order Labs',
        icon: TestTube,
        category: 'lab-order',
        priority: 'high',
        description: 'Request laboratory tests',
        shortcut: 'Ctrl+L'
    },
    {
        id: 'appointment',
        label: 'Schedule',
        icon: Calendar,
        category: 'appointment',
        priority: 'medium',
        description: 'Book appointment',
        shortcut: 'Ctrl+A'
    },
    {
        id: 'message',
        label: 'Message',
        icon: MessageCircle,
        category: 'communication',
        priority: 'medium',
        description: 'Send secure message',
        shortcut: 'Ctrl+M'
    },
    {
        id: 'note',
        label: 'Clinical Note',
        icon: FileText,
        category: 'documentation',
        priority: 'high',
        description: 'Add clinical note',
        shortcut: 'Ctrl+N'
    },
    {
        id: 'referral',
        label: 'Referral',
        icon: ArrowUpRightSquare,
        category: 'communication',
        priority: 'low',
        description: 'Create referral',
        shortcut: 'Ctrl+R'
    }
];

// Alert System Component
const ClinicalAlertSystem: React.FC<{ alerts: ClinicalAlert[] }> = ({ alerts }) => {
    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical': return AlertTriangle;
            case 'warning': return AlertCircle;
            case 'info': return Info;
            default: return Bell;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'critical': return 'border-red-500 bg-red-50 text-red-900';
            case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-900';
            case 'info': return 'border-blue-500 bg-blue-50 text-blue-900';
            default: return 'border-gray-500 bg-gray-50 text-gray-900';
        }
    };

    return (
        <div className="space-y-2">
            {alerts.map((alert) => {
                const IconComponent = getAlertIcon(alert.type);
                return (
                    <Alert key={alert.id} className={getAlertColor(alert.type)}>
                        <IconComponent className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{alert.title}</p>
                                    <p className="text-sm opacity-90">{alert.description}</p>
                                </div>
                                {alert.actionable && (
                                    <Button size="sm" variant="outline">
                                        {alert.actionRequired || 'Action Required'}
                                    </Button>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                );
            })}
        </div>
    );
};


// Vital Signs Component
const VitalSignsPanel: React.FC<{ vitals: VitalSign[] }> = ({ vitals }) => {
    const getVitalIcon = (type: string) => {
        switch (type) {
            case 'blood-pressure': return Activity;
            case 'heart-rate': return Heart;
            case 'temperature': return Thermometer;
            case 'weight': return Scale;
            case 'height': return Ruler;
            case 'oxygen-saturation': return Target;
            default: return Activity;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'normal': return 'text-green-600';
            case 'elevated': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Vital Signs</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {vitals.map((vital) => {
                        const IconComponent = getVitalIcon(vital.type);
                        return (
                            <div key={vital.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <IconComponent className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium capitalize">
                                        {vital.type.replace('-', ' ')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className={`font-semibold ${getStatusColor(vital.status)}`}>
                                        {vital.value} {vital.unit}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {format(parseISO(vital.timestamp), 'MMM dd, HH:mm')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// Main Unified Patient Workspace Component
export default function UnifiedPatientWorkspace() {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Responsive design hook
    const { screenSize } = useResponsiveDesign();

    // State management
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'clinical');
    const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);
    const [recentVitals, setRecentVitals] = useState<VitalSign[]>([]);

    // Fetch patient data
    const { data: patient, isLoading: patientLoading, error: patientError } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => mockApiClient.entities.Patient.get(id || ''),
        enabled: !!id
    });

    // Fetch related data
    const { data: appointments } = useQuery({
        queryKey: ['patient-appointments', id],
        queryFn: () => mockApiClient.entities.Appointment.list(),
        enabled: !!id
    });

    const { data: prescriptions } = useQuery({
        queryKey: ['patient-prescriptions', id],
        queryFn: () => mockApiClient.entities.Prescription.list(),
        enabled: !!id
    });

    const { data: labOrders } = useQuery({
        queryKey: ['patient-lab-orders', id],
        queryFn: () => mockApiClient.entities.LabOrder.list(),
        enabled: !!id
    });

    // Clinical Decision Support
    useEffect(() => {
        if (patient && prescriptions) {
            const alerts: ClinicalAlert[] = [];

            // Check for drug interactions
            const currentMeds = prescriptions.map(p => p.medication_name.toLowerCase());
            CLINICAL_DECISION_RULES.drugInteractions.forEach(rule => {
                if (rule.medications.every(med => currentMeds.includes(med.toLowerCase()))) {
                    alerts.push({
                        id: `drug-interaction-${Date.now()}`,
                        type: 'critical',
                        category: 'drug-interaction',
                        title: 'Drug Interaction Alert',
                        description: rule.message,
                        severity: 10,
                        timestamp: new Date().toISOString(),
                        actionable: true,
                        actionRequired: 'Review medications'
                    });
                }
            });

            // Check for allergies
            CLINICAL_DECISION_RULES.allergyWarnings.forEach(rule => {
                if (patient.allergies?.includes(rule.allergen)) {
                    alerts.push({
                        id: `allergy-${Date.now()}`,
                        type: 'critical',
                        category: 'allergy',
                        title: 'Allergy Alert',
                        description: rule.message,
                        severity: 10,
                        timestamp: new Date().toISOString(),
                        actionable: true,
                        actionRequired: 'Avoid allergen'
                    });
                }
            });

            setClinicalAlerts(alerts);
        }
    }, [patient, prescriptions]);

    // Mock vital signs data
    useEffect(() => {
        setRecentVitals([
            {
                id: 'bp-1',
                type: 'blood-pressure',
                value: '120/80',
                unit: 'mmHg',
                timestamp: new Date().toISOString(),
                normalRange: { min: 90, max: 140 },
                status: 'normal'
            },
            {
                id: 'hr-1',
                type: 'heart-rate',
                value: '72',
                unit: 'bpm',
                timestamp: new Date().toISOString(),
                normalRange: { min: 60, max: 100 },
                status: 'normal'
            },
            {
                id: 'temp-1',
                type: 'temperature',
                value: '98.6',
                unit: '°F',
                timestamp: new Date().toISOString(),
                normalRange: { min: 97, max: 99 },
                status: 'normal'
            },
            {
                id: 'weight-1',
                type: 'weight',
                value: '165',
                unit: 'lbs',
                timestamp: new Date().toISOString(),
                normalRange: { min: 120, max: 200 },
                status: 'normal'
            }
        ]);
    }, []);

    // Handle tab change
    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    }, [setSearchParams]);

    // Loading state
    if (patientLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        );
    }

    // Error state
    if (patientError || !patient) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-96">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
                            <p className="text-gray-600 mb-4">The requested patient could not be found.</p>
                            <Button onClick={() => void navigate('/patients')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Patients
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Mobile navigation items
    const mobileNavItems: any[] = [
        {
            id: 'clinical',
            label: 'Clinical',
            icon: Stethoscope,
            active: activeTab === 'clinical',
            onClick: () => handleTabChange('clinical')
        },
        {
            id: 'visualization',
            label: 'Charts',
            icon: BarChart3,
            active: activeTab === 'visualization',
            onClick: () => handleTabChange('visualization')
        },
        {
            id: 'actions',
            label: 'Actions',
            icon: Activity,
            active: activeTab === 'actions',
            onClick: () => handleTabChange('actions')
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            active: activeTab === 'settings',
            onClick: () => handleTabChange('settings')
        }
    ];

    // Main tabs configuration - Ordered by clinical workflow
    const mainTabs: EnhancedMobileTab[] = [
        // 1. Overview - Patient summary and key information
        {
            id: 'overview',
            label: 'Overview',
            icon: User,
            colorScheme: 'MEDICAL',
            priority: 'high',
            tooltip: 'Patient overview and summary information',
            content: (
                <div className="space-y-6">
                    {/* Patient Summary Card */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <span>Patient Summary</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm text-gray-600">Demographics</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Age:</span> {patient?.date_of_birth ? `${differenceInYears(new Date(), parseISO(patient.date_of_birth))} years` : 'Unknown'}</p>
                                        <p><span className="font-medium">Gender:</span> {patient?.gender || 'Not specified'}</p>
                                        <p><span className="font-medium">Status:</span>
                                            <Badge variant={patient?.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                                                {patient?.status || 'Unknown'}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm text-gray-600">Contact Information</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <span>{patient?.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span>{patient?.email || 'Not provided'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span>{patient?.address || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm text-gray-600">Medical Information</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Blood Type:</span> {patient?.blood_type || 'Not specified'}</p>
                                        <p><span className="font-medium">Allergies:</span> {patient?.allergies?.length || 0} recorded</p>
                                        <p><span className="font-medium">MRN:</span> {patient?.id || 'Not assigned'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm text-gray-600">Emergency Contact</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Name:</span> {patient?.emergency_contact_name || 'Not provided'}</p>
                                        <p><span className="font-medium">Phone:</span> {patient?.phone || 'Not provided'}</p>
                                        <p><span className="font-medium">Relationship:</span> {patient?.emergency_contact_relationship || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Appointments</p>
                                        <p className="text-2xl font-bold text-gray-900">{appointments?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Pill className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                                        <p className="text-2xl font-bold text-gray-900">{prescriptions?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <TestTube className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Lab Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{labOrders?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Documents</p>
                                        <p className="text-2xl font-bold text-gray-900">0</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="w-5 h-5" />
                                <span>Recent Activity</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {appointments && appointments.length > 0 ? (
                                    appointments.slice(0, 3).map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">{appointment.type}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {format(parseISO(appointment.appointment_date), 'MMM dd, yyyy')} at {appointment.appointment_time}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{appointment.status}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clinical Alerts Summary */}
                    {clinicalAlerts.length > 0 && (
                        <Card className="border-l-4 border-l-red-500">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <span>Clinical Alerts</span>
                                    <Badge variant="destructive">{clinicalAlerts.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {clinicalAlerts.slice(0, 3).map((alert) => (
                                        <div key={alert.id} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                            <span className="text-sm">{alert.description}</span>
                                            <Badge variant="destructive" className="text-xs">{alert.severity}</Badge>
                                        </div>
                                    ))}
                                    {clinicalAlerts.length > 3 && (
                                        <p className="text-sm text-gray-600 text-center">+{clinicalAlerts.length - 3} more alerts</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )
        },
        // 2. Clinical - Clinical data, vitals, medications
        {
            id: 'clinical',
            label: 'Clinical',
            icon: Stethoscope,
            colorScheme: 'MEDICAL',
            priority: 'high',
            tooltip: 'Clinical data, vital signs, and medications',
            content: (
                <div className="space-y-6">
                    {/* Clinical Alerts */}
                    {clinicalAlerts.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <span>Clinical Alerts</span>
                                    <Badge variant="destructive">{clinicalAlerts.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ClinicalAlertSystem alerts={clinicalAlerts} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Vital Signs */}
                    <VitalSignsPanel vitals={recentVitals} />

                    {/* Current Medications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Pill className="w-5 h-5" />
                                <span>Current Medications</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {prescriptions && prescriptions.length > 0 ? (
                                <div className="space-y-3">
                                    {prescriptions.slice(0, 5).map((prescription) => (
                                        <div key={prescription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{prescription.medication_name}</p>
                                                <p className="text-sm text-gray-600">{prescription.dosage}</p>
                                            </div>
                                            <Badge variant="outline">
                                                {prescription.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No current medications</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Appointments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>Recent Appointments</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {appointments && appointments.length > 0 ? (
                                <div className="space-y-3">
                                    {appointments.slice(0, 3).map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{appointment.type}</p>
                                                <p className="text-sm text-gray-600">
                                                    {format(parseISO(appointment.appointment_date), 'MMM dd, yyyy')} at {appointment.appointment_time}
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No recent appointments</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )
        },
        {
            id: 'visualization',
            label: 'Analytics',
            icon: BarChart3,
            colorScheme: 'ANALYTICS',
            priority: 'medium',
            tooltip: 'Data visualization and analytics reports',
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5" />
                                <span>Patient Analytics</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 text-center py-8">Data visualization coming soon</p>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        // Quick Action Tabs
        {
            id: 'prescribe',
            label: 'Rx',
            icon: Pill,
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Pill className="w-5 h-5" />
                                <span>New Prescription</span>
                            </CardTitle>
                            <CardDescription>Create a new prescription for this patient</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Medication</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter medication name"
                                            aria-label="Medication name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Dosage</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., 10mg twice daily"
                                            aria-label="Dosage"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Instructions</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Special instructions for the patient"
                                            aria-label="Instructions"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Duration</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., 30 days"
                                            aria-label="Duration"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Create Prescription</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        {
            id: 'lab-order',
            label: 'Labs',
            icon: TestTube,
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TestTube className="w-5 h-5" />
                                <span>New Lab Order</span>
                            </CardTitle>
                            <CardDescription>Request laboratory tests for this patient</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Test Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter test name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Priority</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Priority">
                                            <option value="routine">Routine</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="stat">STAT</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Clinical Indication</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Reason for ordering this test"
                                        aria-label="Clinical indication"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Order Lab Test</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        {
            id: 'appointment',
            label: 'Book',
            icon: Calendar,
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>New Appointment</span>
                            </CardTitle>
                            <CardDescription>Schedule a new appointment for this patient</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Appointment Type</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Appointment type">
                                            <option value="consultation">Consultation</option>
                                            <option value="follow-up">Follow-up</option>
                                            <option value="procedure">Procedure</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Provider</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="dr-smith">Dr. Smith</option>
                                            <option value="dr-jones">Dr. Jones</option>
                                            <option value="nurse-johnson">Nurse Johnson</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            aria-label="Date"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            aria-label="Time"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Brief description of the reason for the appointment"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Schedule Appointment</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        {
            id: 'message',
            label: 'Msg',
            icon: MessageCircle,
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MessageCircle className="w-5 h-5" />
                                <span>Send Secure Message</span>
                            </CardTitle>
                            <CardDescription>Send a secure message to this patient</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Message subject"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Message</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={6}
                                        placeholder="Type your message here..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Send Message</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        {
            id: 'note',
            label: 'Note',
            icon: FileText,
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="w-5 h-5" />
                                <span>New Clinical Note</span>
                            </CardTitle>
                            <CardDescription>Add a new clinical note for this patient</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Note Type</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="progress">Progress Note</option>
                                            <option value="consultation">Consultation Note</option>
                                            <option value="discharge">Discharge Summary</option>
                                            <option value="procedure">Procedure Note</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            aria-label="Date"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Chief Complaint</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Primary reason for visit"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Clinical Note</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={8}
                                        placeholder="Document your clinical findings, assessment, and plan..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Save Note</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        {
            id: 'referral',
            label: 'Referral',
            icon: ArrowUpRightSquare,
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <ArrowUpRightSquare className="w-5 h-5" />
                                <span>Create Referral</span>
                            </CardTitle>
                            <CardDescription>Refer this patient to a specialist</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Specialty</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="cardiology">Cardiology</option>
                                            <option value="dermatology">Dermatology</option>
                                            <option value="endocrinology">Endocrinology</option>
                                            <option value="gastroenterology">Gastroenterology</option>
                                            <option value="neurology">Neurology</option>
                                            <option value="orthopedics">Orthopedics</option>
                                            <option value="psychiatry">Psychiatry</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Urgency</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="routine">Routine</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Reason for Referral</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                        placeholder="Describe the reason for referral and any relevant clinical information"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Create Referral</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        {
            id: 'encounter',
            label: 'New Encounter',
            icon: FileHeart,
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileHeart className="w-5 h-5" />
                                <span>New Clinical Encounter</span>
                            </CardTitle>
                            <CardDescription>Document a new clinical encounter</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Encounter Type</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="office-visit">Office Visit</option>
                                            <option value="telemedicine">Telemedicine</option>
                                            <option value="emergency">Emergency</option>
                                            <option value="procedure">Procedure</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Provider</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="dr-smith">Dr. Smith</option>
                                            <option value="dr-jones">Dr. Jones</option>
                                            <option value="nurse-johnson">Nurse Johnson</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Chief Complaint</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Primary reason for encounter"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">History of Present Illness</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                        placeholder="Detailed description of the current problem"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Create Encounter</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        {
            id: 'telemedicine',
            label: 'Telemedicine',
            icon: Video,
            content: (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Video className="w-5 h-5" />
                                <span>Start Telemedicine Session</span>
                            </CardTitle>
                            <CardDescription>Begin a virtual consultation with this patient</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Session Type</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="consultation">Consultation</option>
                                            <option value="follow-up">Follow-up</option>
                                            <option value="urgent-care">Urgent Care</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Duration</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">60 minutes</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Brief description of the reason for the telemedicine visit"
                                    />
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Pre-session Checklist</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>✓ Patient has stable internet connection</li>
                                        <li>✓ Camera and microphone are working</li>
                                        <li>✓ Patient is in a private location</li>
                                        <li>✓ Emergency contact information is available</li>
                                    </ul>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Start Session</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        }
    ];

    return (
        <div className="h-screen bg-gray-50 flex flex-col" id="patient-workspace">
            {/* Enhanced Patient Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 px-6 py-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                        <MobileButton
                            variant="ghost"
                            size="sm"
                            onClick={() => void navigate('/patients')}
                            className="flex items-center space-x-2 mt-1 hover:bg-white/50 rounded-xl transition-all duration-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Patients</span>
                        </MobileButton>
                        <div className="w-px h-8 bg-gray-300" />

                        {/* Patient Bio Data */}
                        {patient && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            {patient.first_name} {patient.last_name}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                <span className="text-gray-700 font-medium">
                                                    {patient.date_of_birth ? `${differenceInYears(new Date(), parseISO(patient.date_of_birth))} years old` : 'Age unknown'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-green-600" />
                                                <span className="text-gray-700 font-medium capitalize">
                                                    {patient.gender || 'Gender not specified'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FileText className="w-4 h-4 text-purple-600" />
                                                <span className="text-gray-700 font-medium">
                                                    MRN: {patient.id || 'Not assigned'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-3">
                                        <Badge
                                            variant={patient.status === 'active' ? 'default' : 'secondary'}
                                            className={`px-4 py-2 text-sm font-medium rounded-xl ${patient.status === 'active'
                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                : 'bg-gray-100 text-gray-800 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${patient.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                {patient.status || 'Unknown Status'}
                                            </div>
                                        </Badge>
                                        <Badge variant="outline" className="text-blue-600 border-blue-600 px-3 py-1 text-sm rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                Live Data
                                            </div>
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-3 mt-1">
                        <MobileButton
                            variant="outline"
                            size="sm"
                            onClick={() => void handleTabChange('prescribe')}
                            className="hover:bg-white/50 rounded-xl transition-all duration-200"
                        >
                            <Pill className="w-4 h-4 mr-2" />
                            Prescribe
                        </MobileButton>
                        <MobileButton
                            variant="outline"
                            size="sm"
                            onClick={() => void handleTabChange('lab-order')}
                            className="hover:bg-white/50 rounded-xl transition-all duration-200"
                        >
                            <TestTube className="w-4 h-4 mr-2" />
                            Lab Order
                        </MobileButton>
                        <MobileButton
                            variant="outline"
                            size="sm"
                            onClick={() => void handleTabChange('appointment')}
                            className="hover:bg-white/50 rounded-xl transition-all duration-200"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                        </MobileButton>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {screenSize === 'mobile' ? (
                    // Mobile Layout
                    <div className="h-full flex flex-col">
                        <EnhancedMobileTabs
                            tabs={mainTabs}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            swipeable={true}
                            compact={screenSize === 'mobile'}
                            showBadges={true}
                            showPriority={true}
                            animation={true}
                            lazyLoading={true}
                        />
                        <MobileNavigation
                            items={mobileNavItems}
                            orientation="horizontal"
                        />
                    </div>
                ) : (
                    // Desktop/Tablet Layout
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        {/* Primary Panel */}
                        <ResizablePanel defaultSize={70} minSize={50}>
                            <div className="h-full p-6">
                                <div className="h-full overflow-auto">
                                    <EnhancedMobileTabs
                                        tabs={mainTabs}
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                        swipeable={false}
                                        compact={false}
                                        showBadges={true}
                                        showPriority={true}
                                        animation={true}
                                        lazyLoading={true}
                                    />
                                </div>
                            </div>
                        </ResizablePanel>

                        <div className="w-px bg-gray-200" />

                        {/* Secondary Panel - Context Information */}
                        <ResizablePanel defaultSize={30} minSize={20}>
                            <div className="h-full p-6 bg-white border-l border-gray-200">
                                <div className="h-full overflow-auto">
                                    <div className="space-y-6">
                                        {/* Active Lab Orders */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2">
                                                    <TestTube className="w-5 h-5" />
                                                    <span>Active Lab Orders</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {labOrders && labOrders.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {labOrders.slice(0, 3).map((order) => (
                                                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div>
                                                                    <p className="font-medium">{order.test_name}</p>
                                                                    <p className="text-sm text-gray-600">{order.priority}</p>
                                                                </div>
                                                                <Badge variant="outline">
                                                                    {order.status}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 text-center py-4">No active lab orders</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Care Team */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2">
                                                    <Users className="w-5 h-5" />
                                                    <span>Care Team</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Dr. Smith</p>
                                                            <p className="text-sm text-gray-600">Primary Care</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Nurse Johnson</p>
                                                            <p className="text-sm text-gray-600">Care Coordinator</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </div>
        </div>
    );
}
