// PDF Generator Utility for Clinical Performance Reports
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF Generator for Clinical Performance Reports
 */
export class ClinicalReportPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = 0;
        this.lineHeight = 7;
    }

    /**
     * Generate comprehensive clinical performance report
     */
    async generateClinicalReport(data) {
        this.doc = new jsPDF();
        this.currentY = this.margin;

        // Cover page
        await this.addCoverPage(data);

        // Overview section
        await this.addOverviewSection(data.overview);

        // Performance Trends section
        await this.addTrendsSection(data.trends);

        // Diagnosis Analysis section
        await this.addDiagnosisSection(data.diagnosis);

        // Staff Performance section
        await this.addStaffPerformanceSection(data.staff);

        // Footer
        this.addFooter();

        return this.doc;
    }

    /**
     * Generate individual compliance report
     */
    async generateComplianceReport(reportData) {
        this.doc = new jsPDF();
        this.currentY = this.margin;

        // Header
        this.addHeader(reportData.title);

        // Report content
        this.addReportContent(reportData);

        // Footer
        this.addFooter();

        return this.doc;
    }

    /**
     * Add cover page
     */
    async addCoverPage(data) {
        // Title
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Clinical Performance Report', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 20;

        // Subtitle
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Bluequee2 Healthcare System', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 30;

        // Report details
        this.doc.setFontSize(12);
        const reportDate = new Date().toLocaleDateString();
        const reportTime = new Date().toLocaleTimeString();

        this.doc.text(`Report Generated: ${reportDate} at ${reportTime}`, this.margin, this.currentY);
        this.currentY += 10;

        if (data.organization) {
            this.doc.text(`Organization: ${data.organization}`, this.margin, this.currentY);
            this.currentY += 10;
        }

        if (data.dateRange) {
            this.doc.text(`Period: ${data.dateRange.start} to ${data.dateRange.end}`, this.margin, this.currentY);
            this.currentY += 10;
        }

        // Summary stats
        this.currentY += 20;
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Executive Summary', this.margin, this.currentY);
        this.currentY += 15;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');

        if (data.overview) {
            this.doc.text(`• Total Encounters: ${data.overview.totalEncounters || 'N/A'}`, this.margin, this.currentY);
            this.currentY += 6;
            this.doc.text(`• Average Wait Time: ${data.overview.avgWaitTime ? data.overview.avgWaitTime.toFixed(1) + ' minutes' : 'N/A'}`, this.margin, this.currentY);
            this.currentY += 6;
            this.doc.text(`• Patient Satisfaction: ${data.overview.patientSatisfaction ? data.overview.patientSatisfaction.toFixed(1) + '/5.0' : 'N/A'}`, this.margin, this.currentY);
            this.currentY += 6;
            this.doc.text(`• Treatment Success Rate: ${data.overview.treatmentSuccessRate ? (data.overview.treatmentSuccessRate * 100).toFixed(1) + '%' : 'N/A'}`, this.margin, this.currentY);
        }

        // Add new page for content
        this.doc.addPage();
        this.currentY = this.margin;
    }

    /**
     * Add overview section
     */
    async addOverviewSection(overview) {
        this.addSectionHeader('Clinical Performance Overview');

        if (!overview) {
            this.doc.text('No overview data available', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        // Key metrics table
        const metrics = [
            ['Metric', 'Value'],
            ['Total Encounters', overview.totalEncounters || 'N/A'],
            ['Total Patients', overview.totalPatients || 'N/A'],
            ['Total Appointments', overview.totalAppointments || 'N/A'],
            ['Average Wait Time', overview.avgWaitTime ? `${overview.avgWaitTime.toFixed(1)} minutes` : 'N/A'],
            ['Patient Satisfaction', overview.patientSatisfaction ? `${overview.patientSatisfaction.toFixed(1)}/5.0` : 'N/A'],
            ['Treatment Success Rate', overview.treatmentSuccessRate ? `${(overview.treatmentSuccessRate * 100).toFixed(1)}%` : 'N/A']
        ];

        this.addTable(metrics);

        // Top diagnoses
        if (overview.topDiagnoses && overview.topDiagnoses.length > 0) {
            this.currentY += 10;
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Top Diagnoses', this.margin, this.currentY);
            this.currentY += 8;

            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            overview.topDiagnoses.slice(0, 5).forEach((diagnosis, index) => {
                this.doc.text(`${index + 1}. ${diagnosis.diagnosis} (${diagnosis.count} cases)`, this.margin + 10, this.currentY);
                this.currentY += 6;
            });
        }

        this.currentY += 20;
    }

    /**
     * Add trends section
     */
    async addTrendsSection(trends) {
        this.addSectionHeader('Performance Trends');

        if (!trends || trends.length === 0) {
            this.doc.text('No trends data available', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        // Trends table
        const trendsTable = [
            ['Period', 'Encounters', 'Avg Wait Time', 'Satisfaction', 'Success Rate']
        ];

        trends.forEach(trend => {
            trendsTable.push([
                trend.period,
                trend.encounters?.length || 'N/A',
                trend.avgWaitTime ? `${trend.avgWaitTime.toFixed(1)} min` : 'N/A',
                trend.satisfaction ? `${trend.satisfaction.toFixed(1)}/5.0` : 'N/A',
                trend.successRate ? `${(trend.successRate * 100).toFixed(1)}%` : 'N/A'
            ]);
        });

        this.addTable(trendsTable);
        this.currentY += 20;
    }

    /**
     * Add diagnosis analysis section
     */
    async addDiagnosisSection(diagnosis) {
        this.addSectionHeader('Diagnosis Analysis');

        if (!diagnosis) {
            this.doc.text('No diagnosis data available', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        // Diagnosis distribution
        if (diagnosis.distribution && diagnosis.distribution.length > 0) {
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Diagnosis Distribution', this.margin, this.currentY);
            this.currentY += 8;

            const distTable = [
                ['Diagnosis', 'Count', 'Percentage']
            ];

            diagnosis.distribution.slice(0, 10).forEach(item => {
                distTable.push([
                    item.diagnosis,
                    item.count.toString(),
                    `${item.percentage.toFixed(1)}%`
                ]);
            });

            this.addTable(distTable);
        }

        // Demographics
        if (diagnosis.demographics) {
            this.currentY += 10;
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Demographics', this.margin, this.currentY);
            this.currentY += 8;

            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');

            if (diagnosis.demographics.ageGroups) {
                this.doc.text('Age Groups:', this.margin, this.currentY);
                this.currentY += 6;
                Object.entries(diagnosis.demographics.ageGroups).forEach(([age, count]) => {
                    this.doc.text(`  ${age}: ${count}%`, this.margin + 10, this.currentY);
                    this.currentY += 5;
                });
            }

            if (diagnosis.demographics.genderDistribution) {
                this.currentY += 5;
                this.doc.text('Gender Distribution:', this.margin, this.currentY);
                this.currentY += 6;
                Object.entries(diagnosis.demographics.genderDistribution).forEach(([gender, count]) => {
                    this.doc.text(`  ${gender}: ${count}%`, this.margin + 10, this.currentY);
                    this.currentY += 5;
                });
            }
        }

        this.currentY += 20;
    }

    /**
     * Add staff performance section
     */
    async addStaffPerformanceSection(staff) {
        this.addSectionHeader('Staff Performance');

        if (!staff || staff.length === 0) {
            this.doc.text('No staff performance data available', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        // Staff performance table
        const staffTable = [
            ['Staff Member', 'Role', 'Appointments', 'Satisfaction', 'Success Rate', 'Productivity']
        ];

        staff.slice(0, 10).forEach(member => {
            staffTable.push([
                member.name,
                member.role,
                member.totalAppointments?.toString() || 'N/A',
                member.patientSatisfaction ? `${member.patientSatisfaction.toFixed(1)}/5.0` : 'N/A',
                member.treatmentSuccessRate ? `${(member.treatmentSuccessRate * 100).toFixed(1)}%` : 'N/A',
                member.productivity ? `${member.productivity.toFixed(2)}` : 'N/A'
            ]);
        });

        this.addTable(staffTable);
        this.currentY += 20;
    }

    /**
     * Add compliance report content
     */
    addReportContent(reportData) {
        this.addSectionHeader(reportData.title);

        // Report details
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');

        this.doc.text(`Report Type: ${reportData.report_type}`, this.margin, this.currentY);
        this.currentY += 6;

        this.doc.text(`Generated: ${new Date(reportData.generated_date).toLocaleDateString()}`, this.margin, this.currentY);
        this.currentY += 6;

        this.doc.text(`Status: ${reportData.status}`, this.margin, this.currentY);
        this.currentY += 15;

        // Findings
        if (reportData.findings && reportData.findings.length > 0) {
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Findings', this.margin, this.currentY);
            this.currentY += 8;

            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            reportData.findings.forEach(finding => {
                this.doc.text(`• ${finding}`, this.margin, this.currentY);
                this.currentY += 6;
            });
        }

        // Recommendations
        if (reportData.recommendations && reportData.recommendations.length > 0) {
            this.currentY += 10;
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Recommendations', this.margin, this.currentY);
            this.currentY += 8;

            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            reportData.recommendations.forEach(recommendation => {
                this.doc.text(`• ${recommendation}`, this.margin, this.currentY);
                this.currentY += 6;
            });
        }
    }

    /**
     * Add section header
     */
    addSectionHeader(title) {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 50) {
            this.doc.addPage();
            this.currentY = this.margin;
        }

        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 10;

        // Add line
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 8;
    }

    /**
     * Add table
     */
    addTable(data) {
        if (!data || data.length === 0) return;

        const colWidths = this.calculateColumnWidths(data[0].length);
        const startX = this.margin;

        // Draw table
        data.forEach((row, rowIndex) => {
            let currentX = startX;

            // Check if we need a new page
            if (this.currentY > this.pageHeight - 30) {
                this.doc.addPage();
                this.currentY = this.margin;
            }

            row.forEach((cell, colIndex) => {
                const cellWidth = colWidths[colIndex];

                // Draw cell border
                this.doc.rect(currentX, this.currentY - 5, cellWidth, this.lineHeight + 2);

                // Add cell content
                this.doc.setFontSize(9);
                this.doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');

                const text = this.truncateText(cell.toString());
                this.doc.text(text, currentX + 2, this.currentY);

                currentX += cellWidth;
            });

            this.currentY += this.lineHeight + 2;
        });
    }

    /**
     * Calculate column widths
     */
    calculateColumnWidths(numColumns) {
        const availableWidth = this.pageWidth - (2 * this.margin);
        const baseWidth = availableWidth / numColumns;

        // Adjust for content if needed
        return Array(numColumns).fill(baseWidth);
    }

    /**
     * Truncate text to fit in cell
     */
    truncateText(text) {
        if (text.length <= 20) return text;
        return text.substring(0, 17) + '...';
    }

    /**
     * Add header
     */
    addHeader(title) {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 15;
    }

    /**
     * Add footer
     */
    addFooter() {
        const pageCount = this.doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);

            // Footer line
            this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);

            // Footer text
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(
                `Page ${i} of ${pageCount} | Generated by Bluequee2 Healthcare System | ${new Date().toLocaleDateString()}`,
                this.pageWidth / 2,
                this.pageHeight - 8, { align: 'center' }
            );
        }
    }

    /**
     * Download PDF
     */
    downloadPDF(filename = 'clinical-report.pdf') {
        this.doc.save(filename);
    }

    /**
     * Get PDF as blob
     */
    getPDFBlob() {
        return this.doc.output('blob');
    }

    /**
     * Get PDF as data URL
     */
    getPDFDataURL() {
        return this.doc.output('dataurlstring');
    }
}

/**
 * Generate PDF from HTML element
 */
export async function generatePDFFromElement(elementId, filename = 'report.pdf') {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
    }

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return pdf;
}

// Export singleton instance
export const pdfGenerator = new ClinicalReportPDFGenerator();