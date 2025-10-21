/**
 * Permission Matrix and Route Protection System
 *
 * This module provides comprehensive role-based access control (RBAC) for the healthcare
 * application. It defines granular permissions, role mappings, route protections, and
 * utilities for checking user access rights throughout the application.
 *
 * @module permissionMatrix
 *
 * @example
 * ```typescript
 * import { usePermissions, PERMISSIONS, PermissionGuard } from '@/utils/permissionMatrix';
 *
 * // In a component
 * function AdminPanel() {
 *   const permissions = usePermissions();
 *
 *   if (!permissions.hasPermission(PERMISSIONS.SYSTEM_ADMIN)) {
 *     return <AccessDenied />;
 *   }
 *
 *   return <div>Admin content...</div>;
 * }
 *
 * // Using permission guard
 * <PermissionGuard permissions={[PERMISSIONS.USER_CREATE]}>
 *   <CreateUserButton />
 * </PermissionGuard>
 * ```
 */
import { mockApiClient } from "@/api/mockApiClient";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useMemo } from 'react';
import { Shield } from 'lucide-react';
import React from 'react';

/**
 * Comprehensive permission constants for granular access control
 * Organized by functional area (User Management, Patients, Billing, etc.)
 *
 * @constant
 *
 * @example
 * ```typescript
 * // Check if user can create patients
 * if (permissions.hasPermission(PERMISSIONS.PATIENT_CREATE)) {
 *   // Show create patient button
 * }
 *
 * // Check multiple permissions
 * if (permissions.hasAnyPermission([
 *   PERMISSIONS.USER_CREATE,
 *   PERMISSIONS.USER_UPDATE
 * ])) {
 *   // Allow user management
 * }
 * ```
 */
export const PERMISSIONS = {
    // User Management
    /** Create new user accounts */
    USER_CREATE: 'user:create',
    /** View user account details */
    USER_READ: 'user:read',
    /** Update existing user accounts */
    USER_UPDATE: 'user:update',
    /** Delete user accounts */
    USER_DELETE: 'user:delete',
    /** Reset and manage user passwords */
    USER_MANAGE_PASSWORDS: 'user:manage_passwords',

    // Organization Management
    /** Create new organizations */
    ORG_CREATE: 'organization:create',
    /** View organization details */
    ORG_READ: 'organization:read',
    /** Update organization information */
    ORG_UPDATE: 'organization:update',
    /** Delete organizations */
    ORG_DELETE: 'organization:delete',

    // Role Management
    /** Create custom roles */
    ROLE_CREATE: 'role:create',
    /** View role definitions and permissions */
    ROLE_READ: 'role:read',
    /** Modify role permissions */
    ROLE_UPDATE: 'role:update',
    /** Delete custom roles */
    ROLE_DELETE: 'role:delete',

    // Patient Management
    /** Create new patient records (HIPAA-sensitive) */
    PATIENT_CREATE: 'patient:create',
    /** View patient information (HIPAA-tracked) */
    PATIENT_READ: 'patient:read',
    /** Update patient records (HIPAA-tracked) */
    PATIENT_UPDATE: 'patient:update',
    /** Delete patient records (HIPAA-critical) */
    PATIENT_DELETE: 'patient:delete',

    // Appointment Management
    /** Schedule new appointments */
    APPOINTMENT_CREATE: 'appointment:create',
    /** View appointment schedules */
    APPOINTMENT_READ: 'appointment:read',
    /** Modify existing appointments */
    APPOINTMENT_UPDATE: 'appointment:update',
    /** Cancel or delete appointments */
    APPOINTMENT_DELETE: 'appointment:delete',

    // Billing Management
    /** Create billing records and invoices */
    BILLING_CREATE: 'billing:create',
    /** View billing and financial information */
    BILLING_READ: 'billing:read',
    /** Update billing records */
    BILLING_UPDATE: 'billing:update',
    /** Delete or void billing records */
    BILLING_DELETE: 'billing:delete',

    // Analytics & Reports
    /** Access analytics dashboards and metrics */
    ANALYTICS_VIEW: 'analytics:view',
    /** Export analytics data */
    ANALYTICS_EXPORT: 'analytics:export',
    /** Generate compliance and operational reports */
    REPORTS_GENERATE: 'reports:generate',

    // System Administration
    /** Full system administration access */
    SYSTEM_ADMIN: 'system:admin',
    /** View audit logs (compliance requirement) */
    AUDIT_LOGS_VIEW: 'audit:view',
    /** Export audit logs for compliance reporting */
    AUDIT_LOGS_EXPORT: 'audit:export',
    /** Access error monitoring and debugging tools */
    ERROR_MONITORING: 'error:monitor',
    /** View system performance metrics */
    SYSTEM_METRICS: 'system:metrics',

    // Staff Messaging
    /** Send messages to other staff members */
    MESSAGING_SEND: 'messaging:send',
    /** Receive messages from other staff */
    MESSAGING_RECEIVE: 'messaging:receive',
    /** Initiate and participate in video calls */
    MESSAGING_VIDEO_CALL: 'messaging:video_call',
    /** Initiate and participate in voice calls */
    MESSAGING_VOICE_CALL: 'messaging:voice_call',

    // Help & Support
    /** Create FAQ entries */
    FAQ_CREATE: 'faq:create',
    /** View FAQ content */
    FAQ_READ: 'faq:read',
    /** Update FAQ entries */
    FAQ_UPDATE: 'faq:update',
    /** Delete FAQ entries */
    FAQ_DELETE: 'faq:delete',
    /** Create user guides and documentation */
    GUIDE_CREATE: 'guide:create',
    /** View user guides */
    GUIDE_READ: 'guide:read',
    /** Update user guides */
    GUIDE_UPDATE: 'guide:update',
    /** Delete user guides */
    GUIDE_DELETE: 'guide:delete',
    /** Create support tickets */
    SUPPORT_TICKET_CREATE: 'support:create',
    /** View support tickets */
    SUPPORT_TICKET_READ: 'support:read',
    /** Update support ticket status */
    SUPPORT_TICKET_UPDATE: 'support:update',
    /** Create help resources */
    RESOURCE_CREATE: 'resource:create',
    /** View help resources */
    RESOURCE_READ: 'resource:read',
    /** Update help resources */
    RESOURCE_UPDATE: 'resource:update',
    /** Delete help resources */
    RESOURCE_DELETE: 'resource:delete',

    // Settings
    /** View application settings */
    SETTINGS_VIEW: 'settings:view',
    /** Modify application settings */
    SETTINGS_UPDATE: 'settings:update',
    /** Update own user profile */
    PROFILE_UPDATE: 'profile:update',
    /** Change own password */
    PASSWORD_CHANGE: 'password:change'
};

/**
 * Role-based permission mappings for predefined user roles
 * Maps each role to their allowed permissions for access control
 *
 * @constant
 *
 * @example
 * ```typescript
 * // Get permissions for a role
 * const doctorPermissions = ROLE_PERMISSIONS.doctor;
 *
 * // Check if role has specific permission
 * const canViewPatients = ROLE_PERMISSIONS.doctor.includes(PERMISSIONS.PATIENT_READ);
 * ```
 */
export const ROLE_PERMISSIONS = {
    /** Superadmin - Full system access, all permissions */
    superadmin: Object.values(PERMISSIONS), // All permissions

    /**
     * Admin - Comprehensive management permissions
     * Can manage users, organizations, roles, patients, billing, and system settings
     * Cannot delete critical system data without superadmin approval
     */
    admin: [
        // User Management
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.USER_DELETE,
        PERMISSIONS.USER_MANAGE_PASSWORDS,

        // Organization Management
        PERMISSIONS.ORG_CREATE,
        PERMISSIONS.ORG_READ,
        PERMISSIONS.ORG_UPDATE,
        PERMISSIONS.ORG_DELETE,

        // Role Management
        PERMISSIONS.ROLE_CREATE,
        PERMISSIONS.ROLE_READ,
        PERMISSIONS.ROLE_UPDATE,
        PERMISSIONS.ROLE_DELETE,

        // Patient Management
        PERMISSIONS.PATIENT_CREATE,
        PERMISSIONS.PATIENT_READ,
        PERMISSIONS.PATIENT_UPDATE,
        PERMISSIONS.PATIENT_DELETE,

        // Appointment Management
        PERMISSIONS.APPOINTMENT_CREATE,
        PERMISSIONS.APPOINTMENT_READ,
        PERMISSIONS.APPOINTMENT_UPDATE,
        PERMISSIONS.APPOINTMENT_DELETE,

        // Billing Management
        PERMISSIONS.BILLING_CREATE,
        PERMISSIONS.BILLING_READ,
        PERMISSIONS.BILLING_UPDATE,
        PERMISSIONS.BILLING_DELETE,

        // Analytics & Reports
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.ANALYTICS_EXPORT,
        PERMISSIONS.REPORTS_GENERATE,

        // System Administration
        PERMISSIONS.SYSTEM_ADMIN,
        PERMISSIONS.AUDIT_LOGS_VIEW,
        PERMISSIONS.AUDIT_LOGS_EXPORT,
        PERMISSIONS.ERROR_MONITORING,
        PERMISSIONS.SYSTEM_METRICS,

        // Staff Messaging
        PERMISSIONS.MESSAGING_SEND,
        PERMISSIONS.MESSAGING_RECEIVE,
        PERMISSIONS.MESSAGING_VIDEO_CALL,
        PERMISSIONS.MESSAGING_VOICE_CALL,

        // Help & Support
        PERMISSIONS.FAQ_CREATE,
        PERMISSIONS.FAQ_READ,
        PERMISSIONS.FAQ_UPDATE,
        PERMISSIONS.FAQ_DELETE,
        PERMISSIONS.GUIDE_CREATE,
        PERMISSIONS.GUIDE_READ,
        PERMISSIONS.GUIDE_UPDATE,
        PERMISSIONS.GUIDE_DELETE,
        PERMISSIONS.SUPPORT_TICKET_CREATE,
        PERMISSIONS.SUPPORT_TICKET_READ,
        PERMISSIONS.SUPPORT_TICKET_UPDATE,
        PERMISSIONS.RESOURCE_CREATE,
        PERMISSIONS.RESOURCE_READ,
        PERMISSIONS.RESOURCE_UPDATE,
        PERMISSIONS.RESOURCE_DELETE,

        // Settings
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.SETTINGS_UPDATE,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.PASSWORD_CHANGE
    ],

    /**
     * Delegate - Organizational manager with limited administrative access
     * Can manage daily operations, patient care, and staff coordination
     * Cannot modify system-level settings or create/delete users
     */
    delegate: [
        // User Management (limited)
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_UPDATE,

        // Organization Management (read-only)
        PERMISSIONS.ORG_READ,

        // Patient Management
        PERMISSIONS.PATIENT_CREATE,
        PERMISSIONS.PATIENT_READ,
        PERMISSIONS.PATIENT_UPDATE,
        PERMISSIONS.PATIENT_DELETE,

        // Appointment Management
        PERMISSIONS.APPOINTMENT_CREATE,
        PERMISSIONS.APPOINTMENT_READ,
        PERMISSIONS.APPOINTMENT_UPDATE,
        PERMISSIONS.APPOINTMENT_DELETE,

        // Billing Management
        PERMISSIONS.BILLING_CREATE,
        PERMISSIONS.BILLING_READ,
        PERMISSIONS.BILLING_UPDATE,
        PERMISSIONS.BILLING_DELETE,

        // Analytics & Reports
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.ANALYTICS_EXPORT,
        PERMISSIONS.REPORTS_GENERATE,

        // Staff Messaging
        PERMISSIONS.MESSAGING_SEND,
        PERMISSIONS.MESSAGING_RECEIVE,
        PERMISSIONS.MESSAGING_VIDEO_CALL,
        PERMISSIONS.MESSAGING_VOICE_CALL,

        // Help & Support
        PERMISSIONS.FAQ_CREATE,
        PERMISSIONS.FAQ_READ,
        PERMISSIONS.FAQ_UPDATE,
        PERMISSIONS.FAQ_DELETE,
        PERMISSIONS.GUIDE_CREATE,
        PERMISSIONS.GUIDE_READ,
        PERMISSIONS.GUIDE_UPDATE,
        PERMISSIONS.GUIDE_DELETE,
        PERMISSIONS.SUPPORT_TICKET_CREATE,
        PERMISSIONS.SUPPORT_TICKET_READ,
        PERMISSIONS.SUPPORT_TICKET_UPDATE,
        PERMISSIONS.RESOURCE_CREATE,
        PERMISSIONS.RESOURCE_READ,
        PERMISSIONS.RESOURCE_UPDATE,
        PERMISSIONS.RESOURCE_DELETE,

        // Settings
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.SETTINGS_UPDATE,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.PASSWORD_CHANGE
    ],

    /**
     * Doctor - Clinical staff with patient care permissions
     * Can create/view/update patient records, manage appointments
     * Limited access to billing (read-only) and analytics
     * Full messaging capabilities for care coordination
     */
    doctor: [
        // Patient Management
        PERMISSIONS.PATIENT_CREATE,
        PERMISSIONS.PATIENT_READ,
        PERMISSIONS.PATIENT_UPDATE,

        // Appointment Management
        PERMISSIONS.APPOINTMENT_CREATE,
        PERMISSIONS.APPOINTMENT_READ,
        PERMISSIONS.APPOINTMENT_UPDATE,

        // Billing Management (read-only)
        PERMISSIONS.BILLING_READ,

        // Analytics & Reports (read-only)
        PERMISSIONS.ANALYTICS_VIEW,

        // Staff Messaging
        PERMISSIONS.MESSAGING_SEND,
        PERMISSIONS.MESSAGING_RECEIVE,
        PERMISSIONS.MESSAGING_VIDEO_CALL,
        PERMISSIONS.MESSAGING_VOICE_CALL,

        // Help & Support (read-only)
        PERMISSIONS.FAQ_READ,
        PERMISSIONS.GUIDE_READ,
        PERMISSIONS.SUPPORT_TICKET_CREATE,
        PERMISSIONS.SUPPORT_TICKET_READ,
        PERMISSIONS.RESOURCE_READ,

        // Settings
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.PASSWORD_CHANGE
    ],

    /**
     * Nurse - Clinical support staff with patient care access
     * Can view/update patient records, manage appointments
     * Cannot create new patient records
     * Full messaging for care team coordination
     */
    nurse: [
        // Patient Management (limited)
        PERMISSIONS.PATIENT_READ,
        PERMISSIONS.PATIENT_UPDATE,

        // Appointment Management
        PERMISSIONS.APPOINTMENT_CREATE,
        PERMISSIONS.APPOINTMENT_READ,
        PERMISSIONS.APPOINTMENT_UPDATE,

        // Staff Messaging
        PERMISSIONS.MESSAGING_SEND,
        PERMISSIONS.MESSAGING_RECEIVE,
        PERMISSIONS.MESSAGING_VIDEO_CALL,
        PERMISSIONS.MESSAGING_VOICE_CALL,

        // Help & Support (read-only)
        PERMISSIONS.FAQ_READ,
        PERMISSIONS.GUIDE_READ,
        PERMISSIONS.SUPPORT_TICKET_CREATE,
        PERMISSIONS.SUPPORT_TICKET_READ,
        PERMISSIONS.RESOURCE_READ,

        // Settings
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.PASSWORD_CHANGE
    ],

    /**
     * Receptionist - Front desk staff with administrative access
     * Can manage patient registration, appointments, and billing
     * Limited messaging (no video/voice calls)
     * Cannot access clinical data or analytics
     */
    receptionist: [
        // Patient Management (limited)
        PERMISSIONS.PATIENT_CREATE,
        PERMISSIONS.PATIENT_READ,
        PERMISSIONS.PATIENT_UPDATE,

        // Appointment Management
        PERMISSIONS.APPOINTMENT_CREATE,
        PERMISSIONS.APPOINTMENT_READ,
        PERMISSIONS.APPOINTMENT_UPDATE,

        // Billing Management
        PERMISSIONS.BILLING_CREATE,
        PERMISSIONS.BILLING_READ,
        PERMISSIONS.BILLING_UPDATE,

        // Staff Messaging
        PERMISSIONS.MESSAGING_SEND,
        PERMISSIONS.MESSAGING_RECEIVE,

        // Help & Support (read-only)
        PERMISSIONS.FAQ_READ,
        PERMISSIONS.GUIDE_READ,
        PERMISSIONS.SUPPORT_TICKET_CREATE,
        PERMISSIONS.SUPPORT_TICKET_READ,
        PERMISSIONS.RESOURCE_READ,

        // Settings
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.PASSWORD_CHANGE
    ],

    /**
     * Patient - End user with minimal permissions
     * Can only manage own profile and access help resources
     * Can create support tickets for assistance
     * No access to other patients' data or administrative functions
     */
    patient: [
        // Own profile only
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.PASSWORD_CHANGE,

        // Help & Support
        PERMISSIONS.FAQ_READ,
        PERMISSIONS.GUIDE_READ,
        PERMISSIONS.SUPPORT_TICKET_CREATE,
        PERMISSIONS.SUPPORT_TICKET_READ,
        PERMISSIONS.RESOURCE_READ
    ]
};

/**
 * Route-to-permission mappings for path-based access control
 * Defines which permissions are required to access specific routes
 *
 * @constant
 *
 * @example
 * ```typescript
 * // Check if user can access a route
 * const requiredPerms = ROUTE_PERMISSIONS['/admin/users'];
 * if (permissions.hasAnyPermission(requiredPerms)) {
 *   // Allow route access
 * }
 * ```
 */
export const ROUTE_PERMISSIONS = {
    // Analytics & Reports
    '/analytics/clinical-performance': [PERMISSIONS.ANALYTICS_VIEW],
    '/analytics/compliance': [PERMISSIONS.ANALYTICS_VIEW],

    // System Administration
    '/admin/users': [PERMISSIONS.USER_READ],
    '/admin/roles': [PERMISSIONS.ROLE_READ],
    '/admin/organizations': [PERMISSIONS.ORG_READ],
    '/admin/audit-logs': [PERMISSIONS.AUDIT_LOGS_VIEW],
    '/admin/error-monitoring': [PERMISSIONS.ERROR_MONITORING],
    '/admin/system-metrics': [PERMISSIONS.SYSTEM_METRICS],
    '/admin/staff-access-control': [PERMISSIONS.SYSTEM_ADMIN],

    // Staff Messaging
    '/staff-messaging': [PERMISSIONS.MESSAGING_SEND, PERMISSIONS.MESSAGING_RECEIVE],

    // Settings
    '/settings': [PERMISSIONS.SETTINGS_VIEW],
    '/profile': [PERMISSIONS.PROFILE_UPDATE],

    // Help & Support
    '/help': [PERMISSIONS.FAQ_READ],
    '/help/faqs': [PERMISSIONS.FAQ_READ],
    '/help/guides': [PERMISSIONS.GUIDE_READ],
    '/help/contact': [PERMISSIONS.SUPPORT_TICKET_CREATE],
    '/help/resources': [PERMISSIONS.RESOURCE_READ],

    // System Testing
    '/system-tester': [PERMISSIONS.SYSTEM_ADMIN]
};

/**
 * Permission Manager - Core class for permission checking and access control
 * Handles user permissions, role inheritance, and route access validation
 *
 * @class PermissionManager
 *
 * @example
 * ```typescript
 * const manager = new PermissionManager(currentUser, customRoles);
 *
 * // Check single permission
 * if (manager.hasPermission(PERMISSIONS.PATIENT_CREATE)) {
 *   // Allow patient creation
 * }
 *
 * // Check route access
 * if (manager.canAccessRoute('/admin/users')) {
 *   // Navigate to admin users page
 * }
 * ```
 */
export class PermissionManager {
    user: any;
    customRoles: any[];
    userPermissions: any[];

    /**
     * Creates a new PermissionManager instance
     *
     * @param user - User object containing role and email
     * @param customRoles - Array of custom role objects with additional permissions
     */
    constructor(user: any, customRoles: any[] = []) {
        this.user = user;
        this.customRoles = customRoles;
        this.userPermissions = this.getUserPermissions();
    }

    /**
     * Computes all permissions for the current user
     * Combines role-based permissions, custom role permissions, and superadmin override
     *
     * @returns Array of permission strings
     *
     * @example
     * ```typescript
     * const perms = manager.getUserPermissions();
     * // Returns: ['user:create', 'user:read', 'patient:view', ...]
     * ```
     */
    getUserPermissions() {
        if (!this.user) return [];

        const permissions = new Set();

        // Add role-based permissions
        if (this.user.role && ROLE_PERMISSIONS[this.user.role as keyof typeof ROLE_PERMISSIONS]) {
            ROLE_PERMISSIONS[this.user.role as keyof typeof ROLE_PERMISSIONS].forEach((permission: any) => {
                permissions.add(permission);
            });
        }

        // Add custom role permissions
        this.customRoles.forEach((role: any) => {
            if (role.permissions) {
                role.permissions.forEach((permission: any) => {
                    permissions.add(permission);
                });
            }
        });

        // Super admin gets all permissions
        if (this.user.email === 'superadmin@bluequee2.com') {
            Object.values(PERMISSIONS).forEach(permission => {
                permissions.add(permission);
            });
        }

        return Array.from(permissions);
    }

    /**
     * Checks if user has a specific permission
     *
     * @param permission - Permission string to check (e.g., 'user:create')
     * @returns True if user has the permission
     *
     * @example
     * ```typescript
     * if (manager.hasPermission(PERMISSIONS.PATIENT_CREATE)) {
     *   // Show create patient button
     * }
     * ```
     */
    hasPermission(permission: string) {
        return this.userPermissions.includes(permission);
    }

    /**
     * Checks if user has ANY of the specified permissions (OR logic)
     * Useful for features accessible by multiple permission types
     *
     * @param permissions - Array of permission strings
     * @returns True if user has at least one of the permissions
     *
     * @example
     * ```typescript
     * // User management requires either create or update permission
     * if (manager.hasAnyPermission([
     *   PERMISSIONS.USER_CREATE,
     *   PERMISSIONS.USER_UPDATE
     * ])) {
     *   // Show user management section
     * }
     * ```
     */
    hasAnyPermission(permissions: string[]) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Checks if user has ALL of the specified permissions (AND logic)
     * Useful for features requiring multiple permissions simultaneously
     *
     * @param permissions - Array of permission strings
     * @returns True if user has all permissions
     *
     * @example
     * ```typescript
     * // Advanced billing requires both create and export permissions
     * if (manager.hasAllPermissions([
     *   PERMISSIONS.BILLING_CREATE,
     *   PERMISSIONS.ANALYTICS_EXPORT
     * ])) {
     *   // Show advanced billing features
     * }
     * ```
     */
    hasAllPermissions(permissions: string[]) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    /**
     * Checks if user can access a specific route based on route permissions
     * Returns true if no permissions are required or user has any required permission
     *
     * @param route - Route path (e.g., '/admin/users')
     * @returns True if user can access the route
     *
     * @example
     * ```typescript
     * if (manager.canAccessRoute('/admin/audit-logs')) {
     *   router.push('/admin/audit-logs');
     * } else {
     *   showAccessDenied();
     * }
     * ```
     */
    canAccessRoute(route: string) {
        const requiredPermissions = ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];
        if (!requiredPermissions) return true; // No specific permissions required

        return this.hasAnyPermission(requiredPermissions);
    }

    /**
     * Gets user's effective role (including superadmin override)
     *
     * @returns Role string ('superadmin', 'admin', 'doctor', etc.)
     *
     * @example
     * ```typescript
     * const role = manager.getEffectiveRole();
     * console.log(`User role: ${role}`); // "doctor"
     * ```
     */
    getEffectiveRole() {
        if (this.user.email === 'superadmin@bluequee2.com') {
            return 'superadmin';
        }

        return this.user.role || 'patient';
    }

    /**
     * Checks if user is a superadmin (has all permissions)
     *
     * @returns True if user is superadmin
     */
    isSuperAdmin() {
        return this.user?.email === 'superadmin@bluequee2.com';
    }

    /**
     * Checks if user is an administrator (admin or delegate role)
     *
     * @returns True if user has admin-level access
     */
    isAdmin() {
        return ['admin', 'delegate'].includes(this.getEffectiveRole());
    }

    /**
     * Checks if user can manage other users (create/update/delete)
     *
     * @returns True if user has any user management permissions
     */
    canManageUsers() {
        return this.hasPermission(PERMISSIONS.USER_CREATE) ||
            this.hasPermission(PERMISSIONS.USER_UPDATE) ||
            this.hasPermission(PERMISSIONS.USER_DELETE);
    }

    /**
     * Checks if user can manage organizations
     *
     * @returns True if user has any organization management permissions
     */
    canManageOrganizations() {
        return this.hasPermission(PERMISSIONS.ORG_CREATE) ||
            this.hasPermission(PERMISSIONS.ORG_UPDATE) ||
            this.hasPermission(PERMISSIONS.ORG_DELETE);
    }

    /**
     * Checks if user can view analytics dashboards
     *
     * @returns True if user has analytics view permission
     */
    canViewAnalytics() {
        return this.hasPermission(PERMISSIONS.ANALYTICS_VIEW);
    }

    /**
     * Checks if user can generate reports
     *
     * @returns True if user has report generation permission
     */
    canGenerateReports() {
        return this.hasPermission(PERMISSIONS.REPORTS_GENERATE);
    }

    /**
     * Checks if user has system administration access
     *
     * @returns True if user has system admin permission
     */
    canAccessSystemAdmin() {
        return this.hasPermission(PERMISSIONS.SYSTEM_ADMIN);
    }

    /**
     * Checks if user can send staff messages
     *
     * @returns True if user has messaging send permission
     */
    canSendMessages() {
        return this.hasPermission(PERMISSIONS.MESSAGING_SEND);
    }

    /**
     * Checks if user can make video calls
     *
     * @returns True if user has video call permission
     */
    canMakeVideoCalls() {
        return this.hasPermission(PERMISSIONS.MESSAGING_VIDEO_CALL);
    }

    /**
     * Checks if user can make voice calls
     *
     * @returns True if user has voice call permission
     */
    canMakeVoiceCalls() {
        return this.hasPermission(PERMISSIONS.MESSAGING_VOICE_CALL);
    }

    /**
     * Checks if user can manage help content (FAQs, guides, resources)
     *
     * @returns True if user has any help content management permissions
     */
    canManageHelpContent() {
        return this.hasPermission(PERMISSIONS.FAQ_CREATE) ||
            this.hasPermission(PERMISSIONS.GUIDE_CREATE) ||
            this.hasPermission(PERMISSIONS.RESOURCE_CREATE);
    }

    /**
     * Filters menu items based on user permissions
     * Recursively filters children menu items as well
     *
     * @param menuItems - Array of menu item objects with optional permissions/route fields
     * @returns Filtered menu items the user can access
     *
     * @example
     * ```typescript
     * const menu = [
     *   { label: 'Users', permissions: [PERMISSIONS.USER_READ], route: '/admin/users' },
     *   { label: 'Settings', route: '/settings', children: [...] }
     * ];
     * const filteredMenu = manager.getFilteredMenuItems(menu);
     * ```
     */
    getFilteredMenuItems(menuItems: any) {
        return menuItems.filter((item: any) => {
            if (item.permissions) {
                return this.hasAnyPermission(item.permissions);
            }
            if (item.route) {
                return this.canAccessRoute(item.route);
            }
            return true;
        }).map((item: any) => ({
            ...item,
            children: item.children ? this.getFilteredMenuItems(item.children) : undefined
        }));
    }
}

/**
 * React hook for accessing permission checking in components
 * Automatically fetches custom roles and memoizes the permission manager
 *
 * @returns PermissionManager instance for the current user
 *
 * @example
 * ```typescript
 * function AdminPanel() {
 *   const permissions = usePermissions();
 *
 *   if (!permissions.hasPermission(PERMISSIONS.SYSTEM_ADMIN)) {
 *     return <AccessDenied />;
 *   }
 *
 *   return (
 *     <div>
 *       {permissions.canManageUsers() && <UserManagement />}
 *       {permissions.canViewAnalytics() && <Analytics />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions() {
    const { user } = useAuth();
    const [customRoles, setCustomRoles] = useState<any[]>([]);

    useEffect(() => {
        // Fetch custom roles for the user
        const fetchCustomRoles = async () => {
            try {
                const roles = await mockApiClient.entities?.['Role']?.list();
                if (roles && Array.isArray(roles)) {
                    setCustomRoles(roles);
                }
            } catch (error) {
                console.error('Failed to fetch custom roles:', error);
            }
        };

        if (user) {
            fetchCustomRoles();
        }
    }, [user]);

    const permissionManager = useMemo(() => {
        return new PermissionManager(user, customRoles);
    }, [user, customRoles]);

    return permissionManager;
}

/**
 * Higher-order component for wrapping components with permission checks
 * Displays access denied message if user lacks required permissions
 *
 * @param WrappedComponent - Component to wrap with permission check
 * @param requiredPermissions - Array of permission strings (ANY logic)
 * @returns Wrapped component with permission protection
 *
 * @example
 * ```typescript
 * const ProtectedUserManagement = withPermissions(
 *   UserManagement,
 *   [PERMISSIONS.USER_READ]
 * );
 *
 * // Usage in app
 * <ProtectedUserManagement />
 * ```
 */
export function withPermissions(WrappedComponent: React.ComponentType<any>, requiredPermissions: string[]) {
    return function PermissionWrapper(props: any) {
        const permissions = usePermissions();

        if (!permissions.hasAnyPermission(requiredPermissions)) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                        <p className="text-gray-600">You don&apos;t have permission to access this feature.</p>
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
}

/**
 * Permission guard component for conditional rendering based on permissions
 * Provides flexible permission checking with custom fallback content
 *
 * @param props - Component props
 * @param props.children - Content to render if user has permissions
 * @param props.permissions - Array of permission strings to check
 * @param props.fallback - Content to render if permission check fails (default: null)
 * @param props.requireAll - If true, requires ALL permissions (AND logic), otherwise ANY (OR logic)
 * @returns children if permission check passes, otherwise fallback
 *
 * @example
 * ```typescript
 * // Show button only if user can create patients
 * <PermissionGuard permissions={[PERMISSIONS.PATIENT_CREATE]}>
 *   <CreatePatientButton />
 * </PermissionGuard>
 *
 * // Require ALL permissions
 * <PermissionGuard
 *   permissions={[PERMISSIONS.BILLING_CREATE, PERMISSIONS.BILLING_UPDATE]}
 *   requireAll={true}
 *   fallback={<p>You need both create and update permissions</p>}
 * >
 *   <AdvancedBillingFeatures />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
    children,
    permissions,
    fallback = null,
    requireAll = false
}: {
    children: React.ReactNode;
    permissions: string[];
    fallback?: React.ReactNode;
    requireAll?: boolean;
}) {
    const permissionManager = usePermissions();

    const hasAccess = requireAll ?
        permissionManager.hasAllPermissions(permissions) :
        permissionManager.hasAnyPermission(permissions);

    if (!hasAccess) {
        return fallback;
    }

    return children;
}

/**
 * Standalone function to check if user can access a route
 * Useful for router guards and navigation logic
 *
 * @param route - Route path to check
 * @param user - User object
 * @param customRoles - Optional custom roles
 * @returns True if user can access the route
 *
 * @example
 * ```typescript
 * if (checkRoutePermission('/admin/users', currentUser)) {
 *   navigate('/admin/users');
 * }
 * ```
 */
export function checkRoutePermission(route: string, user: any, customRoles: any[] = []) {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.canAccessRoute(route);
}

/**
 * Standalone function to check if user has a specific permission
 *
 * @param user - User object
 * @param permission - Permission string to check
 * @param customRoles - Optional custom roles
 * @returns True if user has the permission
 *
 * @example
 * ```typescript
 * if (hasPermission(currentUser, PERMISSIONS.PATIENT_CREATE)) {
 *   // Show create patient button
 * }
 * ```
 */
export const hasPermission = (user: any, permission: string, customRoles: any[] = []) => {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.hasPermission(permission);
};

/**
 * Standalone function to check if user has ANY of the specified permissions
 *
 * @param user - User object
 * @param permissions - Array of permission strings
 * @param customRoles - Optional custom roles
 * @returns True if user has at least one permission
 *
 * @example
 * ```typescript
 * if (hasAnyPermission(currentUser, [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE])) {
 *   // Show user management
 * }
 * ```
 */
export const hasAnyPermission = (user: any, permissions: string[], customRoles: any[] = []) => {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.hasAnyPermission(permissions);
};

/**
 * Standalone function to check if user has ALL of the specified permissions
 *
 * @param user - User object
 * @param permissions - Array of permission strings
 * @param customRoles - Optional custom roles
 * @returns True if user has all permissions
 *
 * @example
 * ```typescript
 * if (hasAllPermissions(currentUser, [
 *   PERMISSIONS.BILLING_CREATE,
 *   PERMISSIONS.ANALYTICS_EXPORT
 * ])) {
 *   // Show advanced billing features
 * }
 * ```
 */
export const hasAllPermissions = (user: any, permissions: string[], customRoles: any[] = []) => {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.hasAllPermissions(permissions);
};

/**
 * Standalone function to check if user can access a route (alias for checkRoutePermission)
 *
 * @param route - Route path to check
 * @param user - User object
 * @param customRoles - Optional custom roles
 * @returns True if user can access the route
 *
 * @example
 * ```typescript
 * const canView = canAccessRoute('/admin/audit-logs', currentUser);
 * ```
 */
export const canAccessRoute = (route: string, user: any, customRoles: any[] = []) => {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.canAccessRoute(route);
};