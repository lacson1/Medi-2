/**
 * Form Enhancement Utilities
 * Provides utilities to enhance existing forms with autocomplete functionality
 */

import React from 'react';
import { EnhancedInputField, AllergyField, ConditionField, MedicationField, SymptomField, LabTestField, InsuranceField } from './EnhancedFormFields';

// Field mapping for automatic enhancement
export const FIELD_ENHANCEMENT_MAP = {
    // Patient form fields
    'allergies': AllergyField,
    'medical_conditions': ConditionField,
    'insurance_provider': InsuranceField,
    'phone': EnhancedInputField,
    'email': EnhancedInputField,

    // Prescription form fields
    'medication_name': MedicationField,
    'drug_name': MedicationField,
    'indication': ConditionField,
    'diagnosis': ConditionField,

    // Appointment form fields
    'reason': SymptomField,
    'chief_complaint': SymptomField,
    'symptoms': SymptomField,

    // Lab order form fields
    'test_name': LabTestField,
    'lab_test': LabTestField,
    'test_category': LabTestField,

    // General medical fields
    'specialty': EnhancedInputField,
    'procedure': EnhancedInputField,
    'treatment': EnhancedInputField,
};

// Enhanced field props based on field type
export const ENHANCED_FIELD_PROPS = {
    'allergies': {
        autocompleteType: 'allergies',
        placeholder: 'Add allergy (e.g., Penicillin, Shellfish)',
        helpText: 'Common allergies include medications, foods, and environmental factors'
    },
    'medical_conditions': {
        autocompleteType: 'conditions',
        placeholder: 'Add condition (e.g., Hypertension, Diabetes)',
        helpText: 'Include both current and past medical conditions'
    },
    'insurance_provider': {
        autocompleteType: 'insurance',
        placeholder: 'Select insurance provider',
        helpText: 'Choose from major insurance providers'
    },
    'medication_name': {
        autocompleteType: 'medications',
        placeholder: 'Enter medication name (e.g., Metformin, Lisinopril)',
        helpText: 'Search for medications by name or generic name'
    },
    'indication': {
        autocompleteType: 'conditions',
        placeholder: 'Reason for prescription (e.g., Hypertension, Diabetes)',
        helpText: 'Medical condition or reason for prescribing this medication'
    },
    'reason': {
        autocompleteType: 'symptoms',
        placeholder: 'Brief description of the visit purpose (e.g., Chest Pain, Headache)',
        helpText: 'Primary reason for the appointment'
    },
    'test_name': {
        autocompleteType: 'labTests',
        placeholder: 'Select lab test (e.g., CBC, BMP, Lipid Panel)',
        helpText: 'Choose from common laboratory tests'
    },
    'phone': {
        autocompleteType: 'phoneFormats',
        placeholder: '(555) 123-4567',
        helpText: 'Enter phone number in standard format'
    },
    'email': {
        type: 'email',
        placeholder: 'email@example.com',
        helpText: 'Enter a valid email address'
    }
};

/**
 * Enhance a form field with autocomplete functionality
 */
export function enhanceFormField(fieldName: string, props: any = {}) {
    const EnhancedComponent = FIELD_ENHANCEMENT_MAP[fieldName.toLowerCase()];

    if (!EnhancedComponent) {
        return null; // Return null if no enhancement available
    }

    const enhancedProps = ENHANCED_FIELD_PROPS[fieldName.toLowerCase()] || {};

    return {
        component: EnhancedComponent,
        props: {
            ...enhancedProps,
            ...props,
            name: fieldName
        }
    };
}

/**
 * Create an enhanced form field component
 */
export function createEnhancedField(fieldName: string, originalProps: any = {}) {
    const enhancement = enhanceFormField(fieldName, originalProps);

    if (!enhancement) {
        return null;
    }

    const { component: EnhancedComponent, props } = enhancement;

    return React.createElement(EnhancedComponent, props);
}

/**
 * Batch enhance multiple form fields
 */
export function enhanceFormFields(fieldMappings: Record<string, any>) {
    const enhancedFields: Record<string, any> = {};

    Object.entries(fieldMappings).forEach(([fieldName, props]) => {
        const enhancement = enhanceFormField(fieldName, props);
        if (enhancement) {
            enhancedFields[fieldName] = enhancement;
        }
    });

    return enhancedFields;
}

/**
 * Get autocomplete suggestions for a field
 */
export function getFieldSuggestions(fieldName: string, query: string = '') {
    const fieldType = Object.keys(FIELD_ENHANCEMENT_MAP).find(
        key => key.toLowerCase() === fieldName.toLowerCase()
    );

    if (!fieldType) {
        return [];
    }

    const enhancedProps = ENHANCED_FIELD_PROPS[fieldName.toLowerCase()];
    if (!enhancedProps?.autocompleteType) {
        return [];
    }

    // This would typically call the autocomplete service
    // For now, return empty array - the actual suggestions come from the components
    return [];
}

/**
 * Form field validation helpers
 */
export const FORM_VALIDATION_HELPERS = {
    // Validate medication names
    validateMedication: (medication: string) => {
        if (!medication || medication.length < 2) {
            return 'Please enter a valid medication name';
        }
        return null;
    },

    // Validate medical conditions
    validateCondition: (condition: string) => {
        if (!condition || condition.length < 2) {
            return 'Please enter a valid medical condition';
        }
        return null;
    },

    // Validate allergies
    validateAllergy: (allergy: string) => {
        if (!allergy || allergy.length < 2) {
            return 'Please enter a valid allergy';
        }
        return null;
    },

    // Validate symptoms
    validateSymptom: (symptom: string) => {
        if (!symptom || symptom.length < 2) {
            return 'Please enter a valid symptom';
        }
        return null;
    },

    // Validate lab tests
    validateLabTest: (test: string) => {
        if (!test || test.length < 2) {
            return 'Please enter a valid lab test';
        }
        return null;
    },

    // Validate insurance provider
    validateInsurance: (provider: string) => {
        if (!provider || provider.length < 2) {
            return 'Please select a valid insurance provider';
        }
        return null;
    }
};

/**
 * Smart form field suggestions based on context
 */
export function getContextualSuggestions(formData: any, fieldName: string) {
    const suggestions: string[] = [];

    // Suggest medications based on conditions
    if (fieldName === 'medication_name' && formData.medical_conditions) {
        formData.medical_conditions.forEach((condition: string) => {
            switch (condition.toLowerCase()) {
                case 'hypertension':
                case 'high blood pressure':
                    suggestions.push('Lisinopril', 'Amlodipine', 'Losartan');
                    break;
                case 'diabetes':
                case 'type 2 diabetes':
                    suggestions.push('Metformin', 'Glipizide', 'Insulin');
                    break;
                case 'depression':
                    suggestions.push('Sertraline', 'Fluoxetine', 'Escitalopram');
                    break;
                case 'asthma':
                    suggestions.push('Albuterol', 'Fluticasone', 'Montelukast');
                    break;
            }
        });
    }

    // Suggest lab tests based on conditions
    if (fieldName === 'test_name' && formData.medical_conditions) {
        formData.medical_conditions.forEach((condition: string) => {
            switch (condition.toLowerCase()) {
                case 'diabetes':
                    suggestions.push('HbA1c', 'Glucose', 'Lipid Panel');
                    break;
                case 'hypertension':
                    suggestions.push('Basic Metabolic Panel', 'Creatinine', 'Lipid Panel');
                    break;
                case 'heart disease':
                    suggestions.push('Lipid Panel', 'Troponin', 'BNP');
                    break;
                case 'thyroid disorder':
                    suggestions.push('TSH', 'Free T4', 'Free T3');
                    break;
            }
        });
    }

    // Suggest conditions based on symptoms
    if (fieldName === 'indication' && formData.symptoms) {
        formData.symptoms.forEach((symptom: string) => {
            switch (symptom.toLowerCase()) {
                case 'chest pain':
                    suggestions.push('Angina', 'Myocardial Infarction', 'GERD');
                    break;
                case 'shortness of breath':
                    suggestions.push('Asthma', 'COPD', 'Heart Failure');
                    break;
                case 'headache':
                    suggestions.push('Migraine', 'Tension Headache', 'Hypertension');
                    break;
                case 'fatigue':
                    suggestions.push('Anemia', 'Thyroid Disorder', 'Depression');
                    break;
            }
        });
    }

    return [...new Set(suggestions)]; // Remove duplicates
}

export default {
    enhanceFormField,
    createEnhancedField,
    enhanceFormFields,
    getFieldSuggestions,
    FORM_VALIDATION_HELPERS,
    getContextualSuggestions,
    FIELD_ENHANCEMENT_MAP,
    ENHANCED_FIELD_PROPS
};
