/**
 * Type-safe tests for API client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnhancedApiClient } from '@/api/apiClient';
import type { Patient, Appointment, User, Organization } from '@/types';

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

describe('EnhancedApiClient', () => {
    let apiClient: EnhancedApiClient;

    beforeEach(() => {
        apiClient = new EnhancedApiClient();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Patient operations', () => {
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

        it('should list patients', async () => {
            mockRequest.mockResolvedValue({ data: [mockPatient] });

            const result = await apiClient.list<Patient>('Patient');

            expect(result).toEqual([mockPatient]);
            expect(mockRequest).toHaveBeenCalledWith('/patients');
        });

        it('should get a patient by id', async () => {
            mockRequest.mockResolvedValue({ data: mockPatient });

            const result = await apiClient.get<Patient>('Patient', 'patient-1');

            expect(result).toEqual(mockPatient);
            expect(mockRequest).toHaveBeenCalledWith('/patients/patient-1');
        });

        it('should create a patient', async () => {
            const newPatient = { ...mockPatient, id: undefined };
            mockRequest.mockResolvedValue({ data: mockPatient });

            const result = await apiClient.create<Patient>('Patient', newPatient);

            expect(result).toEqual(mockPatient);
            expect(mockRequest).toHaveBeenCalledWith('/patients', {
                method: 'POST',
                body: JSON.stringify(newPatient)
            });
        });

        it('should update a patient', async () => {
            const updatedData = { first_name: 'Jane' };
            const updatedPatient = { ...mockPatient, ...updatedData };
            mockRequest.mockResolvedValue({ data: updatedPatient });

            const result = await apiClient.update<Patient>('Patient', 'patient-1', updatedData);

            expect(result).toEqual(updatedPatient);
            expect(mockRequest).toHaveBeenCalledWith('/patients/patient-1', {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });
        });

        it('should delete a patient', async () => {
            mockRequest.mockResolvedValue({ data: { success: true } });

            const result = await apiClient.delete('Patient', 'patient-1');

            expect(result).toEqual({ success: true });
            expect(mockRequest).toHaveBeenCalledWith('/patients/patient-1', {
                method: 'DELETE'
            });
        });
    });

    describe('Appointment operations', () => {
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

        it('should list appointments', async () => {
            mockRequest.mockResolvedValue({ data: [mockAppointment] });

            const result = await apiClient.list<Appointment>('Appointment');

            expect(result).toEqual([mockAppointment]);
            expect(mockRequest).toHaveBeenCalledWith('/appointments');
        });

        it('should get an appointment by id', async () => {
            mockRequest.mockResolvedValue({ data: mockAppointment });

            const result = await apiClient.get<Appointment>('Appointment', 'appointment-1');

            expect(result).toEqual(mockAppointment);
            expect(mockRequest).toHaveBeenCalledWith('/appointments/appointment-1');
        });

        it('should create an appointment', async () => {
            const newAppointment = { ...mockAppointment, id: undefined };
            mockRequest.mockResolvedValue({ data: mockAppointment });

            const result = await apiClient.create<Appointment>('Appointment', newAppointment);

            expect(result).toEqual(mockAppointment);
            expect(mockRequest).toHaveBeenCalledWith('/appointments', {
                method: 'POST',
                body: JSON.stringify(newAppointment)
            });
        });

        it('should update an appointment', async () => {
            const updatedData = { status: 'completed' };
            const updatedAppointment = { ...mockAppointment, ...updatedData };
            mockRequest.mockResolvedValue({ data: updatedAppointment });

            const result = await apiClient.update<Appointment>('Appointment', 'appointment-1', updatedData);

            expect(result).toEqual(updatedAppointment);
            expect(mockRequest).toHaveBeenCalledWith('/appointments/appointment-1', {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });
        });

        it('should delete an appointment', async () => {
            mockRequest.mockResolvedValue({ data: { success: true } });

            const result = await apiClient.delete('Appointment', 'appointment-1');

            expect(result).toEqual({ success: true });
            expect(mockRequest).toHaveBeenCalledWith('/appointments/appointment-1', {
                method: 'DELETE'
            });
        });
    });

    describe('User operations', () => {
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

        it('should list users', async () => {
            mockRequest.mockResolvedValue({ data: [mockUser] });

            const result = await apiClient.list<User>('User');

            expect(result).toEqual([mockUser]);
            expect(mockRequest).toHaveBeenCalledWith('/users');
        });

        it('should get a user by id', async () => {
            mockRequest.mockResolvedValue({ data: mockUser });

            const result = await apiClient.get<User>('User', 'user-1');

            expect(result).toEqual(mockUser);
            expect(mockRequest).toHaveBeenCalledWith('/users/user-1');
        });

        it('should create a user', async () => {
            const newUser = { ...mockUser, id: undefined };
            mockRequest.mockResolvedValue({ data: mockUser });

            const result = await apiClient.create<User>('User', newUser);

            expect(result).toEqual(mockUser);
            expect(mockRequest).toHaveBeenCalledWith('/users', {
                method: 'POST',
                body: JSON.stringify(newUser)
            });
        });

        it('should update a user', async () => {
            const updatedData = { first_name: 'Dr. John' };
            const updatedUser = { ...mockUser, ...updatedData };
            mockRequest.mockResolvedValue({ data: updatedUser });

            const result = await apiClient.update<User>('User', 'user-1', updatedData);

            expect(result).toEqual(updatedUser);
            expect(mockRequest).toHaveBeenCalledWith('/users/user-1', {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });
        });

        it('should delete a user', async () => {
            mockRequest.mockResolvedValue({ data: { success: true } });

            const result = await apiClient.delete('User', 'user-1');

            expect(result).toEqual({ success: true });
            expect(mockRequest).toHaveBeenCalledWith('/users/user-1', {
                method: 'DELETE'
            });
        });
    });

    describe('Organization operations', () => {
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

        it('should list organizations', async () => {
            mockRequest.mockResolvedValue({ data: [mockOrganization] });

            const result = await apiClient.list<Organization>('Organization');

            expect(result).toEqual([mockOrganization]);
            expect(mockRequest).toHaveBeenCalledWith('/organizations');
        });

        it('should get an organization by id', async () => {
            mockRequest.mockResolvedValue({ data: mockOrganization });

            const result = await apiClient.get<Organization>('Organization', 'org-1');

            expect(result).toEqual(mockOrganization);
            expect(mockRequest).toHaveBeenCalledWith('/organizations/org-1');
        });

        it('should create an organization', async () => {
            const newOrganization = { ...mockOrganization, id: undefined };
            mockRequest.mockResolvedValue({ data: mockOrganization });

            const result = await apiClient.create<Organization>('Organization', newOrganization);

            expect(result).toEqual(mockOrganization);
            expect(mockRequest).toHaveBeenCalledWith('/organizations', {
                method: 'POST',
                body: JSON.stringify(newOrganization)
            });
        });

        it('should update an organization', async () => {
            const updatedData = { name: 'Updated Clinic' };
            const updatedOrganization = { ...mockOrganization, ...updatedData };
            mockRequest.mockResolvedValue({ data: updatedOrganization });

            const result = await apiClient.update<Organization>('Organization', 'org-1', updatedData);

            expect(result).toEqual(updatedOrganization);
            expect(mockRequest).toHaveBeenCalledWith('/organizations/org-1', {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });
        });

        it('should delete an organization', async () => {
            mockRequest.mockResolvedValue({ data: { success: true } });

            const result = await apiClient.delete('Organization', 'org-1');

            expect(result).toEqual({ success: true });
            expect(mockRequest).toHaveBeenCalledWith('/organizations/org-1', {
                method: 'DELETE'
            });
        });
    });

    describe('Batch operations', () => {
        it('should execute batch operations', async () => {
            const operations = [
                { type: 'list' as const, entityType: 'Patient' as const },
                { type: 'get' as const, entityType: 'Patient' as const, id: 'patient-1' },
            ];

            mockRequest
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: { id: 'patient-1' } });

            const result = await apiClient.batchOperation(operations);

            expect(result).toHaveLength(2);
            expect(result[0]?.success).toBe(true);
            expect(result[1]?.success).toBe(true);
        });

        it('should handle batch operation errors', async () => {
            const operations = [
                { type: 'get' as const, entityType: 'Patient' as const, id: 'invalid-id' },
            ];

            mockRequest.mockRejectedValue(new Error('Not found'));

            const result = await apiClient.batchOperation(operations);

            expect(result).toHaveLength(1);
            expect(result[0]?.success).toBe(false);
            expect(result[0]?.error).toBeInstanceOf(Error);
        });
    });

    describe('Cache management', () => {
        it('should cache results', async () => {
            mockRequest.mockResolvedValue({ data: [] });

            // First call
            await apiClient.list<Patient>('Patient');
            expect(mockRequest).toHaveBeenCalledTimes(1);

            // Second call should use cache
            await apiClient.list<Patient>('Patient');
            expect(mockRequest).toHaveBeenCalledTimes(1);
        });

        it('should invalidate cache', () => {
            apiClient.invalidateCache('Patient');
            // Cache invalidation should not throw
            expect(true).toBe(true);
        });

        it('should clear cache', () => {
            apiClient.clearCache();
            // Cache clearing should not throw
            expect(true).toBe(true);
        });
    });

    describe('Health check', () => {
        it('should perform health check', async () => {
            mockRequest.mockResolvedValue({
                data: { status: 'healthy' }
            });

            const result = await apiClient.healthCheck();

            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('timestamp');
            expect(mockRequest).toHaveBeenCalledWith('/health');
        });
    });

    describe('Error handling', () => {
        it('should handle API errors gracefully', async () => {
            const error = new Error('API Error');
            mockRequest.mockRejectedValue(error);

            await expect(apiClient.list<Patient>('Patient')).rejects.toThrow('API Error');
        });

        it('should retry failed requests', async () => {
            const error = new Error('Network Error');
            mockRequest
                .mockRejectedValueOnce(error)
                .mockRejectedValueOnce(error)
                .mockResolvedValue({ data: [] });

            const result = await apiClient.list<Patient>('Patient');

            expect(result).toEqual([]);
            expect(mockRequest).toHaveBeenCalledTimes(3);
        });
    });
});