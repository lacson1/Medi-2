/**
 * CRUD Component Tests
 * Tests CRUD operations in React components and forms
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { createMockPatient, createMockAppointment, createMockUser } from '../setup';
import type { Patient, Appointment, User } from '@/types';

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

// Mock components - these would be your actual form components
const PatientForm = ({ patient, onSubmit, onCancel }: {
    patient?: Patient;
    onSubmit: (data: Partial<Patient>) => void;
    onCancel: () => void;
}) => {
    const [formData, setFormData] = React.useState({
        first_name: patient?.first_name || '',
        last_name: patient?.last_name || '',
        email: patient?.email || '',
        phone: patient?.phone || '',
        status: patient?.status || 'active',
        ...patient
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} data-testid="patient-form">
            <input
                data-testid="first-name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="First Name"
                required
            />
            <input
                data-testid="last-name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Last Name"
                required
            />
            <input
                data-testid="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                required
            />
            <input
                data-testid="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone"
                required
            />
            <select
                data-testid="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                aria-label="Patient status"
            >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            <button type="submit" data-testid="submit-btn">Save</button>
            <button type="button" onClick={onCancel} data-testid="cancel-btn">Cancel</button>
        </form>
    );
};

const PatientList = ({ patients, onEdit, onDelete, onCreate }: {
    patients: Patient[];
    onEdit: (patient: Patient) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
}) => {
    return (
        <div data-testid="patient-list">
            <button onClick={onCreate} data-testid="create-btn">Add Patient</button>
            {patients.map(patient => (
                <div key={patient.id} data-testid={`patient-item-${patient.id}`}>
                    <span data-testid={`patient-name-${patient.id}`}>
                        {patient.first_name} {patient.last_name}
                    </span>
                    <span data-testid={`patient-email-${patient.id}`}>{patient.email}</span>
                    <button onClick={() => onEdit(patient)} data-testid={`edit-btn-${patient.id}`}>Edit</button>
                    <button onClick={() => onDelete(patient.id)} data-testid={`delete-btn-${patient.id}`}>Delete</button>
                </div>
            ))}
        </div>
    );
};

const PatientManagement = () => {
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
    const [isCreating, setIsCreating] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const data = await mockApiClient.list('patients') as Patient[];
            setPatients(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: Partial<Patient>) => {
        try {
            const newPatient = await mockApiClient.create('patients', data) as Patient;
            setPatients([...patients, newPatient]);
            setIsCreating(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create patient');
        }
    };

    const handleUpdate = async (data: Partial<Patient>) => {
        if (!selectedPatient) return;
        try {
            const updatedPatient = await mockApiClient.update('patients', selectedPatient.id, data) as Patient;
            setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
            setSelectedPatient(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update patient');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await mockApiClient.delete('patients', id);
            setPatients(patients.filter(p => p.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete patient');
        }
    };

    React.useEffect(() => {
        void loadPatients();
    }, []);

    if (loading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">{error}</div>;

    return (
        <div data-testid="patient-management">
            {isCreating ? (
                <PatientForm
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreating(false)}
                />
            ) : selectedPatient ? (
                <PatientForm
                    patient={selectedPatient}
                    onSubmit={handleUpdate}
                    onCancel={() => setSelectedPatient(null)}
                />
            ) : (
                <PatientList
                    patients={patients}
                    onEdit={setSelectedPatient}
                    onDelete={handleDelete}
                    onCreate={() => setIsCreating(true)}
                />
            )}
        </div>
    );
};

describe('CRUD Component Tests', () => {
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
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );

    describe('Patient CRUD Component Operations', () => {
        const mockPatients = [
            createMockPatient({ id: 'patient-1', first_name: 'John', last_name: 'Doe' }),
            createMockPatient({ id: 'patient-2', first_name: 'Jane', last_name: 'Smith' }),
        ];

        describe('CREATE Operations', () => {
            it('should render create form when create button is clicked', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                const createBtn = screen.getByTestId('create-btn');
                await userEvent.click(createBtn);

                expect(screen.getByTestId('patient-form')).toBeInTheDocument();
                expect(screen.getByTestId('first-name')).toBeInTheDocument();
                expect(screen.getByTestId('last-name')).toBeInTheDocument();
                expect(screen.getByTestId('email')).toBeInTheDocument();
            });

            it('should create a new patient when form is submitted', async () => {
                const newPatientData = {
                    first_name: 'New',
                    last_name: 'Patient',
                    email: 'new@example.com',
                    phone: '+1234567890',
                    status: 'active'
                };

                const createdPatient = { ...newPatientData, id: 'patient-3', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' };

                mockApiClient.list.mockResolvedValue(mockPatients);
                mockApiClient.create.mockResolvedValue(createdPatient);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                // Click create button
                await userEvent.click(screen.getByTestId('create-btn'));

                // Fill form
                await userEvent.type(screen.getByTestId('first-name'), newPatientData.first_name);
                await userEvent.type(screen.getByTestId('last-name'), newPatientData.last_name);
                await userEvent.type(screen.getByTestId('email'), newPatientData.email);
                await userEvent.type(screen.getByTestId('phone'), newPatientData.phone);

                // Submit form
                await userEvent.click(screen.getByTestId('submit-btn'));

                expect(mockApiClient.create).toHaveBeenCalledWith('patients', expect.objectContaining(newPatientData));
            });

            it('should validate required fields', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                await userEvent.click(screen.getByTestId('create-btn'));

                // Try to submit without filling required fields
                await userEvent.click(screen.getByTestId('submit-btn'));

                // Form should not submit due to HTML5 validation
                expect(mockApiClient.create).not.toHaveBeenCalled();
            });

            it('should handle create errors', async () => {
                const error = new Error('Failed to create patient');
                mockApiClient.list.mockResolvedValue(mockPatients);
                mockApiClient.create.mockRejectedValue(error);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                await userEvent.click(screen.getByTestId('create-btn'));

                await userEvent.type(screen.getByTestId('first-name'), 'Test');
                await userEvent.type(screen.getByTestId('last-name'), 'Patient');
                await userEvent.type(screen.getByTestId('email'), 'test@example.com');
                await userEvent.type(screen.getByTestId('phone'), '+1234567890');

                await userEvent.click(screen.getByTestId('submit-btn'));

                await waitFor(() => {
                    expect(screen.getByTestId('error')).toBeInTheDocument();
                });

                expect(screen.getByTestId('error')).toHaveTextContent('Failed to create patient');
            });
        });

        describe('READ Operations', () => {
            it('should display patient list', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                expect(screen.getByTestId('patient-item-patient-1')).toBeInTheDocument();
                expect(screen.getByTestId('patient-item-patient-2')).toBeInTheDocument();
                expect(screen.getByTestId('patient-name-patient-1')).toHaveTextContent('John Doe');
                expect(screen.getByTestId('patient-name-patient-2')).toHaveTextContent('Jane Smith');
            });

            it('should show loading state', async () => {
                mockApiClient.list.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockPatients), 100)));

                render(<PatientManagement />, { wrapper });

                expect(screen.getByTestId('loading')).toBeInTheDocument();
            });

            it('should handle load errors', async () => {
                const error = new Error('Failed to load patients');
                mockApiClient.list.mockRejectedValue(error);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('error')).toBeInTheDocument();
                });

                expect(screen.getByTestId('error')).toHaveTextContent('Failed to load patients');
            });
        });

        describe('UPDATE Operations', () => {
            it('should render edit form when edit button is clicked', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                const editBtn = screen.getByTestId('edit-btn-patient-1');
                await userEvent.click(editBtn);

                expect(screen.getByTestId('patient-form')).toBeInTheDocument();
                expect(screen.getByTestId('first-name')).toHaveValue('John');
                expect(screen.getByTestId('last-name')).toHaveValue('Doe');
            });

            it('should update patient when form is submitted', async () => {
                const updateData = {
                    first_name: 'Johnny',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1234567890',
                    status: 'active'
                };

                const updatedPatient = { ...mockPatients[0], ...updateData };

                mockApiClient.list.mockResolvedValue(mockPatients);
                mockApiClient.update.mockResolvedValue(updatedPatient);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                // Click edit button
                await userEvent.click(screen.getByTestId('edit-btn-patient-1'));

                // Update form
                const firstNameInput = screen.getByTestId('first-name');
                await userEvent.clear(firstNameInput);
                await userEvent.type(firstNameInput, updateData.first_name);

                // Submit form
                await userEvent.click(screen.getByTestId('submit-btn'));

                expect(mockApiClient.update).toHaveBeenCalledWith('patients', 'patient-1', expect.objectContaining(updateData));
            });

            it('should handle update errors', async () => {
                const error = new Error('Failed to update patient');
                mockApiClient.list.mockResolvedValue(mockPatients);
                mockApiClient.update.mockRejectedValue(error);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                await userEvent.click(screen.getByTestId('edit-btn-patient-1'));

                const firstNameInput = screen.getByTestId('first-name');
                await userEvent.clear(firstNameInput);
                await userEvent.type(firstNameInput, 'Updated');

                await userEvent.click(screen.getByTestId('submit-btn'));

                await waitFor(() => {
                    expect(screen.getByTestId('error')).toBeInTheDocument();
                });

                expect(screen.getByTestId('error')).toHaveTextContent('Failed to update patient');
            });
        });

        describe('DELETE Operations', () => {
            it('should delete patient when delete button is clicked', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);
                mockApiClient.delete.mockResolvedValue({ success: true });

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                const deleteBtn = screen.getByTestId('delete-btn-patient-1');
                await userEvent.click(deleteBtn);

                expect(mockApiClient.delete).toHaveBeenCalledWith('patients', 'patient-1');
            });

            it('should handle delete errors', async () => {
                const error = new Error('Failed to delete patient');
                mockApiClient.list.mockResolvedValue(mockPatients);
                mockApiClient.delete.mockRejectedValue(error);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                await userEvent.click(screen.getByTestId('delete-btn-patient-1'));

                await waitFor(() => {
                    expect(screen.getByTestId('error')).toBeInTheDocument();
                });

                expect(screen.getByTestId('error')).toHaveTextContent('Failed to delete patient');
            });
        });

        describe('Form Validation', () => {
            it('should validate email format', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                await userEvent.click(screen.getByTestId('create-btn'));

                await userEvent.type(screen.getByTestId('first-name'), 'Test');
                await userEvent.type(screen.getByTestId('last-name'), 'Patient');
                await userEvent.type(screen.getByTestId('email'), 'invalid-email');
                await userEvent.type(screen.getByTestId('phone'), '+1234567890');

                await userEvent.click(screen.getByTestId('submit-btn'));

                // Form should not submit due to HTML5 email validation
                expect(mockApiClient.create).not.toHaveBeenCalled();
            });

            it('should validate required fields', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                await userEvent.click(screen.getByTestId('create-btn'));

                // Try to submit with empty required fields
                await userEvent.click(screen.getByTestId('submit-btn'));

                // Form should not submit due to HTML5 validation
                expect(mockApiClient.create).not.toHaveBeenCalled();
            });
        });

        describe('User Experience', () => {
            it('should cancel form and return to list', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                await userEvent.click(screen.getByTestId('create-btn'));
                expect(screen.getByTestId('patient-form')).toBeInTheDocument();

                await userEvent.click(screen.getByTestId('cancel-btn'));
                expect(screen.getByTestId('patient-list')).toBeInTheDocument();
            });

            it('should show form with pre-filled data for editing', async () => {
                mockApiClient.list.mockResolvedValue(mockPatients);

                render(<PatientManagement />, { wrapper });

                await waitFor(() => {
                    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
                });

                await userEvent.click(screen.getByTestId('edit-btn-patient-1'));

                expect(screen.getByTestId('first-name')).toHaveValue('John');
                expect(screen.getByTestId('last-name')).toHaveValue('Doe');
                expect(screen.getByTestId('email')).toHaveValue('john.doe@example.com');
            });
        });
    });

    describe('Appointment CRUD Component Operations', () => {
        const mockAppointments = [
            createMockAppointment({
                id: 'appointment-1',
                patient_name: 'John Doe',
                appointment_date: '2024-02-01T10:00:00Z',
                status: 'scheduled'
            }),
            createMockAppointment({
                id: 'appointment-2',
                patient_name: 'Jane Smith',
                appointment_date: '2024-02-02T14:00:00Z',
                status: 'completed'
            }),
        ];

        it('should display appointment list with status', async () => {
            mockApiClient.list.mockResolvedValue(mockAppointments);

            // This would be your actual AppointmentList component
            const AppointmentList = ({ appointments }: { appointments: Appointment[] }) => (
                <div data-testid="appointment-list">
                    {appointments.map(appointment => (
                        <div key={appointment.id} data-testid={`appointment-item-${appointment.id}`}>
                            <span data-testid={`appointment-patient-${appointment.id}`}>
                                {appointment.patient_name}
                            </span>
                            <span data-testid={`appointment-date-${appointment.id}`}>
                                {new Date(appointment.appointment_date).toLocaleDateString()}
                            </span>
                            <span data-testid={`appointment-status-${appointment.id}`}>
                                {appointment.status}
                            </span>
                        </div>
                    ))}
                </div>
            );

            render(<AppointmentList appointments={mockAppointments} />, { wrapper });

            expect(screen.getByTestId('appointment-item-appointment-1')).toBeInTheDocument();
            expect(screen.getByTestId('appointment-patient-appointment-1')).toHaveTextContent('John Doe');
            expect(screen.getByTestId('appointment-status-appointment-1')).toHaveTextContent('scheduled');
        });
    });

    describe('User CRUD Component Operations', () => {
        const mockUsers = [
            createMockUser({
                id: 'user-1',
                first_name: 'Dr. John',
                last_name: 'Smith',
                role: 'Doctor',
                email: 'john.smith@clinic.com'
            }),
            createMockUser({
                id: 'user-2',
                first_name: 'Nurse',
                last_name: 'Johnson',
                role: 'Nurse',
                email: 'nurse.johnson@clinic.com'
            }),
        ];

        it('should display user list with roles', async () => {
            mockApiClient.list.mockResolvedValue(mockUsers);

            const UserList = ({ users }: { users: User[] }) => (
                <div data-testid="user-list">
                    {users.map(user => (
                        <div key={user.id} data-testid={`user-item-${user.id}`}>
                            <span data-testid={`user-name-${user.id}`}>
                                {user.first_name} {user.last_name}
                            </span>
                            <span data-testid={`user-role-${user.id}`}>
                                {user.role}
                            </span>
                            <span data-testid={`user-email-${user.id}`}>
                                {user.email}
                            </span>
                        </div>
                    ))}
                </div>
            );

            render(<UserList users={mockUsers} />, { wrapper });

            expect(screen.getByTestId('user-item-user-1')).toBeInTheDocument();
            expect(screen.getByTestId('user-name-user-1')).toHaveTextContent('Dr. John Smith');
            expect(screen.getByTestId('user-role-user-1')).toHaveTextContent('Doctor');
        });
    });

    describe('CRUD Component Integration', () => {
        it('should handle multiple CRUD operations in sequence', async () => {
            const initialPatients = [createMockPatient({ id: 'patient-1', first_name: 'John', last_name: 'Doe' })];
            const newPatient = createMockPatient({ id: 'patient-2', first_name: 'Jane', last_name: 'Smith' });
            const updatedPatient = createMockPatient({ id: 'patient-1', first_name: 'Johnny', last_name: 'Doe' });

            mockApiClient.list
                .mockResolvedValueOnce(initialPatients)
                .mockResolvedValueOnce([...initialPatients, newPatient])
                .mockResolvedValueOnce([updatedPatient, newPatient]);

            mockApiClient.create.mockResolvedValue(newPatient);
            mockApiClient.update.mockResolvedValue(updatedPatient);
            mockApiClient.delete.mockResolvedValue({ success: true });

            render(<PatientManagement />, { wrapper });

            // Wait for initial load
            await waitFor(() => {
                expect(screen.getByTestId('patient-list')).toBeInTheDocument();
            });

            // Create a new patient
            await userEvent.click(screen.getByTestId('create-btn'));
            await userEvent.type(screen.getByTestId('first-name'), 'Jane');
            await userEvent.type(screen.getByTestId('last-name'), 'Smith');
            await userEvent.type(screen.getByTestId('email'), 'jane@example.com');
            await userEvent.type(screen.getByTestId('phone'), '+1234567890');
            await userEvent.click(screen.getByTestId('submit-btn'));

            // Edit existing patient
            await waitFor(() => {
                expect(screen.getByTestId('edit-btn-patient-1')).toBeInTheDocument();
            });
            await userEvent.click(screen.getByTestId('edit-btn-patient-1'));

            const firstNameInput = screen.getByTestId('first-name');
            await userEvent.clear(firstNameInput);
            await userEvent.type(firstNameInput, 'Johnny');
            await userEvent.click(screen.getByTestId('submit-btn'));

            // Delete a patient
            await waitFor(() => {
                expect(screen.getByTestId('delete-btn-patient-2')).toBeInTheDocument();
            });
            await userEvent.click(screen.getByTestId('delete-btn-patient-2'));

            // Verify all operations were called
            expect(mockApiClient.create).toHaveBeenCalled();
            expect(mockApiClient.update).toHaveBeenCalled();
            expect(mockApiClient.delete).toHaveBeenCalled();
        });
    });
});
