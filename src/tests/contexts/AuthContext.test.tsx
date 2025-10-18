/**
 * Type-safe tests for AuthContext
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { AuthUser } from '@/types';

// Mock the mockApiClient client
const mockApiClient = {
    auth: {
        me: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        refresh: vi.fn(),
        isAuthenticated: vi.fn(),
        updateMe: vi.fn(),
    },
    entities: {
        User: {
            get: vi.fn(),
        },
    },
    setToken: vi.fn(),
};

vi.mock('@/api/mockApiClient', () => ({
    mockApiClient,
}));

// Mock API config
vi.mock('@/api/apiConfig', () => ({
    API_CONFIG: {
        useMockData: false,
        isProduction: false,
    },
}));

// Mock monitoring
vi.mock('@/lib/monitoring', () => ({
    ErrorLogger: {
        log: vi.fn(),
    },
}));

// Test component that uses auth context
const TestComponent = () => {
    const auth = useAuth();

    return (
        <div>
            <div data-testid="user">{auth.user?.email || 'No user'}</div>
            <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
            <div data-testid="authenticated">{auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
            <button onClick={() => void auth.login({ email: 'test@example.com', password: 'password' })}>
                Login
            </button>
            <button onClick={() => void auth.logout()}>Logout</button>
            <button onClick={() => void auth.updateUser({ first_name: 'Updated' })}>
                Update User
            </button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should provide auth context', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('user')).toBeInTheDocument();
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.getByTestId('authenticated')).toBeInTheDocument();
    });

    it('should handle successful login', async () => {
        const mockUser: AuthUser = {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            role: 'Doctor',
            roleColor: '🔵',
            permissions: ['read_patients'],
            organization: 'Test Clinic',
            is_active: true,
        };

        mockApiClient.auth.login.mockResolvedValue({
            user: mockUser,
            token: 'mock-token',
        } as any);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('john.doe@example.com');
            expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
        });

        expect(mockApiClient.auth.login).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password',
        });
        expect(mockApiClient.setToken).toHaveBeenCalledWith('mock-token');
    });

    it('should handle login error', async () => {
        const error = new Error('Invalid credentials');
        mockApiClient.auth.login.mockRejectedValue(error);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
        });

        expect(mockApiClient.auth.login).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password',
        });
    });

    it('should handle successful logout', async () => {
        const mockUser: AuthUser = {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            role: 'Doctor',
            roleColor: '🔵',
            permissions: ['read_patients'],
            organization: 'Test Clinic',
            is_active: true,
        };

        // First login
        mockApiClient.auth.login.mockResolvedValue({
            user: mockUser,
            token: 'mock-token',
        } as any);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
        });

        // Then logout
        mockApiClient.auth.logout.mockResolvedValue({ success: true } as any);
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
        });

        expect(mockApiClient.auth.logout).toHaveBeenCalled();
        expect(mockApiClient.setToken).toHaveBeenCalledWith(null);
    });

    it('should handle logout error', async () => {
        const error = new Error('Logout failed');
        mockApiClient.auth.logout.mockRejectedValue(error);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
        });

        expect(mockApiClient.auth.logout).toHaveBeenCalled();
    });

    it('should handle user update', async () => {
        const mockUser: AuthUser = {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            role: 'Doctor',
            roleColor: '🔵',
            permissions: ['read_patients'],
            organization: 'Test Clinic',
            is_active: true,
        };

        const updatedUser = { ...mockUser, first_name: 'Updated' };
        mockApiClient.auth.updateMe.mockResolvedValue(updatedUser as any);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const updateButton = screen.getByText('Update User');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(mockApiClient.auth.updateMe).toHaveBeenCalledWith({ first_name: 'Updated' });
        });
    });

    it('should handle user update error', async () => {
        const error = new Error('Update failed');
        mockApiClient.auth.updateMe.mockRejectedValue(error);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const updateButton = screen.getByText('Update User');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(mockApiClient.auth.updateMe).toHaveBeenCalledWith({ first_name: 'Updated' });
        });
    });

    it('should check auth status on mount', async () => {
        const mockUser: AuthUser = {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            role: 'Doctor',
            roleColor: '🔵',
            permissions: ['read_patients'],
            organization: 'Test Clinic',
            is_active: true,
        };

        mockApiClient.auth.isAuthenticated.mockResolvedValue(true);
        mockApiClient.auth.me.mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('john.doe@example.com');
            expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
        });

        expect(mockApiClient.auth.isAuthenticated).toHaveBeenCalled();
        expect(mockApiClient.auth.me).toHaveBeenCalled();
    });

    it('should handle auth check error', async () => {
        const error = new Error('Auth check failed');
        mockApiClient.auth.isAuthenticated.mockRejectedValue(error);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
        });

        expect(mockApiClient.auth.isAuthenticated).toHaveBeenCalled();
    });

    it('should handle permission checks', () => {
        const mockUser: AuthUser = {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            role: 'Doctor',
            roleColor: '🔵',
            permissions: ['read_patients', 'write_patients'],
            organization: 'Test Clinic',
            is_active: true,
        };

        mockApiClient.auth.isAuthenticated.mockResolvedValue(true);
        mockApiClient.auth.me.mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Test permission checks
        const auth = useAuth();
        expect(auth.hasPermission('read_patients')).toBe(true);
        expect(auth.hasPermission('admin_access')).toBe(false);
        expect(auth.hasRole('Doctor')).toBe(true);
        expect(auth.hasRole('Admin')).toBe(false);
        expect(auth.hasAnyRole(['Doctor', 'Admin'])).toBe(true);
        expect(auth.hasAnyRole(['Admin', 'SuperAdmin'])).toBe(false);
    });

    it('should handle organization selection', async () => {
        const mockUser: AuthUser = {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            role: 'Doctor',
            roleColor: '🔵',
            permissions: ['read_patients'],
            organization: 'Test Clinic',
            is_active: true,
        };

        const mockOrganizations = [
            { id: 'org-1', name: 'Clinic 1' },
            { id: 'org-2', name: 'Clinic 2' },
        ];

        mockApiClient.auth.isAuthenticated.mockResolvedValue(true);
        mockApiClient.auth.me.mockResolvedValue(mockUser);
        mockApiClient.entities.User.get.mockResolvedValue({ organizations: mockOrganizations });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
        });

        expect(mockApiClient.entities.User.get).toHaveBeenCalledWith('user-1');
    });

    it('should throw error when used outside provider', () => {
        const TestComponentWithoutProvider = () => {
            useAuth();
            return <div>Test</div>;
        };

        expect(() => {
            render(<TestComponentWithoutProvider />);
        }).toThrow('useAuth must be used within an AuthProvider');
    });
});
