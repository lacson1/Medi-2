declare module '@/utils/pdfGenerator' {
    export function generatePDF(data: any, template: string): Promise<Blob>;
    export function generateComplianceReport(reportType: string, reportData: any): Promise<Blob>;
}

