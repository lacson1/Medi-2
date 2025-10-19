import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Organization {
    id: string;
    name: string;
    type: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'insurance';
    location: string;
    logo?: string;
    isActive: boolean;
}

interface OrganizationContextType {
    currentOrganization: Organization | null;
    userOrganizations: Organization[];
    setCurrentOrganization: (org: Organization) => void;
    switchOrganization: (orgId: string) => void;
    isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
    children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
    const { user } = useAuth();
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock organizations data - in real app, this would come from API
    const mockOrganizations: Organization[] = [
        {
            id: '1',
            name: 'City General Hospital',
            type: 'hospital',
            location: 'New York, NY',
            logo: '/logos/city-general.png',
            isActive: true
        },
        {
            id: '2',
            name: 'Downtown Medical Clinic',
            type: 'clinic',
            location: 'Brooklyn, NY',
            logo: '/logos/downtown-clinic.png',
            isActive: false
        },
        {
            id: '3',
            name: 'Metro Pharmacy',
            type: 'pharmacy',
            location: 'Manhattan, NY',
            logo: '/logos/metro-pharmacy.png',
            isActive: false
        },
        {
            id: '4',
            name: 'Central Laboratory',
            type: 'lab',
            location: 'Queens, NY',
            logo: '/logos/central-lab.png',
            isActive: false
        },
        {
            id: '5',
            name: 'HealthPlus Insurance',
            type: 'insurance',
            location: 'Bronx, NY',
            logo: '/logos/healthplus.png',
            isActive: false
        }
    ];

    useEffect(() => {
        const loadOrganizations = async () => {
            setIsLoading(true);

            try {
                // Filter organizations based on user role
                // Super users/admins see all organizations, regular users see only their assigned ones
                const userOrgs = user?.role === 'super_admin' || user?.role === 'superuser'
                    ? mockOrganizations
                    : mockOrganizations.filter(org => org.isActive);

                setUserOrganizations(userOrgs);

                // Set current organization to the first active one or previously selected one
                const savedOrgId = localStorage.getItem('selectedOrganizationId');
                const activeOrg = savedOrgId
                    ? userOrgs.find(org => org.id === savedOrgId) || userOrgs.find(org => org.isActive) || userOrgs[0]
                    : userOrgs.find(org => org.isActive) || userOrgs[0];

                setCurrentOrganization(activeOrg);
            } catch (error) {
                console.error('Error loading organizations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            loadOrganizations();
        }
    }, [user]);

    const switchOrganization = (orgId: string) => {
        const org = userOrganizations.find(o => o.id === orgId);
        if (org) {
            setCurrentOrganization(org);
            localStorage.setItem('selectedOrganizationId', orgId);

            // In a real app, this would trigger API calls to load organization-specific data
            console.log('Switched to organization:', org.name);

            // Dispatch custom event for other components to listen to
            window.dispatchEvent(new CustomEvent('organizationChanged', {
                detail: { organization: org }
            }));
        }
    };

    const value: OrganizationContextType = {
        currentOrganization,
        userOrganizations,
        setCurrentOrganization,
        switchOrganization,
        isLoading
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
}

// Hook to get organization-specific data
export function useOrganizationData() {
    const { currentOrganization } = useOrganization();

    return {
        organizationId: currentOrganization?.id,
        organizationName: currentOrganization?.name,
        organizationType: currentOrganization?.type,
        organizationLocation: currentOrganization?.location,
        isHospital: currentOrganization?.type === 'hospital',
        isClinic: currentOrganization?.type === 'clinic',
        isPharmacy: currentOrganization?.type === 'pharmacy',
        isLab: currentOrganization?.type === 'lab',
        isInsurance: currentOrganization?.type === 'insurance',
    };
}
