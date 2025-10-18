declare module '@/utils/dataAggregation' {
    export class ClinicalDataAggregator {
        getClinicalOverview(organizationId: string, dateRange: any): Promise<any>;
        getPerformanceTrends(organizationId: string, period: string): Promise<any>;
        getDiagnosisAnalysis(organizationId: string, dateRange: any): Promise<any>;
        getStaffPerformance(organizationId: string, dateRange: any): Promise<any>;
        clearCache(): void;
    }

    export const clinicalDataAggregator: ClinicalDataAggregator;
}

