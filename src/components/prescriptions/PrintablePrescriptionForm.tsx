import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Download, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PrintUtils from '@/utils/PrintUtils';

export default function PrintablePrescriptionForm({ prescription, patient, onPrint, onClose }: any) {
  const { user } = useAuth();
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    if (prescription && patient && user) {
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

      setPrintData({
        prescription,
        patient,
        organization: organizationData,
        doctor: doctorData,
        printDate: new Date().toLocaleDateString(),
        prescriptionId: prescription.id || `RX-${Date.now()}`
      });
    }
  }, [prescription, patient, user]);

  const handlePrint = () => {
    if (onPrint) {
      onPrint(printData);
    } else {
      PrintUtils.printPrescription(printData);
    }
  };

  const handleDownload = () => {
    PrintUtils.downloadPDF(printData, 'prescription');
  };

  const generatePrintHTML = () => {
    if (!printData) return '';

    const { prescription: rxData, patient, organization, doctor } = printData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patient.first_name} ${patient.last_name}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .no-print { display: none !important; }
            .prescription-form { max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #22c55e; padding-bottom: 15px; margin-bottom: 20px; }
            .organization-info { text-align: center; margin-bottom: 15px; }
          }
          body { font-family: Arial, sans-serif; line-height: 1.4; }
          .prescription-form { max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #22c55e; }
          .header { border-bottom: 3px solid #22c55e; padding-bottom: 15px; margin-bottom: 20px; }
          .organization-info { text-align: center; margin-bottom: 15px; }
          .logo { max-height: 60px; margin-bottom: 10px; }
          .org-name { font-size: 24px; font-weight: bold; color: #22c55e; margin-bottom: 5px; }
          .org-details { font-size: 12px; color: #666; }
          .rx-symbol { font-size: 48px; color: #22c55e; text-align: center; margin: 20px 0; }
          .patient-section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #22c55e; border-bottom: 1px solid #22c55e; padding-bottom: 5px; margin-bottom: 10px; }
          .allergy-alert { background-color: #fef2f2; border: 2px solid #ef4444; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .allergy-text { color: #dc2626; font-weight: bold; }
          .medication-details { margin: 20px 0; }
          .medication-row { margin-bottom: 15px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 5px; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; text-align: center; }
          .signature-line { border-bottom: 1px solid #000; margin-bottom: 5px; height: 30px; }
          .validity-info { margin-top: 20px; font-size: 12px; color: #666; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="prescription-form">
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

          <!-- Rx Symbol -->
          <div class="rx-symbol">℞</div>

          <!-- Patient Information -->
          <div class="patient-section">
            <div class="section-title">PATIENT INFORMATION</div>
            <div><strong>Name:</strong> ${patient.first_name} ${patient.last_name}</div>
            <div><strong>DOB:</strong> ${patient.date_of_birth}</div>
            <div><strong>Age:</strong> ${patient.age || 'N/A'}</div>
            <div><strong>Gender:</strong> ${patient.gender}</div>
            <div><strong>Phone:</strong> ${patient.phone || 'N/A'}</div>
            <div><strong>Address:</strong> ${patient.address || 'N/A'}</div>
            ${patient.allergies && patient.allergies.length > 0 ? `
              <div class="allergy-alert">
                <div class="allergy-text">⚠️ ALLERGIES: ${patient.allergies.join(', ')}</div>
              </div>
            ` : ''}
          </div>

          <!-- Medication Details -->
          <div class="medication-details">
            <div class="section-title">PRESCRIPTION DETAILS</div>
            <div class="medication-row">
              <div><strong>Medication:</strong> ${prescription.medication_name}</div>
              <div><strong>Dosage:</strong> ${prescription.dosage} ${prescription.dosage_unit || 'mg'}</div>
              <div><strong>Frequency:</strong> ${prescription.frequency} ${prescription.frequency_unit || 'daily'}</div>
              <div><strong>Route:</strong> ${prescription.route || 'oral'}</div>
              <div><strong>Quantity:</strong> ${prescription.quantity}</div>
              <div><strong>Refills:</strong> ${prescription.refills || 0}</div>
              <div><strong>Indication:</strong> ${prescription.indication || 'N/A'}</div>
              ${prescription.special_instructions ? `<div><strong>Special Instructions:</strong> ${prescription.special_instructions}</div>` : ''}
              ${prescription.notes ? `<div><strong>Notes:</strong> ${prescription.notes}</div>` : ''}
            </div>
          </div>

          <!-- Doctor Information -->
          <div class="patient-section">
            <div class="section-title">PRESCRIBING PHYSICIAN</div>
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
              <div>Doctor's Signature</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ${printData.printDate}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Pharmacist's Signature</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ___________</div>
            </div>
          </div>

          <!-- Validity Information -->
          <div class="validity-info">
            <div><strong>Prescription ID:</strong> ${printData.prescriptionId}</div>
            <div><strong>Valid Until:</strong> ${rxData.end_date || 'N/A'}</div>
            <div><strong>Start Date:</strong> ${rxData.start_date}</div>
            ${rxData.monitoring_required ? '<div><strong>Lab Monitoring Required:</strong> Yes</div>' : ''}
            ${rxData.lab_monitoring ? `<div><strong>Monitoring Details:</strong> ${rxData.lab_monitoring}</div>` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div>This prescription is valid only when signed by a licensed physician</div>
            <div>Keep this prescription in a safe place. Do not share with others.</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  if (!printData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading prescription data...</div>
        </CardContent>
      </Card>
    );
  }

  const { prescription: rxData, patient: patientData, organization, doctor } = printData;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Print Controls */}
      <div className="no-print mb-4 flex gap-2 justify-end">
        <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
          <Printer className="w-4 h-4 mr-2" />
          Print Prescription
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

      {/* Prescription Form */}
      <Card className="prescription-form border-2 border-green-500">
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

          {/* Rx Symbol */}
          <div className="rx-symbol text-5xl text-green-600 text-center my-8">
            ℞
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

          {/* Medication Details */}
          <div className="medication-details mb-6">
            <div className="section-title font-bold text-green-600 border-b border-green-500 pb-2 mb-3">
              PRESCRIPTION DETAILS
            </div>
            <div className="medication-row border border-gray-300 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Medication:</strong> {prescription.medication_name}</div>
                <div><strong>Dosage:</strong> {prescription.dosage} {prescription.dosage_unit || 'mg'}</div>
                <div><strong>Frequency:</strong> {prescription.frequency} {prescription.frequency_unit || 'daily'}</div>
                <div><strong>Route:</strong> {prescription.route || 'oral'}</div>
                <div><strong>Quantity:</strong> {prescription.quantity}</div>
                <div><strong>Refills:</strong> {prescription.refills || 0}</div>
                <div><strong>Indication:</strong> {prescription.indication || 'N/A'}</div>
                {prescription.special_instructions && (
                  <div className="col-span-2"><strong>Special Instructions:</strong> {prescription.special_instructions}</div>
                )}
                {prescription.notes && (
                  <div className="col-span-2"><strong>Notes:</strong> {prescription.notes}</div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="patient-section mb-6">
            <div className="section-title font-bold text-green-600 border-b border-green-500 pb-2 mb-3">
              PRESCRIBING PHYSICIAN
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
              <div className="font-semibold">Doctor's Signature</div>
              <div className="text-xs mt-2">Date: {printData.printDate}</div>
            </div>
            <div className="signature-box w-48 text-center">
              <div className="signature-line border-b border-black mb-2 h-8"></div>
              <div className="font-semibold">Pharmacist's Signature</div>
              <div className="text-xs mt-2">Date: ___________</div>
            </div>
          </div>

          {/* Validity Information */}
          <div className="validity-info mt-6 text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Prescription ID:</strong> {printData.prescriptionId}</div>
              <div><strong>Valid Until:</strong> {rxData.end_date || 'N/A'}</div>
              <div><strong>Start Date:</strong> {rxData.start_date}</div>
              {rxData.monitoring_required && (
                <div><strong>Lab Monitoring Required:</strong> Yes</div>
              )}
            </div>
            {rxData.lab_monitoring && (
              <div className="mt-2"><strong>Monitoring Details:</strong> {rxData.lab_monitoring}</div>
            )}
          </div>

          {/* Footer */}
          <div className="footer mt-8 text-center text-xs text-gray-500">
            <div className="mb-2">This prescription is valid only when signed by a licensed physician</div>
            <div>Keep this prescription in a safe place. Do not share with others.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
