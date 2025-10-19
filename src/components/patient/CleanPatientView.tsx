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
    FileText,
    Heart,
    Phone,
    Mail,
    MapPin,
    Clock,
    Activity,
    Plus,
    Edit,
    Download
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

interface CleanPatientViewProps {
    patient?: Patient;
}

export default function CleanPatientView({ patient }: CleanPatientViewProps) {
    if (!patient) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No patient data available</p>
            </div>
        );
    }

    const patientInfo = [
        { label: 'Email', value: patient.email, icon: Mail },
        { label: 'Phone', value: patient.phone, icon: Phone },
        { label: 'Date of Birth', value: patient.date_of_birth, icon: Calendar },
        { label: 'Address', value: patient.address, icon: MapPin },
    ].filter(info => info.value);

    const quickActions = [
        { title: 'New Appointment', icon: Calendar, color: 'bg-blue-500' },
        { title: 'Prescription', icon: Pill, color: 'bg-green-500' },
        { title: 'Lab Order', icon: TestTube, color: 'bg-purple-500' },
        { title: 'Add Note', icon: FileText, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Patient Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-full">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {patient.first_name} {patient.last_name}
                            </h2>
                            <p className="text-blue-100">
                                Patient ID: {patient.id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                            Active Patient
                        </Badge>
                        <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Basic Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {patientInfo.map((info, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-gray-100">
                                    <info.icon className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{info.label}</p>
                                    <p className="text-sm">{info.value}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Medical History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Heart className="h-5 w-5" />
                            <span>Medical History</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Medical History</p>
                                <p className="text-sm text-gray-800">
                                    {patient.medical_history || 'No medical history recorded'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Allergies</p>
                                <p className="text-sm text-gray-800">
                                    {patient.allergies || 'No known allergies'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Emergency Contact</p>
                                <p className="text-sm text-gray-800">
                                    {patient.emergency_contact || 'No emergency contact on file'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Activity className="h-5 w-5" />
                            <span>Quick Actions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
                                >
                                    <div className={`p-2 rounded-full ${action.color}`}>
                                        <action.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-xs font-medium">{action.title}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Patient Tabs */}
            <Card>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                        <TabsTrigger value="lab-orders">Lab Orders</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                                <p className="text-2xl font-bold text-blue-600">12</p>
                                <p className="text-sm text-gray-600">Appointments</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <Pill className="h-8 w-8 mx-auto text-green-600 mb-2" />
                                <p className="text-2xl font-bold text-green-600">5</p>
                                <p className="text-sm text-gray-600">Active Prescriptions</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <TestTube className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                                <p className="text-2xl font-bold text-purple-600">8</p>
                                <p className="text-sm text-gray-600">Lab Orders</p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <FileText className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                                <p className="text-2xl font-bold text-orange-600">15</p>
                                <p className="text-sm text-gray-600">Notes</p>
                            </div>
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

                    <TabsContent value="notes" className="mt-6">
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Clinical notes will be displayed here</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}
