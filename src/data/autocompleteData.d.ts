// TypeScript declarations for autocomplete data
export interface AutocompleteItem {
    value: string;
    label: string;
    description?: string;
    category?: string;
    severity?: string;
    dosage?: string;
    code?: string;
    type?: string;
    state?: string;
    zip?: string;
    format?: string;
}

export interface AutocompleteData {
    MEDICAL_SPECIALTIES: AutocompleteItem[];
    MEDICAL_CONDITIONS: AutocompleteItem[];
    MEDICATIONS: AutocompleteItem[];
    SYMPTOMS: AutocompleteItem[];
    ALLERGIES: AutocompleteItem[];
    LAB_TESTS: AutocompleteItem[];
    PROCEDURES: AutocompleteItem[];
    INSURANCE_PROVIDERS: AutocompleteItem[];
    COMMON_ADDRESSES: AutocompleteItem[];
    PHONE_FORMATS: AutocompleteItem[];
}

export declare function getSuggestionsByType(type: string, query?: string): AutocompleteItem[];
export declare function getSmartSuggestions(fieldName: string, query?: string): AutocompleteItem[];

declare const autocompleteData: AutocompleteData & {
    getSuggestionsByType: typeof getSuggestionsByType;
    getSmartSuggestions: typeof getSmartSuggestions;
};

export default autocompleteData;
