// Mock implementation of entity classes
class BaseEntity {
    static async list() {
        return [];
    }

    static async create(data) {
        return { id: Date.now().toString(), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    }

    static async update(id, data) {
        return { id, ...data, updated_at: new Date().toISOString() };
    }

    static async delete() {
        return true;
    }
}

export class LabResult extends BaseEntity {
    constructor(data) {
        super();
        Object.assign(this, data);
    }
}

export class Medication extends BaseEntity {
    constructor(data) {
        super();
        Object.assign(this, data);
    }
}

export class ProceduralReport extends BaseEntity {
    constructor(data) {
        super();
        Object.assign(this, data);
    }

    static async list() {
        // Mock data for procedural reports
        const mockReports = [{
                id: '1',
                patient_id: '1',
                procedure_name: 'Colonoscopy',
                procedure_type: 'Endoscopy',
                procedure_date: '2024-01-15',
                performed_by: 'Dr. Smith',
                location: 'Operating Room 1',
                indication: 'Routine screening',
                procedure_details: 'Complete colonoscopy performed with no complications',
                findings: 'Normal colonoscopy findings',
                complications: '',
                specimens_collected: 'Biopsy samples',
                status: 'completed',
                follow_up_required: true,
                follow_up_details: {
                    date: '2024-02-15',
                    time: '10:00',
                    doctor: 'Dr. Smith',
                    notes: 'Follow-up in 1 month'
                },
                notes: 'Patient tolerated procedure well',
                cost: '1500',
                duration_minutes: '45',
                anesthesia_used: true,
                anesthesia_type: 'Conscious sedation',
                pre_procedure_medications: 'Midazolam',
                post_procedure_medications: 'None',
                discharge_instructions: 'Rest for remainder of day',
                digital_signature: '',
                signed_by: 'Dr. Smith',
                signature_date: '2024-01-15',
                created_at: '2024-01-15T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z'
            },
            {
                id: '2',
                patient_id: '2',
                procedure_name: 'Biopsy',
                procedure_type: 'Biopsy',
                procedure_date: '2024-01-20',
                performed_by: 'Dr. Johnson',
                location: 'Procedure Room 2',
                indication: 'Suspicious lesion',
                procedure_details: 'Skin biopsy performed on left arm',
                findings: 'Lesion removed for analysis',
                complications: '',
                specimens_collected: 'Skin biopsy',
                status: 'completed',
                follow_up_required: true,
                follow_up_details: {
                    date: '2024-01-27',
                    time: '14:00',
                    doctor: 'Dr. Johnson',
                    notes: 'Results discussion'
                },
                notes: 'Patient cooperative during procedure',
                cost: '800',
                duration_minutes: '20',
                anesthesia_used: true,
                anesthesia_type: 'Local anesthesia',
                pre_procedure_medications: 'Lidocaine',
                post_procedure_medications: 'Antibiotic ointment',
                discharge_instructions: 'Keep wound clean and dry',
                digital_signature: '',
                signed_by: 'Dr. Johnson',
                signature_date: '2024-01-20',
                created_at: '2024-01-20T14:00:00Z',
                updated_at: '2024-01-20T14:00:00Z'
            },
            {
                id: '3',
                patient_id: '3',
                procedure_name: 'Blood Draw',
                procedure_type: 'Blood Draw',
                procedure_date: '2024-01-25',
                performed_by: 'Nurse Williams',
                location: 'Lab Station 1',
                indication: 'Routine lab work',
                procedure_details: 'Venipuncture for CBC and CMP',
                findings: 'Blood samples collected successfully',
                complications: '',
                specimens_collected: 'Blood samples',
                status: 'completed',
                follow_up_required: false,
                follow_up_details: null,
                notes: 'Patient experienced mild discomfort',
                cost: '150',
                duration_minutes: '5',
                anesthesia_used: false,
                anesthesia_type: '',
                pre_procedure_medications: '',
                post_procedure_medications: '',
                discharge_instructions: 'Apply pressure to site',
                digital_signature: '',
                signed_by: 'Nurse Williams',
                signature_date: '2024-01-25',
                created_at: '2024-01-25T09:00:00Z',
                updated_at: '2024-01-25T09:00:00Z'
            }
        ];

        return Promise.resolve(mockReports);
    }

    static async create(data) {
        const newReport = {
            id: Date.now().toString(),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return Promise.resolve(newReport);
    }

    static async update(id, data) {
        const updatedReport = {
            id,
            ...data,
            updated_at: new Date().toISOString()
        };
        return Promise.resolve(updatedReport);
    }

    static async delete() {
        return Promise.resolve();
    }
}

export class Appointment extends BaseEntity {
    constructor(data) {
        super();
        Object.assign(this, data);
    }
}

export class MedicationReview extends BaseEntity {
    constructor(data) {
        super();
        Object.assign(this, data);
    }
}

export class Prescription extends BaseEntity {
    constructor(data) {
        super();
        Object.assign(this, data);
    }

    static async list() {
        // Mock data for prescriptions
        const mockPrescriptions = [{
                id: '1',
                patient_id: '1',
                medication_name: 'Amoxicillin',
                dosage: '500',
                dosage_unit: 'mg',
                frequency: '3',
                frequency_unit: 'daily',
                quantity: '21',
                refills: 1,
                start_date: '2024-01-15',
                end_date: '2024-01-22',
                prescribing_doctor: 'Dr. Smith',
                pharmacy_name: 'CVS Pharmacy',
                pharmacy_phone: '(555) 123-4567',
                status: 'active',
                notes: 'Take with food',
                special_instructions: 'Complete full course',
                indication: 'Upper respiratory infection',
                route: 'oral',
                duration_days: '7',
                monitoring_required: false,
                lab_monitoring: '',
                side_effects_to_watch: 'Nausea, diarrhea',
                created_at: '2024-01-15T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z'
            },
            {
                id: '2',
                patient_id: '2',
                medication_name: 'Lisinopril',
                dosage: '10',
                dosage_unit: 'mg',
                frequency: '1',
                frequency_unit: 'daily',
                quantity: '30',
                refills: 2,
                start_date: '2024-01-10',
                end_date: '2024-02-10',
                prescribing_doctor: 'Dr. Johnson',
                pharmacy_name: 'Walgreens',
                pharmacy_phone: '(555) 987-6543',
                status: 'active',
                notes: 'Monitor blood pressure',
                special_instructions: 'Take at same time daily',
                indication: 'Hypertension',
                route: 'oral',
                duration_days: '30',
                monitoring_required: true,
                lab_monitoring: 'Blood pressure, kidney function',
                side_effects_to_watch: 'Dry cough, dizziness',
                created_at: '2024-01-10T09:00:00Z',
                updated_at: '2024-01-10T09:00:00Z'
            }
        ];

        return Promise.resolve(mockPrescriptions);
    }

    static async create(data) {
        const newPrescription = {
            id: Date.now().toString(),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return Promise.resolve(newPrescription);
    }

    static async update(id, data) {
        const updatedPrescription = {
            id,
            ...data,
            updated_at: new Date().toISOString()
        };
        return Promise.resolve(updatedPrescription);
    }

    static async delete() {
        return Promise.resolve();
    }
}

// Generic entity functions
export const entities = {
    LabResult,
    Medication,
    ProceduralReport,
    Appointment,
    MedicationReview,
    Prescription
};

export function fetchEntity(entityType, id) {
    return Promise.resolve({ id, entityType });
}

export function createEntity(entityType, data) {
    return Promise.resolve({ id: Date.now().toString(), entityType, ...data });
}

export function updateEntity(entityType, id, data) {
    return Promise.resolve({ id, entityType, ...data });
}

export function deleteEntity() {
    return Promise.resolve();
}