/**
 * Type-safe tests for AuthContext
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { AuthUser } from '@/contexts/AuthContext';

// Mock the mockApiClient client
vi.mock('@/api/mockApiClientClient', () => ({
    mockApiClient: {
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
    },
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
            <button onClick={() => auth.login({ email: 'test@example.com', password: 'password' })}>
                Login
            </button>
            <button onClick={() => auth.logout()}>Logout</button>
            <button onClick={() => auth.updateUser({ first_name: 'Updated' })}>
                Update User
            </button>
        </div>
    );
};

describe('AuthContext', () => {
    let mockBase44: any;

    beforeEach(() => {
        mockBase44 = require('@/api/mockApiClientClient').mockApiClient;
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
