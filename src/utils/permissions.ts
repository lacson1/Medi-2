// Permission constants and types
// Separated from permissionMatrix.tsx to fix React Fast Refresh issues

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
    PATIENT_VIEW_SENSITIVE: 'patient:view_sensitive',

    // Appointment Management
    APPOINTMENT_CREATE: 'appointment:create',
    APPOINTMENT_READ: 'appointment:read',
    APPOINTMENT_UPDATE: 'appointment:update',
    APPOINTMENT_DELETE: 'appointment:delete',
    APPOINTMENT_SCHEDULE: 'appointment:schedule',

    // Lab Management
    LAB_CREATE: 'lab:create',
    LAB_READ: 'lab:read',
    LAB_UPDATE: 'lab:update',
    LAB_DELETE: 'lab:delete',
    LAB_RESULTS_VIEW: 'lab:results_view',
    LAB_RESULTS_EDIT: 'lab:results_edit',

    // Prescription Management
    PRESCRIPTION_CREATE: 'prescription:create',
    PRESCRIPTION_READ: 'prescription:read',
    PRESCRIPTION_UPDATE: 'prescription:update',
    PRESCRIPTION_DELETE: 'prescription:delete',
    PRESCRIPTION_APPROVE: 'prescription:approve',

    // Billing Management
    BILLING_CREATE: 'billing:create',
    BILLING_READ: 'billing:read',
    BILLING_UPDATE: 'billing:update',
    BILLING_DELETE: 'billing:delete',
    BILLING_APPROVE: 'billing:approve',

    // Analytics & Reports
    ANALYTICS_VIEW: 'analytics:view',
    REPORTS_GENERATE: 'reports:generate',
    REPORTS_EXPORT: 'reports:export',

    // System Administration
    SYSTEM_CONFIG: 'system:config',
    SYSTEM_BACKUP: 'system:backup',
    SYSTEM_RESTORE: 'system:restore',
    SYSTEM_LOGS: 'system:logs',

    // Telemedicine
    TELEMEDICINE_SESSION: 'telemedicine:session',
    TELEMEDICINE_RECORD: 'telemedicine:record',

    // Patient Portal
    PORTAL_ACCESS: 'portal:access',
    PORTAL_MANAGE: 'portal:manage'
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: [
        PERMISSIONS.USER_CREATE, PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE,
        PERMISSIONS.ORG_CREATE, PERMISSIONS.ORG_READ, PERMISSIONS.ORG_UPDATE, PERMISSIONS.ORG_DELETE,
        PERMISSIONS.ROLE_CREATE, PERMISSIONS.ROLE_READ, PERMISSIONS.ROLE_UPDATE, PERMISSIONS.ROLE_DELETE,
        PERMISSIONS.PATIENT_CREATE, PERMISSIONS.PATIENT_READ, PERMISSIONS.PATIENT_UPDATE, PERMISSIONS.PATIENT_DELETE,
        PERMISSIONS.APPOINTMENT_CREATE, PERMISSIONS.APPOINTMENT_READ, PERMISSIONS.APPOINTMENT_UPDATE, PERMISSIONS.APPOINTMENT_DELETE,
        PERMISSIONS.LAB_CREATE, PERMISSIONS.LAB_READ, PERMISSIONS.LAB_UPDATE, PERMISSIONS.LAB_DELETE,
        PERMISSIONS.PRESCRIPTION_CREATE, PERMISSIONS.PRESCRIPTION_READ, PERMISSIONS.PRESCRIPTION_UPDATE, PERMISSIONS.PRESCRIPTION_DELETE,
        PERMISSIONS.BILLING_CREATE, PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_UPDATE, PERMISSIONS.BILLING_DELETE,
        PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.REPORTS_EXPORT,
        PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.SYSTEM_BACKUP, PERMISSIONS.SYSTEM_RESTORE, PERMISSIONS.SYSTEM_LOGS,
        PERMISSIONS.TELEMEDICINE_SESSION, PERMISSIONS.TELEMEDICINE_RECORD,
        PERMISSIONS.PORTAL_ACCESS, PERMISSIONS.PORTAL_MANAGE
    ],
    ADMIN: [
        PERMISSIONS.USER_CREATE, PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE,
        PERMISSIONS.ORG_READ, PERMISSIONS.ORG_UPDATE,
        PERMISSIONS.PATIENT_CREATE, PERMISSIONS.PATIENT_READ, PERMISSIONS.PATIENT_UPDATE, PERMISSIONS.PATIENT_DELETE,
        PERMISSIONS.APPOINTMENT_CREATE, PERMISSIONS.APPOINTMENT_READ, PERMISSIONS.APPOINTMENT_UPDATE, PERMISSIONS.APPOINTMENT_DELETE,
        PERMISSIONS.LAB_CREATE, PERMISSIONS.LAB_READ, PERMISSIONS.LAB_UPDATE, PERMISSIONS.LAB_DELETE,
        PERMISSIONS.PRESCRIPTION_CREATE, PERMISSIONS.PRESCRIPTION_READ, PERMISSIONS.PRESCRIPTION_UPDATE, PERMISSIONS.PRESCRIPTION_DELETE,
        PERMISSIONS.BILLING_CREATE, PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_UPDATE, PERMISSIONS.BILLING_DELETE,
        PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.REPORTS_EXPORT,
        PERMISSIONS.TELEMEDICINE_SESSION, PERMISSIONS.TELEMEDICINE_RECORD,
        PERMISSIONS.PORTAL_ACCESS, PERMISSIONS.PORTAL_MANAGE
    ],
    DOCTOR: [
        PERMISSIONS.PATIENT_CREATE, PERMISSIONS.PATIENT_READ, PERMISSIONS.PATIENT_UPDATE,
        PERMISSIONS.APPOINTMENT_CREATE, PERMISSIONS.APPOINTMENT_READ, PERMISSIONS.APPOINTMENT_UPDATE, PERMISSIONS.APPOINTMENT_SCHEDULE,
        PERMISSIONS.LAB_CREATE, PERMISSIONS.LAB_READ, PERMISSIONS.LAB_RESULTS_VIEW, PERMISSIONS.LAB_RESULTS_EDIT,
        PERMISSIONS.PRESCRIPTION_CREATE, PERMISSIONS.PRESCRIPTION_READ, PERMISSIONS.PRESCRIPTION_UPDATE, PERMISSIONS.PRESCRIPTION_APPROVE,
        PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.REPORTS_GENERATE,
        PERMISSIONS.TELEMEDICINE_SESSION, PERMISSIONS.TELEMEDICINE_RECORD
    ],
    NURSE: [
        PERMISSIONS.PATIENT_READ, PERMISSIONS.PATIENT_UPDATE,
        PERMISSIONS.APPOINTMENT_READ, PERMISSIONS.APPOINTMENT_UPDATE, PERMISSIONS.APPOINTMENT_SCHEDULE,
        PERMISSIONS.LAB_READ, PERMISSIONS.LAB_RESULTS_VIEW,
        PERMISSIONS.PRESCRIPTION_READ,
        PERMISSIONS.TELEMEDICINE_SESSION
    ],
    RECEPTIONIST: [
        PERMISSIONS.PATIENT_CREATE, PERMISSIONS.PATIENT_READ, PERMISSIONS.PATIENT_UPDATE,
        PERMISSIONS.APPOINTMENT_CREATE, PERMISSIONS.APPOINTMENT_READ, PERMISSIONS.APPOINTMENT_UPDATE, PERMISSIONS.APPOINTMENT_SCHEDULE,
        PERMISSIONS.BILLING_CREATE, PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_UPDATE
    ],
    LAB_TECHNICIAN: [
        PERMISSIONS.LAB_CREATE, PERMISSIONS.LAB_READ, PERMISSIONS.LAB_UPDATE, PERMISSIONS.LAB_RESULTS_EDIT,
        PERMISSIONS.PATIENT_READ
    ],
    PHARMACIST: [
        PERMISSIONS.PRESCRIPTION_READ, PERMISSIONS.PRESCRIPTION_UPDATE, PERMISSIONS.PRESCRIPTION_APPROVE,
        PERMISSIONS.PATIENT_READ
    ],
    PATIENT: [
        PERMISSIONS.PORTAL_ACCESS
    ]
} as const;

// Route-based permission mapping
export const ROUTE_PERMISSIONS = {
    '/dashboard': [PERMISSIONS.USER_READ],
    '/patients': [PERMISSIONS.PATIENT_READ],
    '/patients/new': [PERMISSIONS.PATIENT_CREATE],
    '/patients/:id': [PERMISSIONS.PATIENT_READ],
    '/patients/:id/edit': [PERMISSIONS.PATIENT_UPDATE],
    '/appointments': [PERMISSIONS.APPOINTMENT_READ],
    '/appointments/new': [PERMISSIONS.APPOINTMENT_CREATE],
    '/appointments/:id': [PERMISSIONS.APPOINTMENT_READ],
    '/appointments/:id/edit': [PERMISSIONS.APPOINTMENT_UPDATE],
    '/lab-orders': [PERMISSIONS.LAB_READ],
    '/lab-orders/new': [PERMISSIONS.LAB_CREATE],
    '/lab-orders/:id': [PERMISSIONS.LAB_READ],
    '/lab-orders/:id/edit': [PERMISSIONS.LAB_UPDATE],
    '/prescriptions': [PERMISSIONS.PRESCRIPTION_READ],
    '/prescriptions/new': [PERMISSIONS.PRESCRIPTION_CREATE],
    '/prescriptions/:id': [PERMISSIONS.PRESCRIPTION_READ],
    '/prescriptions/:id/edit': [PERMISSIONS.PRESCRIPTION_UPDATE],
    '/billing': [PERMISSIONS.BILLING_READ],
    '/billing/new': [PERMISSIONS.BILLING_CREATE],
    '/billing/:id': [PERMISSIONS.BILLING_READ],
    '/billing/:id/edit': [PERMISSIONS.BILLING_UPDATE],
    '/analytics': [PERMISSIONS.ANALYTICS_VIEW],
    '/reports': [PERMISSIONS.REPORTS_GENERATE],
    '/settings': [PERMISSIONS.SYSTEM_CONFIG],
    '/users': [PERMISSIONS.USER_READ],
    '/users/new': [PERMISSIONS.USER_CREATE],
    '/users/:id': [PERMISSIONS.USER_READ],
    '/users/:id/edit': [PERMISSIONS.USER_UPDATE],
    '/organizations': [PERMISSIONS.ORG_READ],
    '/organizations/new': [PERMISSIONS.ORG_CREATE],
    '/organizations/:id': [PERMISSIONS.ORG_READ],
    '/organizations/:id/edit': [PERMISSIONS.ORG_UPDATE],
    '/telemedicine': [PERMISSIONS.TELEMEDICINE_SESSION],
    '/patient-portal': [PERMISSIONS.PORTAL_ACCESS]
} as const;

// Permission checking functions
export const hasPermission = (_user: any, _permission: string, _customRoles: any[] = []) => {
    // Implementation moved to permissionMatrix.tsx
    return false; // Placeholder
};

export const hasAnyPermission = (_user: any, _permissions: string[], _customRoles: any[] = []) => {
    // Implementation moved to permissionMatrix.tsx
    return false; // Placeholder
};

export const hasAllPermissions = (_user: any, _permissions: string[], _customRoles: any[] = []) => {
    // Implementation moved to permissionMatrix.tsx
    return false; // Placeholder
};

export const canAccessRoute = (_route: string, _user: any, _customRoles: any[] = []) => {
    // Implementation moved to permissionMatrix.tsx
    return false; // Placeholder
};

export const checkRoutePermission = (_route: string, _user: any, _customRoles: any[] = []) => {
    // Implementation moved to permissionMatrix.tsx
    return false; // Placeholder
};
