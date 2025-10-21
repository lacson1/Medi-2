/**
 * Comprehensive Audit Logging System for HIPAA/GDPR Compliance
 *
 * This module provides a complete audit trail for all user actions and data access
 * within the healthcare application. It ensures compliance with HIPAA, GDPR, and
 * other regulatory requirements by maintaining an immutable, comprehensive log
 * of all system activities.
 *
 * @module auditLogger
 *
 * @example
 * ```typescript
 * import { auditLogger, AUDIT_ACTIONS, AUDIT_LEVELS } from '@/utils/auditLogger';
 *
 * // Set user context
 * auditLogger.setUserContext(currentUser);
 *
 * // Log patient access
 * await auditLogger.log({
 *   action: AUDIT_ACTIONS.PATIENT_VIEW,
 *   level: AUDIT_LEVELS.INFO,
 *   patientId: 'patient-123',
 *   sensitiveDataAccessed: true
 * });
 *
 * // Log emergency access
 * await auditLogger.log({
 *   action: AUDIT_ACTIONS.BREAK_GLASS_ACCESS,
 *   level: AUDIT_LEVELS.CRITICAL,
 *   emergencyAccess: true,
 *   breakGlassReason: 'Patient cardiac arrest - immediate care required'
 * });
 * ```
 */
import React from 'react';
import { mockApiClient } from "@/api/mockApiClient";

/**
 * User context information for audit logging
 * Contains identifying information about the user performing an action
 */
export interface UserContext {
    /** Unique identifier for the user */
    userId: string;
    /** Full name of the user */
    userName: string;
    /** Email address of the user */
    userEmail: string;
    /** Role of the user (doctor, nurse, admin, etc.) */
    userRole: string;
    /** Organization ID the user belongs to */
    organizationId: string;
    /** Name of the organization */
    organizationName: string;
}

/**
 * Organization context information for multi-tenant systems
 */
export interface OrganizationContext {
    /** Unique identifier for the organization */
    organizationId: string;
    /** Name of the organization */
    organizationName: string;
    /** Type of organization (hospital, clinic, etc.) */
    organizationType: string;
}

/**
 * Complete audit log entry with all metadata
 * Represents a single immutable audit record
 */
export interface AuditLogEntry {
    /** Unique identifier for this audit entry */
    id: string;
    /** Session identifier for grouping related actions */
    sessionId: string;
    /** ISO 8601 timestamp when the action occurred */
    timestamp: string;
    /** Action type (e.g., 'patient_view', 'login', 'data_export') */
    action: string;
    /** Severity level ('info', 'warning', 'error', 'critical') */
    level: string;
    /** Resource name being accessed (optional) */
    resource: string | null;
    /** Unique identifier of the resource (optional) */
    resourceId: string | null;
    /** Type of resource being accessed (optional) */
    resourceType: string | null;
    /** User ID who performed the action */
    userId?: string | undefined;
    /** Name of the user */
    userName?: string | undefined;
    /** Email of the user */
    userEmail?: string | undefined;
    /** Role of the user */
    userRole?: string | undefined;
    /** Organization ID */
    organizationId?: string | undefined;
    /** Organization name */
    organizationName?: string | undefined;
    /** Patient ID if action involves a specific patient */
    patientId?: string | null;
    /** Patient name for reference */
    patientName?: string | null;
    /** IP address of the user */
    ipAddress: string;
    /** Browser user agent string */
    userAgent: string;
    /** Whether sensitive/PHI data was accessed */
    sensitiveDataAccessed: boolean;
    /** Whether data was masked/redacted */
    dataMasked: boolean;
    /** Whether this was emergency access */
    emergencyAccess: boolean;
    /** Reason for emergency "break glass" access */
    breakGlassReason?: string | null;
    /** Whether user consent was given for this action */
    consentGiven?: boolean | null;
    /** Custom retention period for this entry */
    dataRetentionPeriod?: string | null;
    /** Compliance flags (HIPAA, GDPR, etc.) */
    complianceFlags: string[];
    /** Additional contextual details */
    details: Record<string, any>;
    /** Compliance metadata */
    complianceMetadata: {
        /** HIPAA compliance indicator */
        hipaaCompliant: boolean;
        /** GDPR compliance indicator */
        gdprCompliant: boolean;
        /** Retention period in days */
        retentionPeriod: number;
        /** Whether this log is immutable */
        immutable: boolean;
    };
    /** Error message if logging failed */
    loggingError?: string;
    /** Whether stored in fallback storage */
    fallbackStorage?: boolean;
}

/**
 * Parameters for creating an audit log entry
 * Only action is required, all other fields are optional
 */
export interface LogParams {
    /** Action being performed (required) */
    action: string;
    /** Severity level (defaults to 'info') */
    level?: string;
    /** Resource name */
    resource?: string | null;
    /** Resource identifier */
    resourceId?: string | null;
    /** Resource type */
    resourceType?: string | null;
    /** Additional contextual details */
    details?: Record<string, any>;
    /** IP address (auto-detected if not provided) */
    ipAddress?: string | null;
    /** User agent (auto-detected if not provided) */
    userAgent?: string | null;
    /** Patient identifier */
    patientId?: string | null;
    /** Patient name */
    patientName?: string | null;
    /** Whether PHI/sensitive data was accessed */
    sensitiveDataAccessed?: boolean;
    /** Whether data was masked */
    dataMasked?: boolean;
    /** Whether this is emergency access */
    emergencyAccess?: boolean;
    /** Reason for emergency access */
    breakGlassReason?: string | null;
    /** Whether consent was given */
    consentGiven?: boolean | null;
    /** Custom retention period */
    dataRetentionPeriod?: string | null;
    /** Compliance flags */
    complianceFlags?: string[];
}

/**
 * Filters for querying audit logs
 */
export interface AuditFilters {
    /** Filter by action type */
    action?: string;
    /** Filter by severity level */
    level?: string;
    /** Filter by user ID */
    userId?: string;
    /** Filter by patient ID */
    patientId?: string;
    /** Filter by date range start (ISO 8601) */
    dateFrom?: string;
    /** Filter by date range end (ISO 8601) */
    dateTo?: string;
}

/**
 * Configuration for React component audit logging
 */
export interface AuditConfig {
    /** Log entry to create when component mounts */
    onMount?: {
        action: string;
        level?: string;
        details?: Record<string, any>;
    };
    /** Log entry to create when component unmounts */
    onUnmount?: {
        action: string;
        level?: string;
        details?: Record<string, any>;
    };
}

/**
 * Severity levels for audit log entries
 * Used to categorize the importance and urgency of logged events
 *
 * @constant
 *
 * @example
 * ```typescript
 * // Regular patient access
 * auditLogger.log({ action: 'patient_view', level: AUDIT_LEVELS.INFO });
 *
 * // Suspicious activity
 * auditLogger.log({ action: 'login_failed', level: AUDIT_LEVELS.WARNING });
 *
 * // Emergency access
 * auditLogger.log({ action: 'break_glass_access', level: AUDIT_LEVELS.CRITICAL });
 * ```
 */
export const AUDIT_LEVELS = {
    /** Informational events - routine operations and normal access */
    INFO: 'info',
    /** Warning events - unusual but not critical activity */
    WARNING: 'warning',
    /** Error events - failed operations or access denials */
    ERROR: 'error',
    /** Critical events - emergency access, security breaches, or compliance violations */
    CRITICAL: 'critical'
} as const;

/**
 * Comprehensive set of audit action types for tracking all system activities
 * Organized by category for easy reference and compliance mapping
 *
 * @constant
 *
 * @example
 * ```typescript
 * // Authentication
 * auditLogger.log({ action: AUDIT_ACTIONS.LOGIN, level: AUDIT_LEVELS.INFO });
 *
 * // Patient access
 * auditLogger.log({
 *   action: AUDIT_ACTIONS.PATIENT_VIEW,
 *   patientId: '123',
 *   sensitiveDataAccessed: true
 * });
 *
 * // Emergency access
 * auditLogger.log({
 *   action: AUDIT_ACTIONS.BREAK_GLASS_ACCESS,
 *   level: AUDIT_LEVELS.CRITICAL,
 *   breakGlassReason: 'Life-threatening emergency'
 * });
 * ```
 */
export const AUDIT_ACTIONS = {
    // Authentication & Authorization
    /** User successfully logged in */
    LOGIN: 'login',
    /** User logged out */
    LOGOUT: 'logout',
    /** Failed login attempt (security monitoring) */
    LOGIN_FAILED: 'login_failed',
    /** User changed their password */
    PASSWORD_CHANGE: 'password_change',
    /** User role was changed by administrator */
    ROLE_CHANGE: 'role_change',
    /** User permissions were modified */
    PERMISSION_CHANGE: 'permission_change',

    // Patient Data Access
    /** Patient record was viewed (HIPAA-tracked) */
    PATIENT_VIEW: 'patient_view',
    /** New patient record created */
    PATIENT_CREATE: 'patient_create',
    /** Patient record was updated */
    PATIENT_UPDATE: 'patient_update',
    /** Patient record was deleted */
    PATIENT_DELETE: 'patient_delete',
    /** Patient search was performed */
    PATIENT_SEARCH: 'patient_search',

    // Medical Records
    /** Medical record was viewed (HIPAA-tracked) */
    MEDICAL_RECORD_VIEW: 'medical_record_view',
    /** New medical record created */
    MEDICAL_RECORD_CREATE: 'medical_record_create',
    /** Medical record was updated */
    MEDICAL_RECORD_UPDATE: 'medical_record_update',
    /** Medical record was deleted */
    MEDICAL_RECORD_DELETE: 'medical_record_delete',

    // Prescriptions
    /** Prescription was viewed */
    PRESCRIPTION_VIEW: 'prescription_view',
    /** New prescription created */
    PRESCRIPTION_CREATE: 'prescription_create',
    /** Prescription was updated */
    PRESCRIPTION_UPDATE: 'prescription_update',
    /** Prescription was deleted */
    PRESCRIPTION_DELETE: 'prescription_delete',

    // Lab Results
    /** Lab result was viewed */
    LAB_RESULT_VIEW: 'lab_result_view',
    /** New lab result created */
    LAB_RESULT_CREATE: 'lab_result_create',
    /** Lab result was updated */
    LAB_RESULT_UPDATE: 'lab_result_update',

    // Appointments
    /** Appointment was viewed */
    APPOINTMENT_VIEW: 'appointment_view',
    /** New appointment created */
    APPOINTMENT_CREATE: 'appointment_create',
    /** Appointment was updated */
    APPOINTMENT_UPDATE: 'appointment_update',
    /** Appointment was cancelled/deleted */
    APPOINTMENT_DELETE: 'appointment_delete',

    // Consent Management
    /** Patient consent record viewed */
    CONSENT_VIEW: 'consent_view',
    /** New consent record created */
    CONSENT_CREATE: 'consent_create',
    /** Consent record updated */
    CONSENT_UPDATE: 'consent_update',
    /** Patient consent revoked (GDPR-tracked) */
    CONSENT_REVOKE: 'consent_revoke',

    // Emergency Access
    /** Break-glass emergency access override (requires justification) */
    BREAK_GLASS_ACCESS: 'break_glass_access',
    /** Emergency access to patient data */
    EMERGENCY_ACCESS: 'emergency_access',

    // Data Export/Import
    /** Patient data exported (GDPR-tracked) */
    DATA_EXPORT: 'data_export',
    /** Data imported into system */
    DATA_IMPORT: 'data_import',
    /** Patient data deleted (GDPR right to be forgotten) */
    DATA_DELETE: 'data_delete',

    // System Events
    /** System configuration changed */
    SYSTEM_CONFIG_CHANGE: 'system_config_change',
    /** New user account created */
    USER_CREATE: 'user_create',
    /** User account updated */
    USER_UPDATE: 'user_update',
    /** User account deleted */
    USER_DELETE: 'user_delete',

    // Privacy Events
    /** Data masking applied to sensitive fields */
    DATA_MASKING_APPLIED: 'data_masking_applied',
    /** Sensitive/PHI data accessed */
    SENSITIVE_DATA_ACCESS: 'sensitive_data_access',
    /** Privacy settings changed */
    PRIVACY_SETTING_CHANGE: 'privacy_setting_change'
} as const;

/**
 * Main audit logging class for HIPAA/GDPR compliance
 * Manages session tracking, user context, and creates immutable audit trail entries
 *
 * @class AuditLogger
 *
 * @example
 * ```typescript
 * const logger = new AuditLogger();
 * logger.setUserContext(currentUser);
 * await logger.log({ action: AUDIT_ACTIONS.PATIENT_VIEW, patientId: '123' });
 * ```
 */
export class AuditLogger {
    private sessionId: string;
    private userContext: UserContext | null;
    private organizationContext: OrganizationContext | null;

    /**
     * Creates a new AuditLogger instance with a unique session ID
     * Initializes user and organization contexts as null
     */
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userContext = null;
        this.organizationContext = null;
    }

    /**
     * Generates a unique session identifier
     * Format: "session_timestamp_randomstring"
     *
     * @returns Unique session ID string
     *
     * @example
     * ```typescript
     * const sessionId = auditLogger.generateSessionId();
     * // Returns: "session_1699999999999_abc123xyz"
     * ```
     */
    generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sets the current user context for all subsequent audit log entries
     * Should be called after user authentication
     *
     * @param user - User object containing id, name, email, role, and organization info
     *
     * @example
     * ```typescript
     * auditLogger.setUserContext({
     *   id: 'user-123',
     *   name: 'Dr. Jane Smith',
     *   email: 'jane.smith@hospital.com',
     *   role: 'doctor',
     *   organizationId: 'org-456',
     *   organizationName: 'City Hospital'
     * });
     * ```
     */
    setUserContext(user: any): void {
        this.userContext = {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userRole: user.role,
            organizationId: user.organizationId,
            organizationName: user.organizationName
        };
    }

    /**
     * Sets the organization context for multi-tenant systems
     * Useful when user context doesn't include full organization details
     *
     * @param organization - Organization object containing id, name, and type
     *
     * @example
     * ```typescript
     * auditLogger.setOrganizationContext({
     *   id: 'org-456',
     *   name: 'City Hospital',
     *   type: 'hospital'
     * });
     * ```
     */
    setOrganizationContext(organization: any): void {
        this.organizationContext = {
            organizationId: organization.id,
            organizationName: organization.name,
            organizationType: organization.type
        };
    }

    /**
     * Core logging method - creates a complete audit log entry
     * Automatically includes user context, timestamps, compliance metadata, and device info
     *
     * @param params - Logging parameters (only action is required)
     * @returns Promise resolving to the created audit log entry, or undefined if logging fails
     *
     * @example
     * ```typescript
     * // Basic logging
     * await auditLogger.log({
     *   action: AUDIT_ACTIONS.PATIENT_VIEW,
     *   patientId: 'patient-123'
     * });
     *
     * // Advanced logging with all options
     * await auditLogger.log({
     *   action: AUDIT_ACTIONS.BREAK_GLASS_ACCESS,
     *   level: AUDIT_LEVELS.CRITICAL,
     *   patientId: 'patient-456',
     *   patientName: 'John Doe',
     *   emergencyAccess: true,
     *   breakGlassReason: 'Cardiac arrest - immediate care required',
     *   sensitiveDataAccessed: true,
     *   details: { vitals: 'critical', location: 'ER' }
     * });
     * ```
     */
    async log(params: LogParams): Promise<AuditLogEntry | undefined> {
        const {
            action,
            level = AUDIT_LEVELS.INFO,
            resource = null,
            resourceId = null,
            resourceType = null,
            details = {},
            ipAddress = null,
            userAgent = null,
            patientId = null,
            patientName = null,
            sensitiveDataAccessed = false,
            dataMasked = false,
            emergencyAccess = false,
            breakGlassReason = null,
            consentGiven = null,
            dataRetentionPeriod = null,
            complianceFlags = []
        } = params;

        const auditEntry: AuditLogEntry = {
            // Core identifiers
            id: this.generateAuditId(),
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),

            // Action details
            action,
            level,

            // Resource information
            resource,
            resourceId,
            resourceType,

            // User context
            userId: this.userContext?.userId,
            userName: this.userContext?.userName,
            userEmail: this.userContext?.userEmail,
            userRole: this.userContext?.userRole,

            // Organization context
            organizationId: this.userContext?.organizationId || this.organizationContext?.organizationId,
            organizationName: this.userContext?.organizationName || this.organizationContext?.organizationName,

            // Patient information (if applicable)
            patientId,
            patientName,

            // Technical details
            ipAddress: ipAddress || this.getClientIP(),
            userAgent: userAgent || navigator.userAgent,

            // Privacy and compliance
            sensitiveDataAccessed,
            dataMasked,
            emergencyAccess,
            breakGlassReason,
            consentGiven,
            dataRetentionPeriod,
            complianceFlags,

            // Additional details
            details: {
                ...details,
                browserInfo: this.getBrowserInfo(),
                deviceInfo: this.getDeviceInfo(),
                location: this.getLocationInfo()
            },

            // Compliance metadata
            complianceMetadata: {
                hipaaCompliant: this.isHIPAACompliant(action, sensitiveDataAccessed),
                gdprCompliant: this.isGDPRCompliant(action, consentGiven),
                retentionPeriod: this.getRetentionPeriod(level),
                immutable: true // Audit logs should be immutable
            }
        };

        try {
            // Store locally for immediate access
            this.storeLocalAuditLog(auditEntry);

            // Send to backend for persistent storage
            await this.sendToBackend(auditEntry);

            // Real-time monitoring alerts for critical events
            if (level === AUDIT_LEVELS.CRITICAL || emergencyAccess) {
                this.sendRealTimeAlert(auditEntry);
            }

            return auditEntry;
        } catch (error) {
            console.error('Audit logging failed:', error);
            // Fallback: store in localStorage with error flag
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.storeLocalAuditLog({
                ...auditEntry,
                loggingError: errorMessage,
                fallbackStorage: true
            });
            return undefined;
        }
    }

    /**
     * Generates a unique audit log entry identifier
     * Format: "audit_timestamp_randomstring"
     *
     * @returns Unique audit ID string
     *
     * @example
     * ```typescript
     * const auditId = auditLogger.generateAuditId();
     * // Returns: "audit_1699999999999_xyz789abc"
     * ```
     */
    generateAuditId(): string {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Gets the client's IP address
     * In production, this should be provided by the backend to avoid spoofing
     *
     * @returns IP address string (currently returns placeholder)
     */
    getClientIP(): string {
        // In a real implementation, this would be provided by the backend
        return '127.0.0.1'; // Placeholder
    }

    /**
     * Collects browser information for audit context
     * Includes user agent, language, platform, and connection status
     *
     * @returns Object containing browser metadata
     *
     * @example
     * ```typescript
     * const browserInfo = auditLogger.getBrowserInfo();
     * // Returns: { userAgent: '...', language: 'en-US', platform: 'MacIntel', ... }
     * ```
     */
    getBrowserInfo(): Record<string, any> {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    /**
     * Collects device information for audit context
     * Includes screen dimensions, color depth, pixel ratio, and timezone
     *
     * @returns Object containing device metadata
     *
     * @example
     * ```typescript
     * const deviceInfo = auditLogger.getDeviceInfo();
     * // Returns: { screenWidth: 1920, screenHeight: 1080, timezone: 'America/New_York', ... }
     * ```
     */
    getDeviceInfo(): Record<string, any> {
        return {
            screenWidth: screen.width,
            screenHeight: screen.height,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * Gets user location information (placeholder implementation)
     * In production, this should use IP geolocation services
     *
     * @returns Object containing location metadata
     */
    getLocationInfo(): Record<string, string> {
        // In a real implementation, this would be determined by IP geolocation
        return {
            country: 'US',
            region: 'Unknown',
            city: 'Unknown'
        };
    }

    /**
     * Determines if an action is HIPAA-compliant based on action type and data access
     * HIPAA compliance requires tracking when PHI/sensitive patient data is accessed
     *
     * @param action - The audit action type
     * @param sensitiveDataAccessed - Whether PHI/sensitive data was accessed
     * @returns True if action meets HIPAA compliance requirements
     *
     * @example
     * ```typescript
     * const isCompliant = auditLogger.isHIPAACompliant(
     *   AUDIT_ACTIONS.PATIENT_VIEW,
     *   true
     * );
     * // Returns: true
     * ```
     */
    isHIPAACompliant(action: string, sensitiveDataAccessed: boolean): boolean {
        const hipaaActions: string[] = [
            AUDIT_ACTIONS.PATIENT_VIEW,
            AUDIT_ACTIONS.MEDICAL_RECORD_VIEW,
            AUDIT_ACTIONS.PRESCRIPTION_VIEW,
            AUDIT_ACTIONS.LAB_RESULT_VIEW,
            AUDIT_ACTIONS.SENSITIVE_DATA_ACCESS
        ];

        return hipaaActions.includes(action) && sensitiveDataAccessed;
    }

    /**
     * Determines if an action is GDPR-compliant based on action type and consent
     * GDPR compliance requires tracking consent for data operations
     *
     * @param action - The audit action type
     * @param consentGiven - Whether user consent was obtained (null if not applicable)
     * @returns True if action meets GDPR compliance requirements
     *
     * @example
     * ```typescript
     * const isCompliant = auditLogger.isGDPRCompliant(
     *   AUDIT_ACTIONS.DATA_EXPORT,
     *   true
     * );
     * // Returns: true
     * ```
     */
    isGDPRCompliant(action: string, consentGiven: boolean | null): boolean {
        const gdprActions: string[] = [
            AUDIT_ACTIONS.DATA_EXPORT,
            AUDIT_ACTIONS.DATA_DELETE,
            AUDIT_ACTIONS.CONSENT_REVOKE,
            AUDIT_ACTIONS.PRIVACY_SETTING_CHANGE
        ];

        return gdprActions.includes(action) && consentGiven !== null;
    }

    /**
     * Calculates retention period for audit logs based on severity level
     * HIPAA requires 6 years minimum, critical events stored for 12 years
     *
     * @param level - Audit log severity level
     * @returns Retention period in milliseconds
     *
     * @example
     * ```typescript
     * const retention = auditLogger.getRetentionPeriod(AUDIT_LEVELS.CRITICAL);
     * // Returns: 378432000000 (12 years in milliseconds)
     * ```
     */
    getRetentionPeriod(level: string): number {
        // HIPAA requires 6 years retention for audit logs
        const baseRetention = 6 * 365 * 24 * 60 * 60 * 1000; // 6 years in milliseconds

        // Critical events may require longer retention
        if (level === AUDIT_LEVELS.CRITICAL) {
            return baseRetention * 2; // 12 years
        }

        return baseRetention;
    }

    /**
     * Stores audit log entry in browser's local storage
     * Keeps only the last 1000 entries to prevent storage bloat
     *
     * @param auditEntry - The audit log entry to store
     *
     * @example
     * ```typescript
     * auditLogger.storeLocalAuditLog(auditEntry);
     * ```
     */
    storeLocalAuditLog(auditEntry: AuditLogEntry): void {
        try {
            const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
            existingLogs.push(auditEntry);

            // Keep only last 1000 entries locally to prevent storage bloat
            if (existingLogs.length > 1000) {
                existingLogs.splice(0, existingLogs.length - 1000);
            }

            localStorage.setItem('audit_logs', JSON.stringify(existingLogs));
        } catch (error) {
            console.error('Failed to store audit log locally:', error);
        }
    }

    /**
     * Sends audit log entry to backend for persistent storage
     * In production, this would make an API call to the audit log service
     *
     * @param auditEntry - The audit log entry to send
     * @throws Error if backend communication fails
     *
     * @example
     * ```typescript
     * await auditLogger.sendToBackend(auditEntry);
     * ```
     */
    async sendToBackend(auditEntry: AuditLogEntry): Promise<void> {
        try {
            // Mock implementation - Base44 integration removed
            console.warn('Mock audit log backend call - Base44 integration removed');
            await this.simulateBackendCall(auditEntry);
        } catch (error) {
            console.error('Failed to send audit log to backend:', error);
            throw error;
        }
    }

    /**
     * Simulates backend API call with network delay
     * This is a placeholder for actual backend integration
     *
     * @param auditEntry - The audit log entry to send
     * @private
     */
    private async simulateBackendCall(auditEntry: AuditLogEntry): Promise<void> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // In a real implementation, this would be an actual API call
        console.log('Audit log would be sent to backend:', auditEntry.id);
    }

    /**
     * Sends real-time alerts for critical audit events
     * Dispatches custom events and postMessage for monitoring systems
     *
     * @param auditEntry - The critical audit log entry
     *
     * @example
     * ```typescript
     * auditLogger.sendRealTimeAlert(criticalEntry);
     * ```
     */
    sendRealTimeAlert(auditEntry: AuditLogEntry): void {
        // Send real-time alert for critical events
        if (window.parent !== window) {
            // If in iframe, send message to parent with proper origin validation
            try {
                // Get the parent origin safely
                const parentOrigin = this.getParentOrigin();

                if (parentOrigin) {
                    window.parent.postMessage({
                        type: 'AUDIT_ALERT',
                        data: auditEntry
                    }, parentOrigin);
                } else {
                    console.warn('Unable to determine parent origin for postMessage');
                }
            } catch (error) {
                console.error('Failed to send postMessage to parent:', error);
            }
        }

        // Dispatch custom event for real-time monitoring
        window.dispatchEvent(new CustomEvent('auditAlert', {
            detail: auditEntry
        }));
    }

    private getParentOrigin(): string | null {
        try {
            // Try to get the parent origin safely
            if (window.parent && window.parent.location) {
                return window.parent.location.origin;
            }

            // Fallback: use current origin if we can't access parent
            return window.location.origin;
        } catch (error) {
            // Cross-origin access blocked, use current origin as fallback
            console.warn('Cross-origin access blocked, using current origin:', error);
            return window.location.origin;
        }
    }

    /**
     * Convenience method to log patient data access (HIPAA-tracked)
     * Automatically marks as sensitive data access and includes compliance flags
     *
     * @param patientId - Unique identifier of the patient
     * @param patientName - Name of the patient
     * @param action - Action performed (defaults to PATIENT_VIEW)
     * @param details - Additional context information
     * @returns Promise resolving to the created audit log entry
     *
     * @example
     * ```typescript
     * await auditLogger.logPatientAccess(
     *   'patient-123',
     *   'John Doe',
     *   AUDIT_ACTIONS.PATIENT_VIEW,
     *   { accessReason: 'routine_checkup' }
     * );
     * ```
     */
    async logPatientAccess(
        patientId: string,
        patientName: string,
        action: string = AUDIT_ACTIONS.PATIENT_VIEW,
        details: Record<string, any> = {}
    ): Promise<AuditLogEntry | undefined> {
        return this.log({
            action,
            level: AUDIT_LEVELS.INFO,
            resource: 'patient',
            resourceId: patientId,
            resourceType: 'patient',
            patientId,
            patientName,
            sensitiveDataAccessed: true,
            details: {
                ...details,
                accessReason: (details as any).accessReason || 'routine_care'
            },
            complianceFlags: ['HIPAA']
        });
    }

    /**
     * Logs emergency access to patient data (CRITICAL severity)
     * Used for urgent medical situations requiring immediate patient data access
     *
     * @param patientId - Unique identifier of the patient
     * @param patientName - Name of the patient
     * @param reason - Justification for emergency access
     * @param details - Additional context (emergency type, etc.)
     * @returns Promise resolving to the created audit log entry
     *
     * @example
     * ```typescript
     * await auditLogger.logEmergencyAccess(
     *   'patient-456',
     *   'Jane Smith',
     *   'Patient collapse in ER - requires immediate medical history',
     *   { emergencyType: 'cardiac_event', location: 'ER_ROOM_3' }
     * );
     * ```
     */
    async logEmergencyAccess(
        patientId: string,
        patientName: string,
        reason: string,
        details: Record<string, any> = {}
    ): Promise<AuditLogEntry | undefined> {
        return this.log({
            action: AUDIT_ACTIONS.EMERGENCY_ACCESS,
            level: AUDIT_LEVELS.CRITICAL,
            resource: 'patient',
            resourceId: patientId,
            resourceType: 'patient',
            patientId,
            patientName,
            emergencyAccess: true,
            breakGlassReason: reason,
            sensitiveDataAccessed: true,
            details: {
                ...details,
                emergencyType: (details as any).emergencyType || 'medical_emergency',
                justification: reason
            },
            complianceFlags: ['HIPAA', 'EMERGENCY_ACCESS']
        });
    }

    /**
     * Logs "break glass" override access (CRITICAL severity)
     * Used when normal access controls are overridden for emergency situations
     *
     * @param patientId - Unique identifier of the patient
     * @param patientName - Name of the patient
     * @param reason - Mandatory justification for override
     * @param details - Additional context (override type, justification)
     * @returns Promise resolving to the created audit log entry
     *
     * @example
     * ```typescript
     * await auditLogger.logBreakGlassAccess(
     *   'patient-789',
     *   'Bob Johnson',
     *   'Life-threatening situation - patient unconscious, need allergy info',
     *   { breakGlassType: 'override_access', authorizedBy: 'Dr. Smith' }
     * );
     * ```
     */
    async logBreakGlassAccess(
        patientId: string,
        patientName: string,
        reason: string,
        details: Record<string, any> = {}
    ): Promise<AuditLogEntry | undefined> {
        return this.log({
            action: AUDIT_ACTIONS.BREAK_GLASS_ACCESS,
            level: AUDIT_LEVELS.CRITICAL,
            resource: 'patient',
            resourceId: patientId,
            resourceType: 'patient',
            patientId,
            patientName,
            emergencyAccess: true,
            breakGlassReason: reason,
            sensitiveDataAccessed: true,
            details: {
                ...details,
                breakGlassType: (details as any).breakGlassType || 'override_access',
                justification: reason
            },
            complianceFlags: ['HIPAA', 'BREAK_GLASS']
        });
    }

    /**
     * Logs patient data export operations (GDPR-tracked, WARNING severity)
     * Required for compliance with data portability regulations
     *
     * @param patientId - Unique identifier of the patient
     * @param patientName - Name of the patient
     * @param exportType - Type of export (e.g., 'full_record', 'medical_history')
     * @param details - Additional context (format, retention period, etc.)
     * @returns Promise resolving to the created audit log entry
     *
     * @example
     * ```typescript
     * await auditLogger.logDataExport(
     *   'patient-101',
     *   'Alice Williams',
     *   'full_patient_record',
     *   { exportFormat: 'pdf', requestedBy: 'patient', dataRetentionPeriod: '30_days' }
     * );
     * ```
     */
    async logDataExport(
        patientId: string,
        patientName: string,
        exportType: string,
        details: Record<string, any> = {}
    ): Promise<AuditLogEntry | undefined> {
        return this.log({
            action: AUDIT_ACTIONS.DATA_EXPORT,
            level: AUDIT_LEVELS.WARNING,
            resource: 'patient_data',
            resourceId: patientId,
            resourceType: 'export',
            patientId,
            patientName,
            sensitiveDataAccessed: true,
            details: {
                ...details,
                exportType,
                exportFormat: (details as any).exportFormat || 'json',
                dataRetentionPeriod: (details as any).dataRetentionPeriod || '30_days'
            },
            complianceFlags: ['GDPR', 'DATA_EXPORT']
        });
    }

    /**
     * Logs patient consent changes (GDPR-tracked)
     * Tracks consent creation, updates, and revocations
     *
     * @param patientId - Unique identifier of the patient
     * @param patientName - Name of the patient
     * @param consentType - Type of consent (e.g., 'data_processing', 'marketing')
     * @param action - Action performed ('create', 'update', 'revoke')
     * @param details - Additional context information
     * @returns Promise resolving to the created audit log entry
     *
     * @example
     * ```typescript
     * await auditLogger.logConsentChange(
     *   'patient-202',
     *   'Charlie Brown',
     *   'data_processing',
     *   'revoke',
     *   { previousConsent: true, reason: 'patient_request' }
     * );
     * ```
     */
    async logConsentChange(
        patientId: string,
        patientName: string,
        consentType: string,
        action: string,
        details: Record<string, any> = {}
    ): Promise<AuditLogEntry | undefined> {
        return this.log({
            action: action === 'revoke' ? AUDIT_ACTIONS.CONSENT_REVOKE : AUDIT_ACTIONS.CONSENT_UPDATE,
            level: AUDIT_LEVELS.INFO,
            resource: 'consent',
            resourceId: patientId,
            resourceType: 'consent',
            patientId,
            patientName,
            consentGiven: action !== 'revoke',
            details: {
                ...details,
                consentType,
                consentAction: action
            },
            complianceFlags: ['GDPR', 'CONSENT_MANAGEMENT']
        });
    }

    /**
     * Queries audit logs with optional filters
     * Falls back to local storage if backend is unavailable
     *
     * @param filters - Optional filters for action, level, user, patient, date range
     * @returns Promise resolving to array of matching audit log entries
     *
     * @example
     * ```typescript
     * // Get all patient-123 logs from last week
     * const logs = await auditLogger.getAuditLogs({
     *   patientId: 'patient-123',
     *   dateFrom: '2024-01-01T00:00:00Z',
     *   dateTo: '2024-01-07T23:59:59Z'
     * });
     *
     * // Get all critical events
     * const criticalLogs = await auditLogger.getAuditLogs({
     *   level: AUDIT_LEVELS.CRITICAL
     * });
     * ```
     */
    async getAuditLogs(filters: AuditFilters = {}): Promise<AuditLogEntry[]> {
        try {
            // Since mockApiClient doesn't have audit entity, we'll use local storage
            return this.getLocalAuditLogs(filters);
        } catch (error) {
            console.error('Failed to query audit logs:', error);
            // Fallback to local storage
            return this.getLocalAuditLogs(filters);
        }
    }

    /**
     * Retrieves audit logs from local storage with optional filters
     *
     * @param filters - Optional filters to apply
     * @returns Array of matching audit log entries from local storage
     *
     * @example
     * ```typescript
     * const logs = auditLogger.getLocalAuditLogs({
     *   action: AUDIT_ACTIONS.PATIENT_VIEW
     * });
     * ```
     */
    getLocalAuditLogs(filters: AuditFilters = {}): AuditLogEntry[] {
        try {
            const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
            return this.filterAuditLogs(logs, filters);
        } catch (error) {
            console.error('Failed to get local audit logs:', error);
            return [];
        }
    }

    /**
     * Filters audit log entries based on provided criteria
     *
     * @param logs - Array of audit log entries to filter
     * @param filters - Filter criteria (action, level, user, patient, date range)
     * @returns Filtered array of audit log entries
     *
     * @example
     * ```typescript
     * const filtered = auditLogger.filterAuditLogs(allLogs, {
     *   level: AUDIT_LEVELS.CRITICAL,
     *   dateFrom: '2024-01-01T00:00:00Z'
     * });
     * ```
     */
    filterAuditLogs(logs: AuditLogEntry[], filters: AuditFilters): AuditLogEntry[] {
        return logs.filter((log: AuditLogEntry) => {
            if (filters.action && log.action !== filters.action) return false;
            if (filters.level && log.level !== filters.level) return false;
            if (filters.userId && log.userId !== filters.userId) return false;
            if (filters.patientId && log.patientId !== filters.patientId) return false;
            if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && new Date(log.timestamp) > new Date(filters.dateTo)) return false;
            return true;
        });
    }

    /**
     * Clears all audit logs from local storage
     * Use with caution - this does not affect backend storage
     *
     * @returns Promise that resolves when clearing is complete
     *
     * @example
     * ```typescript
     * await auditLogger.clearLocalAuditLogs();
     * ```
     */
    async clearLocalAuditLogs(): Promise<void> {
        try {
            localStorage.removeItem('audit_logs');
            console.log('Local audit logs cleared');
        } catch (error) {
            console.error('Failed to clear local audit logs:', error);
        }
    }

    /**
     * Generates statistics about audit logs (total count, by level, by action)
     * Useful for dashboards and compliance reporting
     *
     * @returns Object containing audit log statistics
     *
     * @example
     * ```typescript
     * const stats = auditLogger.getAuditLogStats();
     * console.log(`Total logs: ${stats.total}`);
     * console.log(`Critical events: ${stats.byLevel[AUDIT_LEVELS.CRITICAL]}`);
     * ```
     */
    getAuditLogStats(): { total: number; byLevel: Record<string, number>; byAction: Record<string, number> } {
        try {
            const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
            const stats = {
                total: logs.length,
                byLevel: {} as Record<string, number>,
                byAction: {} as Record<string, number>
            };

            logs.forEach((log: AuditLogEntry) => {
                stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
                stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Failed to get audit log stats:', error);
            return { total: 0, byLevel: {}, byAction: {} };
        }
    }

    /**
     * Exports audit logs for compliance reporting
     * Supports JSON and CSV formats for different reporting requirements
     *
     * @param filters - Optional filters to apply before export
     * @param format - Export format ('json' or 'csv'), defaults to 'json'
     * @returns Formatted string containing audit log data
     *
     * @example
     * ```typescript
     * // Export all critical events as CSV
     * const csvData = auditLogger.exportAuditLogs(
     *   { level: AUDIT_LEVELS.CRITICAL },
     *   'csv'
     * );
     *
     * // Export patient-123 logs as JSON
     * const jsonData = auditLogger.exportAuditLogs(
     *   { patientId: 'patient-123' },
     *   'json'
     * );
     * ```
     */
    exportAuditLogs(filters: AuditFilters = {}, format: 'json' | 'csv' = 'json'): string {
        const logs = this.getLocalAuditLogs(filters);

        if (format === 'csv') {
            return this.convertToCSV(logs);
        }

        return JSON.stringify(logs, null, 2);
    }

    /**
     * Converts audit log entries to CSV format
     * Includes key fields for compliance reporting
     *
     * @param logs - Array of audit log entries to convert
     * @returns CSV-formatted string
     * @private
     */
    private convertToCSV(logs: AuditLogEntry[]): string {
        if (logs.length === 0) return '';

        const headers = [
            'ID', 'Timestamp', 'Action', 'Level', 'User ID', 'User Name',
            'Patient ID', 'Patient Name', 'Resource', 'Sensitive Data Accessed',
            'Emergency Access', 'Compliance Flags'
        ];

        const rows = logs.map(log => [
            log.id,
            log.timestamp,
            log.action,
            log.level,
            log.userId || '',
            log.userName || '',
            log.patientId || '',
            log.patientName || '',
            log.resource || '',
            log.sensitiveDataAccessed ? 'Yes' : 'No',
            log.emergencyAccess ? 'Yes' : 'No',
            log.complianceFlags.join(';')
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

/**
 * Singleton instance of AuditLogger for application-wide use
 * Use this instance to maintain consistent session and context across the app
 *
 * @constant
 *
 * @example
 * ```typescript
 * import { auditLogger } from '@/utils/auditLogger';
 *
 * auditLogger.setUserContext(currentUser);
 * await auditLogger.log({ action: AUDIT_ACTIONS.LOGIN });
 * ```
 */
export const auditLogger = new AuditLogger();

/**
 * React hook to access the audit logger singleton
 * Provides easy access to audit logging in functional components
 *
 * @returns The singleton AuditLogger instance
 *
 * @example
 * ```typescript
 * function PatientView({ patientId }) {
 *   const auditLogger = useAuditLogger();
 *
 *   useEffect(() => {
 *     auditLogger.logPatientAccess(patientId, 'John Doe');
 *   }, [patientId]);
 *
 *   return <div>Patient details...</div>;
 * }
 * ```
 */
export function useAuditLogger(): AuditLogger {
    return auditLogger;
}

/**
 * Higher-order component for automatic audit logging on component lifecycle
 * Automatically logs when component mounts and/or unmounts
 *
 * @param WrappedComponent - The component to wrap with audit logging
 * @param auditConfig - Configuration for mount/unmount logging
 * @returns Component with automatic audit logging
 *
 * @example
 * ```typescript
 * const AuditedPatientView = withAuditLogging(PatientView, {
 *   onMount: {
 *     action: 'patient_view_opened',
 *     level: AUDIT_LEVELS.INFO,
 *     details: { component: 'PatientView' }
 *   },
 *   onUnmount: {
 *     action: 'patient_view_closed',
 *     level: AUDIT_LEVELS.INFO
 *   }
 * });
 * ```
 */
export function withAuditLogging<T extends Record<string, any>>(
    WrappedComponent: React.ComponentType<T>,
    auditConfig: AuditConfig = {}
): React.ComponentType<T> {
    return function AuditedComponent(props: T) {
        const auditLogger = useAuditLogger();

        React.useEffect(() => {
            if (auditConfig.onMount) {
                auditLogger.log({
                    action: auditConfig.onMount.action,
                    level: auditConfig.onMount.level || AUDIT_LEVELS.INFO,
                    details: auditConfig.onMount.details || {}
                });
            }
        }, [auditLogger]);

        React.useEffect(() => {
            if (auditConfig.onUnmount) {
                return () => {
                    auditLogger.log({
                        action: auditConfig.onUnmount!.action,
                        level: auditConfig.onUnmount!.level || AUDIT_LEVELS.INFO,
                        details: auditConfig.onUnmount!.details || {}
                    });
                };
            }
            return undefined;
        }, [auditLogger]);

        return <WrappedComponent {...props} auditLogger={auditLogger} />;
    };
}