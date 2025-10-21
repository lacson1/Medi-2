/**
 * Centralized Validation Schemas using Zod
 *
 * This module provides comprehensive, type-safe validation schemas for all entities
 * in the healthcare application. Built with Zod for runtime validation and TypeScript
 * type inference, ensuring data integrity across forms, API calls, and database operations.
 *
 * @module validationSchemas
 *
 * @example
 * ```typescript
 * import { patientSchema, validateForm } from '@/utils/validationSchemas';
 *
 * // Validate patient data
 * const result = validateForm(patientSchema, patientData);
 * if (result.isValid) {
 *   await createPatient(patientData);
 * } else {
 *   console.error(result.errors);
 * }
 *
 * // Use in React Hook Form
 * const form = useForm({
 *   resolver: zodResolver(patientSchema)
 * });
 * ```
 */

import { z } from 'zod';

/**
 * Email validation schema with RFC-compliant format checking
 * @internal
 */
const emailSchema = z.string().email('Invalid email format');

/**
 * Phone number validation schema supporting international formats
 * Accepts numbers with optional + prefix and 1-16 digits
 * @internal
 */
const phoneSchema = z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number');

/**
 * Creates a required string schema with custom field name in error message
 * @param fieldName - Name of the field for error messages
 * @returns Zod string schema with min length validation
 * @internal
 */
const requiredString = (fieldName: string) => z.string().min(1, `${fieldName} is required`);

/**
 * Optional string schema (empty strings allowed)
 * @internal
 */
const optionalString = z.string().optional();

/**
 * Validates that a date is in the future
 * Useful for appointments, deadlines, and scheduled events
 *
 * @example
 * ```typescript
 * const appointmentDate = futureDateSchema.parse(new Date('2024-12-31'));
 * ```
 */
export const futureDateSchema = z.date().refine(
    (date) => date > new Date(),
    'Date must be in the future'
);

/**
 * Validates that a date is in the past
 * Useful for date of birth, hire dates, and historical records
 *
 * @example
 * ```typescript
 * const birthDate = pastDateSchema.parse(new Date('1990-01-01'));
 * ```
 */
export const pastDateSchema = z.date().refine(
    (date) => date < new Date(),
    'Date must be in the past'
);

/**
 * Patient registration and management validation schema
 * Validates all patient demographic, contact, and medical information
 * HIPAA-compliant with required and optional fields
 *
 * @example
 * ```typescript
 * const newPatient = {
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   date_of_birth: new Date('1990-01-01'),
 *   email: 'john.doe@email.com',
 *   allergies: 'Penicillin',
 *   status: 'active'
 * };
 *
 * const validated = patientSchema.parse(newPatient);
 * ```
 */
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

/**
 * User account validation schema
 * Validates staff and administrative user accounts with role-based fields
 * Supports multi-role system and organization assignments
 *
 * @example
 * ```typescript
 * const newUser = {
 *   full_name: 'Dr. Jane Smith',
 *   email: 'jane.smith@hospital.com',
 *   role: 'Doctor',
 *   specialization: 'Cardiology',
 *   license_number: 'MD123456',
 *   is_active: true
 * };
 *
 * const validated = userSchema.parse(newUser);
 * ```
 */
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

/**
 * Appointment scheduling and management validation schema
 * Supports recurring appointments with complex validation rules
 * Validates date/time, duration, patient assignment, and appointment types
 *
 * @example
 * ```typescript
 * const appointment = {
 *   patient_id: 'patient-123',
 *   appointment_date: new Date('2024-12-25'),
 *   duration: 30,
 *   reason: 'Annual checkup',
 *   type: 'consultation',
 *   status: 'scheduled'
 * };
 *
 * const validated = appointmentSchema.parse(appointment);
 * ```
 */
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

/**
 * Organization (multi-tenant) validation schema
 * Validates healthcare organizations including hospitals, clinics, and practices
 * Supports organizational settings and localization preferences
 *
 * @example
 * ```typescript
 * const organization = {
 *   name: 'City General Hospital',
 *   type: 'hospital',
 *   email: 'info@cityhospital.com',
 *   license_number: 'HOSP-12345',
 *   status: 'active',
 *   settings: {
 *     timezone: 'America/New_York',
 *     currency: 'USD'
 *   }
 * };
 *
 * const validated = organizationSchema.parse(organization);
 * ```
 */
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

/**
 * Prescription validation schema
 * Validates medication prescriptions with dosage, frequency, and refill tracking
 * Supports prescription lifecycle from creation to completion
 *
 * @example
 * ```typescript
 * const prescription = {
 *   patient_id: 'patient-123',
 *   medication_name: 'Lisinopril',
 *   dosage: '10mg',
 *   frequency: 'Once daily',
 *   duration_days: 30,
 *   refills: 2,
 *   status: 'active'
 * };
 *
 * const validated = prescriptionSchema.parse(prescription);
 * ```
 */
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

/**
 * Laboratory order validation schema
 * Validates lab test orders with test types, priority levels, and scheduling
 * Supports specimen collection tracking and special instructions
 *
 * @example
 * ```typescript
 * const labOrder = {
 *   patient_id: 'patient-123',
 *   test_name: 'Complete Blood Count',
 *   test_type: 'blood',
 *   priority: 'routine',
 *   fasting_required: true,
 *   status: 'ordered'
 * };
 *
 * const validated = labOrderSchema.parse(labOrder);
 * ```
 */
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

/**
 * Billing and invoicing validation schema
 * Validates financial transactions with line items, payment methods, and insurance claims
 * Supports multi-currency and various payment statuses
 *
 * @example
 * ```typescript
 * const invoice = {
 *   patient_id: 'patient-123',
 *   amount: 150.00,
 *   currency: 'USD',
 *   status: 'pending',
 *   payment_method: 'card',
 *   line_items: [
 *     { description: 'Consultation', amount: 100, quantity: 1 },
 *     { description: 'Lab Test', amount: 50, quantity: 1 }
 *   ]
 * };
 *
 * const validated = billingSchema.parse(invoice);
 * ```
 */
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

/**
 * Consultation template validation schema
 * Validates reusable consultation templates with dynamic variables
 * Supports specialty-specific templates and custom field definitions
 *
 * @example
 * ```typescript
 * const template = {
 *   template_name: 'Annual Physical',
 *   specialty: 'general',
 *   template_content: 'Patient presented for {{reason}}. Vitals: {{vitals}}.',
 *   is_active: true,
 *   variables: [
 *     { name: 'reason', label: 'Visit Reason', type: 'text', required: true },
 *     { name: 'vitals', label: 'Vital Signs', type: 'text', required: false }
 *   ]
 * };
 *
 * const validated = consultationTemplateSchema.parse(template);
 * ```
 */
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

/**
 * Medical document template validation schema
 * Validates templates for sick notes, referrals, discharge summaries, etc.
 * Supports dynamic variables and document categorization
 *
 * @example
 * ```typescript
 * const docTemplate = {
 *   template_name: 'Sick Note Template',
 *   document_type: 'sick_note',
 *   template_content: 'This certifies that {{patient_name}} is unfit for work...',
 *   category: 'general',
 *   is_active: true,
 *   variables: [
 *     { name: 'patient_name', label: 'Patient Name', type: 'text', required: true }
 *   ]
 * };
 *
 * const validated = medicalDocumentTemplateSchema.parse(docTemplate);
 * ```
 */
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

/**
 * User login validation schema
 * Validates email and password for authentication
 *
 * @example
 * ```typescript
 * const credentials = {
 *   email: 'user@hospital.com',
 *   password: 'securePassword123'
 * };
 *
 * const validated = loginSchema.parse(credentials);
 * ```
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
});

/**
 * Password reset request validation schema
 * Validates email for password reset flow
 *
 * @example
 * ```typescript
 * const resetRequest = { email: 'user@hospital.com' };
 * const validated = passwordResetSchema.parse(resetRequest);
 * ```
 */
export const passwordResetSchema = z.object({
    email: emailSchema
});

/**
 * Change password validation schema
 * Validates password change with current password verification and confirmation match
 * Enforces minimum 8 character password requirement
 *
 * @example
 * ```typescript
 * const passwordChange = {
 *   current_password: 'oldPassword',
 *   new_password: 'newSecurePassword123',
 *   confirm_password: 'newSecurePassword123'
 * };
 *
 * const validated = changePasswordSchema.parse(passwordChange);
 * ```
 */
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

/**
 * Global search validation schema
 * Validates search queries with optional filters for entity type, status, and date range
 * Minimum 2 character search query required
 *
 * @example
 * ```typescript
 * const search = {
 *   query: 'John Doe',
 *   filters: {
 *     entity_type: 'patient',
 *     status: 'active',
 *     date_range: {
 *       start: new Date('2024-01-01'),
 *       end: new Date('2024-12-31')
 *     }
 *   }
 * };
 *
 * const validated = searchSchema.parse(search);
 * ```
 */
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

/**
 * Single field validation result
 * Used for real-time field validation in forms
 */
export interface ValidationResult {
    /** Whether the field value is valid */
    isValid: boolean;
    /** Error message if validation failed */
    error?: string;
}

/**
 * Complete form validation result with all field errors
 * Used for form submission validation
 */
export interface FormValidationResult {
    /** Whether the entire form is valid */
    isValid: boolean;
    /** Map of field paths to error messages */
    errors: Record<string, string>;
}

/**
 * Validates a single field within a schema
 * Useful for real-time validation as users type
 *
 * @param schema - Zod schema containing the field
 * @param fieldName - Name of the field to validate
 * @param value - Value to validate
 * @returns Validation result with isValid flag and optional error message
 *
 * @example
 * ```typescript
 * const result = validateField(patientSchema, 'email', 'invalid-email');
 * if (!result.isValid) {
 *   console.error(result.error); // "Invalid email format"
 * }
 * ```
 */
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

/**
 * Validates an entire form data object against a schema
 * Returns all validation errors with field paths
 *
 * @param schema - Zod schema to validate against
 * @param data - Form data object to validate
 * @returns Form validation result with isValid flag and errors map
 *
 * @example
 * ```typescript
 * const formData = {
 *   first_name: 'John',
 *   last_name: '',
 *   email: 'invalid-email'
 * };
 *
 * const result = validateForm(patientSchema, formData);
 * if (!result.isValid) {
 *   console.error(result.errors);
 *   // {
 *   //   "last_name": "Last name is required",
 *   //   "email": "Invalid email format"
 *   // }
 * }
 * ```
 */
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

/**
 * Default export containing all validation schemas and helper functions
 * Convenient for importing multiple schemas at once
 *
 * @example
 * ```typescript
 * import schemas from '@/utils/validationSchemas';
 *
 * const patientResult = schemas.validateForm(schemas.patientSchema, data);
 * const userResult = schemas.validateForm(schemas.userSchema, userData);
 * ```
 */
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
