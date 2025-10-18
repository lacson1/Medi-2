// Enhanced Role-Based Access Control System
export const SYSTEM_ROLES = {
    SUPER_ADMIN: {
        name: 'SuperAdmin',
        key: 'super_admin',
        color: '🟣',
        description: 'Full system access across all organizations',
        level: 1,
        permissions: [
            // System Management
            'system_admin',
            'full_system_access',
            'cross_organization_access',
            'system_configuration',
            'global_settings',

            // User Management
            'user_management',
            'role_management',
            'permission_management',
            'bulk_user_operations',
            'user_import_export',

            // Organization Management
            'organization_management',
            'organization_creation',
            'organization_deletion',
            'organization_settings',
            'organization_billing',

            // Clinical Access
            'clinical_access',
            'patient_records',
            'medical_history',
            'prescription_rights',
            'diagnosis',
            'treatment_plans',

            // Financial Access
            'financial_access',
            'billing_management',
            'financial_reports',
            'revenue_management',
            'payment_processing',

            // Lab & Pharmacy
            'lab_access',
            'pharmacy_access',
            'medication_management',
            'inventory_management',

            // Reports & Analytics
            'all_reports',
            'system_analytics',
            'performance_metrics',
            'audit_logs'
        ]
    },
    ORGANIZATION_ADMIN: {
        name: 'Organization Admin',
        key: 'org_admin',
        color: '🔵',
        description: 'Organization manager with full org access',
        level: 2,
        permissions: [
            // Organization Management
            'organization_settings',
            'organization_users',
            'organization_billing',

            // User Management
            'user_management',
            'role_assignment',
            'user_invitation',
            'user_deactivation',

            // Clinical Access
            'clinical_access',
            'patient_records',
            'medical_history',
            'prescription_rights',
            'diagnosis',
            'treatment_plans',

            // Financial Access
            'financial_access',
            'billing_management',
            'financial_reports',
            'revenue_management',

            // Lab & Pharmacy
            'lab_access',
            'pharmacy_access',
            'medication_management',

            // Reports
            'organization_reports',
            'performance_metrics'
        ]
    },
    DOCTOR: {
        name: 'Doctor',
        key: 'doctor',
        color: '🟢',
        description: 'Clinical practitioner with prescription rights',
        level: 3,
        permissions: [
            'clinical_access',
            'patient_records',
            'medical_history',
            'prescription_rights',
            'diagnosis',
            'treatment_plans',
            'appointments',
            'patient_notes',
            'medical_documents',
            'lab_orders',
            'referrals',
            'clinical_reports'
        ]
    },
    NURSE: {
        name: 'Nurse',
        key: 'nurse',
        color: '🔷',
        description: 'Clinical support with limited patient data access',
        level: 4,
        permissions: [
            // Limited clinical access - read/update vitals and basic care data
            'clinical_support',
            'patient_care',
            'vital_signs_read',
            'vital_signs_update',
            'patient_records_view',
            'patient_records_limited',
            'appointment_assistance',
            'care_plans_view',
            'care_plans_update',
            'patient_notes_view',
            'patient_notes_add',
            'medication_assistance',
            'medication_administration',
            'lab_sample_collection',
            'lab_results_view',
            'patient_education',
            'family_communication',
            'patient_consents_view',
            'emergency_access',
            'break_glass_access',
            'sensitive_data_masked',
            'patient_communication',
            'telemedicine_support'
        ]
    },
    PHARMACIST: {
        name: 'Pharmacist',
        key: 'pharmacist',
        color: '🟠',
        description: 'Medication management with prescription access',
        level: 4,
        permissions: [
            // Medication-focused access - read prescriptions and medication history
            'medication_management',
            'prescription_verification',
            'prescription_read',
            'prescription_history',
            'drug_interactions',
            'inventory',
            'pharmacy_reports',
            'medication_counseling',
            'prescription_modification',
            'medication_dispensing',
            'patient_medication_history',
            'medication_allergies',
            'drug_interaction_check',
            'pharmacy_inventory',
            'medication_education',
            'prescription_refills',
            'medication_adherence',
            'pharmacy_analytics',
            'emergency_access',
            'break_glass_access',
            'sensitive_data_masked'
        ]
    },
    LAB_TECHNICIAN: {
        name: 'Lab Technician',
        key: 'lab_tech',
        color: '🔬',
        description: 'Laboratory order management',
        level: 4,
        permissions: [
            'lab_order_management',
            'specimen_processing',
            'lab_results',
            'equipment_maintenance',
            'lab_reports',
            'quality_control',
            'lab_inventory',
            'test_ordering'
        ]
    },
    BILLING_SPECIALIST: {
        name: 'Billing Specialist',
        key: 'billing',
        color: '🟡',
        description: 'Billing and insurance with minimal clinical data access',
        level: 4,
        permissions: [
            // Financial access with minimal clinical data
            'financial_access',
            'billing_management',
            'insurance_claims',
            'payment_processing',
            'financial_reports',
            'revenue_management',
            'insurance_verification',
            'claims_processing',
            'patient_billing_info',
            'insurance_coverage',
            'payment_history',
            'claims_status',
            'financial_analytics',
            'revenue_tracking',
            'patient_demographics_limited',
            'appointment_billing',
            'procedure_coding',
            'insurance_authorization',
            'payment_plans',
            'collections',
            'financial_compliance',
            'audit_financial_records'
        ]
    },
    RECEPTIONIST: {
        name: 'Receptionist',
        key: 'receptionist',
        color: '🟣',
        description: 'Appointment management with limited medical data access',
        level: 5,
        permissions: [
            // Appointment management with limited medical data access
            'patient_scheduling',
            'patient_registration',
            'appointment_management',
            'appointment_view',
            'check_in',
            'patient_info_view',
            'patient_demographics',
            'insurance_verification',
            'patient_communication',
            'appointment_reminders',
            'patient_contact_info',
            'emergency_contacts',
            'appointment_history',
            'patient_preferences',
            'waiting_list_management',
            'appointment_cancellation',
            'appointment_rescheduling',
            'patient_checkout',
            'basic_patient_notes',
            'patient_consents_view',
            'emergency_access',
            'break_glass_access',
            'sensitive_data_masked'
        ]
    },
    STAFF: {
        name: 'Staff',
        key: 'staff',
        color: '⚪',
        description: 'General staff member',
        level: 6,
        permissions: [
            'basic_access',
            'profile_management',
            'patient_info_view',
            'appointment_view',
            'basic_reports'
        ]
    }
};

// Permission Categories for better organization
export const PERMISSION_CATEGORIES = {
    SYSTEM: {
        name: 'System Management',
        permissions: [
            'system_admin',
            'full_system_access',
            'cross_organization_access',
            'system_configuration',
            'global_settings'
        ]
    },
    USER_MANAGEMENT: {
        name: 'User Management',
        permissions: [
            'user_management',
            'role_management',
            'permission_management',
            'bulk_user_operations',
            'user_import_export',
            'user_invitation',
            'user_deactivation',
            'role_assignment'
        ]
    },
    ORGANIZATION: {
        name: 'Organization Management',
        permissions: [
            'organization_management',
            'organization_creation',
            'organization_deletion',
            'organization_settings',
            'organization_billing',
            'organization_users',
            'organization_reports'
        ]
    },
    CLINICAL: {
        name: 'Clinical Access',
        permissions: [
            'clinical_access',
            'patient_records',
            'medical_history',
            'prescription_rights',
            'diagnosis',
            'treatment_plans',
            'appointments',
            'patient_notes',
            'medical_documents',
            'lab_orders',
            'referrals',
            'clinical_reports',
            'clinical_support',
            'patient_care',
            'vital_signs',
            'medication_assistance',
            'care_plans'
        ]
    },
    FINANCIAL: {
        name: 'Financial Access',
        permissions: [
            'financial_access',
            'billing_management',
            'financial_reports',
            'revenue_management',
            'payment_processing',
            'insurance_claims',
            'insurance_verification',
            'claims_processing'
        ]
    },
    LAB_PHARMACY: {
        name: 'Lab & Pharmacy',
        permissions: [
            'lab_access',
            'pharmacy_access',
            'medication_management',
            'inventory_management',
            'prescription_verification',
            'drug_interactions',
            'inventory',
            'pharmacy_reports',
            'medication_counseling',
            'prescription_modification',
            'medication_dispensing',
            'lab_order_management',
            'specimen_processing',
            'lab_results',
            'equipment_maintenance',
            'lab_reports',
            'quality_control',
            'lab_inventory',
            'test_ordering'
        ]
    },
    SCHEDULING: {
        name: 'Scheduling & Registration',
        permissions: [
            'patient_scheduling',
            'patient_registration',
            'appointment_management',
            'check_in',
            'patient_info_view',
            'patient_communication',
            'appointment_reminders',
            'appointment_view'
        ]
    },
    REPORTS: {
        name: 'Reports & Analytics',
        permissions: [
            'all_reports',
            'system_analytics',
            'performance_metrics',
            'audit_logs',
            'organization_reports',
            'clinical_reports',
            'financial_reports',
            'pharmacy_reports',
            'lab_reports',
            'basic_reports'
        ]
    }
};

// Enhanced permission checking utilities
export const hasPermission = (userRole: any, requiredPermission: any) => {
    const role = Object.values(SYSTEM_ROLES).find(r => r.key === userRole);
    if (!role) return false;

    return role.permissions.includes(requiredPermission) ||
        role.permissions.includes('full_system_access');
};

export const hasAnyPermission = (userRole: string, requiredPermissions: string[]) => {
    return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: string, requiredPermissions: string[]) => {
    return requiredPermissions.every(permission => hasPermission(userRole, permission));
};

// Role hierarchy utilities
export const getRoleHierarchy = () => {
    return Object.values(SYSTEM_ROLES).sort((a, b) => a.level - b.level);
};

export const canManageRole = (managerRole: any, targetRole: any) => {
    const managerRoleObj = Object.values(SYSTEM_ROLES).find(r => r.key === managerRole);
    const targetRoleObj = Object.values(SYSTEM_ROLES).find(r => r.key === targetRole);

    if (!managerRoleObj || !targetRoleObj) return false;

    // Super admin can manage all roles
    if (managerRoleObj.key === 'super_admin') return true;

    // Organization admin can manage roles within their organization (except super admin)
    if (managerRoleObj.key === 'org_admin' && targetRoleObj.key !== 'super_admin') return true;

    // Higher level roles can manage lower level roles
    return managerRoleObj.level < targetRoleObj.level;
};

export const canAssignRole = (assignerRole: any, targetRole: any) => {
    return canManageRole(assignerRole, targetRole);
};

// Organization management utilities
export const canManageOrganization = (userRole: any, organizationId: any, userOrganizationId: any) => {
    // Super admin can manage all organizations
    if (userRole === 'super_admin') return true;

    // Organization admin can only manage their own organization
    if (userRole === 'org_admin') return organizationId === userOrganizationId;

    return false;
};

export const canViewOrganization = (userRole: any, organizationId: any, userOrganizationId: any) => {
    // Super admin can view all organizations
    if (userRole === 'super_admin') return true;

    // Others can only view their own organization
    return organizationId === userOrganizationId;
};

// User management utilities
export const canManageUser = (managerRole: any, targetUserRole: any, managerOrgId: any, targetUserOrgId: any) => {
    // Super admin can manage all users
    if (managerRole === 'super_admin') return true;

    // Organization admin can manage users in their organization
    if (managerRole === 'org_admin' && managerOrgId === targetUserOrgId) {
        return canManageRole(managerRole, targetUserRole);
    }

    return false;
};

// Component access control
export const withRoleAccess = (Component: any, requiredPermissions: any, fallbackComponent: any = null) => {
    const WrappedComponent = (props: any) => {
        const { user } = props;

        if (!user || !hasAnyPermission(user?.role, requiredPermissions)) {
            return fallbackComponent || <div>Access Denied</div>;
        }

        return <Component {...props} />;
    };

    WrappedComponent.displayName = `withRoleAccess(${Component.displayName || Component.name})`;
    return WrappedComponent;
};

// Route protection
export const protectRoute = (requiredPermissions: any) => {
    return (user: any) => {
        return hasAnyPermission(user?.role, requiredPermissions);
    };
};

// Get available roles for assignment based on current user's role
export const getAvailableRoles = (currentUserRole: any) => {
    const hierarchy = getRoleHierarchy();
    const currentRole = hierarchy.find(r => r.key === currentUserRole);

    if (!currentRole) return [];

    // Super admin can assign any role
    if (currentRole.key === 'super_admin') {
        return hierarchy.filter(r => r.key !== 'super_admin'); // Can't assign super admin
    }

    // Organization admin can assign roles within their organization
    if (currentRole.key === 'org_admin') {
        return hierarchy.filter(r => r.level > currentRole.level);
    }

    // Others cannot assign roles
    return [];
};

// Get permissions by category
export const getPermissionsByCategory = (roleKey: any) => {
    const role = Object.values(SYSTEM_ROLES).find(r => r.key === roleKey);
    if (!role) return {};

    const categorizedPermissions: any = {};

    Object.entries(PERMISSION_CATEGORIES).forEach(([categoryKey, category]) => {
        const categoryPermissions = category.permissions.filter(permission =>
            role.permissions.includes(permission)
        );

        if (categoryPermissions.length > 0) {
            categorizedPermissions[categoryKey] = {
                name: category.name,
                permissions: categoryPermissions
            };
        }
    });

    return categorizedPermissions;
};

// Validate role assignment
export const validateRoleAssignment = (assignerRole: any, targetRole: any, assignerOrgId: any, targetOrgId: any) => {
    const errors = [];

    // Check if assigner can assign this role
    if (!canAssignRole(assignerRole, targetRole)) {
        errors.push(`You cannot assign the ${targetRole} role`);
    }

    // Check organization access
    if (assignerRole !== 'super_admin' && assignerOrgId !== targetOrgId) {
        errors.push('You can only assign roles within your organization');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};