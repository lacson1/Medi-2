import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CalmColorPaletteDemo() {
    return (
        <div className="p-8 bg-gradient-calm-surface min-h-screen space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-calm-gray-900">Google-Style Calm Color Palette</h1>
                <p className="text-lg text-calm-gray-600">Soft blues, whites, and subtle gradients for a calming medical interface</p>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Calm Blue Palette */}
                <Card className="bg-gradient-calm-card shadow-calm-md">
                    <CardHeader>
                        <CardTitle className="text-calm-gray-900">Calm Blue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-calm-50 p-4 rounded-lg text-calm-gray-900 text-sm">50</div>
                            <div className="bg-calm-100 p-4 rounded-lg text-calm-gray-900 text-sm">100</div>
                            <div className="bg-calm-200 p-4 rounded-lg text-calm-gray-900 text-sm">200</div>
                            <div className="bg-calm-300 p-4 rounded-lg text-calm-gray-900 text-sm">300</div>
                            <div className="bg-calm-400 p-4 rounded-lg text-white text-sm">400</div>
                            <div className="bg-calm-500 p-4 rounded-lg text-white text-sm">500</div>
                            <div className="bg-calm-600 p-4 rounded-lg text-white text-sm">600</div>
                            <div className="bg-calm-700 p-4 rounded-lg text-white text-sm">700</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calm Gray Palette */}
                <Card className="bg-gradient-calm-card shadow-calm-md">
                    <CardHeader>
                        <CardTitle className="text-calm-gray-900">Calm Gray</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-calm-gray-50 p-4 rounded-lg text-calm-gray-900 text-sm">50</div>
                            <div className="bg-calm-gray-100 p-4 rounded-lg text-calm-gray-900 text-sm">100</div>
                            <div className="bg-calm-gray-200 p-4 rounded-lg text-calm-gray-900 text-sm">200</div>
                            <div className="bg-calm-gray-300 p-4 rounded-lg text-calm-gray-900 text-sm">300</div>
                            <div className="bg-calm-gray-400 p-4 rounded-lg text-white text-sm">400</div>
                            <div className="bg-calm-gray-500 p-4 rounded-lg text-white text-sm">500</div>
                            <div className="bg-calm-gray-600 p-4 rounded-lg text-white text-sm">600</div>
                            <div className="bg-calm-gray-700 p-4 rounded-lg text-white text-sm">700</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calm Teal Palette */}
                <Card className="bg-gradient-calm-card shadow-calm-md">
                    <CardHeader>
                        <CardTitle className="text-calm-gray-900">Calm Teal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-calm-teal-50 p-4 rounded-lg text-calm-gray-900 text-sm">50</div>
                            <div className="bg-calm-teal-100 p-4 rounded-lg text-calm-gray-900 text-sm">100</div>
                            <div className="bg-calm-teal-200 p-4 rounded-lg text-calm-gray-900 text-sm">200</div>
                            <div className="bg-calm-teal-300 p-4 rounded-lg text-calm-gray-900 text-sm">300</div>
                            <div className="bg-calm-teal-400 p-4 rounded-lg text-white text-sm">400</div>
                            <div className="bg-calm-teal-500 p-4 rounded-lg text-white text-sm">500</div>
                            <div className="bg-calm-teal-600 p-4 rounded-lg text-white text-sm">600</div>
                            <div className="bg-calm-teal-700 p-4 rounded-lg text-white text-sm">700</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gradient Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-calm-blue shadow-calm-lg">
                    <CardHeader>
                        <CardTitle className="text-calm-gray-900">Calm Blue Gradient</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-calm-gray-700">Perfect for backgrounds and subtle accents</p>
                        <div className="mt-4 space-x-2">
                            <Button className="bg-calm-500 hover:bg-calm-600 text-white">Primary Action</Button>
                            <Button variant="outline" className="border-calm-300 text-calm-700">Secondary</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-calm-surface shadow-calm-lg">
                    <CardHeader>
                        <CardTitle className="text-calm-gray-900">Calm Surface Gradient</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-calm-gray-700">Ideal for main content areas and cards</p>
                        <div className="mt-4 space-x-2">
                            <Badge className="bg-calm-teal-100 text-calm-teal-800">Status</Badge>
                            <Badge className="bg-calm-gray-100 text-calm-gray-800">Info</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Component Examples */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-calm-gray-900">Component Examples</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-calm-card shadow-calm-md border-calm-light">
                        <CardHeader>
                            <CardTitle className="text-calm-gray-900">Patient Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-calm-gray-600">John Doe</p>
                                <p className="text-calm-gray-500 text-sm">Last visit: 2 days ago</p>
                                <Badge className="bg-calm-100 text-calm-800">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-calm-card shadow-calm-md border-calm-light">
                        <CardHeader>
                            <CardTitle className="text-calm-gray-900">Appointment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-calm-gray-600">10:30 AM</p>
                                <p className="text-calm-gray-500 text-sm">Follow-up visit</p>
                                <Badge className="bg-calm-teal-100 text-calm-teal-800">Scheduled</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-calm-card shadow-calm-md border-calm-light">
                        <CardHeader>
                            <CardTitle className="text-calm-gray-900">Prescription</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-calm-gray-600">Medication A</p>
                                <p className="text-calm-gray-500 text-sm">30 day supply</p>
                                <Badge className="bg-calm-gray-100 text-calm-gray-800">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
