// Permission Matrix and Route Protection System
import { mockApiClient } from "@/api/mockApiClient";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useMemo } from 'react';
import { Shield } from 'lucide-react';
import React from 'react';

// Define all permission types
export const PERMISSIONS = {
    // User Management
    USER_CREATE: 'user:create',
    USER_READ: 'user:read',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    USER_MANAGE_PASSWORDS: 'user:manage_passwords',

    // Organization Management
    ORG_CREATE: 'organization:create',
    ORG_READ: 'organization:read',
    ORG_UPDATE: 'organization:update',
    ORG_DELETE: 'organization:delete',

    // Role Management
    ROLE_CREATE: 'role:create',
    ROLE_READ: 'role:read',
    ROLE_UPDATE: 'role:update',
    ROLE_DELETE: 'role:delete',

    // Patient Management
    PATIENT_CREATE: 'patient:create',
    PATIENT_READ: 'patient:read',
    PATIENT_UPDATE: 'patient:update',
    PATIENT_DELETE: 'patient:delete',

    // Appointment Management
    APPOINTMENT_CREATE: 'appointment:create',
    APPOINTMENT_READ: 'appointment:read',
    APPOINTMENT_UPDATE: 'appointment:update',
    APPOINTMENT_DELETE: 'appointment:delete',

    // Billing Management
    BILLING_CREATE: 'billing:create',
    BILLING_READ: 'billing:read',
    BILLING_UPDATE: 'billing:update',
    BILLING_DELETE: 'billing:delete',

    // Analytics & Reports
    ANALYTICS_VIEW: 'analytics:view',
    ANALYTICS_EXPORT: 'analytics:export',
    REPORTS_GENERATE: 'reports:generate',

    // System Administration
    SYSTEM_ADMIN: 'system:admin',
    AUDIT_LOGS_VIEW: 'audit:view',
    AUDIT_LOGS_EXPORT: 'audit:export',
    ERROR_MONITORING: 'error:monitor',
    SYSTEM_METRICS: 'system:metrics',

    // Staff Messaging
    MESSAGING_SEND: 'messaging:send',
    MESSAGING_RECEIVE: 'messaging:receive',
    MESSAGING_VIDEO_CALL: 'messaging:video_call',
    MESSAGING_VOICE_CALL: 'messaging:voice_call',

    // Help & Support
    FAQ_CREATE: 'faq:create',
    FAQ_READ: 'faq:read',
    FAQ_UPDATE: 'faq:update',
    FAQ_DELETE: 'faq:delete',
    GUIDE_CREATE: 'guide:create',
    GUIDE_READ: 'guide:read',
    GUIDE_UPDATE: 'guide:update',
    GUIDE_DELETE: 'guide:delete',
    SUPPORT_TICKET_CREATE: 'support:create',
    SUPPORT_TICKET_READ: 'support:read',
    SUPPORT_TICKET_UPDATE: 'support:update',
    RESOURCE_CREATE: 'resource:create',
    RESOURCE_READ: 'resource:read',
    RESOURCE_UPDATE: 'resource:update',
    RESOURCE_DELETE: 'resource:delete',

    // Settings
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_UPDATE: 'settings:update',
    PROFILE_UPDATE: 'profile:update',
    PASSWORD_CHANGE: 'password:change'
};

// Define role-based permission mappings
export const ROLE_PERMISSIONS = {
    superadmin: Object.values(PERMISSIONS), // All permissions

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

// Route permission mappings
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

// Permission checking utilities
export class PermissionManager {
    user: any;
    customRoles: any[];
    userPermissions: any[];

    constructor(user: any, customRoles: any[] = []) {
        this.user = user;
        this.customRoles = customRoles;
        this.userPermissions = this.getUserPermissions();
    }

    // Get all permissions for the current user
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

    // Check if user has specific permission
    hasPermission(permission: string) {
        return this.userPermissions.includes(permission);
    }

    // Check if user has any of the specified permissions
    hasAnyPermission(permissions: string[]) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    // Check if user has all of the specified permissions
    hasAllPermissions(permissions: string[]) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    // Check if user can access a specific route
    canAccessRoute(route: string) {
        const requiredPermissions = ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];
        if (!requiredPermissions) return true; // No specific permissions required

        return this.hasAnyPermission(requiredPermissions);
    }

    // Get user's effective role (including custom roles)
    getEffectiveRole() {
        if (this.user.email === 'superadmin@bluequee2.com') {
            return 'superadmin';
        }

        return this.user.role || 'patient';
    }

    // Check if user is super admin
    isSuperAdmin() {
        return this.user?.email === 'superadmin@bluequee2.com';
    }

    // Check if user is admin or delegate
    isAdmin() {
        return ['admin', 'delegate'].includes(this.getEffectiveRole());
    }

    // Check if user can manage other users
    canManageUsers() {
        return this.hasPermission(PERMISSIONS.USER_CREATE) ||
            this.hasPermission(PERMISSIONS.USER_UPDATE) ||
            this.hasPermission(PERMISSIONS.USER_DELETE);
    }

    // Check if user can manage organizations
    canManageOrganizations() {
        return this.hasPermission(PERMISSIONS.ORG_CREATE) ||
            this.hasPermission(PERMISSIONS.ORG_UPDATE) ||
            this.hasPermission(PERMISSIONS.ORG_DELETE);
    }

    // Check if user can view analytics
    canViewAnalytics() {
        return this.hasPermission(PERMISSIONS.ANALYTICS_VIEW);
    }

    // Check if user can generate reports
    canGenerateReports() {
        return this.hasPermission(PERMISSIONS.REPORTS_GENERATE);
    }

    // Check if user can access system administration
    canAccessSystemAdmin() {
        return this.hasPermission(PERMISSIONS.SYSTEM_ADMIN);
    }

    // Check if user can send messages
    canSendMessages() {
        return this.hasPermission(PERMISSIONS.MESSAGING_SEND);
    }

    // Check if user can make video calls
    canMakeVideoCalls() {
        return this.hasPermission(PERMISSIONS.MESSAGING_VIDEO_CALL);
    }

    // Check if user can make voice calls
    canMakeVoiceCalls() {
        return this.hasPermission(PERMISSIONS.MESSAGING_VOICE_CALL);
    }

    // Check if user can manage help content
    canManageHelpContent() {
        return this.hasPermission(PERMISSIONS.FAQ_CREATE) ||
            this.hasPermission(PERMISSIONS.GUIDE_CREATE) ||
            this.hasPermission(PERMISSIONS.RESOURCE_CREATE);
    }

    // Get filtered menu items based on permissions
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

// Hook for using permissions in React components
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

// Higher-order component for permission-based rendering
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

// Permission guard component
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

// Route permission checker
export function checkRoutePermission(route: string, user: any, customRoles: any[] = []) {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.canAccessRoute(route);
}

// Export permission checking functions
export const hasPermission = (user: any, permission: string, customRoles: any[] = []) => {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.hasPermission(permission);
};

export const hasAnyPermission = (user: any, permissions: string[], customRoles: any[] = []) => {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.hasAnyPermission(permissions);
};

export const hasAllPermissions = (user: any, permissions: string[], customRoles: any[] = []) => {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.hasAllPermissions(permissions);
};

export const canAccessRoute = (route: string, user: any, customRoles: any[] = []) => {
    const permissionManager = new PermissionManager(user, customRoles);
    return permissionManager.canAccessRoute(route);
};