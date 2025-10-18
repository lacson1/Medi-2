/**
 * Shared TypeScript type definitions for MediFlow application
 */

import * as React from 'react';

// Base entity types
export interface BaseEntity {
    id: string;
    created_at?: string;
    updated_at?: string;
}

// Patient entity
export interface Patient extends BaseEntity {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    insurance_provider?: string;
    insurance_number?: string;
    allergies?: string | string[];
    medications?: string | string[];
    medical_history?: string | string[];
    blood_type?: string;
    status: 'active' | 'inactive' | 'archived';
    organization_id?: string;
}

// User entity
export interface User extends BaseEntity {
    first_name: string;
    last_name: string;
    email: string;
    role: 'SuperAdmin' | 'Admin' | 'Doctor' | 'Nurse' | 'Billing' | 'Receptionist' | 'LabTech';
    permissions: string[];
    organization_id?: string;
    is_active: boolean;
    last_login?: string;
    profile_picture?: string;
    // Additional user properties
    phone?: string;
    mobile?: string;
    job_title?: string;
    department?: string;
    specialization?: string;
    license_number?: string;
    license_expiry?: string;
    qualifications?: string[];
    certifications?: string[];
    years_of_experience?: number;
    languages?: string[];
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zip_code?: string;
        country?: string;
    };
    emergency_contact?: {
        name?: string;
        phone?: string;
        relationship?: string;
    };
    employment_type?: 'full_time' | 'part_time' | 'contract' | 'consultant';
    date_of_joining?: string;
    shift?: 'day' | 'night' | 'rotating';
    availability?: {
        monday?: { start: string; end: string };
        tuesday?: { start: string; end: string };
        wednesday?: { start: string; end: string };
        thursday?: { start: string; end: string };
        friday?: { start: string; end: string };
        saturday?: { start: string; end: string };
        sunday?: { start: string; end: string };
    };
    status?: 'active' | 'inactive' | 'suspended';
    profile_picture_url?: string;
    bio?: string;
    consultation_fee?: number;
    npi_number?: string;
    dea_number?: string;
}

// Organization entity
export interface Organization extends BaseEntity {
    name: string;
    type: 'hospital' | 'clinic' | 'private_practice' | 'other';
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    email: string;
    website?: string;
    license_number?: string;
    is_active: boolean;
    description?: string;
    logo_url?: string;
}

// Appointment entity
export interface Appointment extends BaseEntity {
    patient_id: string;
    patient_name?: string;
    doctor_id: string;
    appointment_date: string;
    appointment_time?: string;
    duration: number; // in minutes
    type: 'consultation' | 'follow_up' | 'procedure' | 'emergency' | 'checkup' | 'telemedicine';
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    reason?: string;
    provider?: string;
    is_recurring?: boolean;
    recurring_pattern?: string;
    recurring_end_date?: string;
    reminder_sent?: boolean;
    priority?: string;
    organization_id?: string;
}

// Encounter entity
export interface Encounter extends BaseEntity {
    patient_id: string;
    doctor_id: string;
    appointment_id?: string;
    encounter_date: string;
    encounter_type: 'initial' | 'follow_up' | 'emergency' | 'procedure';
    chief_complaint: string;
    diagnosis?: string;
    treatment_plan?: string;
    medications_prescribed?: string[];
    follow_up_instructions?: string;
    organization_id?: string;
}

// Billing entity
export interface Billing extends BaseEntity {
    patient_id: string;
    patient_name?: string;
    encounter_id?: string;
    appointment_id?: string;
    amount: number;
    currency?: string;
    billing_date: string;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'draft' | 'partially_paid';
    payment_method?: string;
    payment_date?: string;
    insurance_claim_id?: string;
    insurance_claim_number?: string;
    insurance_coverage?: number;
    invoice_number?: string;
    invoice_date?: string;
    service_date?: string;
    service_type?: string;
    description?: string;
    line_items?: Array<{
        item: string;
        quantity: number;
        unit_price: number;
        total: number;
    }>;
    subtotal?: number;
    tax?: number;
    discount?: number;
    total_amount?: number;
    amount_paid?: number;
    balance?: number;
    notes?: string;
    organization_id?: string;
}

// Lab Order entity
export interface LabOrder extends BaseEntity {
    patient_id: string;
    doctor_id: string;
    encounter_id?: string;
    test_name: string;
    test_type: string;
    priority: 'routine' | 'urgent' | 'stat';
    status: 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled';
    ordered_date: string;
    due_date?: string;
    results?: string;
    notes?: string;
    organization_id?: string;
}

// Prescription entity
export interface Prescription extends BaseEntity {
    patient_id: string;
    doctor_id: string;
    encounter_id?: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    status: 'active' | 'completed' | 'cancelled';
    prescribed_date: string;
    organization_id?: string;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiListResponse<T> {
    data: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
    message?: string;
    success: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
}

// Form data types
export interface PatientFormData {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    insurance_provider?: string;
    insurance_number?: string;
    allergies?: string[];
    medications?: string[];
    medical_history?: string[];
}

export interface AppointmentFormData {
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    duration: number;
    type: 'consultation' | 'follow_up' | 'procedure' | 'emergency';
    notes?: string;
    reason?: string;
}

export interface UserFormData {
    first_name: string;
    last_name: string;
    email: string;
    role: 'SuperAdmin' | 'Admin' | 'Doctor' | 'Nurse' | 'Billing' | 'Receptionist' | 'LabTech';
    permissions: string[];
    organization_id?: string;
    is_active: boolean;
}

// Authentication types
export interface LoginCredentials {
    email: string;
    password: string;
}

// AuthUser interface - re-exported from AuthContext
export interface AuthUser extends Omit<User, 'role'> {
    role: string;
    roleColor?: string;
    permissions: string[];
    organization?: string;
    organization_id?: string;
    organization_name?: string;
}

// Context types
export interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<UserFormData>) => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    client: any; // Base44 client
    checkAuthStatus: () => Promise<void>;
    showOrgSelector: boolean;
    setShowOrgSelector: (show: boolean) => void;
    userOrganizations: Organization[];
    handleOrganizationSelect: (selectedUser: AuthUser) => void;
    closeOrgSelector: () => void;
}

// Component prop types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

// Utility types
export type EntityType = 'Patient' | 'User' | 'Organization' | 'Appointment' | 'Encounter' | 'Billing' | 'LabOrder' | 'Prescription' | 'ConsultationTemplate' | 'MedicalDocumentTemplate';

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'stat';

// Batch operation interface
export interface BatchOperation {
    type: 'list' | 'get' | 'create' | 'update' | 'delete';
    entityType: EntityType;
    id?: string;
    data?: unknown;
    options?: Record<string, unknown>;
}

// API Options
export interface ListOptions {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
    useCache?: boolean;
    cacheTTL?: number;
    [key: string]: unknown;
}

export interface GetOptions {
    useCache?: boolean;
    cacheTTL?: number;
    include?: string[];
    [key: string]: unknown;
}

// Error types
export interface ApiErrorContext {
    requestId: string;
    timestamp: string;
    url: string;
    method: string;
    status: number | undefined;
    response: unknown;
    options: Record<string, unknown>;
    [key: string]: unknown;
}

// Monitoring types
export interface ErrorInfo {
    message: string;
    stack: string | undefined;
    timestamp: string;
    context: Record<string, unknown>;
    userAgent: string;
    url: string;
}

export interface PerformanceMetrics {
    loadTime: number;
    renderTime: number;
    apiResponseTime: number;
    memoryUsage: number;
}

// Form validation types
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface FormState<T> {
    data: T;
    errors: ValidationError[];
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
}

// Medication entity
export interface Medication extends BaseEntity {
    name: string;
    generic_name?: string;
    dosage_form: string;
    strength?: string;
    manufacturer?: string;
    ndc_code?: string;
    description?: string;
    side_effects?: string[];
    contraindications?: string[];
    interactions?: string[];
    storage_instructions?: string;
    cost?: number;
    organization_id?: string;
}

// Referral entity
export interface Referral extends BaseEntity {
    patient_id: string;
    referring_provider_id: string;
    referred_to_provider_id: string;
    referral_reason: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    referral_date: string;
    appointment_date?: string;
    notes?: string;
    organization_id?: string;
}

// Pharmacy Activity entity
export interface PharmacyActivity extends BaseEntity {
    medication_id: string;
    patient_id: string;
    activity_type: 'dispensed' | 'returned' | 'refill_requested' | 'interaction_check' | 'counseling';
    quantity?: number;
    dosage?: string;
    pharmacist_id?: string;
    notes?: string;
    timestamp: string;
    organization_id?: string;
}

// Additional entity types for tests
export interface ConsultationTemplate extends BaseEntity {
    name: string;
    description?: string;
    template_content: string;
    category?: string;
    organization_id?: string;
}

export interface MedicalDocumentTemplate extends BaseEntity {
    name: string;
    description?: string;
    template_content: string;
    document_type: string;
    organization_id?: string;
}

export interface Prescription extends BaseEntity {
    patient_id: string;
    doctor_id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    status: 'active' | 'completed' | 'cancelled';
    organization_id?: string;
}

export interface LabOrder extends BaseEntity {
    patient_id: string;
    doctor_id: string;
    test_name: string;
    test_code?: string;
    instructions?: string;
    status: 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled';
    results?: string;
    organization_id?: string;
}

export interface Encounter extends BaseEntity {
    patient_id: string;
    doctor_id: string;
    encounter_date: string;
    encounter_type: 'initial' | 'follow_up' | 'emergency' | 'procedure';
    chief_complaint: string;
    diagnosis?: string;
    treatment_plan?: string;
    notes?: string;
    status: 'in_progress' | 'completed' | 'cancelled';
    organization_id?: string;
}

// Additional API types
export interface RequestOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    [key: string]: unknown;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    errors?: FormErrors;
}

export interface FormErrors {
    [key: string]: string | null;
}

export interface FormValidator {
    (value: unknown): string | null;
}

export interface FormValidators {
    [key: string]: FormValidator;
}

export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    statusCode?: number;
    error?: string;
    timestamp: string;
}

export interface BatchResult {
    operation: BatchOperation;
    success: boolean;
    data: unknown | null;
    error: Error | null;
}
