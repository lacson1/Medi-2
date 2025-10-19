import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    Download,
    Stethoscope,
    ClipboardList,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    BarChart3
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

interface EnhancedPatientViewProps {
    patient?: Patient;
}

export default function EnhancedPatientView({ patient }: EnhancedPatientViewProps) {
    if (!patient) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No patient data available</p>
            </div>
        );
    }

    const clinicalMetrics = [
        { label: 'Last Visit', value: '2 weeks ago', icon: Calendar, color: 'text-blue-600' },
        { label: 'Active Conditions', value: '3', icon: Heart, color: 'text-red-600' },
        { label: 'Medication Adherence', value: '95%', icon: Pill, color: 'text-green-600' },
        { label: 'Risk Score', value: 'Low', icon: AlertTriangle, color: 'text-yellow-600' },
    ];

    const recentActivity = [
        { type: 'appointment', title: 'Follow-up consultation', time: '2 weeks ago', status: 'completed' },
        { type: 'prescription', title: 'Medication refill', time: '1 week ago', status: 'active' },
        { type: 'lab', title: 'Blood work results', time: '3 days ago', status: 'reviewed' },
        { type: 'note', title: 'Clinical note added', time: '1 day ago', status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-full">
                            <Stethoscope className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {patient.first_name} {patient.last_name}
                            </h2>
                            <p className="text-green-100">
                                Enhanced Clinical Workspace
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                            Enhanced View
                        </Badge>
                        <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* Clinical Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {clinicalMetrics.map((metric, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-gray-100 ${metric.color}`}>
                                    <metric.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                                    <p className="text-lg font-bold">{metric.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Enhanced Tabs */}
            <Card>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="clinical">Clinical</TabsTrigger>
                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                        <TabsTrigger value="lab-orders">Lab Orders</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Patient Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <User className="h-5 w-5" />
                                        <span>Patient Summary</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Age</p>
                                            <p className="text-lg font-semibold">45 years</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Gender</p>
                                            <p className="text-lg font-semibold">Male</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Medical History</p>
                                        <p className="text-sm text-gray-800">
                                            {patient.medical_history || 'No medical history recorded'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Allergies</p>
                                        <div className="flex flex-wrap gap-2">
                                            {patient.allergies ? (
                                                <Badge variant="destructive">{patient.allergies}</Badge>
                                            ) : (
                                                <Badge variant="secondary">No known allergies</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Activity className="h-5 w-5" />
                                        <span>Recent Activity</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <div className="space-y-4">
                                            {recentActivity.map((activity, index) => (
                                                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                                                    <div className="p-2 rounded-full bg-gray-100">
                                                        {activity.type === 'appointment' && <Calendar className="h-4 w-4 text-blue-600" />}
                                                        {activity.type === 'prescription' && <Pill className="h-4 w-4 text-green-600" />}
                                                        {activity.type === 'lab' && <TestTube className="h-4 w-4 text-purple-600" />}
                                                        {activity.type === 'note' && <FileText className="h-4 w-4 text-orange-600" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{activity.title}</p>
                                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                                    </div>
                                                    <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                                                        {activity.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="clinical" className="mt-6">
                        <div className="text-center py-8">
                            <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Clinical tools and advanced features will be displayed here</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                        <div className="text-center py-8">
                            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Patient analytics and trends will be displayed here</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="appointments" className="mt-6">
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Enhanced appointment management will be displayed here</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="prescriptions" className="mt-6">
                        <div className="text-center py-8">
                            <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Advanced prescription management will be displayed here</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="lab-orders" className="mt-6">
                        <div className="text-center py-8">
                            <TestTube className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Comprehensive lab order management will be displayed here</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}
