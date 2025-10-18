import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, FileText, Calendar, User, TestTube, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function PrintableLabReport({ labOrder, labResults = [], patient, onPrint, onDownload }: any) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior - could generate PDF
      console.log('Download lab report');
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterpretationColor = (interpretation: any) => {
    switch (interpretation) {
      case 'normal': return 'text-green-600';
      case 'abnormal': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getInterpretationIcon = (interpretation: any) => {
    switch (interpretation) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'abnormal': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <div className="printable-lab-report">
      {/* Print Controls - Hidden in print */}
      <div className="print:hidden mb-6 flex justify-end gap-3">
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Report Content */}
      <div className="bg-white print:bg-white">
        {/* Header */}
        <div className="print:border-b print:border-gray-300 print:pb-4 print:mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 print:text-black">
              Laboratory Test Report
            </h1>
            <p className="text-sm text-gray-600 print:text-gray-800 mt-2">
              Generated on {format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}
            </p>
          </div>
        </div>

        {/* Patient Information */}
        <Card className="mb-6 print:border print:shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Patient Name</p>
                <p className="text-lg font-semibold">
                  {patient ? `${patient.first_name} ${patient.last_name}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                <p className="text-lg">
                  {patient?.date_of_birth ? format(parseISO(patient.date_of_birth), 'MMMM d, yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Patient ID</p>
                <p className="text-lg font-mono">{patient?.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-lg">{patient?.phone || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab Order Information */}
        {labOrder && (
          <Card className="mb-6 print:border print:shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TestTube className="w-5 h-5 text-blue-600" />
                Lab Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Order ID</p>
                  <p className="text-lg font-mono">{labOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Order Date</p>
                  <p className="text-lg">
                    {labOrder.date_ordered ? format(parseISO(labOrder.date_ordered), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge className={getStatusColor(labOrder.status)}>
                    {labOrder.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Priority</p>
                  <p className="text-lg">{labOrder.priority || 'Routine'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ordering Physician</p>
                  <p className="text-lg">{labOrder.ordering_physician || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Clinical Notes</p>
                  <p className="text-lg">{labOrder.clinical_notes || 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lab Results */}
        <Card className="print:border print:shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {labResults.length > 0 ? (
              <div className="space-y-4">
                {labResults.map((result, index) => (
                  <div key={result.id || index} className="border border-gray-200 rounded-lg p-4 print:border-gray-400">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{result.test_name}</h3>
                        <p className="text-sm text-gray-600">
                          Result Date: {result.result_date ? format(parseISO(result.result_date), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getInterpretationIcon(result.interpretation)}
                        <Badge className={getInterpretationColor(result.interpretation)}>
                          {result.interpretation?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Result Value</p>
                        <p className="text-xl font-bold text-gray-900">{result.result_value || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Reference Range</p>
                        <p className="text-lg text-gray-700">{result.reference_range || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Units</p>
                        <p className="text-lg text-gray-700">{result.units || 'N/A'}</p>
                      </div>
                    </div>

                    {result.performed_by && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-600">Performed By</p>
                        <p className="text-lg text-gray-700">{result.performed_by}</p>
                      </div>
                    )}

                    {result.notes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-600">Notes</p>
                        <p className="text-lg text-gray-700">{result.notes}</p>
                      </div>
                    )}

                    {result.has_attachment && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <FileText className="w-4 h-4" />
                        <span>Attachment available</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No results available for this lab order.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 print:border-gray-400">
          <div className="text-center text-sm text-gray-600 print:text-gray-800">
            <p>This report was generated electronically and is valid without signature.</p>
            <p className="mt-2">
              Report ID: {labOrder?.id || 'N/A'} | Generated: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .printable-lab-report {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .printable-lab-report h1 {
            font-size: 18px;
            margin-bottom: 8px;
          }
          
          .printable-lab-report h2 {
            font-size: 16px;
            margin-bottom: 6px;
          }
          
          .printable-lab-report h3 {
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .printable-lab-report p {
            margin-bottom: 4px;
          }
          
          .printable-lab-report .grid {
            display: grid;
            gap: 8px;
          }
          
          .printable-lab-report .space-y-4 > * + * {
            margin-top: 16px;
          }
          
          .printable-lab-report .space-y-3 > * + * {
            margin-top: 12px;
          }
          
          .printable-lab-report .space-y-2 > * + * {
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
}
