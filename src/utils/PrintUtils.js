/**
 * Utility functions for printing medical forms
 */
export class PrintUtils {
    /**
     * Print a prescription form
     * @param {Object} prescriptionData - The prescription data to print
     */
    static printPrescription(prescriptionData) {
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert('Please allow popups to print prescriptions');
            return;
        }

        const html = this.generatePrescriptionHTML(prescriptionData);
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();

            // Close window after printing
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        };
    }

    /**
     * Print a lab order form
     * @param {Object} labOrderData - The lab order data to print
     */
    static printLabOrder(labOrderData) {
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert('Please allow popups to print lab orders');
            return;
        }

        const html = this.generateLabOrderHTML(labOrderData);
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();

            // Close window after printing
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        };
    }

    /**
     * Generate HTML for prescription printing
     * @param {Object} data - Prescription data
     * @returns {string} HTML string
     */
    static generatePrescriptionHTML(data) {
            const { prescription, patient, organization, doctor, printDate, prescriptionId } = data;

            return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patient.first_name} ${patient.last_name}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .no-print { display: none !important; }
            .prescription-form { max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #22c55e; padding-bottom: 15px; margin-bottom: 20px; }
            .organization-info { text-align: center; margin-bottom: 15px; }
          }
          body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; }
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
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .grid-2 div { margin-bottom: 5px; }
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
            <div class="grid-2">
              <div><strong>Name:</strong> ${patient.first_name} ${patient.last_name}</div>
              <div><strong>DOB:</strong> ${patient.date_of_birth}</div>
              <div><strong>Age:</strong> ${patient.age || 'N/A'}</div>
              <div><strong>Gender:</strong> ${patient.gender}</div>
              <div><strong>Phone:</strong> ${patient.phone || 'N/A'}</div>
              <div><strong>Address:</strong> ${patient.address || 'N/A'}</div>
            </div>
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
              <div class="grid-2">
                <div><strong>Medication:</strong> ${prescription.medication_name}</div>
                <div><strong>Dosage:</strong> ${prescription.dosage} ${prescription.dosage_unit || 'mg'}</div>
                <div><strong>Frequency:</strong> ${prescription.frequency} ${prescription.frequency_unit || 'daily'}</div>
                <div><strong>Route:</strong> ${prescription.route || 'oral'}</div>
                <div><strong>Quantity:</strong> ${prescription.quantity}</div>
                <div><strong>Refills:</strong> ${prescription.refills || 0}</div>
                <div><strong>Indication:</strong> ${prescription.indication || 'N/A'}</div>
              </div>
              ${prescription.special_instructions ? `<div style="margin-top: 10px;"><strong>Special Instructions:</strong> ${prescription.special_instructions}</div>` : ''}
              ${prescription.notes ? `<div style="margin-top: 10px;"><strong>Notes:</strong> ${prescription.notes}</div>` : ''}
            </div>
          </div>

          <!-- Doctor Information -->
          <div class="patient-section">
            <div class="section-title">PRESCRIBING PHYSICIAN</div>
            <div class="grid-2">
              <div><strong>Name:</strong> ${doctor.name}</div>
              <div><strong>Title:</strong> ${doctor.title}</div>
              <div><strong>License Number:</strong> ${doctor.licenseNumber}</div>
              <div><strong>Specialization:</strong> ${doctor.specialization}</div>
              <div><strong>Phone:</strong> ${doctor.phone}</div>
              <div><strong>Email:</strong> ${doctor.email}</div>
            </div>
          </div>

          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Doctor's Signature</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ${printDate}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Pharmacist's Signature</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ___________</div>
            </div>
          </div>

          <!-- Validity Information -->
          <div class="validity-info">
            <div><strong>Prescription ID:</strong> ${prescriptionId}</div>
            <div><strong>Valid Until:</strong> ${prescription.end_date || 'N/A'}</div>
            <div><strong>Start Date:</strong> ${prescription.start_date}</div>
            ${prescription.monitoring_required ? '<div><strong>Lab Monitoring Required:</strong> Yes</div>' : ''}
            ${prescription.lab_monitoring ? `<div><strong>Monitoring Details:</strong> ${prescription.lab_monitoring}</div>` : ''}
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
  }

  /**
   * Generate HTML for lab order printing
   * @param {Object} data - Lab order data
   * @returns {string} HTML string
   */
  static generateLabOrderHTML(data) {
    const { labOrder, patient, organization, doctor, referenceRanges, validityPeriod, printDate, labOrderId } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lab Order - ${patient.first_name} ${patient.last_name}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .no-print { display: none !important; }
            .lab-order-form { max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #22c55e; padding-bottom: 15px; margin-bottom: 20px; }
            .organization-info { text-align: center; margin-bottom: 15px; }
          }
          body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; }
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
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .grid-2 div { margin-bottom: 5px; }
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
            <div class="grid-2">
              <div><strong>Name:</strong> ${patient.first_name} ${patient.last_name}</div>
              <div><strong>DOB:</strong> ${patient.date_of_birth}</div>
              <div><strong>Age:</strong> ${patient.age || 'N/A'}</div>
              <div><strong>Gender:</strong> ${patient.gender}</div>
              <div><strong>Phone:</strong> ${patient.phone || 'N/A'}</div>
              <div><strong>Address:</strong> ${patient.address || 'N/A'}</div>
              <div><strong>Medical Record #:</strong> ${patient.id || 'N/A'}</div>
            </div>
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
              <div class="grid-2">
                <div><strong>Test Name:</strong> ${labOrder.test_name}</div>
                <div><strong>Test Category:</strong> ${labOrder.test_category || 'General'}</div>
                <div><strong>Test Code:</strong> ${labOrder.test_code || 'N/A'}</div>
                <div><strong>Priority:</strong> 
                  <span class="priority-badge priority-${labOrder.priority}">${labOrder.priority.toUpperCase()}</span>
                </div>
                <div><strong>Date Ordered:</strong> ${labOrder.date_ordered}</div>
                <div><strong>Due Date:</strong> ${labOrder.due_date || 'N/A'}</div>
              </div>
              <div style="margin-top: 10px;"><strong>Clinical Indication:</strong> ${labOrder.clinical_indication || 'N/A'}</div>
              ${labOrder.special_instructions ? `<div style="margin-top: 10px;"><strong>Special Instructions:</strong> ${labOrder.special_instructions}</div>` : ''}
            </div>
          </div>

          <!-- Sample Collection Instructions -->
          <div class="sample-collection">
            <div class="section-title">SAMPLE COLLECTION DETAILS</div>
            <div class="collection-instructions">
              <div class="grid-2">
                <div><strong>Sample Type:</strong> ${this.getSampleType(labOrder.test_name)}</div>
                <div><strong>Collection Instructions:</strong> ${this.getCollectionInstructions(labOrder.test_name)}</div>
                <div><strong>Patient Preparation:</strong> ${this.getPatientPreparation(labOrder.test_name)}</div>
                <div><strong>Storage Requirements:</strong> ${this.getStorageRequirements(labOrder.test_name)}</div>
              </div>
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
            <div class="grid-2">
              <div><strong>Name:</strong> ${doctor.name}</div>
              <div><strong>Title:</strong> ${doctor.title}</div>
              <div><strong>License Number:</strong> ${doctor.licenseNumber}</div>
              <div><strong>Specialization:</strong> ${doctor.specialization}</div>
              <div><strong>Phone:</strong> ${doctor.phone}</div>
              <div><strong>Email:</strong> ${doctor.email}</div>
            </div>
          </div>

          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Ordering Physician</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ${printDate}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Lab Technician</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ___________</div>
            </div>
          </div>

          <!-- Validity Information -->
          <div class="validity-info">
            <div><strong>Lab Order ID:</strong> ${labOrderId}</div>
            <div><strong>Order Valid For:</strong> ${validityPeriod}</div>
            <div><strong>Status:</strong> ${labOrder.status || 'Ordered'}</div>
            ${labOrder.workflow_notes ? `<div><strong>Workflow Notes:</strong> ${labOrder.workflow_notes}</div>` : ''}
            ${labOrder.estimated_completion ? `<div><strong>Estimated Completion:</strong> ${labOrder.estimated_completion}</div>` : ''}
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
  }

  /**
   * Get sample type based on test name
   * @param {string} testName - The test name
   * @returns {string} Sample type
   */
  static getSampleType(testName) {
    const test = testName.toLowerCase();
    if (test.includes('blood') || test.includes('cbc') || test.includes('metabolic')) return 'Blood';
    if (test.includes('urine')) return 'Urine';
    if (test.includes('stool')) return 'Stool';
    if (test.includes('culture')) return 'Swab/Culture';
    return 'Blood (Standard)';
  }

  /**
   * Get collection instructions based on test name
   * @param {string} testName - The test name
   * @returns {string} Collection instructions
   */
  static getCollectionInstructions(testName) {
    const test = testName.toLowerCase();
    if (test.includes('glucose') || test.includes('metabolic')) return 'Fasting required (8-12 hours)';
    if (test.includes('lipid')) return 'Fasting required (12-14 hours)';
    if (test.includes('urine')) return 'Clean catch midstream urine';
    return 'Standard collection procedures apply';
  }

  /**
   * Get patient preparation based on test name
   * @param {string} testName - The test name
   * @returns {string} Patient preparation
   */
  static getPatientPreparation(testName) {
    const test = testName.toLowerCase();
    if (test.includes('glucose') || test.includes('metabolic') || test.includes('lipid')) {
      return 'Patient should fast for specified duration before collection';
    }
    return 'No special preparation required';
  }

  /**
   * Get storage requirements based on test name
   * @param {string} testName - The test name
   * @returns {string} Storage requirements
   */
  static getStorageRequirements(testName) {
    const test = testName.toLowerCase();
    if (test.includes('culture')) return 'Room temperature, transport within 2 hours';
    if (test.includes('blood')) return 'Refrigerate if not processed within 4 hours';
    return 'Standard storage conditions';
  }

  /**
   * Download form as PDF (requires browser PDF support)
   * @param {Object} data - Form data
   * @param {string} type - 'prescription' or 'laborder'
   */
  static downloadPDF(data, type) {
    const html = type === 'prescription' ? 
      this.generatePrescriptionHTML(data) : 
      this.generateLabOrderHTML(data);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Trigger print dialog which can be saved as PDF
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export default PrintUtils;