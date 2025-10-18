import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Calendar,
    Stethoscope,
    Pill,
    FileText,
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Eye,
    Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import EnhancedDataTable from '@/components/ui/EnhancedDataTable';

interface PatientData {
    id: string;
    name: string;
    age: number;
    gender: string;
    lastVisit: string;
    status: 'active' | 'inactive' | 'pending';
    primaryCare: string;
    conditions: string[];
}

interface AppointmentData {
    id: string;
    date: string;
    time: string;
    type: string;
    provider: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
}

interface PrescriptionData {
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'discontinued';
    provider: string;
}

interface LabResultData {
    id: string;
    testName: string;
    date: string;
    result: string;
    status: 'normal' | 'abnormal' | 'critical';
    provider: string;
}

interface EnhancedPatientWorkspaceProps {
    patientId: string;
    patientData?: PatientData;
    appointments?: AppointmentData[];
    prescriptions?: PrescriptionData[];
    labResults?: LabResultData[];
    onAddAppointment?: () => void;
    onAddPrescription?: () => void;
    onOrderLab?: () => void;
    onViewDetails?: (type: string, id: string) => void;
    onEdit?: (type: string, id: string) => void;
    loading?: boolean;
}

export default function EnhancedPatientWorkspace({
    patientId,
    patientData,
    appointments = [],
    prescriptions = [],
    labResults = [],
    onAddAppointment,
    onAddPrescription,
    onOrderLab,
    onViewDetails,
    onEdit,
    loading = false
}: EnhancedPatientWorkspaceProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'scheduled':
            case 'normal':
                return 'bg-green-100 text-green-800';
            case 'inactive':
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
            case 'abnormal':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
            case 'discontinued':
            case 'critical':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (status: string) => {
        switch (status) {
            case 'critical':
                return 'border-l-red-500';
            case 'abnormal':
                return 'border-l-yellow-500';
            case 'normal':
                return 'border-l-green-500';
            default:
                return 'border-l-gray-300';
        }
    };

    const appointmentColumns = [
        {
            key: 'date',
            title: 'Date',
            sortable: true,
            render: (value: string, row: AppointmentData) => (
                <div>
                    <div className="font-medium">{value}</div>
                    <div className="text-sm text-gray-500">{row.time}</div>
                </div>
            )
        },
        {
            key: 'type',
            title: 'Type',
            sortable: true,
            render: (value: string) => (
                <Badge variant="outline" className="text-xs">
                    {value}
                </Badge>
            )
        },
        {
            key: 'provider',
            title: 'Provider',
            sortable: true
        },
        {
            key: 'status',
            title: 'Status',
            sortable: true,
            render: (value: string) => (
                <Badge className={getStatusColor(value)}>
                    {value}
                </Badge>
            )
        }
    ];

    const prescriptionColumns = [
        {
            key: 'medication',
            title: 'Medication',
            sortable: true,
            render: (value: string, row: PrescriptionData) => (
                <div>
                    <div className="font-medium">{value}</div>
                    <div className="text-sm text-gray-500">{row.dosage}</div>
                </div>
            )
        },
        {
            key: 'frequency',
            title: 'Frequency',
            sortable: true
        },
        {
            key: 'startDate',
            title: 'Start Date',
            sortable: true
        },
        {
            key: 'status',
            title: 'Status',
            sortable: true,
            render: (value: string) => (
                <Badge className={getStatusColor(value)}>
                    {value}
                </Badge>
            )
        }
    ];

    const labResultColumns = [
        {
            key: 'testName',
            title: 'Test',
            sortable: true
        },
        {
            key: 'date',
            title: 'Date',
            sortable: true
        },
        {
            key: 'result',
            title: 'Result',
            sortable: true,
            render: (value: string, row: LabResultData) => (
                <div className={cn('border-l-4 pl-3', getPriorityColor(row.status))}>
                    <div className="font-medium">{value}</div>
                    <div className="text-sm text-gray-500">{row.status}</div>
                </div>
            )
        },
        {
            key: 'provider',
            title: 'Provider',
            sortable: true
        }
    ];

    const appointmentActions = [
        {
            label: 'View Details',
            icon: <Eye className="w-4 h-4" />,
            onClick: (row: AppointmentData) => onViewDetails?.('appointment', row.id)
        },
        {
            label: 'Edit',
            icon: <Edit className="w-4 h-4" />,
            onClick: (row: AppointmentData) => onEdit?.('appointment', row.id)
        }
    ];

    const prescriptionActions = [
        {
            label: 'View Details',
            icon: <Eye className="w-4 h-4" />,
            onClick: (row: PrescriptionData) => onViewDetails?.('prescription', row.id)
        },
        {
            label: 'Edit',
            icon: <Edit className="w-4 h-4" />,
            onClick: (row: PrescriptionData) => onEdit?.('prescription', row.id)
        }
    ];

    const labResultActions = [
        {
            label: 'View Details',
            icon: <Eye className="w-4 h-4" />,
            onClick: (row: LabResultData) => onViewDetails?.('lab', row.id)
        },
        {
            label: 'Download',
            icon: <Download className="w-4 h-4" />,
            onClick: (row: LabResultData) => console.log('Download', row.id)
        }
    ];

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Patient Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{patientData?.name || 'Loading...'}</h1>
                            <p className="text-blue-100">
                                {patientData?.age} years old • {patientData?.gender}
                            </p>
                            <p className="text-blue-100 text-sm">
                                Patient ID: {patientId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Badge
                            variant="secondary"
                            className={cn(
                                'text-white',
                                patientData?.status === 'active' && 'bg-green-500',
                                patientData?.status === 'inactive' && 'bg-gray-500',
                                patientData?.status === 'pending' && 'bg-yellow-500'
                            )}
                        >
                            {patientData?.status}
                        </Badge>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Appointments</p>
                                <p className="text-xl font-bold">{appointments.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Pill className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Prescriptions</p>
                                <p className="text-xl font-bold">{prescriptions.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Lab Results</p>
                                <p className="text-xl font-bold">{labResults.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="text-sm text-gray-600">Last Visit</p>
                                <p className="text-sm font-bold">{patientData?.lastVisit || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks for this patient</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={onAddAppointment} className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>New Appointment</span>
                        </Button>
                        <Button variant="outline" onClick={onAddPrescription} className="flex items-center space-x-2">
                            <Pill className="w-4 h-4" />
                            <span>New Prescription</span>
                        </Button>
                        <Button variant="outline" onClick={onOrderLab} className="flex items-center space-x-2">
                            <Activity className="w-4 h-4" />
                            <span>Order Lab Test</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Appointments</CardTitle>
                                <CardDescription>Latest appointment history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {appointments.slice(0, 3).map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{appointment.type}</p>
                                                <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                                            </div>
                                            <Badge className={getStatusColor(appointment.status)}>
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Prescriptions</CardTitle>
                                <CardDescription>Current medications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {prescriptions.filter(p => p.status === 'active').slice(0, 3).map((prescription) => (
                                        <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{prescription.medication}</p>
                                                <p className="text-sm text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
                                            </div>
                                            <Badge className={getStatusColor(prescription.status)}>
                                                {prescription.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="appointments" className="space-y-4">
                    <EnhancedDataTable
                        data={appointments}
                        columns={appointmentColumns}
                        actions={appointmentActions}
                        searchable
                        selectable
                        onRowClick={(row) => onViewDetails?.('appointment', row.id)}
                    />
                </TabsContent>

                <TabsContent value="prescriptions" className="space-y-4">
                    <EnhancedDataTable
                        data={prescriptions}
                        columns={prescriptionColumns}
                        actions={prescriptionActions}
                        searchable
                        selectable
                        onRowClick={(row) => onViewDetails?.('prescription', row.id)}
                    />
                </TabsContent>

                <TabsContent value="lab-results" className="space-y-4">
                    <EnhancedDataTable
                        data={labResults}
                        columns={labResultColumns}
                        actions={labResultActions}
                        searchable
                        selectable
                        onRowClick={(row) => onViewDetails?.('lab', row.id)}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
