declare module '@/utils/consentManager' {
    export class ConsentManager {
        checkConsent(patientId: string, dataType: string, userId: string): Promise<any>;
        requestConsent(patientId: string, dataType: string, requestor: any): Promise<any>;
        grantConsent(patientId: string, dataType: string, options: any): Promise<any>;
        revokeConsent(consentId: string, reason: string): Promise<any>;
    }
}

