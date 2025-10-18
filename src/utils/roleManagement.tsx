// Role-based access control utilities

export const SYSTEM_ROLES = {
    SUPER_ADMIN: {
        name: 'SuperAdmin',
        color: '🟣',
        description: 'Full system access across all organizations',
        permissions: [
            'full_system_access',
            'cross_organization_access',
            'system_admin',
            'user_management',
            'organization_management',
            'clinical_access',
            'financial_access',
            'lab_access',
            'pharmacy_access'
        ]
    },
    ADMIN: {
        name: 'Admin',
        color: '🔵',
        description: 'Organization manager, can manage users and settings',
        permissions: [
            'user_management',
            'organization_settings',
            'system_config',
            'reports',
            'clinical_access',
            'financial_access'
        ]
    },
    DOCTOR: {
        name: 'Doctor',
        color: '🟢',
        description: 'Clinical access with prescription rights',
        permissions: [
            'clinical_access',
            'prescription_rights',
            'patient_records',
            'appointments',
            'medical_history',
            'diagnosis',
            'treatment_plans'
        ]
    },
    NURSE: {
        name: 'Nurse',
        color: '🔷',
        description: 'Clinical support access',
        permissions: [
            'clinical_support',
            'patient_care',
            'vital_signs',
            'medication_assistance',
            'patient_records_view',
            'appointment_assistance'
        ]
    },
    PHARMACIST: {
        name: 'Pharmacist',
        color: '🟠',
        description: 'Medication management',
        permissions: [
            'medication_management',
            'prescription_verification',
            'drug_interactions',
            'inventory',
            'pharmacy_reports',
            'medication_counseling'
        ]
    },
    RECEPTIONIST: {
        name: 'Receptionist',
        color: '🟣',
        description: 'Patient scheduling and registration',
        permissions: [
            'patient_scheduling',
            'patient_registration',
            'appointment_management',
            'check_in',
            'patient_info_view',
            'insurance_verification'
        ]
    },
    LAB_TECH: {
        name: 'Lab Tech',
        color: '🔵',
        description: 'Laboratory order management',
        permissions: [
            'lab_order_management',
            'specimen_processing',
            'lab_results',
            'equipment_maintenance',
            'lab_reports',
            'quality_control'
        ]
    },
    BILLING: {
        name: 'Billing',
        color: '🟡',
        description: 'Financial and billing access',
        permissions: [
            'financial_access',
            'billing_management',
            'insurance_claims',
            'payment_processing',
            'financial_reports',
            'revenue_management'
        ]
    },
    USER: {
        name: 'User',
        color: '⚪',
        description: 'Standard access',
        permissions: [
            'standard_access',
            'view_patient_info',
            'basic_reports',
            'profile_management'
        ]
    }
};

// Permission checking utilities
export const hasPermission = (userRole: string, requiredPermission: string) => {
    const roleKey = userRole.toUpperCase() as keyof typeof SYSTEM_ROLES;
    const role = SYSTEM_ROLES[roleKey];
    if (!role) return false;

    return (
        Array.isArray(role.permissions) &&
        (role.permissions.includes(requiredPermission) ||
            role.permissions.includes('full_system_access'))
    );
};

export const hasAnyPermission = (userRole: string, requiredPermissions: string[]) => {
    if (!Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: string, requiredPermissions: string[]) => {
    if (!Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.every(permission => hasPermission(userRole, permission));
};

// Role hierarchy utilities
export const getRoleHierarchy = () => {
    return [
        SYSTEM_ROLES.SUPER_ADMIN,
        SYSTEM_ROLES.ADMIN,
        SYSTEM_ROLES.DOCTOR,
        SYSTEM_ROLES.PHARMACIST,
        SYSTEM_ROLES.NURSE,
        SYSTEM_ROLES.LAB_TECH,
        SYSTEM_ROLES.BILLING,
        SYSTEM_ROLES.RECEPTIONIST,
        SYSTEM_ROLES.USER
    ];
};

export const canManageRole = (managerRole: any, targetRole: any) => {
    const hierarchy = getRoleHierarchy();
    const managerIndex = hierarchy.findIndex(role => role.name === managerRole);
    const targetIndex = hierarchy.findIndex(role => role.name === targetRole);

    if (managerIndex === -1 || targetIndex === -1) return false;
    return managerIndex < targetIndex;
};

// Component access control
export const withRoleAccess = (Component: any, requiredPermissions: any, fallbackComponent: any = null) => {
    const WrappedComponent = (props: any) => {
        const { user } = props;
        if (!user || !hasAnyPermission(user.role, requiredPermissions)) {
            return fallbackComponent || <div>Access Denied</div>;
        }
        return <Component {...props} />;
    };

    WrappedComponent.displayName = `withRoleAccess(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
};

// Route protection
export const protectRoute = (requiredPermissions: any) => {
    return (user: any) => {
        return hasAnyPermission(user && user.role, requiredPermissions);
    };
};