import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/hooks/useAuth";
import PatientCard from '@/components/patients/PatientCard';
import type { ReactNode } from 'react';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('PatientCard', () => {
  const mockPatient = {
    id: 'patient-1',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    date_of_birth: '1985-03-15',
    gender: 'male',
    address: '123 Main St, New York, NY 10001',
    blood_type: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    medical_conditions: ['Hypertension', 'Diabetes Type 2'],
    medications: [
      { name: 'Metformin', dosage: '500mg twice daily' },
      { name: 'Lisinopril', dosage: '10mg once daily' }
    ],
    emergency_contact: {
      name: 'Jane Smith',
      phone: '+1-555-0124',
      relationship: 'Spouse'
    },
    insurance_provider: 'Blue Cross Blue Shield',
    insurance_id: 'BC123456789',
    status: 'active',
    created_date: '2024-01-15T10:30:00Z',
    updated_date: '2024-01-20T14:45:00Z'
  };

  it('renders patient information correctly', () => {
    render(
      <TestWrapper>
        <PatientCard patient={mockPatient} />
      </TestWrapper>
    );

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('john.smith@email.com')).toBeInTheDocument();
    expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('O+')).toBeInTheDocument();
  });

  it('displays allergies correctly', () => {
    render(
      <TestWrapper>
        <PatientCard patient={mockPatient} />
      </TestWrapper>
    );

    expect(screen.getByText('Penicillin')).toBeInTheDocument();
    expect(screen.getByText('Shellfish')).toBeInTheDocument();
  });

  it('displays medical conditions correctly', () => {
    render(
      <TestWrapper>
        <PatientCard patient={mockPatient} />
      </TestWrapper>
    );

    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('Diabetes Type 2')).toBeInTheDocument();
  });

  it('displays emergency contact information', () => {
    render(
      <TestWrapper>
        <PatientCard patient={mockPatient} />
      </TestWrapper>
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Spouse')).toBeInTheDocument();
    expect(screen.getByText('+1-555-0124')).toBeInTheDocument();
  });

  it('shows insurance information', () => {
    render(
      <TestWrapper>
        <PatientCard patient={mockPatient} />
      </TestWrapper>
    );

    expect(screen.getByText('Blue Cross Blue Shield')).toBeInTheDocument();
    expect(screen.getByText('BC123456789')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = vi.fn();

    render(
      <TestWrapper>
        <PatientCard patient={mockPatient} onClick={mockOnClick} />
      </TestWrapper>
    );

    const card = screen.getByRole('button', { name: /john smith/i });
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockPatient);
  });

  it('handles empty allergies array', () => {
    const patientWithNoAllergies = {
      ...mockPatient,
      allergies: []
    };

    render(
      <TestWrapper>
        <PatientCard patient={patientWithNoAllergies} />
      </TestWrapper>
    );

    expect(screen.queryByText('Penicillin')).not.toBeInTheDocument();
    expect(screen.queryByText('Shellfish')).not.toBeInTheDocument();
  });

  it('handles missing emergency contact', () => {
    const patientWithoutEmergencyContact = {
      ...mockPatient,
      emergency_contact: null
    };

    render(
      <TestWrapper>
        <PatientCard patient={patientWithoutEmergencyContact} />
      </TestWrapper>
    );

    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});
