import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_CONFIG } from '@/api/apiConfig';
import { ErrorLogger } from '@/lib/monitoring';
import { realApiClient } from '@/api/realApiClient';
import type { Organization, AuthUser } from '@/types';

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

            // For mock data, we'll skip organization selection
            // In a real implementation, you would fetch user's organizations here
            console.log('Organization selection check skipped for mock data');
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

            // Check if we have a stored token
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setUser(null);
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            // Set token in API client
            realApiClient.setToken(token);

            // Try to get current user from API
            const currentUser = await realApiClient.getCurrentUser();

            if (currentUser) {
                // Transform API user to AuthUser format
                const authUser: AuthUser = {
                    id: currentUser.id,
                    first_name: currentUser.first_name,
                    last_name: currentUser.last_name,
                    email: currentUser.email,
                    role: currentUser.role,
                    roleColor: getRoleColor(currentUser.role),
                    permissions: currentUser.permissions || [],
                    organization: currentUser.organization || 'Unknown Organization',
                    is_active: currentUser.is_active !== false
                };

                setUser(authUser);
                setIsAuthenticated(true);
            } else {
                // Invalid token, clear it
                localStorage.removeItem('auth_token');
                realApiClient.setToken(null);
                setUser(null);
                setIsAuthenticated(false);
            }

            setLoading(false);
        } catch (error) {
            // Log auth check failure for monitoring
            console.error('Auth check error:', error);
            ErrorLogger.log(error as Error, {
                tags: { type: 'auth_error' },
                extra: { action: 'checkAuthStatus' }
            });

            // Clear invalid token
            localStorage.removeItem('auth_token');
            realApiClient.setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);

            // Show error toast in production
            if (API_CONFIG.isProduction) {
                toast({
                    title: "Authentication Error",
                    description: "Failed to verify authentication status. Please log in again.",
                    variant: "destructive",
                    duration: 3000,
                });
            }
        }
    };

    // Helper function to get role color
    const getRoleColor = (role: string): string => {
        const roleColors: { [key: string]: string } = {
            'SuperAdmin': '🟣',
            'Admin': '🔵',
            'Doctor': '🟢',
            'Nurse': '🟡',
            'Billing': '🟠',
            'Receptionist': '🔴'
        };
        return roleColors[role] || '⚪';
    };

    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            setLoading(true);

            // Use real API client for authentication
            const response = await realApiClient.login(credentials.email, credentials.password);

            if (response.user && response.token) {
                // Transform API user to AuthUser format
                const authUser: AuthUser = {
                    id: response.user.id,
                    first_name: response.user.first_name,
                    last_name: response.user.last_name,
                    email: response.user.email,
                    role: response.user.role,
                    roleColor: getRoleColor(response.user.role),
                    permissions: response.user.permissions || [],
                    organization: response.user.organization || 'Unknown Organization',
                    is_active: response.user.is_active !== false
                };

                setUser(authUser);
                setIsAuthenticated(true);
                setLoading(false);

                // Check if user needs to select organization
                checkOrganizationSelection(authUser);

                // Show success toast
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${authUser.first_name}!`,
                    variant: "default",
                    duration: 3000,
                });
            } else {
                throw new Error('Invalid login response');
            }
        } catch (error) {
            // Log login failure for monitoring
            ErrorLogger.log(error as Error, {
                tags: { type: 'auth_error', operation: 'login' }
            });

            toast({
                title: "Login Failed",
                description: (error as Error).message || "Invalid credentials. Please try again.",
                variant: "destructive",
                duration: 3000,
            });

            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            setLoading(true);

            // Use real API client for logout
            await realApiClient.logout();

            // Clear local state
            setUser(null);
            setIsAuthenticated(false);
            setShowOrgSelector(false);
            setUserOrganizations([]);

            // Show success toast
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
                variant: "default",
                duration: 2000,
            });
        } catch (error) {
            // Log logout error but don't show error to user
            console.error('Logout error:', error);
            ErrorLogger.log(error as Error, {
                tags: { type: 'auth_error', operation: 'logout' }
            });

            // Still clear local state even if API call fails
            setUser(null);
            setIsAuthenticated(false);
            setShowOrgSelector(false);
            setUserOrganizations([]);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData: Partial<AuthUser>): Promise<void> => {
        try {
            // Mock update
            setUser(prev => prev ? { ...prev, ...userData } : null);
        } catch (error) {
            // Log profile update failure for monitoring
            ErrorLogger.log(error as Error, {
                tags: { type: 'auth_error', operation: 'update_profile' }
            });

            toast({
                title: "Update Failed",
                description: (error as Error).message || "Failed to update profile. Please try again.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const hasPermission = (permission: string): boolean => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    };

    const hasRole = (role: string): boolean => {
        if (!user || !user.role) return false;
        return user.role === role;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        if (!user || !user.role) return false;
        return roles.includes(user.role);
    };

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        hasPermission,
        hasRole,
        hasAnyRole,
        checkAuthStatus,
        // Organization selection
        showOrgSelector,
        setShowOrgSelector,
        userOrganizations,
        handleOrganizationSelect,
        closeOrgSelector
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}