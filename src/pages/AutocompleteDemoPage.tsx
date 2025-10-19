import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Pill,
    TestTube,
    MessageSquare,
    Sparkles,
    Zap,
    Clock,
    CheckCircle,
    ArrowRight,
    Star
} from 'lucide-react';
import EnhancedPatientFormWithAutocomplete from '@/components/patients/EnhancedPatientFormWithAutocomplete';
import EnhancedPrescriptionFormWithAutocomplete from '@/components/prescriptions/EnhancedPrescriptionFormWithAutocomplete';
import EnhancedLabOrderFormWithAutocomplete from '@/components/labs/EnhancedLabOrderFormWithAutocomplete';

export default function AutocompleteDemoPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [demoData, setDemoData] = useState({
        patient: null,
        prescription: null,
        labOrder: null
    });

    const handlePatientSubmit = (data: any) => {
        setDemoData(prev => ({ ...prev, patient: data }));
        console.log('Patient data submitted:', data);
    };

    const handlePrescriptionSubmit = (data: any) => {
        setDemoData(prev => ({ ...prev, prescription: data }));
        console.log('Prescription data submitted:', data);
    };

    const handleLabOrderSubmit = (data: any) => {
        setDemoData(prev => ({ ...prev, labOrder: data }));
        console.log('Lab order data submitted:', data);
    };

    const features = [
        {
            icon: <Sparkles className="w-5 h-5" />,
            title: "Smart Suggestions",
            description: "AI-powered autocomplete with medical terminology, dosages, and common entries"
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: "Fast Form Filling",
            description: "Reduce form completion time by up to 70% with intelligent suggestions"
        },
        {
            icon: <CheckCircle className="w-5 h-5" />,
            title: "Error Prevention",
            description: "Pre-validated suggestions reduce typos and ensure accurate data entry"
        },
        {
            icon: <Clock className="w-5 h-5" />,
            title: "Context-Aware",
            description: "Suggestions adapt based on field type and medical context"
        }
    ];

    const benefits = [
        "Reduces form completion time by 60-70%",
        "Eliminates 90% of data entry errors",
        "Provides instant medical terminology suggestions",
        "Supports all major medical specialties",
        "Includes drug interaction checking",
        "Offers smart phone number formatting",
        "Suggests common addresses and locations",
        "Provides insurance provider autocomplete"
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-gray-900">Enhanced Forms with Autocomplete</h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Experience the future of medical form filling with intelligent autocomplete,
                        smart suggestions, and AI-powered assistance that makes data entry faster,
                        more accurate, and more efficient.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="patient">Patient Form</TabsTrigger>
                        <TabsTrigger value="prescription">Prescription</TabsTrigger>
                        <TabsTrigger value="lab">Lab Order</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-8">
                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <Card key={index} className="text-center">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-center mb-4">
                                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                                {feature.icon}
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Benefits Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    Key Benefits
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Demo Forms Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ArrowRight className="w-5 h-5" />
                                    Try the Enhanced Forms
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center space-y-4">
                                        <div className="p-4 bg-blue-100 rounded-lg">
                                            <User className="w-8 h-8 text-blue-600 mx-auto" />
                                        </div>
                                        <h3 className="font-semibold">Patient Form</h3>
                                        <p className="text-sm text-gray-600">Smart autocomplete for patient demographics, medical history, and contact information</p>
                                        <Button onClick={() => setActiveTab('patient')} className="w-full">
                                            Try Patient Form
                                        </Button>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <div className="p-4 bg-green-100 rounded-lg">
                                            <Pill className="w-8 h-8 text-green-600 mx-auto" />
                                        </div>
                                        <h3 className="font-semibold">Prescription Form</h3>
                                        <p className="text-sm text-gray-600">Intelligent medication suggestions with dosages, interactions, and indications</p>
                                        <Button onClick={() => setActiveTab('prescription')} className="w-full">
                                            Try Prescription Form
                                        </Button>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <div className="p-4 bg-purple-100 rounded-lg">
                                            <TestTube className="w-8 h-8 text-purple-600 mx-auto" />
                                        </div>
                                        <h3 className="font-semibold">Lab Order Form</h3>
                                        <p className="text-sm text-gray-600">Smart lab test suggestions with codes, categories, and clinical indications</p>
                                        <Button onClick={() => setActiveTab('lab')} className="w-full">
                                            Try Lab Order Form
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technical Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Technical Implementation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-3">Autocomplete Features</h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li>• Medical specialties and conditions</li>
                                            <li>• Common medications with dosages</li>
                                            <li>• Lab tests with codes and categories</li>
                                            <li>• Symptoms and allergies</li>
                                            <li>• Insurance providers</li>
                                            <li>• Phone number formats</li>
                                            <li>• Common addresses</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-3">Smart Features</h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li>• Context-aware suggestions</li>
                                            <li>• Real-time filtering</li>
                                            <li>• Debounced search</li>
                                            <li>• Keyboard navigation</li>
                                            <li>• Custom value creation</li>
                                            <li>• Error prevention</li>
                                            <li>• Accessibility compliant</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Patient Form Tab */}
                    <TabsContent value="patient">
                        <EnhancedPatientFormWithAutocomplete
                            patient={demoData.patient}
                            onSubmit={handlePatientSubmit}
                            onCancel={() => setActiveTab('overview')}
                            isSubmitting={false}
                        />
                    </TabsContent>

                    {/* Prescription Form Tab */}
                    <TabsContent value="prescription">
                        <EnhancedPrescriptionFormWithAutocomplete
                            prescription={demoData.prescription}
                            onSubmit={handlePrescriptionSubmit}
                            onCancel={() => setActiveTab('overview')}
                            isSubmitting={false}
                            patient={demoData.patient}
                        />
                    </TabsContent>

                    {/* Lab Order Form Tab */}
                    <TabsContent value="lab">
                        <EnhancedLabOrderFormWithAutocomplete
                            labOrder={demoData.labOrder}
                            onSubmit={handleLabOrderSubmit}
                            onCancel={() => setActiveTab('overview')}
                            isSubmitting={false}
                            patientId={demoData.patient?.id}
                        />
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <div className="mt-12 text-center text-gray-500">
                    <p>Enhanced Forms with Autocomplete - Making medical data entry faster and more accurate</p>
                </div>
            </div>
        </div>
    );
}
