/**
 * Type-safe tests for React Query hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
    usePatients,
    usePatient,
    useCreatePatient,
    useUpdatePatient,
    useDeletePatient,
    useAppointments,
    useAppointment,
    useCreateAppointment,
    useUpdateAppointment,
    useDeleteAppointment,
    useUsers,
    useUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useOrganizations,
    useOrganization,
    useCreateOrganization,
    useUpdateOrganization,
    useDeleteOrganization,
    useBatchOperation,
    useInfinitePatients,
    useInfiniteAppointments,
    useApiHealth,
    useSearchPatients,
    useSearchAppointments,
    useCacheManagement,
} from '@/hooks/useApi';
import type { Patient, Appointment, User, Organization } from '@/types';

// Mock the API client
vi.mock('@/api/apiClient', () => ({
    api: {
        patients: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        appointments: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        users: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        organizations: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        batch: vi.fn(),
        health: vi.fn(),
        cache: {
            clear: vi.fn(),
            invalidate: vi.fn(),
        },
    },
}));

// Mock monitoring
vi.mock('@/lib/monitoring', () => ({
    ErrorLogger: {
        log: vi.fn(),
    },
}));

// Test wrapper component
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('React Query Hooks', () => {
    let mockApi: any;

    beforeEach(() => {
        mockApi = require('@/api/apiClient').api;
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Patient Hooks', () => {
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

        it('should fetch patients list', async () => {
            mockApi.patients.list.mockResolvedValue([mockPatient]);

            const { result } = renderHook(() => usePatients(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([mockPatient]);
            expect(mockApi.patients.list).toHaveBeenCalledWith({});
        });

        it('should fetch single patient', async () => {
            mockApi.patients.get.mockResolvedValue(mockPatient);

            const { result } = renderHook(() => usePatient('patient-1'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockPatient);
            expect(mockApi.patients.get).toHaveBeenCalledWith('patient-1', {});
        });

        it('should create patient', async () => {
            const newPatient = { ...mockPatient, id: undefined };
            mockApi.patients.create.mockResolvedValue(mockPatient);

            const { result } = renderHook(() => useCreatePatient(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            result.current.mutate(newPatient);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.patients.create).toHaveBeenCalledWith(newPatient);
        });

        it('should update patient', async () => {
            const updatedData = { first_name: 'Jane' };
            const updatedPatient = { ...mockPatient, ...updatedData };
            mockApi.patients.update.mockResolvedValue(updatedPatient);

            const { result } = renderHook(() => useUpdatePatient(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ id: 'patient-1', data: updatedData });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.patients.update).toHaveBeenCalledWith('patient-1', updatedData);
        });

        it('should delete patient', async () => {
            mockApi.patients.delete.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useDeletePatient(), {
                wrapper: createWrapper(),
            });

            result.current.mutate('patient-1');

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.patients.delete).toHaveBeenCalledWith('patient-1');
        });
    });

    describe('Appointment Hooks', () => {
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

        it('should fetch appointments list', async () => {
            mockApi.appointments.list.mockResolvedValue([mockAppointment]);

            const { result } = renderHook(() => useAppointments(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([mockAppointment]);
            expect(mockApi.appointments.list).toHaveBeenCalledWith({});
        });

        it('should fetch single appointment', async () => {
            mockApi.appointments.get.mockResolvedValue(mockAppointment);

            const { result } = renderHook(() => useAppointment('appointment-1'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockAppointment);
            expect(mockApi.appointments.get).toHaveBeenCalledWith('appointment-1', {});
        });

        it('should create appointment', async () => {
            const newAppointment = { ...mockAppointment, id: undefined };
            mockApi.appointments.create.mockResolvedValue(mockAppointment);

            const { result } = renderHook(() => useCreateAppointment(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(newAppointment);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.appointments.create).toHaveBeenCalledWith(newAppointment);
        });

        it('should update appointment', async () => {
            const updatedData = { status: 'completed' };
            const updatedAppointment = { ...mockAppointment, ...updatedData };
            mockApi.appointments.update.mockResolvedValue(updatedAppointment);

            const { result } = renderHook(() => useUpdateAppointment(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ id: 'appointment-1', data: updatedData });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.appointments.update).toHaveBeenCalledWith('appointment-1', updatedData);
        });

        it('should delete appointment', async () => {
            mockApi.appointments.delete.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useDeleteAppointment(), {
                wrapper: createWrapper(),
            });

            result.current.mutate('appointment-1');

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.appointments.delete).toHaveBeenCalledWith('appointment-1');
        });
    });

    describe('User Hooks', () => {
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

        it('should fetch users list', async () => {
            mockApi.users.list.mockResolvedValue([mockUser]);

            const { result } = renderHook(() => useUsers(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([mockUser]);
            expect(mockApi.users.list).toHaveBeenCalledWith({});
        });

        it('should fetch single user', async () => {
            mockApi.users.get.mockResolvedValue(mockUser);

            const { result } = renderHook(() => useUser('user-1'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockUser);
            expect(mockApi.users.get).toHaveBeenCalledWith('user-1', {});
        });

        it('should create user', async () => {
            const newUser = { ...mockUser, id: undefined };
            mockApi.users.create.mockResolvedValue(mockUser);

            const { result } = renderHook(() => useCreateUser(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(newUser);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.users.create).toHaveBeenCalledWith(newUser);
        });

        it('should update user', async () => {
            const updatedData = { first_name: 'Dr. John' };
            const updatedUser = { ...mockUser, ...updatedData };
            mockApi.users.update.mockResolvedValue(updatedUser);

            const { result } = renderHook(() => useUpdateUser(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ id: 'user-1', data: updatedData });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.users.update).toHaveBeenCalledWith('user-1', updatedData);
        });

        it('should delete user', async () => {
            mockApi.users.delete.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useDeleteUser(), {
                wrapper: createWrapper(),
            });

            result.current.mutate('user-1');

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.users.delete).toHaveBeenCalledWith('user-1');
        });
    });

    describe('Organization Hooks', () => {
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

        it('should fetch organizations list', async () => {
            mockApi.organizations.list.mockResolvedValue([mockOrganization]);

            const { result } = renderHook(() => useOrganizations(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([mockOrganization]);
            expect(mockApi.organizations.list).toHaveBeenCalledWith({});
        });

        it('should fetch single organization', async () => {
            mockApi.organizations.get.mockResolvedValue(mockOrganization);

            const { result } = renderHook(() => useOrganization('org-1'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockOrganization);
            expect(mockApi.organizations.get).toHaveBeenCalledWith('org-1', {});
        });

        it('should create organization', async () => {
            const newOrganization = { ...mockOrganization, id: undefined };
            mockApi.organizations.create.mockResolvedValue(mockOrganization);

            const { result } = renderHook(() => useCreateOrganization(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(newOrganization);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.organizations.create).toHaveBeenCalledWith(newOrganization);
        });

        it('should update organization', async () => {
            const updatedData = { name: 'Updated Clinic' };
            const updatedOrganization = { ...mockOrganization, ...updatedData };
            mockApi.organizations.update.mockResolvedValue(updatedOrganization);

            const { result } = renderHook(() => useUpdateOrganization(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ id: 'org-1', data: updatedData });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.organizations.update).toHaveBeenCalledWith('org-1', updatedData);
        });

        it('should delete organization', async () => {
            mockApi.organizations.delete.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useDeleteOrganization(), {
                wrapper: createWrapper(),
            });

            result.current.mutate('org-1');

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.organizations.delete).toHaveBeenCalledWith('org-1');
        });
    });

    describe('Batch Operation Hook', () => {
        it('should execute batch operations', async () => {
            const operations = [
                { type: 'list' as const, entityType: 'Patient' as const },
                { type: 'get' as const, entityType: 'Patient' as const, id: 'patient-1' },
            ];

            mockApi.batch.mockResolvedValue([
                { success: true, data: [] },
                { success: true, data: { id: 'patient-1' } },
            ]);

            const { result } = renderHook(() => useBatchOperation(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ operations });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockApi.batch).toHaveBeenCalledWith(operations, undefined);
        });
    });

    describe('Infinite Query Hooks', () => {
        it('should fetch infinite patients', async () => {
            const mockPatients = [
                { id: 'patient-1', first_name: 'John', last_name: 'Doe' },
                { id: 'patient-2', first_name: 'Jane', last_name: 'Smith' },
            ];

            mockApi.patients.list.mockResolvedValue(mockPatients);

            const { result } = renderHook(() => useInfinitePatients(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.pages[0]).toEqual(mockPatients);
        });

        it('should fetch infinite appointments', async () => {
            const mockAppointments = [
                { id: 'appointment-1', patient_id: 'patient-1' },
                { id: 'appointment-2', patient_id: 'patient-2' },
            ];

            mockApi.appointments.list.mockResolvedValue(mockAppointments);

            const { result } = renderHook(() => useInfiniteAppointments(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.pages[0]).toEqual(mockAppointments);
        });
    });

    describe('Health Check Hook', () => {
        it('should check API health', async () => {
            mockApi.health.mockResolvedValue({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z' });

            const { result } = renderHook(() => useApiHealth(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z' });
        });
    });

    describe('Search Hooks', () => {
        it('should search patients', async () => {
            const mockPatients = [
                { id: 'patient-1', first_name: 'John', last_name: 'Doe' },
            ];

            mockApi.patients.list.mockResolvedValue(mockPatients);

            const { result } = renderHook(() => useSearchPatients('John'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockPatients);
            expect(mockApi.patients.list).toHaveBeenCalledWith({ search: 'John' });
        });

        it('should search appointments', async () => {
            const mockAppointments = [
                { id: 'appointment-1', patient_id: 'patient-1' },
            ];

            mockApi.appointments.list.mockResolvedValue(mockAppointments);

            const { result } = renderHook(() => useSearchAppointments('checkup'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockAppointments);
            expect(mockApi.appointments.list).toHaveBeenCalledWith({ search: 'checkup' });
        });
    });

    describe('Cache Management Hook', () => {
        it('should clear all cache', () => {
            const { result } = renderHook(() => useCacheManagement(), {
                wrapper: createWrapper(),
            });

            result.current.clearAllCache();

            expect(mockApi.cache.clear).toHaveBeenCalled();
        });

        it('should invalidate entity cache', () => {
            const { result } = renderHook(() => useCacheManagement(), {
                wrapper: createWrapper(),
            });

            result.current.invalidateEntityCache('Patient');

            expect(mockApi.cache.invalidate).toHaveBeenCalledWith('patient');
        });

        it('should prefetch entity', async () => {
            const { result } = renderHook(() => useCacheManagement(), {
                wrapper: createWrapper(),
            });

            await result.current.prefetchEntity('Patient', 'patient-1');

            expect(mockApi.patients.get).toHaveBeenCalledWith('patient-1');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            const error = new Error('API Error');
            mockApi.patients.list.mockRejectedValue(error);

            const { result } = renderHook(() => usePatients(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toEqual(error);
        });

        it('should handle mutation errors', async () => {
            const error = new Error('Mutation Error');
            mockApi.patients.create.mockRejectedValue(error);

            const { result } = renderHook(() => useCreatePatient(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ first_name: 'John', last_name: 'Doe' });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toEqual(error);
        });
    });
});
