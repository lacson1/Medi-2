import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ProceduralReportsTest() {
    const [testResults, setTestResults] = React.useState([]);
    const [isRunning, setIsRunning] = React.useState(false);

    const runTests = async () => {
        setIsRunning(true);
        setTestResults([]);

        const tests = [];

        // Test 1: Check if ProceduralReport entity exists
        try {
            const { ProceduralReport } = await import('@/api/entities');
            if (ProceduralReport && typeof ProceduralReport.list === 'function') {
                tests.push({
                    test: 'ProceduralReport Entity Import',
                    status: 'pass',
                    message: 'ProceduralReport entity imported successfully with static methods'
                });
            } else {
                tests.push({
                    test: 'ProceduralReport Entity Import',
                    status: 'fail',
                    message: 'ProceduralReport entity missing or incomplete'
                });
            }
        } catch (error) {
            tests.push({
                test: 'ProceduralReport Entity Import',
                status: 'fail',
                message: `Import failed: ${error.message}`
            });
        }

        // Test 2: Test ProceduralReport.list() method
        try {
            const { ProceduralReport } = await import('@/api/entities');
            const reports = await ProceduralReport.list();
            if (Array.isArray(reports) && reports.length > 0) {
                tests.push({
                    test: 'ProceduralReport.list() Method',
                    status: 'pass',
                    message: `Successfully retrieved ${reports.length} procedural reports`
                });
            } else {
                tests.push({
                    test: 'ProceduralReport.list() Method',
                    status: 'warning',
                    message: 'ProceduralReport.list() returned empty array'
                });
            }
        } catch (error) {
            tests.push({
                test: 'ProceduralReport.list() Method',
                status: 'fail',
                message: `Method failed: ${error.message}`
            });
        }

        // Test 3: Test mockApiClient ProceduralReport
        try {
            const { mockApiClient } = await import('@/api/mockApiClient');
            if (mockApiClient.entities.ProceduralReport) {
                const reports = await mockApiClient.entities.ProceduralReport.list();
                tests.push({
                    test: 'Mock API Client ProceduralReport',
                    status: 'pass',
                    message: `Mock API client has ProceduralReport with ${reports.length} reports`
                });
            } else {
                tests.push({
                    test: 'Mock API Client ProceduralReport',
                    status: 'fail',
                    message: 'Mock API client missing ProceduralReport entity'
                });
            }
        } catch (error) {
            tests.push({
                test: 'Mock API Client ProceduralReport',
                status: 'fail',
                message: `Mock API test failed: ${error.message}`
            });
        }

        // Test 4: Test ProceduralReports component import
        try {
            const ProceduralReports = await import('@/pages/ProceduralReports');
            if (ProceduralReports.default) {
                tests.push({
                    test: 'ProceduralReports Component',
                    status: 'pass',
                    message: 'ProceduralReports component imported successfully'
                });
            } else {
                tests.push({
                    test: 'ProceduralReports Component',
                    status: 'fail',
                    message: 'ProceduralReports component not found'
                });
            }
        } catch (error) {
            tests.push({
                test: 'ProceduralReports Component',
                status: 'fail',
                message: `Component import failed: ${error.message}`
            });
        }

        setTestResults(tests);
        setIsRunning(false);
    };

    const getStatusIcon = (status) => {
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

    const getStatusColor = (status) => {
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
                    <CardTitle>Procedural Reports System Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Test the procedural reports functionality including entity imports,
                                API methods, and component loading.
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
                            <h3 className="font-semibold mb-3">Quick Actions:</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open('/procedural-reports', '_blank')}
                                >
                                    Open Procedural Reports Page
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.open('/test-intuitive-prescription', '_blank')}
                                >
                                    Test Intuitive Prescription
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
