declare module '@/utils/autopopulateUtils' {
    export function autopopulateFromExisting(patientData: any): any;
    export function suggestValues(fieldName: string, value: string): string[];
}

