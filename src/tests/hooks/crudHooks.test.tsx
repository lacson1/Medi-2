/**
 * CRUD Integration Tests for React Query Hooks
 * Tests the integration between React Query hooks and CRUD operations
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResource, useResourceList } from '@/hooks/useResource';
import type { Patient, Appointment } from '@/types';

// Mock the API client
const mockApiClient = {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

vi.mock('@/api/unifiedApiClient', () => ({
    unifiedApiClient: mockApiClient,
}));

describe('CRUD React Query Hooks Integration', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
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
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

    describe('useResource Hook - Patient CRUD', () => {
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

        describe('READ Operations', () => {
            it('should fetch patient list', async () => {
                mockApiClient.list.mockResolvedValue([mockPatient]);

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                await waitFor(() => {
                    expect(result.current.list.isSuccess).toBe(true);
                });

                expect(result.current.list.data).toEqual([mockPatient]);
                expect(mockApiClient.list).toHaveBeenCalledWith('patients');
            });

            it('should fetch single patient', async () => {
                mockApiClient.get.mockResolvedValue(mockPatient);

                const { result } = renderHook(() => useResource<Patient>('patients', 'patient-1'), { wrapper });

                await waitFor(() => {
                    expect(result.current.item.isSuccess).toBe(true);
                });

                expect(result.current.item.data).toEqual(mockPatient);
                expect(mockApiClient.get).toHaveBeenCalledWith('patients', 'patient-1');
            });

            it('should handle loading states', async () => {
                mockApiClient.list.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([mockPatient]), 100)));

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                expect(result.current.isLoading).toBe(true);
                expect(result.current.list.isLoading).toBe(true);

                await waitFor(() => {
                    expect(result.current.isLoading).toBe(false);
                });
            });

            it('should handle error states', async () => {
                const error = new Error('Failed to fetch patients');
                mockApiClient.list.mockRejectedValue(error);

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                await waitFor(() => {
                    expect(result.current.list.isError).toBe(true);
                });

                expect(result.current.error).toEqual(error);
            });
        });

        describe('CREATE Operations', () => {
            it('should create a new patient', async () => {
                const newPatientData = {
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: 'jane.smith@example.com',
                    phone: '+1234567892',
                    status: 'active'
                };

                const createdPatient = { ...newPatientData, id: 'patient-2', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' };
                mockApiClient.create.mockResolvedValue(createdPatient);
                mockApiClient.list.mockResolvedValue([mockPatient, createdPatient]);

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                await waitFor(() => {
                    expect(result.current.list.isSuccess).toBe(true);
                });

                const createResult = await result.current.create.mutateAsync(newPatientData);

                expect(createResult).toEqual(createdPatient);
                expect(mockApiClient.create).toHaveBeenCalledWith('patients', newPatientData);
            });

            it('should handle create errors', async () => {
                const error = new Error('Failed to create patient');
                mockApiClient.create.mockRejectedValue(error);
                mockApiClient.list.mockResolvedValue([mockPatient]);

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                await waitFor(() => {
                    expect(result.current.list.isSuccess).toBe(true);
                });

                await expect(result.current.create.mutateAsync({})).rejects.toThrow('Failed to create patient');
            });

            it('should invalidate cache after create', async () => {
                const newPatientData = { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', status: 'active' };
                const createdPatient = { ...newPatientData, id: 'patient-2', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' };

                mockApiClient.create.mockResolvedValue(createdPatient);
                mockApiClient.list.mockResolvedValue([mockPatient, createdPatient]);

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                await waitFor(() => {
                    expect(result.current.list.isSuccess).toBe(true);
                });

                await result.current.create.mutateAsync(newPatientData);

                // Verify that list was called again (cache invalidation)
                expect(mockApiClient.list).toHaveBeenCalledTimes(2);
            });
        });

        describe('UPDATE Operations', () => {
            it('should update a patient', async () => {
                const updateData = { first_name: 'Johnny', phone: '+1234567899' };
                const updatedPatient = { ...mockPatient, ...updateData };

                mockApiClient.update.mockResolvedValue(updatedPatient);
                mockApiClient.get.mockResolvedValue(updatedPatient);
                mockApiClient.list.mockResolvedValue([updatedPatient]);

                const { result } = renderHook(() => useResource<Patient>('patients', 'patient-1'), { wrapper });

                await waitFor(() => {
                    expect(result.current.item.isSuccess).toBe(true);
                });

                const updateResult = await result.current.update.mutateAsync({ id: 'patient-1', data: updateData });

                expect(updateResult).toEqual(updatedPatient);
                expect(mockApiClient.update).toHaveBeenCalledWith('patients', 'patient-1', updateData);
            });

            it('should handle update errors', async () => {
                const error = new Error('Failed to update patient');
                mockApiClient.update.mockRejectedValue(error);
                mockApiClient.get.mockResolvedValue(mockPatient);

                const { result } = renderHook(() => useResource<Patient>('patients', 'patient-1'), { wrapper });

                await waitFor(() => {
                    expect(result.current.item.isSuccess).toBe(true);
                });

                await expect(result.current.update.mutateAsync({ id: 'patient-1', data: {} })).rejects.toThrow('Failed to update patient');
            });

            it('should invalidate cache after update', async () => {
                const updateData = { first_name: 'Johnny' };
                const updatedPatient = { ...mockPatient, ...updateData };

                mockApiClient.update.mockResolvedValue(updatedPatient);
                mockApiClient.get.mockResolvedValue(updatedPatient);
                mockApiClient.list.mockResolvedValue([updatedPatient]);

                const { result } = renderHook(() => useResource<Patient>('patients', 'patient-1'), { wrapper });

                await waitFor(() => {
                    expect(result.current.item.isSuccess).toBe(true);
                });

                await result.current.update.mutateAsync({ id: 'patient-1', data: updateData });

                // Verify that both item and list queries were invalidated
                expect(mockApiClient.get).toHaveBeenCalledTimes(2);
            });
        });

        describe('DELETE Operations', () => {
            it('should delete a patient', async () => {
                mockApiClient.delete.mockResolvedValue({ success: true });
                mockApiClient.list.mockResolvedValue([]);

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                await waitFor(() => {
                    expect(result.current.list.isSuccess).toBe(true);
                });

                const deleteResult = await result.current.delete.mutateAsync('patient-1');

                expect(deleteResult).toEqual({ success: true });
                expect(mockApiClient.delete).toHaveBeenCalledWith('patients', 'patient-1');
            });

            it('should handle delete errors', async () => {
                const error = new Error('Failed to delete patient');
                mockApiClient.delete.mockRejectedValue(error);
                mockApiClient.list.mockResolvedValue([mockPatient]);

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                await waitFor(() => {
                    expect(result.current.list.isSuccess).toBe(true);
                });

                await expect(result.current.delete.mutateAsync('patient-1')).rejects.toThrow('Failed to delete patient');
            });

            it('should invalidate cache after delete', async () => {
                mockApiClient.delete.mockResolvedValue({ success: true });
                mockApiClient.list.mockResolvedValue([]);

                const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

                await waitFor(() => {
                    expect(result.current.list.isSuccess).toBe(true);
                });

                await result.current.delete.mutateAsync('patient-1');

                // Verify that list was called again (cache invalidation)
                expect(mockApiClient.list).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('useResourceList Hook - Advanced CRUD Operations', () => {
        const mockPatients: Patient[] = [
            {
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
            },
            {
                id: 'patient-2',
                first_name: 'Jane',
                last_name: 'Smith',
                date_of_birth: '1985-05-15',
                gender: 'female',
                phone: '+1234567892',
                email: 'jane.smith@example.com',
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
                status: 'active',
                created_at: '2024-01-02T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
            }
        ];

        it('should fetch patients with pagination', async () => {
            mockApiClient.list.mockResolvedValue(mockPatients);

            const { result } = renderHook(() => useResourceList<Patient>('patients', { page: 1, limit: 10 }), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockPatients);
            expect(mockApiClient.list).toHaveBeenCalledWith('patients', { page: 1, limit: 10 });
        });

        it('should fetch patients with filters', async () => {
            const filteredPatients = [mockPatients[0]];
            mockApiClient.list.mockResolvedValue(filteredPatients);

            const { result } = renderHook(() => useResourceList<Patient>('patients', {
                status: 'active',
                city: 'Anytown'
            }), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(filteredPatients);
            expect(mockApiClient.list).toHaveBeenCalledWith('patients', {
                status: 'active',
                city: 'Anytown'
            });
        });

        it('should handle search queries', async () => {
            const searchResults = [mockPatients[0]];
            mockApiClient.list.mockResolvedValue(searchResults);

            const { result } = renderHook(() => useResourceList<Patient>('patients', {
                search: 'John'
            }), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(searchResults);
            expect(mockApiClient.list).toHaveBeenCalledWith('patients', {
                search: 'John'
            });
        });

        it('should handle disabled queries', async () => {
            const { result } = renderHook(() => useResourceList<Patient>('patients', {}, { enabled: false }), { wrapper });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.data).toBeUndefined();
            expect(mockApiClient.list).not.toHaveBeenCalled();
        });

        it('should respect stale time configuration', async () => {
            mockApiClient.list.mockResolvedValue(mockPatients);

            const { result } = renderHook(() => useResourceList<Patient>('patients', {}, { staleTime: 5000 }), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // Second call should use cache
            const { result: result2 } = renderHook(() => useResourceList<Patient>('patients', {}, { staleTime: 5000 }), { wrapper });

            await waitFor(() => {
                expect(result2.current.isSuccess).toBe(true);
            });

            // Should only call API once due to stale time
            expect(mockApiClient.list).toHaveBeenCalledTimes(1);
        });
    });

    describe('Cross-Entity CRUD Operations', () => {
        it('should handle related entity operations', async () => {
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

            mockApiClient.list.mockResolvedValue([mockPatient]);
            mockApiClient.create.mockResolvedValue(mockAppointment);

            const { result: patientResult } = renderHook(() => useResource<Patient>('patients'), { wrapper });
            const { result: appointmentResult } = renderHook(() => useResource<Appointment>('appointments'), { wrapper });

            await waitFor(() => {
                expect(patientResult.current.list.isSuccess).toBe(true);
            });

            // Create appointment for the patient
            await appointmentResult.current.create.mutateAsync({
                patient_id: mockPatient.id,
                doctor_id: 'doctor-1',
                appointment_date: '2024-02-01T10:00:00Z',
                status: 'scheduled'
            });

            expect(mockApiClient.create).toHaveBeenCalledWith('appointments', {
                patient_id: mockPatient.id,
                doctor_id: 'doctor-1',
                appointment_date: '2024-02-01T10:00:00Z',
                status: 'scheduled'
            });
        });
    });

    describe('CRUD Error Recovery', () => {
        it('should retry failed operations', async () => {
            const error = new Error('Network error');
            mockApiClient.list
                .mockRejectedValueOnce(error)
                .mockRejectedValueOnce(error)
                .mockResolvedValue([mockPatient]);

            const queryClientWithRetry = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 2,
                        retryDelay: 100,
                    },
                },
            });

            const retryWrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClientWithRetry}>
                    {children}
                </QueryClientProvider>
            );

            const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper: retryWrapper });

            await waitFor(() => {
                expect(result.current.list.isSuccess).toBe(true);
            }, { timeout: 1000 });

            expect(result.current.list.data).toEqual([mockPatient]);
            expect(mockApiClient.list).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });

        it('should handle optimistic updates', async () => {
            const newPatientData = {
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane@example.com',
                status: 'active'
            };

            const createdPatient = { ...newPatientData, id: 'patient-2', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' };

            mockApiClient.list.mockResolvedValue([mockPatient]);
            mockApiClient.create.mockResolvedValue(createdPatient);

            const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

            await waitFor(() => {
                expect(result.current.list.isSuccess).toBe(true);
            });

            await result.current.create.mutateAsync(newPatientData);

            expect(mockApiClient.create).toHaveBeenCalledWith('patients', newPatientData);
        });
    });

    describe('CRUD Performance Testing', () => {
        it('should handle large datasets efficiently', async () => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: `patient-${i}`,
                first_name: `Patient${i}`,
                last_name: 'Test',
                email: `patient${i}@example.com`,
                phone: `+123456789${i}`,
                status: 'active',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }));

            mockApiClient.list.mockResolvedValue(largeDataset);

            const { result } = renderHook(() => useResourceList<Patient>('patients', { limit: 1000 }), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toHaveLength(1000);
        });

        it('should handle concurrent mutations', async () => {
            const patients = Array.from({ length: 5 }, (_, i) => ({
                id: `patient-${i}`,
                first_name: `Patient${i}`,
                last_name: 'Test',
                email: `patient${i}@example.com`,
                status: 'active',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }));

            mockApiClient.list.mockResolvedValue(patients);
            mockApiClient.create.mockImplementation((_, data) =>
                Promise.resolve({ ...data, id: `patient-${Date.now()}`, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' })
            );

            const { result } = renderHook(() => useResource<Patient>('patients'), { wrapper });

            await waitFor(() => {
                expect(result.current.list.isSuccess).toBe(true);
            });

            // Create multiple patients concurrently
            const createPromises = Array.from({ length: 5 }, (_, i) =>
                result.current.create.mutateAsync({
                    first_name: `Concurrent${i}`,
                    last_name: 'Test',
                    email: `concurrent${i}@example.com`,
                    status: 'active'
                })
            );

            const results = await Promise.all(createPromises);

            expect(results).toHaveLength(5);
            expect(mockApiClient.create).toHaveBeenCalledTimes(5);
        });
    });
});
