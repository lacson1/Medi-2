/**
 * Enhanced Role-Based Access Control (RBAC) System
 *
 * This module provides a comprehensive, hierarchical role management system for healthcare
 * applications. It defines system-wide roles with granular permissions, role hierarchies,
 * and utilities for access control, role assignment, and permission validation.
 *
 * @module enhancedRoleManagement
 *
 * @example
 * ```typescript
 * import { SYSTEM_ROLES, hasPermission, canManageRole } from '@/utils/enhancedRoleManagement';
 *
 * // Check if user has permission
 * if (hasPermission(user.role, 'prescription_rights')) {
 *   // Allow prescription creation
 * }
 *
 * // Check role management permissions
 * if (canManageRole('org_admin', 'doctor')) {
 *   // Allow role assignment
 * }
 *
 * // Get available roles for assignment
 * const roles = getAvailableRoles(currentUser.role);
 * ```
 */

/**
 * System-wide role definitions with hierarchical levels and granular permissions
 * Each role includes name, key, visual indicator, description, hierarchy level, and permissions array
 *
 * Hierarchy levels (lower = more privileged):
 * - Level 1: Super Admin (cross-organization, full system access)
 * - Level 2: Organization Admin (organization-wide management)
 * - Level 3: Doctor (clinical practitioner with prescription rights)
 * - Level 4: Nurse, Pharmacist, Lab Tech, Billing (specialized staff roles)
 * - Level 5: Receptionist (front desk, limited clinical data)
 * - Level 6: Staff (basic access)
 *
 * @constant
 *
 * @example
 * ```typescript
 * // Access role definition
 * const doctorRole = SYSTEM_ROLES.DOCTOR;
 * console.log(doctorRole.name); // "Doctor"
 * console.log(doctorRole.level); // 3
 * console.log(doctorRole.permissions); // Array of permission strings
 *
 * // Check if role has specific permission
 * const canPrescribe = SYSTEM_ROLES.DOCTOR.permissions.includes('prescription_rights');
 * ```
 */
export const SYSTEM_ROLES = {
    /**
     * Super Administrator - Highest privilege level with full system access
     * Can manage all organizations, users, roles, and system configuration
     * Cross-organization access with no restrictions
     */
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
    /**
     * Organization Administrator - Manages a single organization
     * Full access within their organization for users, billing, and clinical operations
     * Cannot access other organizations or create new organizations
     */
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
    /**
     * Doctor - Clinical practitioner with prescription and diagnostic rights
     * Can access patient records, create prescriptions, diagnose, and manage treatment plans
     * Full clinical access within their organization
     */
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
    /**
     * Nurse - Clinical support staff with patient care permissions
     * Can view/update vitals, administer medications, and assist with patient care
     * Limited clinical access with data masking for sensitive information
     * Emergency "break glass" access available for critical situations
     */
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
    /**
     * Pharmacist - Medication management specialist
     * Can verify prescriptions, manage drug interactions, and handle pharmacy operations
     * Read-only prescription access with medication history and counseling permissions
     * Emergency "break glass" access for critical medication needs
     */
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
    /**
     * Lab Technician - Laboratory operations specialist
     * Can manage lab orders, process specimens, and handle test results
     * Equipment maintenance and quality control permissions
     * Limited to lab-specific operations
     */
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
    /**
     * Billing Specialist - Financial operations and insurance management
     * Can process payments, manage insurance claims, and handle revenue tracking
     * Minimal clinical data access (limited patient demographics only)
     * Full access to financial records and billing analytics
     */
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
    /**
     * Receptionist - Front desk and appointment management
     * Can schedule appointments, register patients, and manage check-in/check-out
     * Limited medical data access (demographics and contact info only)
     * Emergency "break glass" access for critical situations
     * Sensitive data is masked
     */
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
    /**
     * Staff - General staff member with minimal access
     * Can view basic information and manage own profile
     * Lowest privilege level with limited system access
     * Suitable for non-clinical, non-administrative staff
     */
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

/**
 * Permission categories for organized permission management
 * Groups permissions by functional area for easier role configuration and auditing
 *
 * @constant
 *
 * @example
 * ```typescript
 * // Get all clinical permissions
 * const clinicalPerms = PERMISSION_CATEGORIES.CLINICAL.permissions;
 *
 * // Check if permission belongs to category
 * const isFinancial = PERMISSION_CATEGORIES.FINANCIAL.permissions.includes('billing_management');
 * ```
 */
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

/**
 * Checks if a user role has a specific permission
 * Returns true if role includes the permission or has full system access
 *
 * @param userRole - User's role key (e.g., 'doctor', 'nurse')
 * @param requiredPermission - Permission string to check (e.g., 'prescription_rights')
 * @returns True if user has the permission
 *
 * @example
 * ```typescript
 * if (hasPermission('doctor', 'prescription_rights')) {
 *   // Allow prescription creation
 * }
 * ```
 */
export const hasPermission = (userRole: any, requiredPermission: any) => {
    const role = Object.values(SYSTEM_ROLES).find(r => r.key === userRole);
    if (!role) return false;

    return role.permissions.includes(requiredPermission) ||
        role.permissions.includes('full_system_access');
};

/**
 * Checks if a user role has ANY of the specified permissions (OR logic)
 * Useful for features accessible by multiple permission types
 *
 * @param userRole - User's role key
 * @param requiredPermissions - Array of permission strings
 * @returns True if user has at least one of the permissions
 *
 * @example
 * ```typescript
 * // User management requires either create or update permission
 * if (hasAnyPermission('org_admin', ['user_management', 'role_assignment'])) {
 *   // Show user management section
 * }
 * ```
 */
export const hasAnyPermission = (userRole: string, requiredPermissions: string[]) => {
    return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Checks if a user role has ALL of the specified permissions (AND logic)
 * Useful for features requiring multiple permissions simultaneously
 *
 * @param userRole - User's role key
 * @param requiredPermissions - Array of permission strings
 * @returns True if user has all permissions
 *
 * @example
 * ```typescript
 * // Advanced billing requires both management and reports
 * if (hasAllPermissions('billing', ['billing_management', 'financial_reports'])) {
 *   // Show advanced billing features
 * }
 * ```
 */
export const hasAllPermissions = (userRole: string, requiredPermissions: string[]) => {
    return requiredPermissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Returns all system roles sorted by hierarchy level (lowest level first)
 * Level 1 (highest privilege) to Level 6 (lowest privilege)
 *
 * @returns Array of role objects sorted by hierarchy level
 *
 * @example
 * ```typescript
 * const hierarchy = getRoleHierarchy();
 * console.log(hierarchy[0].name); // "SuperAdmin"
 * console.log(hierarchy[hierarchy.length - 1].name); // "Staff"
 * ```
 */
export const getRoleHierarchy = () => {
    return Object.values(SYSTEM_ROLES).sort((a, b) => a.level - b.level);
};

/**
 * Checks if a manager role can manage (assign/modify/remove) a target role
 * Based on role hierarchy and organizational boundaries
 *
 * @param managerRole - Role key of the manager
 * @param targetRole - Role key of the target user
 * @returns True if manager can manage the target role
 *
 * @example
 * ```typescript
 * // Can org admin manage doctors?
 * if (canManageRole('org_admin', 'doctor')) {
 *   // Allow role assignment
 * }
 * ```
 */
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

/**
 * Checks if a user role can assign a specific role to others
 * Alias for canManageRole - same hierarchy rules apply
 *
 * @param assignerRole - Role key of the assigner
 * @param targetRole - Role key being assigned
 * @returns True if assigner can assign the target role
 */
export const canAssignRole = (assignerRole: any, targetRole: any) => {
    return canManageRole(assignerRole, targetRole);
};

/**
 * Checks if a user can manage (modify settings, billing, etc.) an organization
 * Super admins can manage all orgs, org admins only their own
 *
 * @param userRole - User's role key
 * @param organizationId - Target organization ID
 * @param userOrganizationId - User's organization ID
 * @returns True if user can manage the organization
 *
 * @example
 * ```typescript
 * if (canManageOrganization(user.role, targetOrgId, user.orgId)) {
 *   // Show organization management panel
 * }
 * ```
 */
export const canManageOrganization = (userRole: any, organizationId: any, userOrganizationId: any) => {
    // Super admin can manage all organizations
    if (userRole === 'super_admin') return true;

    // Organization admin can only manage their own organization
    if (userRole === 'org_admin') return organizationId === userOrganizationId;

    return false;
};

/**
 * Checks if a user can view organization details
 * Super admins can view all orgs, others only their own
 *
 * @param userRole - User's role key
 * @param organizationId - Target organization ID
 * @param userOrganizationId - User's organization ID
 * @returns True if user can view the organization
 */
export const canViewOrganization = (userRole: any, organizationId: any, userOrganizationId: any) => {
    // Super admin can view all organizations
    if (userRole === 'super_admin') return true;

    // Others can only view their own organization
    return organizationId === userOrganizationId;
};

/**
 * Checks if a manager can manage (edit, deactivate, etc.) a specific user
 * Combines role hierarchy with organizational boundaries
 *
 * @param managerRole - Manager's role key
 * @param targetUserRole - Target user's role key
 * @param managerOrgId - Manager's organization ID
 * @param targetUserOrgId - Target user's organization ID
 * @returns True if manager can manage the user
 *
 * @example
 * ```typescript
 * if (canManageUser(manager.role, targetUser.role, manager.orgId, targetUser.orgId)) {
 *   // Show edit user button
 * }
 * ```
 */
export const canManageUser = (managerRole: any, targetUserRole: any, managerOrgId: any, targetUserOrgId: any) => {
    // Super admin can manage all users
    if (managerRole === 'super_admin') return true;

    // Organization admin can manage users in their organization
    if (managerRole === 'org_admin' && managerOrgId === targetUserOrgId) {
        return canManageRole(managerRole, targetUserRole);
    }

    return false;
};

/**
 * Higher-order component (HOC) for role-based component access control
 * Wraps a component to show it only if user has required permissions
 *
 * @param Component - React component to wrap
 * @param requiredPermissions - Array of permission strings (ANY logic)
 * @param fallbackComponent - Component to show when access is denied (default: "Access Denied")
 * @returns Wrapped component with access control
 *
 * @example
 * ```typescript
 * const ProtectedAdmin = withRoleAccess(
 *   AdminPanel,
 *   ['system_admin', 'organization_settings'],
 *   <AccessDeniedMessage />
 * );
 *
 * // Usage
 * <ProtectedAdmin user={currentUser} />
 * ```
 */
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

/**
 * Creates a route protection function for router guards
 * Returns a function that checks if user has required permissions
 *
 * @param requiredPermissions - Array of permission strings required for the route
 * @returns Function that takes a user and returns boolean
 *
 * @example
 * ```typescript
 * const adminRouteGuard = protectRoute(['system_admin', 'organization_settings']);
 *
 * // In router
 * if (adminRouteGuard(currentUser)) {
 *   // Allow route navigation
 * } else {
 *   // Redirect to unauthorized page
 * }
 * ```
 */
export const protectRoute = (requiredPermissions: any) => {
    return (user: any) => {
        return hasAnyPermission(user?.role, requiredPermissions);
    };
};

/**
 * Gets list of roles that current user can assign to others
 * Based on role hierarchy - higher roles can assign lower roles
 *
 * @param currentUserRole - Current user's role key
 * @returns Array of assignable role objects
 *
 * @example
 * ```typescript
 * const assignableRoles = getAvailableRoles('org_admin');
 * // Returns: [doctor, nurse, pharmacist, lab_tech, billing, receptionist, staff]
 *
 * // Populate dropdown
 * assignableRoles.map(role => (
 *   <option value={role.key}>{role.name}</option>
 * ))
 * ```
 */
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

/**
 * Gets permissions organized by category for a specific role
 * Useful for displaying role permissions in UI with category groupings
 *
 * @param roleKey - Role key to get permissions for
 * @returns Object with category names as keys and permission arrays as values
 *
 * @example
 * ```typescript
 * const doctorPerms = getPermissionsByCategory('doctor');
 * // Returns:
 * // {
 * //   CLINICAL: { name: 'Clinical Access', permissions: ['clinical_access', 'patient_records', ...] },
 * //   REPORTS: { name: 'Reports & Analytics', permissions: ['clinical_reports'] }
 * // }
 *
 * // Display in UI
 * Object.entries(doctorPerms).map(([category, data]) => (
 *   <Section title={data.name}>
 *     {data.permissions.map(perm => <Badge>{perm}</Badge>)}
 *   </Section>
 * ))
 * ```
 */
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

/**
 * Validates if a role assignment is allowed
 * Checks role hierarchy and organizational boundaries
 * Returns validation result with errors if invalid
 *
 * @param assignerRole - Role key of user assigning the role
 * @param targetRole - Role key being assigned
 * @param assignerOrgId - Organization ID of assigner
 * @param targetOrgId - Organization ID of target user
 * @returns Validation result object with isValid flag and error array
 *
 * @example
 * ```typescript
 * const validation = validateRoleAssignment(
 *   'org_admin',
 *   'doctor',
 *   'org-123',
 *   'org-123'
 * );
 *
 * if (validation.isValid) {
 *   // Proceed with role assignment
 * } else {
 *   // Show errors
 *   validation.errors.forEach(error => showError(error));
 * }
 * ```
 */
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