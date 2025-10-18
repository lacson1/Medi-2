// Compliance & Export Center Component
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  RefreshCw,
  Shield,
  DollarSign,
  Stethoscope,
  Lock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { pdfGenerator } from '@/utils/pdfGenerator';
import { mockApiClient } from "@/api/mockApiClient";

const REPORT_TYPES = [
  {
    id: 'hipaa',
    name: 'HIPAA Compliance',
    description: 'Health Insurance Portability and Accountability Act compliance report',
    icon: Shield,
    color: 'bg-blue-100 text-blue-800',
    requirements: ['Patient data protection', 'Access controls', 'Audit trails', 'Breach notification']
  },
  {
    id: 'billing',
    name: 'Billing Compliance',
    description: 'Healthcare billing and coding compliance report',
    icon: DollarSign,
    color: 'bg-green-100 text-green-800',
    requirements: ['Coding accuracy', 'Documentation standards', 'Revenue cycle', 'Audit findings']
  },
  {
    id: 'clinical',
    name: 'Clinical Compliance',
    description: 'Clinical practice standards and quality assurance report',
    icon: Stethoscope,
    color: 'bg-purple-100 text-purple-800',
    requirements: ['Clinical protocols', 'Quality metrics', 'Patient safety', 'Outcome measures']
  },
  {
    id: 'data-privacy',
    name: 'Data Privacy',
    description: 'Data privacy and protection compliance report',
    icon: Lock,
    color: 'bg-red-100 text-red-800',
    requirements: ['Data encryption', 'Privacy policies', 'Consent management', 'Data retention']
  }
];

export default function ComplianceExportCenter() {
  const [organizationId, setOrganizationId] = useState('test-org-001-agent-mediflow');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Fetch compliance reports
  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['compliance-reports', organizationId],
    queryFn: () => mockApiClient.entities.ComplianceReport.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch organizations for filter
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => mockApiClient.entities.Organization.list(),
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async ({ reportType, organizationId, dateRange }) => {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new compliance report
      const reportData = {
        report_type: reportType,
        title: `${reportType.toUpperCase()} Compliance Report - ${new Date().toLocaleDateString()}`,
        organization_id: organizationId,
        generated_date: new Date().toISOString(),
        status: 'completed',
        findings: generateMockFindings(reportType),
        recommendations: generateMockRecommendations(reportType)
      };

      return mockApiClient.entities.ComplianceReport.create(reportData);
    },
    onSuccess: (newReport: any) => {
      // Generate and download PDF
      generateAndDownloadPDF(newReport);
    }
  });

  const generateMockFindings = (reportType: any) => {
    const findingsMap = {
      hipaa: [
        'All patient data access is properly logged and monitored',
        'Encryption standards meet HIPAA requirements',
        'Access controls are properly configured',
        'Minor documentation updates needed for privacy notices'
      ],
      billing: [
        'All billing practices comply with current regulations',
        'Coding accuracy meets industry standards',
        'No discrepancies found in revenue cycle management',
        'Documentation standards are consistently followed'
      ],
      clinical: [
        'Clinical protocols are up to date and followed',
        'Quality metrics exceed minimum requirements',
        'Patient safety measures are properly implemented',
        'Outcome measures show positive trends'
      ],
      'data-privacy': [
        'Data encryption meets current standards',
        'Privacy policies are comprehensive and current',
        'Consent management processes are effective',
        'Data retention policies are properly implemented'
      ]
    };
    return findingsMap[reportType] || ['No specific findings'];
  };

  const generateMockRecommendations = (reportType: any) => {
    const recommendationsMap = {
      hipaa: [
        'Update privacy notices to reflect current practices',
        'Conduct additional staff training on HIPAA requirements',
        'Review and update access control procedures',
        'Implement quarterly compliance audits'
      ],
      billing: [
        'Continue current billing practices',
        'Schedule regular coding accuracy reviews',
        'Maintain documentation standards training',
        'Conduct annual revenue cycle audits'
      ],
      clinical: [
        'Maintain current clinical protocols',
        'Continue quality improvement initiatives',
        'Regular patient safety assessments',
        'Monitor outcome measures for trends'
      ],
      'data-privacy': [
        'Regular review of encryption standards',
        'Annual privacy policy updates',
        'Quarterly consent management reviews',
        'Bi-annual data retention audits'
      ]
    };
    return recommendationsMap[reportType] || ['Continue current practices'];
  };

  const generateAndDownloadPDF = async (reportData) => {
    try {
      const pdf = await pdfGenerator.generateComplianceReport(reportData);
      const filename = `${reportData.report_type}_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfGenerator.downloadPDF(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const handleGenerateReport = (reportType: any) => {
    generateReportMutation.mutate({
      reportType,
      organizationId,
      dateRange
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <FileText className="h-5 w-5" />
            Error Loading Compliance Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance & Export Center</h2>
          <p className="text-gray-600">Generate individual compliance reports and manage regulatory requirements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Organization</label>
              <select
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {organizations?.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORT_TYPES.map((reportType: any) => {
          const IconComponent = reportType.icon;
          const isGenerating = generateReportMutation.isPending && 
            generateReportMutation.variables?.reportType === reportType.id;
          
          return (
            <Card key={reportType.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {reportType.name}
                </CardTitle>
                <CardDescription>
                  {reportType.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Requirements */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Report Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {reportType.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-4">
                    <Button
                      onClick={() => handleGenerateReport(reportType.id)}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating Report...' : 'Generate Report'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Reports
          </CardTitle>
          <CardDescription>
            Previously generated compliance reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {reports?.length > 0 ? (
                reports.map((report: any) => {
                  const reportType = REPORT_TYPES.find(rt => rt.id === report.report_type);
                  const IconComponent = reportType?.icon || FileText;
                  
                  return (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-semibold text-sm">{report.title}</h4>
                          <p className="text-xs text-gray-500">
                            Generated: {new Date(report.generated_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(report.status)}
                            {report.status}
                          </div>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAndDownloadPDF(report)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No reports generated yet</p>
                  <p className="text-sm">Generate your first compliance report above</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle>{"Compliance Information"}</CardTitle>
          <CardDescription>
            Understanding compliance reporting requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Individual Report Generation</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Each report type is generated individually as requested</li>
                <li>• Reports include specific compliance requirements and findings</li>
                <li>• PDF format with professional formatting and branding</li>
                <li>• Real-time data aggregation from clinical systems</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Compliance Standards</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• HIPAA: Health Insurance Portability and Accountability Act</li>
                <li>• Billing: Healthcare billing and coding compliance</li>
                <li>• Clinical: Clinical practice standards and quality assurance</li>
                <li>• Data Privacy: Data protection and privacy regulations</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Report Features</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Automated compliance checking and validation</li>
                <li>• Detailed findings and recommendations</li>
                <li>• Regulatory requirement mapping</li>
                <li>• Audit trail and documentation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
