import React, { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import IconSystem from '@/components/icons/IconSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInYears, parseISO, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Enhanced workspace configuration with icons
const WORKSPACE_SECTIONS = {
    overview: {
        title: 'Overview',
        icon: 'user',
        category: 'patient',
        description: 'Patient summary and key information',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        priority: 1
    },
    timeline: {
        title: 'Timeline',
        icon: 'clock',
        category: 'medical',
        description: 'Chronological view of all events',
        color: 'bg-green-50 text-green-700 border-green-200',
        priority: 2
    },
    clinical: {
        title: 'Clinical',
        icon: 'stethoscope',
        category: 'medical',
        description: 'Medical records and encounters',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        priority: 3
    },
    orders: {
        title: 'Orders',
        icon: 'prescriptions',
        category: 'navigation',
        description: 'Prescriptions and lab orders',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        priority: 4
    },
    procedures: {
        title: 'Procedures',
        icon: 'procedures',
        category: 'navigation',
        description: 'Procedures and treatments',
        color: 'bg-red-50 text-red-700 border-red-200',
        priority: 5
    },
    specialty: {
        title: 'Specialty',
        icon: 'userCog',
        category: 'medical',
        description: 'Specialist consultations',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        priority: 6
    },
    documents: {
        title: 'Documents',
        icon: 'reports',
        category: 'navigation',
        description: 'Legal documents and forms',
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        priority: 7
    },
    billing: {
        title: 'Billing',
        icon: 'billing',
        category: 'navigation',
        description: 'Financial information',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        priority: 8
    }
};

// Quick actions with enhanced icons
const QUICK_ACTIONS = [
    {
        id: 'appointment',
        label: 'New Appointment',
        icon: 'calendarPlus',
        category: 'medical',
        color: 'bg-blue-500 hover:bg-blue-600',
        description: 'Schedule a new appointment'
    },
    {
        id: 'prescription',
        label: 'Prescribe Medication',
        icon: 'prescriptions',
        category: 'navigation',
        color: 'bg-green-500 hover:bg-green-600',
        description: 'Create new prescription'
    },
    {
        id: 'lab_order',
        label: 'Order Lab Test',
        icon: 'labOrders',
        category: 'navigation',
        color: 'bg-purple-500 hover:bg-purple-600',
        description: 'Request laboratory test'
    },
    {
        id: 'encounter',
        label: 'New Encounter',
        icon: 'fileHeart',
        category: 'medical',
        color: 'bg-orange-500 hover:bg-orange-600',
        description: 'Document clinical encounter'
    },
    {
        id: 'telemedicine',
        label: 'Telemedicine',
        icon: 'telemedicine',
        category: 'navigation',
        color: 'bg-cyan-500 hover:bg-cyan-600',
        description: 'Start virtual consultation'
    },
    {
        id: 'referral',
        label: 'Create Referral',
        icon: 'referrals',
        category: 'navigation',
        color: 'bg-pink-500 hover:bg-pink-600',
        description: 'Refer to specialist'
    }
];

export default function IconEnhancedPatientWorkspace() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const iconSystem = IconSystem();
    const queryClient = useQueryClient();

    const patientId = searchParams.get('id');
    const activeTab = searchParams.get('tab') || 'overview';
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [recentActions, setRecentActions] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Fetch patient data
    const { data: patient, isLoading: patientLoading, error: patientError } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: () => {
            console.warn('Mock Patient.get call - Base44 integration removed');
            return Promise.resolve(null);
        },
        enabled: !!patientId
    });

    // Fetch related data
    const { data: appointments } = useQuery({
        queryKey: ['patient-appointments', patientId],
        queryFn: () => {
            console.warn('Mock Appointment.list call - Base44 integration removed');
            return Promise.resolve([]);
        },
        enabled: !!patientId
    });

    const { data: prescriptions } = useQuery({
        queryKey: ['patient-prescriptions', patientId],
        queryFn: () => {
            console.warn('Mock Prescription.list call - Base44 integration removed');
            return Promise.resolve([]);
        },
        enabled: !!patientId
    });

    const { data: encounters } = useQuery({
        queryKey: ['patient-encounters', patientId],
        queryFn: () => {
            console.warn('Mock Encounter.list call - Base44 integration removed');
            return Promise.resolve([]);
        },
        enabled: !!patientId
    });

    const { data: labOrders } = useQuery({
        queryKey: ['patient-lab-orders', patientId],
        queryFn: () => {
            console.warn('Mock LabOrder.list call - Base44 integration removed');
            return Promise.resolve([]);
        },
        enabled: !!patientId
    });

    // Calculate patient age
    const patientAge = (patient as any)?.date_of_birth
        ? differenceInYears(new Date(), parseISO((patient as any).date_of_birth))
        : null;

    // Handle tab change
    const handleTabChange = useCallback((tab: string) => {
        setSearchParams({ id: patientId!, tab });
    }, [patientId, setSearchParams]);

    // Handle quick action
    const handleQuickAction = useCallback((actionId: string) => {
        const action = QUICK_ACTIONS.find(a => a.id === actionId);
        if (action) {
            setRecentActions((prev: any[]) => [
                { ...action, timestamp: new Date(), patientId },
                ...prev.slice(0, 4)
            ]);
            // Navigate to appropriate form or action
            console.log('Quick action:', actionId);
        }
    }, []);

    // Toggle favorite
    const toggleFavorite = useCallback((sectionId: string) => {
        setFavorites((prev: string[]) =>
            prev.includes(sectionId)
                ? prev.filter((id: string) => id !== sectionId)
                : [...prev, sectionId]
        );
    }, []);

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

    if (patientError || !patient) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <iconSystem.medical.alertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
                        <p className="text-gray-600 mb-4">The requested patient could not be found.</p>
                        <Button onClick={() => navigate('/Patients')}>
                            <iconSystem.status.arrowLeft className="w-4 h-4 mr-2" />
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
                            <iconSystem.status.arrowLeft className="w-4 h-4 mr-2" />
                            Back to Patients
                        </Button>

                        <Separator className="h-6" />

                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                <iconSystem.user.user className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {(patient as any).first_name} {(patient as any).last_name}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <iconSystem.medical.clock className="w-3 h-3" />
                                        <span>{patientAge ? `${patientAge} years old` : 'Age unknown'}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <iconSystem.user.user className="w-3 h-3" />
                                        <span>{(patient as any).gender || 'Gender not specified'}</span>
                                    </div>
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
                            <Icon name="zap" category="status" size="sm" color="warning" className="mr-2" />
                            Quick Actions
                        </Button>

                        {/* Patient Actions */}
                        <IconButton
                            icon="edit"
                            category="data"
                            size="sm"
                            tooltip="Edit Patient"
                        />

                        <IconButton
                            icon="share"
                            category="data"
                            size="sm"
                            tooltip="Share Patient"
                        />
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
                            <IconGrid items={QUICK_ACTIONS} columns={6} />
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
                                                <IconButton
                                                    icon="star"
                                                    category="status"
                                                    size="sm"
                                                    tooltip="Add to favorites"
                                                />
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Icon name="phone" category="patient" size="sm" color="secondary" />
                                                    <span>{patient.phone || 'No phone'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Icon name="mail" category="patient" size="sm" color="secondary" />
                                                    <span>{patient.email || 'No email'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Icon name="mapPin" category="patient" size="sm" color="secondary" />
                                                    <span className="truncate">{patient.address || 'No address'}</span>
                                                </div>
                                            </div>

                                            {/* Key Metrics */}
                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Icon name="appointments" category="navigation" size="sm" color="primary" />
                                                        <span className="text-lg font-semibold text-blue-600">
                                                            {appointments?.length || 0}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">Appointments</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Icon name="prescriptions" category="navigation" size="sm" color="success" />
                                                        <span className="text-lg font-semibold text-green-600">
                                                            {prescriptions?.length || 0}
                                                        </span>
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
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <Icon name="layout" category="navigation" size="sm" color="primary" />
                                        Workspace Sections
                                    </h4>
                                    {Object.entries(WORKSPACE_SECTIONS)
                                        .sort(([, a], [, b]) => a.priority - b.priority)
                                        .map(([sectionId, section]) => (
                                            <Button
                                                key={sectionId}
                                                variant={activeTab === sectionId ? 'default' : 'ghost'}
                                                className={`w-full justify-start ${activeTab === sectionId ? '' : 'hover:bg-gray-50'}`}
                                                onClick={() => handleTabChange(sectionId)}
                                            >
                                                <Icon
                                                    name={section.icon}
                                                    category={section.category}
                                                    size="sm"
                                                    color={activeTab === sectionId ? 'primary' : 'secondary'}
                                                    className="mr-3"
                                                />
                                                <span className="flex-1 text-left">{section.title}</span>
                                                <IconButton
                                                    icon="star"
                                                    category="status"
                                                    size="xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(sectionId);
                                                    }}
                                                    className="p-1 h-auto"
                                                />
                                            </Button>
                                        ))}
                                </div>
                            </ScrollArea>

                            {/* Recent Actions */}
                            {recentActions.length > 0 && (
                                <div className="p-4 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <Icon name="clock" category="medical" size="sm" color="secondary" />
                                        Recent Actions
                                    </h4>
                                    <div className="space-y-2">
                                        {recentActions.slice(0, 3).map((action, index) => (
                                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Icon name={action.icon} category={action.category} size="xs" color="secondary" />
                                                <span className="truncate">{action.label}</span>
                                                <Icon name="clock" category="medical" size="xs" color="muted" />
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
                                    <IconTabs
                                        tabs={Object.entries(WORKSPACE_SECTIONS).map(([sectionId, section]) => ({
                                            id: sectionId,
                                            label: section.title,
                                            icon: section.icon,
                                            category: section.category
                                        }))}
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                    />
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
                                                                <Icon name="user" category="patient" size="md" color="primary" />
                                                                <span>Patient Information</span>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                                        <Icon name="calendar" category="medical" size="xs" color="secondary" />
                                                                        Date of Birth
                                                                    </label>
                                                                    <p className="text-sm">{patient.date_of_birth ? format(parseISO(patient.date_of_birth), 'MMM dd, yyyy') : 'Not provided'}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                                        <Icon name="heart" category="medical" size="xs" color="secondary" />
                                                                        Blood Type
                                                                    </label>
                                                                    <p className="text-sm">{patient.blood_type || 'Not provided'}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                                        <Icon name="shield" category="medical" size="xs" color="secondary" />
                                                                        Insurance Provider
                                                                    </label>
                                                                    <p className="text-sm">{patient.insurance_provider || 'Not provided'}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                                        <Icon name="key" category="data" size="xs" color="secondary" />
                                                                        Insurance ID
                                                                    </label>
                                                                    <p className="text-sm">{patient.insurance_id || 'Not provided'}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Clinical Alerts */}
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center space-x-2">
                                                                <Icon name="alertTriangle" category="medical" size="md" color="error" />
                                                                <span>Clinical Alerts</span>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                                    <Icon name="alertTriangle" category="medical" size="md" color="error" />
                                                                    <div>
                                                                        <h4 className="font-medium text-red-800">High Priority Alert</h4>
                                                                        <p className="text-sm text-red-600">Patient has critical lab values</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <Icon name="alertCircle" category="emergency" size="md" color="warning" />
                                                                    <div>
                                                                        <h4 className="font-medium text-yellow-800">Medication Interaction</h4>
                                                                        <p className="text-sm text-yellow-600">Potential drug interaction detected</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Quick Stats */}
                                                <div className="space-y-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center space-x-2">
                                                                <Icon name="trendingUp" category="status" size="md" color="primary" />
                                                                <span>Quick Stats</span>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Icon name="checkCircle" category="status" size="sm" color="success" />
                                                                        <span className="text-sm text-gray-600">Total Visits</span>
                                                                    </div>
                                                                    <IconBadge icon="checkCircle" category="status" size="xs" variant="default">
                                                                        {encounters?.length || 0}
                                                                    </IconBadge>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Icon name="prescriptions" category="navigation" size="sm" color="primary" />
                                                                        <span className="text-sm text-gray-600">Active Prescriptions</span>
                                                                    </div>
                                                                    <IconBadge icon="checkCircle" category="status" size="xs" variant="default">
                                                                        {prescriptions?.filter(p => p.status === 'active').length || 0}
                                                                    </IconBadge>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Icon name="appointments" category="navigation" size="sm" color="success" />
                                                                        <span className="text-sm text-gray-600">Upcoming Appointments</span>
                                                                    </div>
                                                                    <IconBadge icon="checkCircle" category="status" size="xs" variant="default">
                                                                        {appointments?.filter(a => new Date(a.appointment_date) > new Date()).length || 0}
                                                                    </IconBadge>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Allergies & Conditions */}
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center space-x-2">
                                                                <Icon name="alertTriangle" category="medical" size="md" color="error" />
                                                                <span>Allergies & Conditions</span>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                                        <Icon name="alertTriangle" category="medical" size="xs" color="error" />
                                                                        Allergies
                                                                    </label>
                                                                    <div className="mt-1">
                                                                        {patient.allergies && patient.allergies.length > 0 ? (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {patient.allergies.map((allergy, index) => (
                                                                                    <IconBadge key={index} icon="alertTriangle" category="medical" size="xs" variant="error">
                                                                                        {allergy}
                                                                                    </IconBadge>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-gray-500">No known allergies</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                                        <Icon name="heart" category="medical" size="xs" color="secondary" />
                                                                        Medical Conditions
                                                                    </label>
                                                                    <div className="mt-1">
                                                                        {patient.medical_conditions && patient.medical_conditions.length > 0 ? (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {patient.medical_conditions.map((condition, index) => (
                                                                                    <IconBadge key={index} icon="heart" category="medical" size="xs" variant="default">
                                                                                        {condition}
                                                                                    </IconBadge>
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

                                    {/* Other tabs would be implemented similarly with appropriate icons */}
                                    <TabsContent value="timeline" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center space-x-2">
                                                        <Icon name="clock" category="medical" size="md" color="primary" />
                                                        <span>Patient Timeline</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-600">Timeline view would be implemented here with extensive iconography.</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="clinical" className="h-full m-0">
                                        <div className="h-full p-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center space-x-2">
                                                        <Icon name="stethoscope" category="medical" size="md" color="primary" />
                                                        <span>Clinical Records</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-600">Clinical records would be implemented here with extensive iconography.</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* Additional tabs would follow the same pattern */}
                                </div>
                            </Tabs>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
