import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    Zap,
    Activity,
    Plus,
    Edit,
    Stethoscope,
    ClipboardList,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    Clock,
    Star,
    Target,
    Shield
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

interface IconPatientViewProps {
    patient?: Patient;
}

export default function IconPatientView({ patient }: IconPatientViewProps) {
    if (!patient) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No patient data available</p>
            </div>
        );
    }

    const iconSections = [
        {
            title: 'Clinical',
            icon: Stethoscope,
            color: 'text-blue-600',
            items: [
                { icon: Calendar, label: 'Appointments', count: 12, href: '/appointments' },
                { icon: Heart, label: 'Conditions', count: 3, href: '/conditions' },
                { icon: ClipboardList, label: 'Assessments', count: 8, href: '/assessments' },
                { icon: Activity, label: 'Vitals', count: 24, href: '/vitals' },
            ]
        },
        {
            title: 'Medications',
            icon: Pill,
            color: 'text-green-600',
            items: [
                { icon: Pill, label: 'Active Rx', count: 5, href: '/prescriptions' },
                { icon: TestTube, label: 'Lab Orders', count: 8, href: '/lab-orders' },
                { icon: AlertTriangle, label: 'Allergies', count: 2, href: '/allergies' },
                { icon: CheckCircle, label: 'Compliance', count: 95, href: '/compliance' },
            ]
        },
        {
            title: 'Analytics',
            icon: BarChart3,
            color: 'text-purple-600',
            items: [
                { icon: TrendingUp, label: 'Trends', count: 0, href: '/trends' },
                { icon: Target, label: 'Goals', count: 3, href: '/goals' },
                { icon: Star, label: 'Quality', count: 92, href: '/quality' },
                { icon: Shield, label: 'Risk Score', count: 15, href: '/risk' },
            ]
        }
    ];

    const quickActions = [
        { icon: Plus, label: 'New Appointment', color: 'bg-blue-500' },
        { icon: Pill, label: 'Prescription', color: 'bg-green-500' },
        { icon: TestTube, label: 'Lab Order', color: 'bg-purple-500' },
        { icon: FileText, label: 'Add Note', color: 'bg-orange-500' },
        { icon: Calendar, label: 'Schedule', color: 'bg-indigo-500' },
        { icon: Heart, label: 'Assessment', color: 'bg-red-500' },
        { icon: BarChart3, label: 'Report', color: 'bg-teal-500' },
        { icon: Edit, label: 'Edit Profile', color: 'bg-gray-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Icon Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-full">
                            <Zap className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {patient.first_name} {patient.last_name}
                            </h2>
                            <p className="text-purple-100">
                                Icon-Driven Patient Interface
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                            Icon View
                        </Badge>
                        <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>
            </div>

            {/* Icon Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {iconSections.map((section, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <section.icon className={`h-5 w-5 ${section.color}`} />
                                <span>{section.title}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {section.items.map((item, itemIndex) => (
                                    <Button
                                        key={itemIndex}
                                        variant="outline"
                                        className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="text-xs font-medium">{item.label}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {item.count}
                                        </Badge>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-purple-600" />
                        <span>Quick Actions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {quickActions.map((action, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
                            >
                                <div className={`p-2 rounded-full ${action.color}`}>
                                    <action.icon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-xs font-medium">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Patient Info Icons */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-600" />
                        <span>Patient Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Mail, label: 'Email', value: patient.email || 'Not provided' },
                            { icon: Phone, label: 'Phone', value: patient.phone || 'Not provided' },
                            { icon: Calendar, label: 'DOB', value: patient.date_of_birth || 'Not provided' },
                            { icon: MapPin, label: 'Address', value: patient.address || 'Not provided' },
                        ].map((info, index) => (
                            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                                <info.icon className="h-6 w-6 mx-auto text-gray-600 mb-2" />
                                <p className="text-sm font-medium text-gray-600">{info.label}</p>
                                <p className="text-sm text-gray-800">{info.value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
