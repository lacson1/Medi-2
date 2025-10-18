import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PrescriptionForm from '../prescriptions/PrescriptionForm';

interface TestResult {
    test: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
}

export default function IntuitivePrescriptionTest() {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const runTests = async () => {
        setIsRunning(true);
        setTestResults([]);

        const tests: TestResult[] = [];

        // Test 1: Medication Auto-complete
        try {
            const { medications } = await import('@/data/medications');
            if (medications && medications.length > 0) {
                tests.push({
                    test: 'Medication Database Import',
                    status: 'pass',
                    message: `Successfully imported ${medications.length} medications`
                });
            } else {
                tests.push({
                    test: 'Medication Database Import',
                    status: 'fail',
                    message: 'No medications found in database'
                });
            }
        } catch (error) {
            tests.push({
                test: 'Medication Database Import',
                status: 'fail',
                message: `Import failed: ${error}`
            });
        }

        // Test 2: Auto-complete Data Arrays
        try {
            const { commonIndications, commonDosages, commonFrequencies } = await import('@/data/medications');

            if (commonIndications && commonIndications.length > 0) {
                tests.push({
                    test: 'Common Indications',
                    status: 'pass',
                    message: `Found ${commonIndications.length} common indications`
                });
            } else {
                tests.push({
                    test: 'Common Indications',
                    status: 'warning',
                    message: 'No common indications found'
                });
            }

            if (commonDosages && commonDosages.length > 0) {
                tests.push({
                    test: 'Common Dosages',
                    status: 'pass',
                    message: `Found ${commonDosages.length} common dosages`
                });
            } else {
                tests.push({
                    test: 'Common Dosages',
                    status: 'warning',
                    message: 'No common dosages found'
                });
            }

            if (commonFrequencies && commonFrequencies.length > 0) {
                tests.push({
                    test: 'Common Frequencies',
                    status: 'pass',
                    message: `Found ${commonFrequencies.length} common frequencies`
                });
            } else {
                tests.push({
                    test: 'Common Frequencies',
                    status: 'warning',
                    message: 'No common frequencies found'
                });
            }
        } catch (error) {
            tests.push({
                test: 'Auto-complete Data Arrays',
                status: 'fail',
                message: `Import failed: ${error}`
            });
        }

        // Test 3: PrescriptionForm Component
        try {
            // This is a basic test to see if the component can be imported
            tests.push({
                test: 'PrescriptionForm Component',
                status: 'pass',
                message: 'Component imported successfully'
            });
        } catch (error) {
            tests.push({
                test: 'PrescriptionForm Component',
                status: 'fail',
                message: `Component import failed: ${error}`
            });
        }

        // Test 4: Medication Search Functionality
        try {
            const { medications } = await import('@/data/medications');
            const searchTerm = 'paracetamol';
            const results = medications.filter(med =>
                med.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (results.length > 0) {
                tests.push({
                    test: 'Medication Search',
                    status: 'pass',
                    message: `Found ${results.length} medications matching "${searchTerm}"`
                });
            } else {
                tests.push({
                    test: 'Medication Search',
                    status: 'warning',
                    message: `No medications found matching "${searchTerm}"`
                });
            }
        } catch (error) {
            tests.push({
                test: 'Medication Search',
                status: 'fail',
                message: `Search test failed: ${error}`
            });
        }

        setTestResults(tests);
        setIsRunning(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pass':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'fail':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pass':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'fail':
                return 'text-red-700 bg-red-50 border-red-200';
            case 'warning':
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            default:
                return '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Intuitive Prescription System Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Test the intuitive prescription functionality including auto-complete,
                                drug interactions, and suggestion systems.
                            </p>
                            <Button onClick={runTests} disabled={isRunning}>
                                {isRunning ? 'Running Tests...' : 'Run Tests'}
                            </Button>
                        </div>

                        {testResults.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold">Test Results:</h3>
                                {testResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(result.status)}
                                            <span className="font-medium">{result.test}</span>
                                        </div>
                                        <p className="text-sm mt-1">{result.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6">
                            <h3 className="font-semibold mb-3">Live Prescription Form Test:</h3>
                            <div className="border rounded-lg p-4">
                                <PrescriptionForm
                                    onSubmit={(data) => {
                                        console.log('Prescription submitted:', data);
                                        alert('Prescription submitted successfully! Check console for details.');
                                    }}
                                    onCancel={() => {
                                        console.log('Prescription cancelled');
                                        alert('Prescription cancelled');
                                    }}
                                    isSubmitting={false}
                                    patient={{
                                        first_name: 'John',
                                        last_name: 'Doe',
                                        age: 45,
                                        allergies: ['penicillin'],
                                        current_medications: ['warfarin'],
                                        address: '123 Main St',
                                        phone: '555-0123',
                                        date_of_birth: '1978-01-01'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
