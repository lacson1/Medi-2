import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
    ArrowLeft,
    User,
    Calendar,
    Pill,
    TestTube,
    Activity,
    Stethoscope,
    AlertTriangle,
    Bell,
    AlertCircle,
    Info,
    Phone,
    Mail,
    MapPin,
    Settings,
    MessageCircle,
    FileText,
    Edit,
    Zap
} from 'lucide-react';

// API and Utils
import { mockApiClient } from '@/api/mockApiClient';
import { parseISO, differenceInYears } from 'date-fns';

// Types
interface ClinicalAlert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    severity: number;
    actionable: boolean;
}

interface QuickAction {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category: 'prescription' | 'lab-order' | 'appointment' | 'note' | 'communication';
    priority: 'high' | 'medium' | 'low';
    description: string;
}

interface VitalSign {
    type: string;
    value: string;
    unit: string;
    timestamp: string;
    status: 'normal' | 'elevated' | 'critical';
}

// Quick Actions Configuration
const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'new-prescription',
        label: 'New Prescription',
        icon: Pill,
        category: 'prescription',
        priority: 'high',
        description: 'Prescribe medication'
    },
    {
        id: 'lab-order',
        label: 'Lab Order',
        icon: TestTube,
        category: 'lab-order',
        priority: 'high',
        description: 'Order laboratory tests'
    },
    {
        id: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: Calendar,
        category: 'appointment',
        priority: 'medium',
        description: 'Book follow-up appointment'
    },
    {
        id: 'clinical-note',
        label: 'Clinical Note',
        icon: FileText,
        category: 'note',
        priority: 'high',
        description: 'Add clinical documentation'
    },
    {
        id: 'vital-signs',
        label: 'Vital Signs',
        icon: Activity,
        category: 'note',
        priority: 'medium',
        description: 'Record vital signs'
    },
    {
        id: 'patient-message',
        label: 'Message Patient',
        icon: MessageCircle,
        category: 'communication',
        priority: 'low',
        description: 'Send secure message'
    }
];

// Clinical Decision Support Rules (for future use)
// const CLINICAL_RULES = {
//   drugInteractions: [
//     {
//       medications: ['warfarin', 'aspirin'],
//       severity: 'critical',
//       message: 'High risk of bleeding - monitor INR closely'
//     }
//   ],
//   allergyWarnings: [
//     {
//       allergen: 'penicillin',
//       severity: 'critical',
//       message: 'Patient has penicillin allergy - avoid all beta-lactams'
//     }
//   ]
// };

export default function StreamlinedPatientWorkspace() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);
    const [recentVitals, setRecentVitals] = useState<VitalSign[]>([]);

    // Fetch patient data
    const { data: patient, isLoading, error } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => mockApiClient.entities.Patient.get(id || ''),
        enabled: !!id
    });

    // Fetch related data
    const { data: prescriptions } = useQuery({
        queryKey: ['patient-prescriptions', id],
        queryFn: () => mockApiClient.entities.Prescription.list(),
        enabled: !!id
    });

    // Generate clinical alerts based on patient data
    useEffect(() => {
        if (patient) {
            const alerts: ClinicalAlert[] = [];

            // Check for allergies
            if (patient.allergies?.includes('penicillin')) {
                alerts.push({
                    id: 'penicillin-allergy',
                    type: 'critical',
                    title: 'Penicillin Allergy',
                    description: 'Patient has documented penicillin allergy. Avoid all beta-lactam antibiotics.',
                    severity: 10,
                    actionable: true
                });
            }

            // Check for drug interactions
            const activeMedications = prescriptions?.filter(p => p.status === 'active') || [];
            if (activeMedications.some(m => m.medication_name?.toLowerCase().includes('warfarin'))) {
                alerts.push({
                    id: 'warfarin-monitoring',
                    type: 'warning',
                    title: 'Warfarin Monitoring Required',
                    description: 'Patient on warfarin - ensure INR monitoring is scheduled.',
                    severity: 7,
                    actionable: true
                });
            }

            setClinicalAlerts(alerts);
        }
    }, [patient, prescriptions]);

    // Generate mock vital signs
    useEffect(() => {
        const vitals: VitalSign[] = [
            {
                type: 'Blood Pressure',
                value: '120/80',
                unit: 'mmHg',
                timestamp: new Date().toISOString(),
                status: 'normal'
            },
            {
                type: 'Heart Rate',
                value: '72',
                unit: 'bpm',
                timestamp: new Date().toISOString(),
                status: 'normal'
            },
            {
                type: 'Temperature',
                value: '98.6',
                unit: '°F',
                timestamp: new Date().toISOString(),
                status: 'normal'
            }
        ];
        setRecentVitals(vitals);
    }, []);

    const handleQuickAction = (action: QuickAction): void => {
        switch (action.id) {
            case 'new-prescription':
                // Navigate to prescription form
                console.log('Opening prescription form');
                break;
            case 'lab-order':
                // Navigate to lab order form
                console.log('Opening lab order form');
                break;
            case 'schedule-appointment':
                // Navigate to appointment scheduler
                console.log('Opening appointment scheduler');
                break;
            case 'clinical-note':
                // Open clinical note editor
                console.log('Opening clinical note editor');
                break;
            case 'vital-signs':
                // Open vital signs form
                console.log('Opening vital signs form');
                break;
            case 'patient-message':
                // Open messaging interface
                console.log('Opening patient messaging');
                break;
        }
    };

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
            case 'critical': return 'destructive';
            case 'warning': return 'default';
            case 'info': return 'default';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
                <p className="text-muted-foreground mb-4">Unable to load patient information.</p>
                <Button onClick={() => { void navigate('/patients'); }}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Patients
                </Button>
            </div>
        );
    }

    const patientAge = patient.date_of_birth ?
        differenceInYears(new Date(), parseISO(patient.date_of_birth)) : 'Unknown';

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { void navigate('/patients'); }}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Patients
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {patient.first_name} {patient.last_name}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span>Age: {patientAge}</span>
                                    <span>•</span>
                                    <span>{patient.gender}</span>
                                    <span>•</span>
                                    <span>ID: {patient.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => { console.log('Edit patient'); }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Patient
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { console.log('Settings'); }}>
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Clinical Alerts */}
                        {clinicalAlerts.length > 0 && (
                            <Card className="border-l-4 border-l-red-500">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center text-lg">
                                        <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                                        Clinical Alerts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {clinicalAlerts.map((alert) => {
                                        const Icon = getAlertIcon(alert.type);
                                        return (
                                            <Alert key={alert.id} variant={getAlertColor(alert.type)}>
                                                <Icon className="h-4 w-4" />
                                                <AlertDescription>
                                                    <div className="font-semibold">{alert.title}</div>
                                                    <div className="text-sm">{alert.description}</div>
                                                </AlertDescription>
                                            </Alert>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="h-5 w-5 mr-2" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {QUICK_ACTIONS.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <Button
                                                key={action.id}
                                                variant="outline"
                                                className="h-auto p-4 flex flex-col items-center space-y-2"
                                                onClick={() => handleQuickAction(action)}
                                            >
                                                <Icon className="h-6 w-6" />
                                                <div className="text-center">
                                                    <div className="font-medium text-sm">{action.label}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {action.description}
                                                    </div>
                                                </div>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Tabs */}
                        <Card>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <CardHeader>
                                    <TabsList className="grid w-full grid-cols-5">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="clinical">Clinical</TabsTrigger>
                                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                                        <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent>
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Patient Info */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center">
                                                        <User className="h-5 w-5 mr-2" />
                                                        Patient Information
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="font-medium">Phone:</span>
                                                            <div className="flex items-center">
                                                                <Phone className="h-4 w-4 mr-1" />
                                                                {patient.phone || 'Not provided'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Email:</span>
                                                            <div className="flex items-center">
                                                                <Mail className="h-4 w-4 mr-1" />
                                                                {patient.email || 'Not provided'}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="font-medium">Address:</span>
                                                            <div className="flex items-center">
                                                                <MapPin className="h-4 w-4 mr-1" />
                                                                {patient.address || 'Not provided'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Blood Type:</span>
                                                            <Badge variant="outline">{patient.blood_type || 'Unknown'}</Badge>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Emergency Contact:</span>
                                                            <div>{patient.emergency_contact_name || 'Not provided'}</div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Recent Vitals */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center">
                                                        <Activity className="h-5 w-5 mr-2" />
                                                        Recent Vital Signs
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        {recentVitals.map((vital, index) => (
                                                            <div key={index} className="flex justify-between items-center">
                                                                <span className="font-medium">{vital.type}</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="font-mono">{vital.value} {vital.unit}</span>
                                                                    <Badge
                                                                        variant={vital.status === 'normal' ? 'default' : 'destructive'}
                                                                        className="text-xs"
                                                                    >
                                                                        {vital.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Allergies & Medical History */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center">
                                                        <AlertTriangle className="h-5 w-5 mr-2" />
                                                        Allergies
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {patient.allergies && patient.allergies.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {patient.allergies.map((allergy, index) => (
                                                                <Badge key={index} variant="destructive">
                                                                    {allergy}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground">No known allergies</p>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center">
                                                        <FileText className="h-5 w-5 mr-2" />
                                                        Medical History
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {patient.medical_history && patient.medical_history.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {patient.medical_history.map((condition, index) => (
                                                                <Badge key={index} variant="outline">
                                                                    {condition}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground">No medical history recorded</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="clinical">
                                        <div className="text-center py-8">
                                            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">Clinical Information</h3>
                                            <p className="text-muted-foreground">Clinical notes, assessments, and treatment plans will appear here.</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="appointments">
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">Appointments</h3>
                                            <p className="text-muted-foreground">Upcoming and past appointments will appear here.</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="prescriptions">
                                        <div className="text-center py-8">
                                            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">Prescriptions</h3>
                                            <p className="text-muted-foreground">Active and past prescriptions will appear here.</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="lab-results">
                                        <div className="text-center py-8">
                                            <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">Lab Results</h3>
                                            <p className="text-muted-foreground">Laboratory test results will appear here.</p>
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Patient Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Patient Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <Badge variant="default">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Last Visit</span>
                                    <span className="text-sm text-muted-foreground">Jan 15, 2024</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Next Appointment</span>
                                    <span className="text-sm text-muted-foreground">Feb 1, 2024</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Prescription Updated</div>
                                        <div className="text-xs text-muted-foreground">2 hours ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Lab Results Received</div>
                                        <div className="text-xs text-muted-foreground">1 day ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Appointment Scheduled</div>
                                        <div className="text-xs text-muted-foreground">3 days ago</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Active Prescriptions</span>
                                    <Badge variant="outline">3</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Pending Lab Orders</span>
                                    <Badge variant="outline">2</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Upcoming Appointments</span>
                                    <Badge variant="outline">1</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
