import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Download, AlertTriangle, TestTube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PrintUtils from '@/utils/PrintUtils';

export default function PrintableLabOrderForm({ labOrder, patient, onPrint, onClose }: any) {
  const { user } = useAuth();
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    if (labOrder && patient && user) {
      // Prepare print data with organization branding
      const organizationData = {
        name: user.organization || 'Medical Practice',
        address: user.organization_address || '123 Medical Street, City, State 12345',
        phone: user.organization_phone || '(555) 123-4567',
        email: user.organization_email || 'info@medicalpractice.com',
        registrationNumber: user.organization_registration || 'REG-123456',
        logo: user.organization_logo || null
      };

      const doctorData = {
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Dr. [Name Required]',
        title: user.title || user.role || 'Medical Doctor',
        licenseNumber: user.license_number || 'MD-123456',
        specialization: user.specialization || 'General Practice',
        phone: user.phone || '(555) 123-4567',
        email: user.email || 'doctor@medicalpractice.com'
      };

      // Generate reference ranges based on test type
      const getReferenceRanges = (testName: any) => {
        const ranges = {
          'Complete Blood Count': {
            'Hemoglobin': '12.0-16.0 g/dL (F), 13.5-17.5 g/dL (M)',
            'Hematocrit': '36-46% (F), 41-53% (M)',
            'White Blood Cells': '4.5-11.0 x 10³/μL',
            'Platelets': '150-450 x 10³/μL'
          },
          'Basic Metabolic Panel': {
            'Glucose': '70-100 mg/dL (fasting)',
            'Creatinine': '0.6-1.2 mg/dL (F), 0.8-1.3 mg/dL (M)',
            'BUN': '7-20 mg/dL',
            'Sodium': '136-145 mEq/L',
            'Potassium': '3.5-5.0 mEq/L'
          },
          'Lipid Panel': {
            'Total Cholesterol': '<200 mg/dL',
            'LDL Cholesterol': '<100 mg/dL',
            'HDL Cholesterol': '>50 mg/dL (F), >40 mg/dL (M)',
            'Triglycerides': '<150 mg/dL'
          },
          'Thyroid Function': {
            'TSH': '0.4-4.0 mIU/L',
            'Free T4': '0.8-1.8 ng/dL',
            'Free T3': '2.3-4.2 pg/mL'
          },
          'Liver Function': {
            'ALT': '7-56 U/L (F), 10-40 U/L (M)',
            'AST': '10-40 U/L (F), 10-37 U/L (M)',
            'Bilirubin Total': '0.3-1.2 mg/dL',
            'Albumin': '3.5-5.0 g/dL'
          }
        };

        // Find matching test category
        for (const [category, tests] of Object.entries(ranges)) {
          if (testName.toLowerCase().includes(category.toLowerCase()) || 
              Object.keys(tests).some(test => testName.toLowerCase().includes(test.toLowerCase()))) {
            return tests;
          }
        }

        // Default ranges for common tests
        return {
          'General': 'See individual test ranges',
          'Note': 'Reference ranges may vary by laboratory'
        };
      };

      setPrintData({
        labOrder,
        patient,
        organization: organizationData,
        doctor: doctorData,
        printDate: new Date().toLocaleDateString(),
        labOrderId: labOrder.id || `LAB-${Date.now()}`,
        referenceRanges: getReferenceRanges(labOrder.test_name),
        validityPeriod: labOrder.priority === 'stat' ? '24 hours' : 
                       labOrder.priority === 'urgent' ? '48 hours' : '7 days'
      });
    }
  }, [labOrder, patient, user]);

  const handlePrint = () => {
    if (onPrint) {
      onPrint(printData);
    } else {
      PrintUtils.printLabOrder(printData);
    }
  };

  const handleDownload = () => {
    PrintUtils.downloadPDF(printData, 'laborder');
  };

  const generatePrintHTML = () => {
    if (!printData) return '';

    const { labOrder: orderData, patient, organization, doctor, referenceRanges, validityPeriod } = printData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lab Order - ${patient.first_name} ${patient.last_name}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .no-print { display: none !important; }
            .lab-order-form { max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #22c55e; padding-bottom: 15px; margin-bottom: 20px; }
            .organization-info { text-align: center; margin-bottom: 15px; }
          }
          body { font-family: Arial, sans-serif; line-height: 1.4; }
          .lab-order-form { max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #22c55e; }
          .header { border-bottom: 3px solid #22c55e; padding-bottom: 15px; margin-bottom: 20px; }
          .organization-info { text-align: center; margin-bottom: 15px; }
          .logo { max-height: 60px; margin-bottom: 10px; }
          .org-name { font-size: 24px; font-weight: bold; color: #22c55e; margin-bottom: 5px; }
          .org-details { font-size: 12px; color: #666; }
          .lab-symbol { font-size: 48px; color: #22c55e; text-align: center; margin: 20px 0; }
          .patient-section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #22c55e; border-bottom: 1px solid #22c55e; padding-bottom: 5px; margin-bottom: 10px; }
          .allergy-alert { background-color: #fef2f2; border: 2px solid #ef4444; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .allergy-text { color: #dc2626; font-weight: bold; }
          .test-details { margin: 20px 0; }
          .test-row { margin-bottom: 15px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 5px; }
          .priority-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .priority-stat { background-color: #dc2626; color: white; }
          .priority-urgent { background-color: #ea580c; color: white; }
          .priority-routine { background-color: #2563eb; color: white; }
          .priority-low { background-color: #6b7280; color: white; }
          .reference-ranges { margin: 20px 0; }
          .range-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .range-table th, .range-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          .range-table th { background-color: #f3f4f6; font-weight: bold; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; text-align: center; }
          .signature-line { border-bottom: 1px solid #000; margin-bottom: 5px; height: 30px; }
          .validity-info { margin-top: 20px; font-size: 12px; color: #666; }
          .sample-collection { margin: 20px 0; }
          .collection-instructions { background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 5px; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="lab-order-form">
          <!-- Header with Organization Branding -->
          <div class="header">
            <div class="organization-info">
              ${organization.logo ? `<img src="${organization.logo}" alt="Logo" class="logo">` : ''}
              <div class="org-name">${organization.name}</div>
              <div class="org-details">
                ${organization.address}<br>
                Phone: ${organization.phone} | Email: ${organization.email}<br>
                Registration: ${organization.registrationNumber}
              </div>
            </div>
          </div>

          <!-- Lab Symbol -->
          <div class="lab-symbol">🧪</div>

          <!-- Patient Information -->
          <div class="patient-section">
            <div class="section-title">PATIENT INFORMATION</div>
            <div><strong>Name:</strong> ${patient.first_name} ${patient.last_name}</div>
            <div><strong>DOB:</strong> ${patient.date_of_birth}</div>
            <div><strong>Age:</strong> ${patient.age || 'N/A'}</div>
            <div><strong>Gender:</strong> ${patient.gender}</div>
            <div><strong>Phone:</strong> ${patient.phone || 'N/A'}</div>
            <div><strong>Address:</strong> ${patient.address || 'N/A'}</div>
            <div><strong>Medical Record #:</strong> ${patient.id || 'N/A'}</div>
            ${patient.allergies && patient.allergies.length > 0 ? `
              <div class="allergy-alert">
                <div class="allergy-text">⚠️ ALLERGIES: ${patient.allergies.join(', ')}</div>
              </div>
            ` : ''}
          </div>

          <!-- Test Details -->
          <div class="test-details">
            <div class="section-title">LABORATORY ORDER DETAILS</div>
            <div class="test-row">
              <div><strong>Test Name:</strong> ${labOrder.test_name}</div>
              <div><strong>Test Category:</strong> ${labOrder.test_category || 'General'}</div>
              <div><strong>Test Code:</strong> ${labOrder.test_code || 'N/A'}</div>
              <div><strong>Priority:</strong> 
                <span class="priority-badge priority-${labOrder.priority}">${labOrder.priority.toUpperCase()}</span>
              </div>
              <div><strong>Clinical Indication:</strong> ${labOrder.clinical_indication || 'N/A'}</div>
              ${labOrder.special_instructions ? `<div><strong>Special Instructions:</strong> ${labOrder.special_instructions}</div>` : ''}
              <div><strong>Date Ordered:</strong> ${labOrder.date_ordered}</div>
              <div><strong>Due Date:</strong> ${labOrder.due_date || 'N/A'}</div>
            </div>
          </div>

          <!-- Sample Collection Instructions -->
          <div class="sample-collection">
            <div class="section-title">SAMPLE COLLECTION DETAILS</div>
            <div class="collection-instructions">
              <div><strong>Sample Type:</strong> ${getSampleType(labOrder.test_name)}</div>
              <div><strong>Collection Instructions:</strong> ${getCollectionInstructions(labOrder.test_name)}</div>
              <div><strong>Patient Preparation:</strong> ${getPatientPreparation(labOrder.test_name)}</div>
              <div><strong>Storage Requirements:</strong> ${getStorageRequirements(labOrder.test_name)}</div>
            </div>
          </div>

          <!-- Reference Ranges -->
          <div class="reference-ranges">
            <div class="section-title">REFERENCE RANGES</div>
            <table class="range-table">
              <thead>
                <tr>
                  <th>Test Parameter</th>
                  <th>Reference Range</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(referenceRanges).map(([test, range]) => `
                  <tr>
                    <td>${test}</td>
                    <td>${range.split('(')[0].trim()}</td>
                    <td>${range.includes('(') ? range.split('(')[1].replace(')', '') : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Doctor Information -->
          <div class="patient-section">
            <div class="section-title">ORDERING PHYSICIAN</div>
            <div><strong>Name:</strong> ${doctor.name}</div>
            <div><strong>Title:</strong> ${doctor.title}</div>
            <div><strong>License Number:</strong> ${doctor.licenseNumber}</div>
            <div><strong>Specialization:</strong> ${doctor.specialization}</div>
            <div><strong>Phone:</strong> ${doctor.phone}</div>
            <div><strong>Email:</strong> ${doctor.email}</div>
          </div>

          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Ordering Physician</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ${printData.printDate}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Lab Technician</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ___________</div>
            </div>
          </div>

          <!-- Validity Information -->
          <div class="validity-info">
            <div><strong>Lab Order ID:</strong> ${printData.labOrderId}</div>
            <div><strong>Order Valid For:</strong> ${validityPeriod}</div>
            <div><strong>Status:</strong> ${orderData.status || 'Ordered'}</div>
            ${orderData.workflow_notes ? `<div><strong>Workflow Notes:</strong> ${orderData.workflow_notes}</div>` : ''}
            ${orderData.estimated_completion ? `<div><strong>Estimated Completion:</strong> ${orderData.estimated_completion}</div>` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div>This lab order is valid only when signed by a licensed physician</div>
            <div>Results will be available within the specified timeframe</div>
            <div>Contact the laboratory for any questions regarding sample collection</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Helper functions for sample collection details
  const getSampleType = (testName: any) => {
    const test = testName.toLowerCase();
    if (test.includes('blood') || test.includes('cbc') || test.includes('metabolic')) return 'Blood';
    if (test.includes('urine')) return 'Urine';
    if (test.includes('stool')) return 'Stool';
    if (test.includes('culture')) return 'Swab/Culture';
    return 'Blood (Standard)';
  };

  const getCollectionInstructions = (testName: any) => {
    const test = testName.toLowerCase();
    if (test.includes('glucose') || test.includes('metabolic')) return 'Fasting required (8-12 hours)';
    if (test.includes('lipid')) return 'Fasting required (12-14 hours)';
    if (test.includes('urine')) return 'Clean catch midstream urine';
    return 'Standard collection procedures apply';
  };

  const getPatientPreparation = (testName: any) => {
    const test = testName.toLowerCase();
    if (test.includes('glucose') || test.includes('metabolic') || test.includes('lipid')) {
      return 'Patient should fast for specified duration before collection';
    }
    return 'No special preparation required';
  };

  const getStorageRequirements = (testName: any) => {
    const test = testName.toLowerCase();
    if (test.includes('culture')) return 'Room temperature, transport within 2 hours';
    if (test.includes('blood')) return 'Refrigerate if not processed within 4 hours';
    return 'Standard storage conditions';
  };

  if (!printData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading lab order data...</div>
        </CardContent>
      </Card>
    );
  }

  const { labOrder: orderData, patient: patientData, organization, doctor, referenceRanges, validityPeriod } = printData;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Print Controls */}
      <div className="no-print mb-4 flex gap-2 justify-end">
        <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
          <Printer className="w-4 h-4 mr-2" />
          Print Lab Order
        </Button>
        <Button onClick={handleDownload} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>

      {/* Lab Order Form */}
      <Card className="lab-order-form border-2 border-green-500">
        <CardContent className="p-8">
          {/* Header with Organization Branding */}
          <div className="header border-b-4 border-green-500 pb-4 mb-6">
            <div className="organization-info text-center mb-4">
              {organization.logo && (
                <img src={organization.logo} alt="Logo" className="logo mx-auto mb-3 max-h-16" />
              )}
              <div className="org-name text-2xl font-bold text-green-600 mb-2">
                {organization.name}
              </div>
              <div className="org-details text-sm text-gray-600">
                {organization.address}<br />
                Phone: {organization.phone} | Email: {organization.email}<br />
                Registration: {organization.registrationNumber}
              </div>
            </div>
          </div>

          {/* Lab Symbol */}
          <div className="lab-symbol text-5xl text-green-600 text-center my-8">
            🧪
          </div>

          {/* Patient Information */}
          <div className="patient-section mb-6">
            <div className="section-title font-bold text-green-600 border-b border-green-500 pb-2 mb-3">
              PATIENT INFORMATION
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {patientData.first_name} {patientData.last_name}</div>
              <div><strong>DOB:</strong> {patientData.date_of_birth}</div>
              <div><strong>Age:</strong> {patientData.age || 'N/A'}</div>
              <div><strong>Gender:</strong> {patientData.gender}</div>
              <div><strong>Phone:</strong> {patientData.phone || 'N/A'}</div>
              <div><strong>Address:</strong> {patientData.address || 'N/A'}</div>
              <div><strong>Medical Record #:</strong> {patientData.id || 'N/A'}</div>
            </div>
            
            {/* Allergy Alert */}
            {patientData.allergies && patientData.allergies.length > 0 && (
              <div className="allergy-alert bg-red-50 border-2 border-red-500 p-4 mt-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="allergy-text text-red-700 font-bold">
                    ⚠️ ALLERGIES: {patientData.allergies.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Details */}
          <div className="test-details mb-6">
            <div className="section-title font-bold text-green-600 border-b border-green-500 pb-2 mb-3">
              LABORATORY ORDER DETAILS
            </div>
            <div className="test-row border border-gray-300 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Test Name:</strong> {labOrder.test_name}</div>
                <div><strong>Test Category:</strong> {labOrder.test_category || 'General'}</div>
                <div><strong>Test Code:</strong> {labOrder.test_code || 'N/A'}</div>
                <div><strong>Priority:</strong> 
                  <Badge className={`ml-2 ${
                    labOrder.priority === 'stat' ? 'bg-red-600 text-white' :
                    labOrder.priority === 'urgent' ? 'bg-orange-600 text-white' :
                    labOrder.priority === 'routine' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {labOrder.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="col-span-2"><strong>Clinical Indication:</strong> {labOrder.clinical_indication || 'N/A'}</div>
                {labOrder.special_instructions && (
                  <div className="col-span-2"><strong>Special Instructions:</strong> {labOrder.special_instructions}</div>
                )}
                <div><strong>Date Ordered:</strong> {labOrder.date_ordered}</div>
                <div><strong>Due Date:</strong> {labOrder.due_date || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Sample Collection Instructions */}
          <div className="sample-collection mb-6">
            <div className="section-title font-bold text-green-600 border-b border-green-500 pb-2 mb-3">
              SAMPLE COLLECTION DETAILS
            </div>
            <div className="collection-instructions bg-blue-50 border border-blue-300 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Sample Type:</strong> {getSampleType(orderData.test_name)}</div>
                <div><strong>Collection Instructions:</strong> {getCollectionInstructions(orderData.test_name)}</div>
                <div><strong>Patient Preparation:</strong> {getPatientPreparation(orderData.test_name)}</div>
                <div><strong>Storage Requirements:</strong> {getStorageRequirements(orderData.test_name)}</div>
              </div>
            </div>
          </div>

          {/* Reference Ranges */}
          <div className="reference-ranges mb-6">
            <div className="section-title font-bold text-green-600 border-b border-green-500 pb-2 mb-3">
              REFERENCE RANGES
            </div>
            <div className="overflow-x-auto">
              <table className="range-table w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left font-semibold">Test Parameter</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">Reference Range</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(referenceRanges).map(([test, range]) => (
                    <tr key={test}>
                      <td className="border border-gray-300 p-2">{test}</td>
                      <td className="border border-gray-300 p-2">{range.split('(')[0].trim()}</td>
                      <td className="border border-gray-300 p-2">{range.includes('(') ? range.split('(')[1].replace(')', '') : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="patient-section mb-6">
            <div className="section-title font-bold text-green-600 border-b border-green-500 pb-2 mb-3">
              ORDERING PHYSICIAN
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {doctor.name}</div>
              <div><strong>Title:</strong> {doctor.title}</div>
              <div><strong>License Number:</strong> {doctor.licenseNumber}</div>
              <div><strong>Specialization:</strong> {doctor.specialization}</div>
              <div><strong>Phone:</strong> {doctor.phone}</div>
              <div><strong>Email:</strong> {doctor.email}</div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="signature-section mt-10 flex justify-between">
            <div className="signature-box w-48 text-center">
              <div className="signature-line border-b border-black mb-2 h-8"></div>
              <div className="font-semibold">Ordering Physician</div>
              <div className="text-xs mt-2">Date: {printData.printDate}</div>
            </div>
            <div className="signature-box w-48 text-center">
              <div className="signature-line border-b border-black mb-2 h-8"></div>
              <div className="font-semibold">Lab Technician</div>
              <div className="text-xs mt-2">Date: ___________</div>
            </div>
          </div>

          {/* Validity Information */}
          <div className="validity-info mt-6 text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Lab Order ID:</strong> {printData.labOrderId}</div>
              <div><strong>Order Valid For:</strong> {validityPeriod}</div>
              <div><strong>Status:</strong> {orderData.status || 'Ordered'}</div>
            </div>
            {orderData.workflow_notes && (
              <div className="mt-2"><strong>Workflow Notes:</strong> {orderData.workflow_notes}</div>
            )}
            {orderData.estimated_completion && (
              <div className="mt-2"><strong>Estimated Completion:</strong> {orderData.estimated_completion}</div>
            )}
          </div>

          {/* Footer */}
          <div className="footer mt-8 text-center text-xs text-gray-500">
            <div className="mb-2">This lab order is valid only when signed by a licensed physician</div>
            <div className="mb-2">Results will be available within the specified timeframe</div>
            <div>Contact the laboratory for any questions regarding sample collection</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
