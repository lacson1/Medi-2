export interface MockPatient {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    blood_type: string;
    status: string;
    medical_history: string;
    allergies: string[];
    medications: string[];
    emergency_contact_name: string;
    emergency_contact_phone: string;
    insurance_provider: string;
    insurance_number: string;
    created_at: string;
    updated_at: string;
}

export interface MockUser {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    organization_id: string;
    is_active: boolean;
    permissions: string[];
    department: string;
    specialization: string;
    license_number: string;
    hire_date: string;
    created_at: string;
    updated_at: string;
}

export interface MockOrganization {
    id: string;
    name: string;
    type: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    license_number: string;
    tax_id: string;
    status: string;
    settings: {
        timezone: string;
        currency: string;
        date_format: string;
        time_format: string;
    };
    created_at: string;
    updated_at: string;
}

export interface MockPrescription {
    id: string;
    patient_id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date: string;
    prescribed_by: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface MockLabOrder {
    id: string;
    patient_id: string;
    test_name: string;
    test_type: string;
    ordered_by: string;
    order_date: string;
    status: string;
    results?: string;
    created_at: string;
    updated_at: string;
}

export interface MockAppointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    duration: number;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export const mockPatients: MockPatient[];
export const mockUsers: MockUser[];
export const mockOrganizations: MockOrganization[];
export const mockPrescriptions: MockPrescription[];
export const mockLabOrders: MockLabOrder[];
export const mockAppointments: MockAppointment[];
