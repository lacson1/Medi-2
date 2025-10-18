import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mockApiClient } from "@/api/mockApiClient";
import { API_CONFIG } from '@/api/apiConfig';
import { ErrorLogger } from '@/lib/monitoring';
import type { User, Organization, AuthUser } from '@/types';

// Auth context types
interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<AuthUser>) => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    client: typeof mockApiClient;
    checkAuthStatus: () => Promise<void>;
    // Organization selection
    showOrgSelector: boolean;
    setShowOrgSelector: (show: boolean) => void;
    userOrganizations: Organization[];
    handleOrganizationSelect: (user: AuthUser) => void;
    closeOrgSelector: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showOrgSelector, setShowOrgSelector] = useState<boolean>(false);
    const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);

    // Mock toast function for now
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Check if user needs to select organization
    const checkOrganizationSelection = async (userData: AuthUser): Promise<void> => {
        try {
            // Skip organization selection for SuperAdmins or users with existing organization
            if (userData?.role === 'SuperAdmin' || userData?.organization_id) {
                return;
            }

            // Fetch user's organizations
            const orgs = await mockApiClient.entities?.['User']?.get(userData.id);

            if ((orgs as any)?.organizations && (orgs as any).organizations.length > 0) {
                setUserOrganizations((orgs as any).organizations);
                setShowOrgSelector(true);
            } else if ((orgs as any)?.organizations && (orgs as any).organizations.length === 0) {
                // User has no organizations assigned, show selector with all orgs
                setShowOrgSelector(true);
            }
        } catch (error) {
            console.error('Error checking organization selection:', error);
            // If there's an error, don't show the selector
        }
    };

    // Handle organization selection
    const handleOrganizationSelect = (user: AuthUser): void => {
        setUser(user);
        setShowOrgSelector(false);
        setUserOrganizations([]);
    };

    // Close organization selector
    const closeOrgSelector = (): void => {
        setShowOrgSelector(false);
        setUserOrganizations([]);
    };

    const checkAuthStatus = async (): Promise<void> => {
        try {
            setLoading(true);

            // If using mock data, simulate authentication
            if (API_CONFIG.useMockData) {
                const mockUser: AuthUser = {
                    id: 'dev-user-123',
                    first_name: 'Development',
                    last_name: 'User',
                    email: 'dev@example.com',
                    role: 'SuperAdmin',
