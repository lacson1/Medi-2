import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    Calendar,
    Pill,
    Beaker,
    FileSignature,
    DollarSign,
    FileText,
    BarChart3,
    Database,
    Settings,
    AlertTriangle,
    RefreshCw,
    TrendingUp,
    Users,
    Stethoscope,
    Video,
    CreditCard
} from 'lucide-react';

export default function ColorCodedTabsDemo() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-4">Color-Coded Tabs System</h1>
                <p className="text-gray-600 mb-6">
                    The application now features a comprehensive color-coding system for tabs that provides visual consistency and improves user experience.
                </p>
            </div>

            {/* Color Scheme Legend */}
            <Card>
                <CardHeader>
                    <CardTitle>{"Color Scheme Legend"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                            <span className="text-sm">Medical/Clinical</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                            <span className="text-sm">Patient</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
                            <span className="text-sm">Financial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                            <span className="text-sm">Laboratory</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-teal-100 border border-teal-200 rounded"></div>
                            <span className="text-sm">Pharmacy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-indigo-100 border border-indigo-200 rounded"></div>
                            <span className="text-sm">Administrative</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-emerald-100 border border-emerald-200 rounded"></div>
                            <span className="text-sm">Analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                            <span className="text-sm">Settings</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                            <span className="text-sm">Emergency</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-pink-100 border border-pink-200 rounded"></div>
                            <span className="text-sm">Communication</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Patient Profile Example */}
            <Card>
                <CardHeader>
                    <CardTitle>{"Patient Profile Tabs"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                            <TabsTrigger value="overview" colorScheme="MEDICAL" icon={"Activity"}>
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="appointments" colorScheme="COMMUNICATION" icon={"Calendar"}>
                                Appointments
                            </TabsTrigger>
                            <TabsTrigger value="prescriptions" colorScheme="PHARMACY" icon={"Pill"}>
                                Prescriptions
                            </TabsTrigger>
                            <TabsTrigger value="labs" colorScheme="LABORATORY" icon={"Beaker"}>
                                Labs
                            </TabsTrigger>
                            <TabsTrigger value="consents" colorScheme="PATIENT" icon={"FileSignature"}>
                                Consents
                            </TabsTrigger>
                            <TabsTrigger value="billing" colorScheme="FINANCIAL" icon={"DollarSign"}>
                                Billing
                            </TabsTrigger>
                            <TabsTrigger value="documents" colorScheme="ADMIN" icon={"FileText"}>
                                Documents
                            </TabsTrigger>
                            <TabsTrigger value="timeline" colorScheme="PATIENT" icon={"Activity"}>
                                Timeline
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="mt-4">
                            <div className="text-center py-8 text-gray-500">
                                Patient overview content would go here
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Prescription Management Example */}
            <Card>
                <CardHeader>
                    <CardTitle>{"Prescription Management Tabs"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="dashboard" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                            <TabsTrigger value="dashboard" colorScheme="ANALYTICS" icon={BarChart3}>
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="monitoring" colorScheme="EMERGENCY" icon={"Activity"}>
                                Monitoring
                            </TabsTrigger>
                            <TabsTrigger value="refills" colorScheme="PHARMACY" icon={"RefreshCw"}>
                                Refills
                            </TabsTrigger>
                            <TabsTrigger value="notifications" colorScheme="EMERGENCY" icon={"AlertTriangle"}>
                                Alerts
                            </TabsTrigger>
                            <TabsTrigger value="history" colorScheme="ANALYTICS" icon={"FileText"}>
                                History
                            </TabsTrigger>
                            <TabsTrigger value="analytics" colorScheme="ANALYTICS" icon={BarChart3}>
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="database" colorScheme="ADMIN" icon={"Database"}>
                                Database
                            </TabsTrigger>
                            <TabsTrigger value="settings" colorScheme="SETTINGS" icon={"Settings"}>
                                Settings
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="dashboard" className="mt-4">
                            <div className="text-center py-8 text-gray-500">
                                Prescription dashboard content would go here
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Billing Example */}
            <Card>
                <CardHeader>
                    <CardTitle>{"Billing Tabs"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="invoices" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="invoices" colorScheme="FINANCIAL" icon={"FileText"}>
                                Invoices
                            </TabsTrigger>
                            <TabsTrigger value="payments" colorScheme="FINANCIAL" icon={"CreditCard"}>
                                Payments
                            </TabsTrigger>
                            <TabsTrigger value="analytics" colorScheme="ANALYTICS" icon={BarChart3}>
                                Analytics
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="invoices" className="mt-4">
                            <div className="text-center py-8 text-gray-500">
                                Invoice management content would go here
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Clinical Performance Example */}
            <Card>
                <CardHeader>
                    <CardTitle>{"Clinical Performance Tabs"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview" colorScheme="ANALYTICS" icon={"Activity"}>
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="trends" colorScheme="ANALYTICS" icon={"TrendingUp"}>
                                Trends
                            </TabsTrigger>
                            <TabsTrigger value="diagnosis" colorScheme="MEDICAL" icon={"Stethoscope"}>
                                Diagnosis
                            </TabsTrigger>
                            <TabsTrigger value="staff" colorScheme="ADMIN" icon={"Users"}>
                                Staff
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="mt-4">
                            <div className="text-center py-8 text-gray-500">
                                Clinical performance overview content would go here
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Telemedicine Example */}
            <Card>
                <CardHeader>
                    <CardTitle>{"Telemedicine Tabs"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="sessions" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="sessions" colorScheme="COMMUNICATION" icon={"Video"}>
                                Sessions
                            </TabsTrigger>
                            <TabsTrigger value="analytics" colorScheme="ANALYTICS" icon={"TrendingUp"}>
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="settings" colorScheme="SETTINGS" icon={"Settings"}>
                                Settings
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="sessions" className="mt-4">
                            <div className="text-center py-8 text-gray-500">
                                Telemedicine sessions content would go here
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>{"How to Use Color-Coded Tabs"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Basic Usage:</h3>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {`<TabsTrigger 
  value="prescriptions" 
  colorScheme="PHARMACY" 
  icon={"Pill"}
>
  Prescriptions
</TabsTrigger>`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Available Color Schemes:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><code>MEDICAL</code> - Blue theme for clinical/medical tabs</li>
                                <li><code>PATIENT</code> - Green theme for patient-related tabs</li>
                                <li><code>FINANCIAL</code> - Purple theme for billing/financial tabs</li>
                                <li><code>LABORATORY</code> - Orange theme for lab-related tabs</li>
                                <li><code>PHARMACY</code> - Teal theme for medication/prescription tabs</li>
                                <li><code>ADMIN</code> - Indigo theme for administrative tabs</li>
                                <li><code>ANALYTICS</code> - Emerald theme for reports/analytics tabs</li>
                                <li><code>SETTINGS</code> - Gray theme for configuration tabs</li>
                                <li><code>EMERGENCY</code> - Red theme for critical/alert tabs</li>
                                <li><code>COMMUNICATION</code> - Pink theme for communication tabs</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Automatic Color Assignment:</h3>
                            <p className="text-sm text-gray-600">
                                The system automatically assigns colors based on tab names. For example, tabs containing "prescription", "medication", or "pharmacy" will automatically use the PHARMACY color scheme.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
