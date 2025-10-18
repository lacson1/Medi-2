declare module '@/data/medications' {
    export const medications: any[];
    export const commonIndications: string[];
    export const commonDosages: string[];
    export const commonFrequencies: string[];
    export const medicationCategories: string[];
    export const routes: string[];
    export const pregnancyCategories: Array<{ value: string; label: string }>;
    export const sideEffects: string[];
    export const monitoringTypes: string[];
    export const getMedicationsByCategory: (category: string) => any[];
    export const getLowStockMedications: () => any[];
    export const searchMedications: (query: string) => any[];
    export const getMedicationSuggestions: (query: string, maxResults?: number) => any[];
    export const getIndicationSuggestions: (query: string, maxResults?: number) => string[];
    export const getDosageSuggestions: (query: string, maxResults?: number) => string[];
    export const getFrequencySuggestions: (query: string, maxResults?: number) => string[];
}

