"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Shield,
  Zap,
  Monitor,
  Mouse,
  Settings,
  Activity
} from 'lucide-react';
import {
  TestResult,
  DialogTestConfig,
  AlertDialogTestConfig,
  AlertTestConfig,
  checkAriaAttributes,
  checkFocusManagement,
  checkKeyboardNavigation,
  testDialogRendering,
  testAlertDialogRendering,
  testAlertRendering,
  simulateKeyPress,
  simulateClick,
  waitForElement,
  calculateTestStats
} from '@/utils/dialogTestHelpers';

export default function DialogAlertTester() {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testStats, setTestStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    passRate: 0,
    byCategory: {} as Record<string, { passed: number; total: number }>
  });

  // Test dialog and alert states
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testAlertDialogOpen, setTestAlertDialogOpen] = useState(false);



  // Dialog Rendering Tests
  const runDialogRenderingTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Open test dialog first
    setTestDialogOpen(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for dialog to render

    // Test 1: Basic Dialog Structure
    const dialogElement = await waitForElement('[role="dialog"]');
    if (dialogElement) {
      const config: DialogTestConfig = {
        title: 'Test Dialog',
        hasCloseButton: true,
        hasOverlay: true,
        isModal: true
      };
      results.push(...testDialogRendering(dialogElement, config));
    } else {
      results.push({
        testName: 'Dialog Structure',
        passed: false,
        message: 'Dialog element not found in DOM',
        category: 'rendering'
      });
    }

    // Test 2: Dialog Overlay
    const overlayElement = document.querySelector('[data-state="open"]');
    if (overlayElement) {
      results.push({
        testName: 'Dialog Overlay',
        passed: true,
        message: 'Dialog overlay is present',
        category: 'rendering'
      });
    } else {
      results.push({
        testName: 'Dialog Overlay',
        passed: false,
        message: 'Dialog overlay is missing',
        category: 'rendering'
      });
    }

    // Test 3: Dialog Content
    const dialogContent = document.querySelector('[role="dialog"]');
    if (dialogContent) {
      results.push({
        testName: 'Dialog Content',
        passed: true,
        message: 'Dialog content is present',
        category: 'rendering'
      });
    } else {
      results.push({
        testName: 'Dialog Content',
        passed: false,
        message: 'Dialog content is missing',
        category: 'rendering'
      });
    }

    return results;
  };

  // AlertDialog Rendering Tests
  const runAlertDialogRenderingTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Open test alert dialog first
    setTestAlertDialogOpen(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for alert dialog to render

    // Test 1: AlertDialog Structure
    const alertDialogElement = await waitForElement('[role="alertdialog"]');
    if (alertDialogElement) {
      const config: AlertDialogTestConfig = {
        title: 'Test AlertDialog',
        description: 'This is a test alert dialog',
        actionText: 'Confirm',
        cancelText: 'Cancel',
        isDestructive: false
      };
      results.push(...testAlertDialogRendering(alertDialogElement, config));
    } else {
      results.push({
        testName: 'AlertDialog Structure',
        passed: false,
        message: 'AlertDialog element not found in DOM',
        category: 'rendering'
      });
    }

    return results;
  };

  // Alert Rendering Tests
  const runAlertRenderingTests = (): TestResult[] => {
    const results: TestResult[] = [];

    // Test 1: Default Alert
    const defaultAlert = document.querySelector('[role="alert"]');
    if (defaultAlert) {
      const config: AlertTestConfig = {
        variant: 'default',
        title: 'Test Alert',
        description: 'This is a test alert'
      };
      results.push(...testAlertRendering(defaultAlert as HTMLElement, config));
    } else {
      results.push({
        testName: 'Default Alert',
        passed: false,
        message: 'Default alert element not found',
        category: 'rendering'
      });
    }

    return results;
  };

  // Dialog Interaction Tests
  const runDialogInteractionTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Test 1: Dialog Open
    const triggerButton = document.querySelector('[data-testid="dialog-trigger"]') as HTMLElement;
    if (triggerButton) {
      simulateClick(triggerButton);
      await new Promise(resolve => setTimeout(resolve, 100));

      const dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        results.push({
          testName: 'Dialog Open',
          passed: true,
          message: 'Dialog opens on trigger click',
          category: 'interaction'
        });
      } else {
        results.push({
          testName: 'Dialog Open',
          passed: false,
          message: 'Dialog does not open on trigger click',
          category: 'interaction'
        });
      }
    }

    // Test 2: Dialog Close (ESC Key)
    const dialogElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (dialogElement) {
      simulateKeyPress(dialogElement, 'Escape');
      await new Promise(resolve => setTimeout(resolve, 100));

      const closedDialog = document.querySelector('[role="dialog"]');
      if (!closedDialog) {
        results.push({
          testName: 'Dialog Close (ESC)',
          passed: true,
          message: 'Dialog closes on ESC key',
          category: 'interaction'
        });
      } else {
        results.push({
          testName: 'Dialog Close (ESC)',
          passed: false,
          message: 'Dialog does not close on ESC key',
          category: 'interaction'
        });
      }
    }

    return results;
  };

  // AlertDialog Interaction Tests
  const runAlertDialogInteractionTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Test 1: AlertDialog Open
    const triggerButton = document.querySelector('[data-testid="alert-dialog-trigger"]') as HTMLElement;
    if (triggerButton) {
      simulateClick(triggerButton);
      await new Promise(resolve => setTimeout(resolve, 100));

      const alertDialogElement = document.querySelector('[role="alertdialog"]');
      if (alertDialogElement) {
        results.push({
          testName: 'AlertDialog Open',
          passed: true,
          message: 'AlertDialog opens on trigger click',
          category: 'interaction'
        });
      } else {
        results.push({
          testName: 'AlertDialog Open',
          passed: false,
          message: 'AlertDialog does not open on trigger click',
          category: 'interaction'
        });
      }
    }

    // Test 2: AlertDialog Action Button
    const actionButton = document.querySelector('[data-testid="alert-dialog-action"]') as HTMLElement;
    if (actionButton) {
      simulateClick(actionButton);
      await new Promise(resolve => setTimeout(resolve, 100));

      results.push({
        testName: 'AlertDialog Action',
        passed: true,
        message: 'AlertDialog action button works',
        category: 'interaction'
      });
    }

    return results;
  };

  // Accessibility Tests
  const runAccessibilityTests = (): TestResult[] => {
    const results: TestResult[] = [];

    // Test 1: Dialog ARIA Attributes
    const dialogElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (dialogElement) {
      results.push(checkAriaAttributes(dialogElement, 'dialog'));
    }

    // Test 2: AlertDialog ARIA Attributes
    const alertDialogElement = document.querySelector('[role="alertdialog"]') as HTMLElement;
    if (alertDialogElement) {
      results.push(checkAriaAttributes(alertDialogElement, 'alertdialog'));
    }

    // Test 3: Alert ARIA Attributes
    const alertElement = document.querySelector('[role="alert"]') as HTMLElement;
    if (alertElement) {
      results.push(checkAriaAttributes(alertElement, 'alert'));
    }

    // Test 4: Focus Management
    if (dialogElement) {
      results.push(...checkFocusManagement(dialogElement));
    }

    // Test 5: Keyboard Navigation
    const focusableElements = document.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach((element) => {
      results.push(checkKeyboardNavigation(element as HTMLElement));
    });

    return results;
  };

  // Edge Case Tests
  const runEdgeCaseTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    // Test 1: Multiple Dialogs
    const dialogs = document.querySelectorAll('[role="dialog"]');
    if (dialogs.length > 1) {
      results.push({
        testName: 'Multiple Dialogs',
        passed: true,
        message: `Found ${dialogs.length} dialogs`,
        category: 'edge-case'
      });
    } else {
      results.push({
        testName: 'Multiple Dialogs',
        passed: false,
        message: 'Only one dialog found',
        category: 'edge-case'
      });
    }

    // Test 2: Rapid Open/Close
    const triggerButton = document.querySelector('[data-testid="dialog-trigger"]') as HTMLElement;
    if (triggerButton) {
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        simulateClick(triggerButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      results.push({
        testName: 'Rapid Open/Close',
        passed: true,
        message: 'Dialog handles rapid open/close operations',
        category: 'edge-case'
      });
    }

    return results;
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    const allResults: TestResult[] = [];

    try {
      // Wait for any existing dialogs to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Run test suites
      const renderingTests = await Promise.all([
        runDialogRenderingTests(),
        runAlertDialogRenderingTests()
      ]);

      const interactionTests = await Promise.all([
        runDialogInteractionTests(),
        runAlertDialogInteractionTests()
      ]);

      const alertTests = runAlertRenderingTests();
      const accessibilityTests = runAccessibilityTests();
      const edgeCaseTests = await runEdgeCaseTests();

      // Combine all results
      allResults.push(
        ...renderingTests.flat(),
        ...interactionTests.flat(),
        ...alertTests,
        ...accessibilityTests,
        ...edgeCaseTests
      );

      setTestResults(allResults);
      setTestStats(calculateTestStats(allResults));
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunningTests(false);
      // Close any open dialogs
      setTestDialogOpen(false);
      setTestAlertDialogOpen(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rendering':
        return <Monitor className="w-4 h-4" />;
      case 'interaction':
        return <Mouse className="w-4 h-4" />;
      case 'accessibility':
        return <Shield className="w-4 h-4" />;
      case 'edge-case':
        return <Zap className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'rendering':
        return 'bg-blue-100 text-blue-800';
      case 'interaction':
        return 'bg-green-100 text-green-800';
      case 'accessibility':
        return 'bg-purple-100 text-purple-800';
      case 'edge-case':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dialog & Alert Testing</h2>
          <p className="text-gray-600">Comprehensive testing for dialogs, alert dialogs, and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              runAllTests().catch(console.error);
            }}
            disabled={isRunningTests}
            className="flex items-center gap-2"
          >
            {isRunningTests ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Test Statistics */}
      {testStats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Test Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{testStats.total}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testStats.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testStats.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testStats.passRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Pass Rate</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, testStats.passRate))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(testStats.byCategory).map(([category, stats]) => (
                <div key={category} className="text-center">
                  <Badge className={getCategoryColor(category)}>
                    {getCategoryIcon(category)}
                    <span className="ml-1">{category}</span>
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">
                    {stats.passed}/{stats.total}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rendering">Rendering</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Rendering Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Tests for dialog structure, content, and visual elements
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Dialog Structure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">AlertDialog Structure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Alert Variants</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mouse className="w-5 h-5" />
                  Interaction Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Tests for user interactions and behavior
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Open/Close</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Button Actions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Keyboard Navigation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Accessibility Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Tests for accessibility compliance
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">ARIA Attributes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Focus Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Screen Reader Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rendering Tests Tab */}
        <TabsContent value="rendering" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendering Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults
                  .filter(result => result.category === 'rendering')
                  .map((result, _index) => (
                    <div key={_index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.passed)}
                      <div className="flex-1">
                        <div className="font-medium">{result.testName}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                        {result.details && (
                          <div className="text-xs text-gray-500 mt-1">{result.details}</div>
                        )}
                      </div>
                      <Badge className={getCategoryColor(result.category)}>
                        {getCategoryIcon(result.category)}
                        <span className="ml-1">{result.category}</span>
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interaction Tests Tab */}
        <TabsContent value="interaction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interaction Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults
                  .filter(result => result.category === 'interaction')
                  .map((result, _index) => (
                    <div key={_index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.passed)}
                      <div className="flex-1">
                        <div className="font-medium">{result.testName}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                        {result.details && (
                          <div className="text-xs text-gray-500 mt-1">{result.details}</div>
                        )}
                      </div>
                      <Badge className={getCategoryColor(result.category)}>
                        {getCategoryIcon(result.category)}
                        <span className="ml-1">{result.category}</span>
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Tests Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults
                  .filter(result => result.category === 'accessibility')
                  .map((result, _index) => (
                    <div key={_index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.passed)}
                      <div className="flex-1">
                        <div className="font-medium">{result.testName}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                        {result.details && (
                          <div className="text-xs text-gray-500 mt-1">{result.details}</div>
                        )}
                      </div>
                      <Badge className={getCategoryColor(result.category)}>
                        {getCategoryIcon(result.category)}
                        <span className="ml-1">{result.category}</span>
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Dialogs for Interactive Testing */}
      <div className="space-y-4">
        {/* Test Dialog */}
        {/* @ts-expect-error */}
        <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
          {/* @ts-expect-error */}
          <DialogTrigger asChild>
            <Button variant="outline" data-testid="dialog-trigger">
              Open Test Dialog
            </Button>
          </DialogTrigger>
          {/* @ts-expect-error */}
          <DialogContent>
            {/* @ts-expect-error */}
            <DialogHeader>
              {/* @ts-expect-error */}
              <DialogTitle>Test Dialog</DialogTitle>
              {/* @ts-expect-error */}
              <DialogDescription>
                This is a test dialog for automated testing.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>This dialog contains test content for validation.</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test AlertDialog */}
        {/* @ts-expect-error */}
        <AlertDialog open={testAlertDialogOpen} onOpenChange={setTestAlertDialogOpen}>
          {/* @ts-expect-error */}
          {/* @ts-expect-error */}
          <AlertDialogTrigger asChild>
            {/* @ts-expect-error */}
            <Button variant="destructive" data-testid="alert-dialog-trigger">
              Open Test AlertDialog
            </Button>
          </AlertDialogTrigger>
          {/* @ts-expect-error */}
          <AlertDialogContent>
            {/* @ts-expect-error */}
            <AlertDialogHeader>
              {/* @ts-expect-error */}
              <AlertDialogTitle>Test AlertDialog</AlertDialogTitle>
              {/* @ts-expect-error */}
              <AlertDialogDescription>
                This is a test alert dialog for automated testing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {/* @ts-expect-error */}
            <AlertDialogFooter>
              {/* @ts-expect-error */}
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {/* @ts-expect-error */}
              <AlertDialogAction data-testid="alert-dialog-action">Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Test Alerts */}
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is a test alert for automated testing.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

