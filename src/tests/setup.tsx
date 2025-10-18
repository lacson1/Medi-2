/**
 * Type-safe test setup for TypeScript components
 * Provides utilities and mocks for testing TypeScript components
 */

import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';
import React, { ReactElement } from 'react';

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Cleanup after each test
afterEach(() => {
    cleanup();
    server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close());

// Mock environment variables for tests
Object.defineProperty(
    import.meta, 'env', {
    value: {
        VITE_BASE44_SERVER_URL: 'https://test.mockApiClient.app',
        VITE_BASE44_APP_ID: 'test-app-id',
        VITE_USE_MOCK_DATA: 'true',
        MODE: 'test'
    },
    writable: true
});

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Suppress console errors in tests unless explicitly testing them
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is no longer supported')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});

// Type-safe test utilities
export const createMockPatient = (overrides: Partial<import('@/types').Patient> = {}): import('@/types').Patient => ({
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
    ...overrides
});

export const createMockAppointment = (overrides: Partial<import('@/types').Appointment> = {}): import('@/types').Appointment => ({
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
    ...overrides
});

export const createMockUser = (overrides: Partial<import('@/types').User> = {}): import('@/types').User => ({
    id: 'user-1',
    first_name: 'Dr. Jane',
    last_name: 'Smith',
    email: 'jane.smith@clinic.com',
    role: 'Doctor',
    permissions: ['read_patients', 'write_patients'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
});

// Mock React Query client
export const createMockQueryClient = () => {
    const { QueryClient } = require('@tanstack/react-query');
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                cacheTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
};

// Mock React Router
export const mockNavigate = vi.fn();
export const mockLocation = {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
};

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Link: ({ children, to, ...props }: { children: React.ReactNode; to: string;[key: string]: any }) =>
        React.createElement('a', { href: to, ...props }, children),
}));

// Mock Auth Context
export const mockAuthContext = {
    user: createMockUser(),
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    hasPermission: vi.fn(() => true),
    hasRole: vi.fn(() => true),
    hasAnyRole: vi.fn(() => true),
    client: {},
    checkAuthStatus: vi.fn(),
    showOrgSelector: false,
    setShowOrgSelector: vi.fn(),
    userOrganizations: [],
    handleOrganizationSelect: vi.fn(),
    closeOrgSelector: vi.fn(),
};

// Mock Base44 client
export const mockBase44Client = {
    auth: {
        me: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        refresh: vi.fn(),
        isAuthenticated: vi.fn(),
        updateMe: vi.fn(),
    },
    entities: {
        Patient: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        Appointment: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        User: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
    setToken: vi.fn(),
};

// Type-safe render helper
export const renderWithProviders = (ui: ReactElement, options: any = {}) => {
    const { QueryClientProvider } = require('@tanstack/react-query');
    const { render } = require('@testing-library/react');

    const queryClient = options.queryClient || createMockQueryClient();

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient} >
            {children}
        </QueryClientProvider>
    );

    return render(ui, { wrapper: Wrapper, ...options });
};

// Type-safe waitFor helper
export const waitFor = async (callback: () => void | Promise<void>, options: any = {}) => {
    const { waitFor: rtlWaitFor } = require('@testing-library/react');
    return rtlWaitFor(callback, options);
};

// Type-safe screen helper
export const screen = require('@testing-library/react').screen;

// Type-safe fireEvent helper
export const fireEvent = require('@testing-library/react').fireEvent;

// Type-safe userEvent helper
export const userEvent = require('@testing-library/user-event').default;

export default {
    createMockPatient,
    createMockAppointment,
    createMockUser,
    createMockQueryClient,
    mockNavigate,
    mockLocation,
    mockAuthContext,
    mockBase44Client,
    renderWithProviders,
    waitFor,
    screen,
    fireEvent,
    userEvent,
};
