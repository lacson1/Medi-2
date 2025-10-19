/**
 * Comprehensive CRUD Testing Suite
 * Tests all CRUD operations for all entities in the MediFlow application
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnhancedApiClient } from '@/api/apiClient';
import type {
    Patient,
    Appointment,
    User,
    Organization,
    Prescription,
    LabOrder,
    Billing,
    Encounter
} from '@/types';

// Create mock functions with proper typing
const mockRequest = vi.fn();

// Mock the realApiClient since EnhancedApiClient uses it internally
vi.mock('@/api/realApiClient', () => ({
    realApiClient: {
        request: mockRequest,
    },
}));

// Mock monitoring
vi.mock('@/lib/monitoring', () => ({
    ErrorLogger: {
        log: vi.fn(),
    },
    PerformanceMonitor: {
        startTiming: vi.fn(() => Date.now()),
        endTiming: vi.fn(() => 100),
    },
}));

describe('Comprehensive CRUD Operations', () => {
    let apiClient: EnhancedApiClient;

    beforeEach(() => {
        apiClient = new EnhancedApiClient();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Patient CRUD Operations', () => {
        const mockPatient: Patient = {
            id: 'patient-1',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1990-01-01',
            gender: 'male',
            phone: '+1234567890',
            email: 'john.doe@example.com',
            address: '123 Main St',
            city: 'Anytown',
            state: 'NY',
            zip_code: '12345',
            blood_type: 'O+',
            allergies: ['Penicillin'],
            medical_history: ['Hypertension'],
            medications: ['Lisinopril'],
            emergency_contact_name: 'Jane Doe',
            emergency_contact_phone: '+1234567891',
            insurance_provider: 'Blue Cross',
            insurance_number: 'BC123456',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        describe('CREATE - Patient Creation', () => {
            it('should create a new patient with valid data', async () => {
                const newPatientData = {
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: 'jane.smith@example.com',
                    phone: '+1234567892',
                    date_of_birth: '1985-05-15',
                    gender: 'female',
                    address: '456 Oak Ave',
                    city: 'Springfield',
                    state: 'IL',
                    zip_code: '62701',
                    blood_type: 'A+',
                    allergies: ['Latex'],
                    medical_history: ['Diabetes'],
                    medications: ['Metformin'],
                    emergency_contact_name: 'Bob Smith',
                    emergency_contact_phone: '+1234567893',
                    insurance_provider: 'Aetna',
                    insurance_number: 'AET789012',
                    status: 'active'
                };

                mockRequest.mockResolvedValue({
                    data: { ...newPatientData, id: 'patient-2', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' }
                });

                const result = await apiClient.create<Patient>('Patient', newPatientData) as Patient;

                expect(result).toMatchObject(newPatientData);
                expect(result.id).toBeDefined();
                expect(result.created_at).toBeDefined();
                expect(mockRequest).toHaveBeenCalledWith('/patients', {
                    method: 'POST',
                    body: JSON.stringify(newPatientData)
                });
            });

            it('should handle patient creation with missing required fields', async () => {
                const incompleteData = {
                    first_name: 'Jane',
                    // Missing last_name, email, etc.
                };

                mockRequest.mockRejectedValue(new Error('Validation failed: Missing required fields'));

                await expect(apiClient.create<Patient>('Patient', incompleteData))
                    .rejects.toThrow('Validation failed: Missing required fields');
            });

            it('should handle patient creation with invalid email format', async () => {
                const invalidData = {
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: 'invalid-email',
                    phone: '+1234567892',
                    date_of_birth: '1985-05-15',
                    gender: 'female',
                    status: 'active'
                };

                mockRequest.mockRejectedValue(new Error('Invalid email format'));

                await expect(apiClient.create<Patient>('Patient', invalidData))
                    .rejects.toThrow('Invalid email format');
            });
        });

        describe('READ - Patient Retrieval', () => {
            it('should list all patients with pagination', async () => {
                const patients = [mockPatient, { ...mockPatient, id: 'patient-2', first_name: 'Jane' }];
                mockRequest.mockResolvedValue({ data: patients });

                const result = await apiClient.list<Patient>('Patient', { page: 1, limit: 10 });

                expect(result).toEqual(patients);
                expect(mockRequest).toHaveBeenCalledWith('/patients?page=1&limit=10');
            });

            it('should get a specific patient by ID', async () => {
                mockRequest.mockResolvedValue({ data: mockPatient });

                const result = await apiClient.get<Patient>('Patient', 'patient-1');

                expect(result).toEqual(mockPatient);
                expect(mockRequest).toHaveBeenCalledWith('/patients/patient-1');
            });

            it('should handle patient not found', async () => {
                mockRequest.mockRejectedValue(new Error('Patient not found'));

                await expect(apiClient.get<Patient>('Patient', 'non-existent-id'))
                    .rejects.toThrow('Patient not found');
            });

            it('should search patients by name', async () => {
                const searchResults = [mockPatient];
                mockRequest.mockResolvedValue({ data: searchResults });

                const result = await apiClient.list<Patient>('Patient', { search: 'John' });

                expect(result).toEqual(searchResults);
                expect(mockRequest).toHaveBeenCalledWith('/patients?search=John');
            });
        });

        describe('UPDATE - Patient Modification', () => {
            it('should update patient information', async () => {
                const updateData = {
                    first_name: 'Johnny',
                    phone: '+1234567899',
                    address: '789 Pine St'
                };
                const updatedPatient = { ...mockPatient, ...updateData };
                mockRequest.mockResolvedValue({ data: updatedPatient });

                const result = await apiClient.update<Patient>('Patient', 'patient-1', updateData);

                expect(result).toEqual(updatedPatient);
                expect(mockRequest).toHaveBeenCalledWith('/patients/patient-1', {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                });
            });

            it('should handle partial updates', async () => {
                const partialUpdate = { phone: '+1234567899' };
                const updatedPatient = { ...mockPatient, ...partialUpdate };
                mockRequest.mockResolvedValue({ data: updatedPatient });

                const result = await apiClient.update<Patient>('Patient', 'patient-1', partialUpdate);

                expect(result.phone).toBe('+1234567899');
                expect(result.first_name).toBe(mockPatient.first_name); // Unchanged
            });

            it('should handle update with invalid data', async () => {
                const invalidUpdate = { email: 'invalid-email' };
                mockRequest.mockRejectedValue(new Error('Invalid email format'));

                await expect(apiClient.update<Patient>('Patient', 'patient-1', invalidUpdate))
                    .rejects.toThrow('Invalid email format');
            });
        });

        describe('DELETE - Patient Removal', () => {
            it('should delete a patient', async () => {
                mockRequest.mockResolvedValue({ data: { success: true, message: 'Patient deleted successfully' } });

                const result = await apiClient.delete('Patient', 'patient-1');

                expect(result.success).toBe(true);
                expect(mockRequest).toHaveBeenCalledWith('/patients/patient-1', {
                    method: 'DELETE'
                });
            });

            it('should handle deletion of non-existent patient', async () => {
                mockRequest.mockRejectedValue(new Error('Patient not found'));

                await expect(apiClient.delete('Patient', 'non-existent-id'))
                    .rejects.toThrow('Patient not found');
            });

            it('should handle deletion with dependent records', async () => {
                mockRequest.mockRejectedValue(new Error('Cannot delete patient with existing appointments'));

                await expect(apiClient.delete('Patient', 'patient-1'))
                    .rejects.toThrow('Cannot delete patient with existing appointments');
            });
        });
    });

    describe('Appointment CRUD Operations', () => {
        const mockAppointment: Appointment = {
            id: 'appointment-1',
            patient_id: 'patient-1',
            patient_name: 'John Doe',
            doctor_id: 'doctor-1',
            appointment_date: '2024-02-01T10:00:00Z',
            duration: 30,
            type: 'consultation',
            status: 'scheduled',
            reason: 'Regular checkup',
            notes: 'Patient feels well',
            provider: 'Dr. Smith',
            is_recurring: false,
            recurring_pattern: 'none',
            reminder_sent: false,
            priority: 'normal',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        describe('CREATE - Appointment Scheduling', () => {
            it('should create a new appointment', async () => {
                const newAppointmentData = {
                    patient_id: 'patient-2',
                    doctor_id: 'doctor-1',
                    appointment_date: '2024-02-15T14:00:00Z',
                    duration: 45,
                    type: 'follow-up',
                    status: 'scheduled',
                    reason: 'Follow-up visit',
                    notes: 'Patient improving well',
                    provider: 'Dr. Johnson',
                    priority: 'normal'
                };

                mockRequest.mockResolvedValue({
                    data: { ...newAppointmentData, id: 'appointment-2', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' }
                });

                const result = await apiClient.create<Appointment>('Appointment', newAppointmentData);

                expect(result).toMatchObject(newAppointmentData);
                expect(result.id).toBeDefined();
                expect(mockRequest).toHaveBeenCalledWith('/appointments', {
                    method: 'POST',
                    body: JSON.stringify(newAppointmentData)
                });
            });

            it('should handle appointment scheduling conflicts', async () => {
                const conflictingAppointment = {
                    patient_id: 'patient-1',
                    doctor_id: 'doctor-1',
                    appointment_date: '2024-02-01T10:00:00Z', // Same time as existing
                    duration: 30,
                    type: 'consultation',
                    status: 'scheduled'
                };

                mockRequest.mockRejectedValue(new Error('Time slot already booked'));

                await expect(apiClient.create<Appointment>('Appointment', conflictingAppointment))
                    .rejects.toThrow('Time slot already booked');
            });
        });

        describe('READ - Appointment Retrieval', () => {
            it('should list appointments with filters', async () => {
                const appointments = [mockAppointment];
                mockRequest.mockResolvedValue({ data: appointments });

                const result = await apiClient.list<Appointment>('Appointment', {
                    doctor_id: 'doctor-1',
                    status: 'scheduled',
                    date_from: '2024-02-01',
                    date_to: '2024-02-28'
                });

                expect(result).toEqual(appointments);
                expect(mockRequest).toHaveBeenCalledWith('/appointments?doctor_id=doctor-1&status=scheduled&date_from=2024-02-01&date_to=2024-02-28');
            });

            it('should get appointment by ID', async () => {
                mockRequest.mockResolvedValue({ data: mockAppointment });

                const result = await apiClient.get<Appointment>('Appointment', 'appointment-1');

                expect(result).toEqual(mockAppointment);
            });
        });

        describe('UPDATE - Appointment Modification', () => {
            it('should update appointment status', async () => {
                const updateData = { status: 'completed', notes: 'Patient seen successfully' };
                const updatedAppointment = { ...mockAppointment, ...updateData };
                mockRequest.mockResolvedValue({ data: updatedAppointment });

                const result = await apiClient.update<Appointment>('Appointment', 'appointment-1', updateData);

                expect(result.status).toBe('completed');
                expect(result.notes).toBe('Patient seen successfully');
            });

            it('should reschedule appointment', async () => {
                const rescheduleData = {
                    appointment_date: '2024-02-02T10:00:00Z',
                    notes: 'Rescheduled due to patient request'
                };
                const rescheduledAppointment = { ...mockAppointment, ...rescheduleData };
                mockRequest.mockResolvedValue({ data: rescheduledAppointment });

                const result = await apiClient.update<Appointment>('Appointment', 'appointment-1', rescheduleData);

                expect(result.appointment_date).toBe('2024-02-02T10:00:00Z');
            });
        });

        describe('DELETE - Appointment Cancellation', () => {
            it('should cancel an appointment', async () => {
                mockRequest.mockResolvedValue({ data: { success: true, message: 'Appointment cancelled successfully' } });

                const result = await apiClient.delete('Appointment', 'appointment-1');

                expect(result.success).toBe(true);
            });
        });
    });

    describe('Prescription CRUD Operations', () => {
        const mockPrescription: Prescription = {
            id: 'prescription-1',
            patient_id: 'patient-1',
            doctor_id: 'doctor-1',
            medication_name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'once daily',
            duration: '3 months',
            instructions: 'Take once daily with food',
            prescribed_date: '2024-01-01',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        describe('CREATE - Prescription Creation', () => {
            it('should create a new prescription', async () => {
                const newPrescriptionData = {
                    patient_id: 'patient-1',
                    doctor_id: 'doctor-1',
                    medication_name: 'Metformin',
                    dosage: '500mg',
                    frequency: 'twice daily',
                    duration: '3 months',
                    instructions: 'Take twice daily with meals',
                    prescribed_date: '2024-01-15',
                    status: 'active'
                };

                mockRequest.mockResolvedValue({
                    data: { ...newPrescriptionData, id: 'prescription-2', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' }
                });

                const result = await apiClient.create<Prescription>('Prescription', newPrescriptionData) as Prescription;

                expect(result).toMatchObject(newPrescriptionData);
                expect(result.id).toBeDefined();
            });

            it('should handle prescription with drug interactions', async () => {
                const conflictingPrescription = {
                    patient_id: 'patient-1',
                    doctor_id: 'doctor-1',
                    medication_name: 'Warfarin',
                    dosage: '5mg',
                    frequency: 'once daily',
                    duration: '3 months',
                    instructions: 'Take as directed',
                    prescribed_date: '2024-01-15',
                    status: 'active'
                };

                mockRequest.mockRejectedValue(new Error('Drug interaction detected with existing medications'));

                await expect(apiClient.create<Prescription>('Prescription', conflictingPrescription))
                    .rejects.toThrow('Drug interaction detected with existing medications');
            });
        });

        describe('READ - Prescription Retrieval', () => {
            it('should list prescriptions by patient', async () => {
                const prescriptions = [mockPrescription];
                mockRequest.mockResolvedValue({ data: prescriptions });

                const result = await apiClient.list<Prescription>('Prescription', { patient_id: 'patient-1' });

                expect(result).toEqual(prescriptions);
            });

            it('should get prescription by ID', async () => {
                mockRequest.mockResolvedValue({ data: mockPrescription });

                const result = await apiClient.get<Prescription>('Prescription', 'prescription-1');

                expect(result).toEqual(mockPrescription);
            });
        });

        describe('UPDATE - Prescription Modification', () => {
            it('should update prescription dosage', async () => {
                const updateData = { dosage: '20mg', instructions: 'Take once daily in the morning' };
                const updatedPrescription = { ...mockPrescription, ...updateData };
                mockRequest.mockResolvedValue({ data: updatedPrescription });

                const result = await apiClient.update<Prescription>('Prescription', 'prescription-1', updateData) as Prescription;

                expect(result.dosage).toBe('20mg');
                expect(result.instructions).toBe('Take once daily in the morning');
            });

            it('should discontinue prescription', async () => {
                const discontinuationData = {
                    status: 'cancelled' as const,
                    instructions: 'Discontinued due to side effects'
                };
                const discontinuedPrescription = { ...mockPrescription, ...discontinuationData };
                mockRequest.mockResolvedValue({ data: discontinuedPrescription });

                const result = await apiClient.update<Prescription>('Prescription', 'prescription-1', discontinuationData) as Prescription;

                expect(result.status).toBe('cancelled');
            });
        });

        describe('DELETE - Prescription Removal', () => {
            it('should delete a prescription', async () => {
                mockRequest.mockResolvedValue({ data: { success: true, message: 'Prescription deleted successfully' } });

                const result = await apiClient.delete('Prescription', 'prescription-1');

                expect(result.success).toBe(true);
            });
        });
    });

    describe('Lab Order CRUD Operations', () => {
        const mockLabOrder: LabOrder = {
            id: 'lab-order-1',
            patient_id: 'patient-1',
            doctor_id: 'doctor-1',
            test_name: 'Complete Blood Count',
            test_type: 'blood',
            status: 'ordered',
            ordered_date: '2024-01-01',
            results: undefined,
            notes: 'Routine screening',
            priority: 'routine',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        describe('CREATE - Lab Order Creation', () => {
            it('should create a new lab order', async () => {
                const newLabOrderData = {
                    patient_id: 'patient-1',
                    doctor_id: 'doctor-1',
                    test_name: 'Lipid Panel',
                    test_type: 'blood',
                    status: 'ordered' as const,
                    ordered_date: '2024-01-15',
                    notes: 'Fasting required',
                    priority: 'routine' as const
                };

                mockRequest.mockResolvedValue({
                    data: { ...newLabOrderData, id: 'lab-order-2', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' }
                });

                const result = await apiClient.create<LabOrder>('LabOrder', newLabOrderData) as LabOrder;

                expect(result).toMatchObject(newLabOrderData);
                expect(result.id).toBeDefined();
            });
        });

        describe('READ - Lab Order Retrieval', () => {
            it('should list lab orders by patient', async () => {
                const labOrders = [mockLabOrder];
                mockRequest.mockResolvedValue({ data: labOrders });

                const result = await apiClient.list<LabOrder>('LabOrder', { patient_id: 'patient-1' });

                expect(result).toEqual(labOrders);
            });
        });

        describe('UPDATE - Lab Order Modification', () => {
            it('should update lab order with results', async () => {
                const resultsData = {
                    status: 'completed' as const,
                    results: 'Hemoglobin: 14.2 g/dL, Hematocrit: 42.1%, WBC: 7.2 K/uL, Platelets: 285 K/uL',
                    notes: 'All values within normal range'
                };
                const completedLabOrder = { ...mockLabOrder, ...resultsData };
                mockRequest.mockResolvedValue({ data: completedLabOrder });

                const result = await apiClient.update<LabOrder>('LabOrder', 'lab-order-1', resultsData) as LabOrder;

                expect(result.status).toBe('completed');
                expect(result.results).toBeDefined();
            });
        });

        describe('DELETE - Lab Order Removal', () => {
            it('should delete a lab order', async () => {
                mockRequest.mockResolvedValue({ data: { success: true, message: 'Lab order deleted successfully' } });

                const result = await apiClient.delete('LabOrder', 'lab-order-1');

                expect(result.success).toBe(true);
            });
        });
    });

    describe('Billing CRUD Operations', () => {
        const mockBilling: Billing = {
            id: 'billing-1',
            patient_id: 'patient-1',
            appointment_id: 'appointment-1',
            amount: 150.00,
            status: 'pending',
            due_date: '2024-02-15',
            payment_method: null,
            insurance_info: 'Blue Cross - BC123456',
            notes: 'Routine consultation',
            invoice_number: 'INV-2024-001',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        describe('CREATE - Billing Record Creation', () => {
            it('should create a new billing record', async () => {
                const newBillingData = {
                    patient_id: 'patient-1',
                    appointment_id: 'appointment-1',
                    amount: 200.00,
                    status: 'pending',
                    due_date: '2024-02-20',
                    insurance_info: 'Aetna - AET789012',
                    notes: 'Follow-up visit',
                    invoice_number: 'INV-2024-002'
                };

                mockRequest.mockResolvedValue({
                    data: { ...newBillingData, id: 'billing-2', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' }
                });

                const result = await apiClient.create<Billing>('Billing', newBillingData);

                expect(result).toMatchObject(newBillingData);
                expect(result.id).toBeDefined();
            });
        });

        describe('READ - Billing Retrieval', () => {
            it('should list billing records by patient', async () => {
                const billingRecords = [mockBilling];
                mockRequest.mockResolvedValue({ data: billingRecords });

                const result = await apiClient.list<Billing>('Billing', { patient_id: 'patient-1' });

                expect(result).toEqual(billingRecords);
            });
        });

        describe('UPDATE - Billing Modification', () => {
            it('should update billing payment status', async () => {
                const paymentData = {
                    status: 'paid',
                    payment_method: 'credit_card',
                    notes: 'Payment received via credit card'
                };
                const paidBilling = { ...mockBilling, ...paymentData };
                mockRequest.mockResolvedValue({ data: paidBilling });

                const result = await apiClient.update<Billing>('Billing', 'billing-1', paymentData);

                expect(result.status).toBe('paid');
                expect(result.payment_method).toBe('credit_card');
            });
        });

        describe('DELETE - Billing Record Removal', () => {
            it('should delete a billing record', async () => {
                mockRequest.mockResolvedValue({ data: { success: true, message: 'Billing record deleted successfully' } });

                const result = await apiClient.delete('Billing', 'billing-1');

                expect(result.success).toBe(true);
            });
        });
    });

    describe('Encounter CRUD Operations', () => {
        const mockEncounter: Encounter = {
            id: 'encounter-1',
            patient_id: 'patient-1',
            doctor_id: 'doctor-1',
            encounter_date: '2024-01-01',
            encounter_type: 'initial',
            chief_complaint: 'Annual checkup',
            diagnosis: 'Hypertension, well-controlled',
            treatment_plan: 'Continue current medication, follow up in 3 months',
            follow_up_instructions: 'Patient reports feeling well, blood pressure stable',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        describe('CREATE - Encounter Creation', () => {
            it('should create a new encounter', async () => {
                const newEncounterData = {
                    patient_id: 'patient-1',
                    doctor_id: 'doctor-1',
                    encounter_date: '2024-01-15',
                    encounter_type: 'follow_up' as const,
                    chief_complaint: 'Follow-up for hypertension',
                    diagnosis: 'Hypertension, stable',
                    treatment_plan: 'Continue Lisinopril, lifestyle modifications',
                    follow_up_instructions: 'Patient doing well with current treatment'
                };

                mockRequest.mockResolvedValue({
                    data: { ...newEncounterData, id: 'encounter-2', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' }
                });

                const result = await apiClient.create<Encounter>('Encounter', newEncounterData) as Encounter;

                expect(result).toMatchObject(newEncounterData);
                expect(result.id).toBeDefined();
            });
        });

        describe('READ - Encounter Retrieval', () => {
            it('should list encounters by patient', async () => {
                const encounters = [mockEncounter];
                mockRequest.mockResolvedValue({ data: encounters });

                const result = await apiClient.list<Encounter>('Encounter', { patient_id: 'patient-1' });

                expect(result).toEqual(encounters);
            });
        });

        describe('UPDATE - Encounter Modification', () => {
            it('should update encounter notes', async () => {
                const updateData = {
                    follow_up_instructions: 'Updated notes: Patient responding well to treatment',
                    diagnosis: 'Hypertension, well-controlled with medication'
                };
                const updatedEncounter = { ...mockEncounter, ...updateData };
                mockRequest.mockResolvedValue({ data: updatedEncounter });

                const result = await apiClient.update<Encounter>('Encounter', 'encounter-1', updateData) as Encounter;

                expect(result.follow_up_instructions).toBe('Updated notes: Patient responding well to treatment');
                expect(result.diagnosis).toBe('Hypertension, well-controlled with medication');
            });
        });

        describe('DELETE - Encounter Removal', () => {
            it('should delete an encounter', async () => {
                mockRequest.mockResolvedValue({ data: { success: true, message: 'Encounter deleted successfully' } });

                const result = await apiClient.delete('Encounter', 'encounter-1');

                expect(result.success).toBe(true);
            });
        });
    });

    describe('User CRUD Operations', () => {
        const mockUser: User = {
            id: 'user-1',
            first_name: 'Dr. Jane',
            last_name: 'Smith',
            email: 'jane.smith@clinic.com',
            role: 'Doctor',
            permissions: ['read_patients', 'write_patients'],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        describe('CREATE - User Creation', () => {
            it('should create a new user', async () => {
                const newUserData = {
                    first_name: 'Dr. John',
                    last_name: 'Johnson',
                    email: 'john.johnson@clinic.com',
                    role: 'Doctor',
                    permissions: ['read_patients', 'write_patients', 'read_appointments'],
                    is_active: true
                };

                mockRequest.mockResolvedValue({
                    data: { ...newUserData, id: 'user-2', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' }
                });

                const result = await apiClient.create<User>('User', newUserData) as User;

                expect(result).toMatchObject(newUserData);
                expect(result.id).toBeDefined();
            });

            it('should handle duplicate email', async () => {
                const duplicateUserData = {
                    first_name: 'Dr. Jane',
                    last_name: 'Doe',
                    email: 'jane.smith@clinic.com', // Same email as existing user
                    role: 'Nurse',
                    is_active: true
                };

                mockRequest.mockRejectedValue(new Error('Email already exists'));

                await expect(apiClient.create<User>('User', duplicateUserData))
                    .rejects.toThrow('Email already exists');
            });
        });

        describe('READ - User Retrieval', () => {
            it('should list users by role', async () => {
                const users = [mockUser];
                mockRequest.mockResolvedValue({ data: users });

                const result = await apiClient.list<User>('User', { role: 'Doctor' });

                expect(result).toEqual(users);
            });
        });

        describe('UPDATE - User Modification', () => {
            it('should update user permissions', async () => {
                const updateData = {
                    permissions: ['read_patients', 'write_patients', 'read_appointments', 'write_appointments'],
                    role: 'Senior Doctor'
                };
                const updatedUser = { ...mockUser, ...updateData };
                mockRequest.mockResolvedValue({ data: updatedUser });

                const result = await apiClient.update<User>('User', 'user-1', updateData);

                expect(result.permissions).toContain('write_appointments');
                expect(result.role).toBe('Senior Doctor');
            });

            it('should deactivate user', async () => {
                const deactivationData = { is_active: false };
                const deactivatedUser = { ...mockUser, ...deactivationData };
                mockRequest.mockResolvedValue({ data: deactivatedUser });

                const result = await apiClient.update<User>('User', 'user-1', deactivationData);

                expect(result.is_active).toBe(false);
            });
        });

        describe('DELETE - User Removal', () => {
            it('should delete a user', async () => {
                mockRequest.mockResolvedValue({ data: { success: true, message: 'User deleted successfully' } });

                const result = await apiClient.delete('User', 'user-1');

                expect(result.success).toBe(true);
            });
        });
    });

    describe('Organization CRUD Operations', () => {
        const mockOrganization: Organization = {
            id: 'org-1',
            name: 'Test Clinic',
            type: 'clinic',
            address: '123 Main St',
            city: 'Anytown',
            state: 'NY',
            zip_code: '12345',
            phone: '+1234567890',
            email: 'info@testclinic.com',
            website: 'https://testclinic.com',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        describe('CREATE - Organization Creation', () => {
            it('should create a new organization', async () => {
                const newOrgData = {
                    name: 'New Medical Center',
                    type: 'hospital',
                    address: '456 Healthcare Blvd',
                    city: 'Medville',
                    state: 'CA',
                    zip_code: '90210',
                    phone: '+1987654321',
                    email: 'info@newmedical.com',
                    website: 'https://newmedical.com',
                    is_active: true
                };

                mockRequest.mockResolvedValue({
                    data: { ...newOrgData, id: 'org-2', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' }
                });

                const result = await apiClient.create<Organization>('Organization', newOrgData) as Organization;

                expect(result).toMatchObject(newOrgData);
                expect(result.id).toBeDefined();
            });
        });

        describe('READ - Organization Retrieval', () => {
            it('should list organizations by type', async () => {
                const organizations = [mockOrganization];
                mockRequest.mockResolvedValue({ data: organizations });

                const result = await apiClient.list<Organization>('Organization', { type: 'clinic' });

                expect(result).toEqual(organizations);
            });
        });

        describe('UPDATE - Organization Modification', () => {
            it('should update organization information', async () => {
                const updateData = {
                    name: 'Updated Clinic Name',
                    phone: '+1234567899',
                    website: 'https://updatedclinic.com'
                };
                const updatedOrg = { ...mockOrganization, ...updateData };
                mockRequest.mockResolvedValue({ data: updatedOrg });

                const result = await apiClient.update<Organization>('Organization', 'org-1', updateData);

                expect(result.name).toBe('Updated Clinic Name');
                expect(result.phone).toBe('+1234567899');
            });
        });

        describe('DELETE - Organization Removal', () => {
            it('should delete an organization', async () => {
                mockRequest.mockResolvedValue({ data: { success: true, message: 'Organization deleted successfully' } });

                const result = await apiClient.delete('Organization', 'org-1');

                expect(result.success).toBe(true);
            });
        });
    });

    describe('Cross-Entity CRUD Operations', () => {
        it('should handle related entity operations', async () => {
            // Test creating a patient and then creating related records
            const patientData = {
                first_name: 'Test',
                last_name: 'Patient',
                email: 'test@example.com',
                phone: '+1234567890',
                status: 'active'
            };

            mockRequest
                .mockResolvedValueOnce({ data: { ...patientData, id: 'patient-test', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' } })
                .mockResolvedValueOnce({ data: { id: 'appointment-test', patient_id: 'patient-test', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' } });

            const patient = await apiClient.create<Patient>('Patient', patientData);
            const appointment = await apiClient.create<Appointment>('Appointment', {
                patient_id: patient.id,
                doctor_id: 'doctor-1',
                appointment_date: '2024-02-01T10:00:00Z',
                status: 'scheduled'
            });

            expect(patient.id).toBe('patient-test');
            expect(appointment.patient_id).toBe('patient-test');
        });

        it('should handle cascade operations', async () => {
            // Test that deleting a patient should handle related records
            mockRequest.mockRejectedValue(new Error('Cannot delete patient with existing appointments'));

            await expect(apiClient.delete('Patient', 'patient-1'))
                .rejects.toThrow('Cannot delete patient with existing appointments');
        });
    });

    describe('CRUD Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            const networkError = new Error('Network connection failed');
            mockRequest.mockRejectedValue(networkError);

            await expect(apiClient.list<Patient>('Patient'))
                .rejects.toThrow('Network connection failed');
        });

        it('should handle server errors gracefully', async () => {
            const serverError = new Error('Internal server error');
            mockRequest.mockRejectedValue(serverError);

            await expect(apiClient.create<Patient>('Patient', {}))
                .rejects.toThrow('Internal server error');
        });

        it('should handle timeout errors', async () => {
            const timeoutError = new Error('Request timeout');
            mockRequest.mockRejectedValue(timeoutError);

            await expect(apiClient.get<Patient>('Patient', 'patient-1'))
                .rejects.toThrow('Request timeout');
        });

        it('should handle validation errors', async () => {
            const validationError = new Error('Validation failed: Invalid data format');
            mockRequest.mockRejectedValue(validationError);

            await expect(apiClient.update<Patient>('Patient', 'patient-1', { email: 'invalid' }))
                .rejects.toThrow('Validation failed: Invalid data format');
        });
    });

    describe('CRUD Performance Testing', () => {
        it('should handle bulk operations efficiently', async () => {
            const bulkData = Array.from({ length: 100 }, (_, i) => ({
                first_name: `Patient${i}`,
                last_name: 'Test',
                email: `patient${i}@example.com`,
                phone: `+123456789${i}`,
                status: 'active'
            }));

            mockRequest.mockResolvedValue({ data: bulkData.map((data, i) => ({ ...data, id: `patient-${i}`, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' })) });

            const result = await apiClient.list<Patient>('Patient', { limit: 100 });

            expect(result).toHaveLength(100);
        });

        it('should handle concurrent operations', async () => {
            const promises = Array.from({ length: 10 }, (_, i) =>
                apiClient.create<Patient>('Patient', {
                    first_name: `Concurrent${i}`,
                    last_name: 'Test',
                    email: `concurrent${i}@example.com`,
                    phone: `+123456789${i}`,
                    status: 'active'
                })
            );

            mockRequest.mockResolvedValue({ data: { id: 'concurrent-test', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' } });

            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            expect(mockRequest).toHaveBeenCalledTimes(10);
        });
    });
});
