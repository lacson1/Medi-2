// Clinical Performance Main Page
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  TrendingUp,
  Stethoscope,
  Users,
  Download,
  RefreshCw
} from 'lucide-react';
import ClinicalPerformanceOverview from '@/components/analytics/ClinicalPerformanceOverview';
import PerformanceTrends from '@/components/analytics/PerformanceTrends';
import DiagnosisAnalysis from '@/components/analytics/DiagnosisAnalysis';
import StaffPerformance from '@/components/analytics/StaffPerformance';
import { pdfGenerator } from '@/utils/pdfGenerator';
import { clinicalDataAggregator } from '@/utils/dataAggregation';
import { mockApiClient } from "@/api/mockApiClient";

export default function ClinicalPerformance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [organizationId, setOrganizationId] = useState('test-org-001-agent-bluequee2');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleExportReport = async () => {
    setIsGeneratingReport(true);

    try {
      // Gather data from all components
      const [overview, trends, diagnosis, staff] = await Promise.all([
        clinicalDataAggregator.getClinicalOverview(organizationId, dateRange),
        clinicalDataAggregator.getPerformanceTrends(organizationId, '30days'),
        clinicalDataAggregator.getDiagnosisAnalysis(organizationId, dateRange),
        clinicalDataAggregator.getStaffPerformance(organizationId, dateRange)
      ]);

      // Get organization name
      const organizations = await mockApiClient.entities.Organization.list();
      const organization = organizations.find(org => org.id === organizationId);

      // Generate comprehensive PDF report
      const reportData = {
        organization: organization?.name || 'Unknown Organization',
        dateRange,
        overview,
        trends,
        diagnosis,
        staff
      };

      const pdf = await pdfGenerator.generateClinicalReport(reportData);

      // Download the PDF
      const filename = `Clinical_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfGenerator.downloadPDF(filename);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRefreshAll = () => {
    clinicalDataAggregator.clearCache();
    // Force refresh all components by changing a dependency
    setDateRange(prev => ({ ...prev }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinical Performance Analytics</h1>
          <p className="text-gray-600">Comprehensive clinical performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button
            onClick={handleExportReport}
            disabled={isGeneratingReport}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingReport ? 'Generating...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics Overview</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Analysis sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Real-time</div>
            <p className="text-xs text-muted-foreground">
              Data updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diagnosis Analysis</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dynamic</div>
            <p className="text-xs text-muted-foreground">
              Pattern detection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Performance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Individual</div>
            <p className="text-xs text-muted-foreground">
              Performance metrics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

        <TabsContent value="overview" className="mt-6">
          <ClinicalPerformanceOverview />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <PerformanceTrends />
        </TabsContent>

        <TabsContent value="diagnosis" className="mt-6">
          <DiagnosisAnalysis />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffPerformance />
        </TabsContent>
      </Tabs>

      {/* Report Generation Info */}
      <Card>
        <CardHeader>
          <CardTitle>{"Report Generation"}</CardTitle>
          <CardDescription>
            Generate comprehensive PDF reports combining all analytics sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Export Report Features</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Comprehensive PDF report including all four analytics sections</li>
                <li>• Cover page with executive summary and key metrics</li>
                <li>• Detailed charts and data tables for each section</li>
                <li>• Professional formatting with Bluequee2 branding</li>
                <li>• Real-time data aggregation from clinical systems</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Report Sections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <h5 className="font-semibold mb-1">Overview Section</h5>
                  <ul className="space-y-1">
                    <li>• Total encounters and appointments</li>
                    <li>• Average wait times</li>
                    <li>• Patient satisfaction scores</li>
                    <li>• Treatment success rates</li>
                    <li>• Top diagnoses summary</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Trends Section</h5>
                  <ul className="space-y-1">
                    <li>• Performance trends over time</li>
                    <li>• Period-over-period comparisons</li>
                    <li>• Trend analysis and insights</li>
                    <li>• Seasonal pattern identification</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Diagnosis Section</h5>
                  <ul className="space-y-1">
                    <li>• Diagnosis distribution charts</li>
                    <li>• Top diagnoses by frequency</li>
                    <li>• Demographic analysis</li>
                    <li>• Diagnosis trends over time</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Staff Section</h5>
                  <ul className="space-y-1">
                    <li>• Individual staff performance</li>
                    <li>• Productivity metrics</li>
                    <li>• Patient satisfaction by provider</li>
                    <li>• Performance comparisons</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center pt-4">
              <Button
                onClick={handleExportReport}
                disabled={isGeneratingReport}
                size="lg"
                className="min-w-48"
              >
                <Download className="h-5 w-5 mr-2" />
                {isGeneratingReport ? 'Generating Comprehensive Report...' : 'Generate Complete Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
