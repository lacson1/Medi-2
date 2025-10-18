/**
 * Centralized validation schemas using Zod
 * Provides consistent validation across all forms in Bluequee2
 */

import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('Invalid email format');
const phoneSchema = z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number');
const requiredString = (fieldName: string) => z.string().min(1, `${fieldName} is required`);
const optionalString = z.string().optional();

// Date validation helpers
export const futureDateSchema = z.date().refine(
    (date) => date > new Date(),
    'Date must be in the future'
);

export const pastDateSchema = z.date().refine(
    (date) => date < new Date(),
    'Date must be in the past'
);

// Patient validation schemas
export const patientSchema = z.object({
    first_name: requiredString('First name'),
    last_name: requiredString('Last name'),
    date_of_birth: z.date({
        required_error: 'Date of birth is required',
        invalid_type_error: 'Invalid date format'
    }),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    address: optionalString,
    emergency_contact_name: optionalString,
    emergency_contact_phone: phoneSchema.optional(),
    medical_history: optionalString,
    allergies: optionalString,
    medications: optionalString,
    insurance_provider: optionalString,
    insurance_number: optionalString,
    status: z.enum(['active', 'inactive', 'archived']).default('active')
});

// User validation schemas
export const userSchema = z.object({
    full_name: requiredString('Full name'),
    email: emailSchema,
    phone: phoneSchema.optional(),
    role: z.enum(['SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient']),
    organization_id: z.string().optional(),
    is_active: z.boolean().default(true),
    permissions: z.array(z.string()).optional(),
    department: optionalString,
    specialization: optionalString,
    license_number: optionalString,
    hire_date: z.date().optional()
});

// Appointment validation schemas
export const appointmentSchema = z
    .object({
        patient_id: z.string().min(1, 'Patient is required'),
        appointment_date: futureDateSchema,
        duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
        reason: z.string().min(3, 'Reason must be at least 3 characters'),
        status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
        notes: optionalString,
        is_recurring: z.boolean().default(false),
        recurring_end_date: z.date().optional(),
        doctor_id: z.string().optional(),
        room: optionalString,
        type: z.enum(['consultation', 'follow_up', 'procedure', 'emergency']).default('consultation')
    })
    .refine(
        (data) => !data.is_recurring || data.recurring_end_date, {
        message: 'Recurring end date is required for recurring appointments',
        path: ['recurring_end_date']
    }
    );

// Organization validation schemas
export const organizationSchema = z.object({
    name: requiredString('Organization name'),
    type: z.enum(['hospital', 'clinic', 'private_practice', 'pharmacy', 'lab']),
    address: optionalString,
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    website: z.string().url('Invalid website URL').optional(),
    license_number: optionalString,
    tax_id: optionalString,
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
    settings: z.object({
        timezone: z.string().default('UTC'),
        currency: z.string().default('USD'),
        date_format: z.string().default('MM/DD/YYYY'),
        time_format: z.string().default('12h')
    }).optional()
});

// Prescription validation schemas
export const prescriptionSchema = z.object({
    patient_id: z.string().min(1, 'Patient is required'),
    medication_name: requiredString('Medication name'),
    dosage: requiredString('Dosage'),
    frequency: requiredString('Frequency'),
    duration_days: z.number().min(1, 'Duration must be at least 1 day'),
    instructions: optionalString,
    start_date: z.date().default(() => new Date()),
    end_date: z.date().optional(),
    refills: z.number().min(0).default(0),
    status: z.enum(['active', 'completed', 'cancelled', 'expired']).default('active'),
    doctor_id: z.string().optional(),
    pharmacy_notes: optionalString
});

// Lab order validation schemas
export const labOrderSchema = z.object({
    patient_id: z.string().min(1, 'Patient is required'),
    test_name: requiredString('Test name'),
    test_type: z.enum(['blood', 'urine', 'imaging', 'biopsy', 'culture', 'other']),
    priority: z.enum(['routine', 'urgent', 'stat']).default('routine'),
    ordered_date: z.date().default(() => new Date()),
    scheduled_date: z.date().optional(),
    status: z.enum(['ordered', 'collected', 'processing', 'completed', 'cancelled']).default('ordered'),
    notes: optionalString,
    doctor_id: z.string().optional(),
    lab_location: optionalString,
    fasting_required: z.boolean().default(false),
    special_instructions: optionalString
});

// Billing validation schemas
export const billingSchema = z.object({
    patient_id: z.string().min(1, 'Patient is required'),
    appointment_id: z.string().optional(),
    amount: z.number().min(0, 'Amount must be positive'),
    currency: z.string().default('USD'),
    billing_date: z.date().default(() => new Date()),
    due_date: z.date().optional(),
    status: z.enum(['pending', 'paid', 'overdue', 'cancelled', 'refunded']).default('pending'),
    payment_method: z.enum(['cash', 'card', 'insurance', 'check', 'online']).optional(),
    insurance_claim_id: z.string().optional(),
    description: optionalString,
    line_items: z.array(
        z.object({
            description: z.string(),
            amount: z.number(),
            quantity: z.number().default(1)
        })
    ).optional()
});

// Consultation template validation schemas
export const consultationTemplateSchema = z.object({
    template_name: requiredString('Template name'),
    specialty: z.enum(['general', 'cardiology', 'dermatology', 'pediatrics', 'orthopedics', 'neurology', 'psychiatry', 'other']),
    template_content: requiredString('Template content'),
    description: optionalString,
    is_active: z.boolean().default(true),
    variables: z.array(
        z.object({
            name: z.string(),
            label: z.string(),
            type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
            required: z.boolean().default(false),
            options: z.array(z.string()).optional(),
            default_value: z.string().optional()
        })
    ).default([])
});

// Medical document template validation schemas
export const medicalDocumentTemplateSchema = z.object({
    template_name: requiredString('Template name'),
    document_type: z.enum(['sick_note', 'referral', 'discharge_summary', 'prescription', 'lab_order', 'consultation_note', 'other']),
    template_content: requiredString('Template content'),
    description: optionalString,
    category: z.enum(['general', 'specialty', 'emergency', 'follow_up']).default('general'),
    is_active: z.boolean().default(true),
    variables: z.array(
        z.object({
            name: z.string(),
            label: z.string(),
            type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
            required: z.boolean().default(false),
            options: z.array(z.string()).optional(),
            default_value: z.string().optional()
        })
    ).default([])
});

// Login validation schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
});

// Password reset validation schema
export const passwordResetSchema = z.object({
    email: emailSchema
});

// Change password validation schema
export const changePasswordSchema = z
    .object({
        current_password: z.string().min(1, 'Current password is required'),
        new_password: z.string().min(8, 'Password must be at least 8 characters'),
        confirm_password: z.string().min(1, 'Please confirm your password')
    })
    .refine(
        (data) => data.new_password === data.confirm_password, {
        message: 'Passwords do not match',
        path: ['confirm_password']
    }
    );

// Search validation schemas
export const searchSchema = z.object({
    query: z.string().min(2, 'Search query must be at least 2 characters'),
    filters: z.object({
        entity_type: z.enum(['patient', 'appointment', 'user', 'organization']).optional(),
        status: z.string().optional(),
        date_range: z.object({
            start: z.date().optional(),
            end: z.date().optional()
        }).optional()
    }).optional()
});

// Validation result interfaces
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export interface FormValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

// Export validation helper functions
export const validateField = <T extends z.ZodTypeAny>(
    schema: T,
    fieldName: string,
    value: unknown
): ValidationResult => {
    try {
        // Check if schema has a shape property (ZodObject)
        if ('shape' in schema && typeof schema.shape === 'object' && schema.shape !== null) {
            const shape = schema.shape as Record<string, z.ZodTypeAny>;
            const fieldSchema = shape[fieldName];
            if (fieldSchema) {
                fieldSchema.parse(value);
                return { isValid: true };
            }
        }
        return { isValid: false, error: `Unknown field: ${fieldName}` };
    } catch (error) {
        const zodError = error as z.ZodError;
        const message = zodError.errors?.[0]?.message || 'Validation error';
        return { isValid: false, error: message };
    }
};

export const validateForm = <T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
): FormValidationResult => {
    try {
        schema.parse(data);
        return { isValid: true, errors: {} };
    } catch (error) {
        const zodError = error as z.ZodError;
        const errors: Record<string, string> = {};
        zodError.errors?.forEach((err: any) => {
            const path = err.path.join('.');
            errors[path] = err.message;
        });
        return { isValid: false, errors };
    }
};

// Export all schemas for easy importing
export default {
    patientSchema,
    userSchema,
    appointmentSchema,
    organizationSchema,
    prescriptionSchema,
    labOrderSchema,
    billingSchema,
    consultationTemplateSchema,
    medicalDocumentTemplateSchema,
    loginSchema,
    passwordResetSchema,
    changePasswordSchema,
    searchSchema,
    futureDateSchema,
    pastDateSchema,
    validateField,
    validateForm
};
