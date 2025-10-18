// Mock data for development and testing
export const mockPatients = [{
        id: 'patient-1',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1985-03-15',
        email: 'john.doe@email.com',
        phone: '+1-555-0123',
        address: '123 Main St, Anytown, USA',
        gender: 'Male',
        blood_type: 'O+',
        status: 'active',
        medical_history: 'Hypertension, Diabetes Type 2',
        allergies: ['Penicillin', 'Shellfish'],
        medications: ['Metformin', 'Lisinopril'],
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '+1-555-0124',
        insurance_provider: 'Blue Cross',
        insurance_number: 'BC123456789',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
    },
    {
        id: 'patient-2',
        first_name: 'Sarah',
        last_name: 'Smith',
        date_of_birth: '1990-07-22',
        email: 'sarah.smith@email.com',
        phone: '+1-555-0125',
        address: '456 Oak Ave, Somewhere, USA',
        gender: 'Female',
        blood_type: 'A+',
        status: 'active',
        medical_history: 'Asthma',
        allergies: ['Latex'],
        medications: ['Albuterol'],
        emergency_contact_name: 'Mike Smith',
        emergency_contact_phone: '+1-555-0126',
        insurance_provider: 'Aetna',
        insurance_number: 'AE987654321',
        created_at: '2024-01-20T14:30:00Z',
        updated_at: '2024-01-20T14:30:00Z'
    },
    {
        id: 'patient-3',
        first_name: 'Robert',
        last_name: 'Johnson',
        date_of_birth: '1978-11-08',
        email: 'robert.johnson@email.com',
        phone: '+1-555-0127',
        address: '789 Pine St, Elsewhere, USA',
        gender: 'Male',
        blood_type: 'B+',
        status: 'active',
        medical_history: 'High Cholesterol',
        allergies: ['Aspirin'],
        medications: ['Atorvastatin'],
        emergency_contact_name: 'Lisa Johnson',
        emergency_contact_phone: '+1-555-0128',
        insurance_provider: 'Cigna',
        insurance_number: 'CI456789123',
        created_at: '2024-02-01T09:15:00Z',
        updated_at: '2024-02-01T09:15:00Z'
    }
];

export const mockAppointments = [{
        id: 'appointment-1',
        patient_id: 'patient-1',
        doctor_id: 'doctor-1',
        appointment_date: '2024-03-15',
        appointment_time: '10:00',
        duration: 30,
        status: 'scheduled',
        notes: 'Regular checkup',
        created_at: '2024-03-01T10:00:00Z',
        updated_at: '2024-03-01T10:00:00Z'
    },
    {
        id: 'appointment-2',
        patient_id: 'patient-2',
        doctor_id: 'doctor-1',
        appointment_date: '2024-03-16',
        appointment_time: '14:30',
        duration: 45,
        status: 'scheduled',
        notes: 'Follow-up for asthma treatment',
        created_at: '2024-03-02T14:30:00Z',
        updated_at: '2024-03-02T14:30:00Z'
    },
    {
        id: 'appointment-3',
        patient_id: 'patient-3',
        doctor_id: 'doctor-2',
        appointment_date: '2024-03-17',
        appointment_time: '11:15',
        duration: 30,
        status: 'completed',
        notes: 'Cholesterol check completed',
        created_at: '2024-03-03T11:15:00Z',
        updated_at: '2024-03-17T11:45:00Z'
    }
];

export const mockPrescriptions = [{
        id: 'prescription-1',
        patient_id: 'patient-1',
        medication_name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        start_date: '2024-01-15',
        end_date: '2024-07-15',
        prescribed_by: 'Dr. Smith',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
    },
    {
        id: 'prescription-2',
        patient_id: 'patient-1',
        medication_name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        start_date: '2024-01-15',
        end_date: '2024-07-15',
        prescribed_by: 'Dr. Smith',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
    },
    {
        id: 'prescription-3',
        patient_id: 'patient-2',
        medication_name: 'Albuterol',
        dosage: '90mcg',
        frequency: 'As needed',
        start_date: '2024-01-20',
        end_date: '2024-07-20',
        prescribed_by: 'Dr. Johnson',
        status: 'active',
        created_at: '2024-01-20T14:30:00Z',
        updated_at: '2024-01-20T14:30:00Z'
    }
];

export const mockLabOrders = [{
        id: 'lab-order-1',
        patient_id: 'patient-1',
        test_name: 'Complete Blood Count',
        test_type: 'Blood Test',
        ordered_by: 'Dr. Smith',
        order_date: '2024-03-10',
        status: 'completed',
        results: 'Normal range - all values within limits',
        created_at: '2024-03-10T09:00:00Z',
        updated_at: '2024-03-12T15:30:00Z'
    },
    {
        id: 'lab-order-2',
        patient_id: 'patient-2',
        test_name: 'Pulmonary Function Test',
        test_type: 'Respiratory',
        ordered_by: 'Dr. Johnson',
        order_date: '2024-03-11',
        status: 'pending',
        created_at: '2024-03-11T10:30:00Z',
        updated_at: '2024-03-11T10:30:00Z'
    },
    {
        id: 'lab-order-3',
        patient_id: 'patient-3',
        test_name: 'Lipid Panel',
        test_type: 'Blood Test',
        ordered_by: 'Dr. Brown',
        order_date: '2024-03-12',
        status: 'processing',
        created_at: '2024-03-12T08:15:00Z',
        updated_at: '2024-03-12T08:15:00Z'
    }
];

export const mockUsers = [{
        id: 'user-1',
        full_name: 'Dr. John Smith',
        email: 'dr.smith@mediflow.com',
        phone: '+1-555-0200',
        role: 'Doctor',
        organization_id: 'org-1',
        is_active: true,
        permissions: ['read_patients', 'write_patients', 'prescribe_medications'],
        department: 'Internal Medicine',
        specialization: 'Cardiology',
        license_number: 'MD123456',
        hire_date: '2020-01-15',
        created_at: '2020-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'user-2',
        full_name: 'Dr. Sarah Johnson',
        email: 'dr.johnson@mediflow.com',
        phone: '+1-555-0201',
        role: 'Doctor',
        organization_id: 'org-1',
        is_active: true,
        permissions: ['read_patients', 'write_patients', 'prescribe_medications'],
        department: 'Pulmonology',
        specialization: 'Respiratory Medicine',
        license_number: 'MD789012',
        hire_date: '2019-06-01',
        created_at: '2019-06-01T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    }
];

export const mockOrganizations = [{
    id: 'org-1',
    name: 'MediFlow Medical Center',
    type: 'Medical Practice',
    address: '100 Healthcare Blvd, Medical City, USA',
    phone: '+1-555-0300',
    email: 'info@mediflow.com',
    website: 'https://mediflow.com',
    license_number: 'MED123456',
    tax_id: 'TAX789012',
    status: 'active',
    settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        time_format: '12h'
    },
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
}];