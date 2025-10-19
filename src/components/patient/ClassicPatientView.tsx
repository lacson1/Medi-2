import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Calendar,
    Pill,
    TestTube,
    Heart,
    Phone,
    Mail,
    MapPin,
    Clock,
    Activity,
    Plus,
    Edit,
    Download,
    Printer,
    Share2,
    History,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    address?: string;
    medical_history?: string;
    allergies?: string;
    emergency_contact?: string;
}

interface ClassicPatientViewProps {
    patient?: Patient;
}

export default function ClassicPatientView({ patient }: ClassicPatientViewProps) {
    if (!patient) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No patient data available</p>
            </div>
        );
    }

    const patientData = [
        { label: 'Patient ID', value: patient.id },
        { label: 'Name', value: `${patient.first_name} ${patient.last_name}` },
        { label: 'Email', value: patient.email || 'Not provided' },
        { label: 'Phone', value: patient.phone || 'Not provided' },
        { label: 'Date of Birth', value: patient.date_of_birth || 'Not provided' },
        { label: 'Address', value: patient.address || 'Not provided' },
    ];

    const medicalInfo = [
        { label: 'Medical History', value: patient.medical_history || 'No medical history recorded' },
        { label: 'Allergies', value: patient.allergies || 'No known allergies' },
        { label: 'Emergency Contact', value: patient.emergency_contact || 'No emergency contact on file' },
    ];

    const recentAppointments = [
        { date: '2024-01-15', type: 'Follow-up', doctor: 'Dr. Smith', status: 'completed' },
        { date: '2024-01-08', type: 'Consultation', doctor: 'Dr. Johnson', status: 'completed' },
        { date: '2024-01-01', type: 'Annual Checkup', doctor: 'Dr. Brown', status: 'completed' },
    ];

    const activePrescriptions = [
        { medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', status: 'active' },
        { medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'active' },
        { medication: 'Aspirin', dosage: '81mg', frequency: 'Once daily', status: 'active' },
    ];

    const pendingLabOrders = [
        { test: 'Complete Blood Count', date: '2024-01-20', status: 'pending' },
        { test: 'Lipid Panel', date: '2024-01-20', status: 'pending' },
        { test: 'HbA1c', date: '2024-01-20', status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            {/* Classic Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <User className="h-8 w-8 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {patient.first_name} {patient.last_name}
                            </h2>
                            <p className="text-gray-600">
                                Patient ID: {patient.id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline">Active Patient</Badge>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Basic Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {patientData.map((item, index) => (
                                <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                                    <span className="text-sm text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Heart className="h-5 w-5" />
                            <span>Medical Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {medicalInfo.map((item, index) => (
                                <div key={index}>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{item.label}:</p>
                                    <p className="text-sm text-gray-800">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Classic Tabs */}
            <Card>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                        <TabsTrigger value="lab-orders">Lab Orders</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Recent Appointments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5" />
                                        <span>Recent Appointments</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentAppointments.map((appointment, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium">{appointment.type}</p>
                                                    <p className="text-xs text-gray-600">{appointment.doctor}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-600">{appointment.date}</p>
                                                    <Badge variant="default" className="text-xs">
                                                        {appointment.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Prescriptions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Pill className="h-5 w-5" />
                                        <span>Active Prescriptions</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {activePrescriptions.map((prescription, index) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium">{prescription.medication}</p>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {prescription.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    {prescription.dosage} - {prescription.frequency}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pending Lab Orders */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <TestTube className="h-5 w-5" />
                                        <span>Pending Lab Orders</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {pendingLabOrders.map((lab, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium">{lab.test}</p>
                                                    <p className="text-xs text-gray-600">{lab.date}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {lab.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="appointments" className="mt-6">
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Appointment history will be displayed here</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="prescriptions" className="mt-6">
                        <div className="text-center py-8">
                            <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Prescription history will be displayed here</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="lab-orders" className="mt-6">
                        <div className="text-center py-8">
                            <TestTube className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Lab order history will be displayed here</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <div className="text-center py-8">
                            <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Complete patient history will be displayed here</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}
