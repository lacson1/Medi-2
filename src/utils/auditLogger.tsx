// Comprehensive Audit Logging System for HIPAA/GDPR Compliance
import React from 'react';
import { mockApiClient } from "@/api/mockApiClient";

// Type definitions
export interface UserContext {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    organizationId: string;
    organizationName: string;
}

export interface OrganizationContext {
    organizationId: string;
    organizationName: string;
    organizationType: string;
}

export interface AuditLogEntry {
    id: string;
    sessionId: string;
    timestamp: string;
    action: string;
    level: string;
    resource: string | null;
    resourceId: string | null;
    resourceType: string | null;
    userId?: string | undefined;
    userName?: string | undefined;
    userEmail?: string | undefined;
    userRole?: string | undefined;
    organizationId?: string | undefined;
    organizationName?: string | undefined;
    patientId?: string | null;
    patientName?: string | null;
    ipAddress: string;
    userAgent: string;
    sensitiveDataAccessed: boolean;
    dataMasked: boolean;
    emergencyAccess: boolean;
    breakGlassReason?: string | null;
    consentGiven?: boolean | null;
    dataRetentionPeriod?: string | null;
    complianceFlags: string[];
    details: Record<string, any>;
    complianceMetadata: {
        hipaaCompliant: boolean;
        gdprCompliant: boolean;
        retentionPeriod: number;
        immutable: boolean;
    };
    loggingError?: string;
    fallbackStorage?: boolean;
}

export interface LogParams {
    action: string;
    level?: string;
    resource?: string | null;
    resourceId?: string | null;
    resourceType?: string | null;
    details?: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
    patientId?: string | null;
    patientName?: string | null;
    sensitiveDataAccessed?: boolean;
    dataMasked?: boolean;
    emergencyAccess?: boolean;
    breakGlassReason?: string | null;
    consentGiven?: boolean | null;
    dataRetentionPeriod?: string | null;
    complianceFlags?: string[];
}

export interface AuditFilters {
    action?: string;
    level?: string;
    userId?: string;
    patientId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface AuditConfig {
    onMount?: {
        action: string;
        level?: string;
        details?: Record<string, any>;
    };
    onUnmount?: {
        action: string;
        level?: string;
        details?: Record<string, any>;
    };
}

// Audit log levels
export const AUDIT_LEVELS = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
} as const;

// Audit action types
export const AUDIT_ACTIONS = {
    // Authentication & Authorization
    LOGIN: 'login',
    LOGOUT: 'logout',
    LOGIN_FAILED: 'login_failed',
    PASSWORD_CHANGE: 'password_change',
    ROLE_CHANGE: 'role_change',
    PERMISSION_CHANGE: 'permission_change',

    // Patient Data Access
    PATIENT_VIEW: 'patient_view',
    PATIENT_CREATE: 'patient_create',
    PATIENT_UPDATE: 'patient_update',
    PATIENT_DELETE: 'patient_delete',
    PATIENT_SEARCH: 'patient_search',

    // Medical Records
    MEDICAL_RECORD_VIEW: 'medical_record_view',
    MEDICAL_RECORD_CREATE: 'medical_record_create',
    MEDICAL_RECORD_UPDATE: 'medical_record_update',
    MEDICAL_RECORD_DELETE: 'medical_record_delete',

    // Prescriptions
    PRESCRIPTION_VIEW: 'prescription_view',
    PRESCRIPTION_CREATE: 'prescription_create',
    PRESCRIPTION_UPDATE: 'prescription_update',
    PRESCRIPTION_DELETE: 'prescription_delete',

    // Lab Results
    LAB_RESULT_VIEW: 'lab_result_view',
    LAB_RESULT_CREATE: 'lab_result_create',
    LAB_RESULT_UPDATE: 'lab_result_update',

    // Appointments
    APPOINTMENT_VIEW: 'appointment_view',
    APPOINTMENT_CREATE: 'appointment_create',
    APPOINTMENT_UPDATE: 'appointment_update',
    APPOINTMENT_DELETE: 'appointment_delete',

    // Consent Management
    CONSENT_VIEW: 'consent_view',
    CONSENT_CREATE: 'consent_create',
    CONSENT_UPDATE: 'consent_update',
    CONSENT_REVOKE: 'consent_revoke',

    // Emergency Access
    BREAK_GLASS_ACCESS: 'break_glass_access',
    EMERGENCY_ACCESS: 'emergency_access',

    // Data Export/Import
    DATA_EXPORT: 'data_export',
    DATA_IMPORT: 'data_import',
    DATA_DELETE: 'data_delete',

    // System Events
    SYSTEM_CONFIG_CHANGE: 'system_config_change',
    USER_CREATE: 'user_create',
    USER_UPDATE: 'user_update',
    USER_DELETE: 'user_delete',

    // Privacy Events
    DATA_MASKING_APPLIED: 'data_masking_applied',
    SENSITIVE_DATA_ACCESS: 'sensitive_data_access',
    PRIVACY_SETTING_CHANGE: 'privacy_setting_change'
} as const;

// Audit logger class
export class AuditLogger {
    private sessionId: string;
    private userContext: UserContext | null;
    private organizationContext: OrganizationContext | null;

    constructor() {
        this.sessionId = this.generateSessionId();
        this.userContext = null;
        this.organizationContext = null;
    }

    generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

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

    setOrganizationContext(organization: any): void {
        this.organizationContext = {
            organizationId: organization.id,
            organizationName: organization.name,
            organizationType: organization.type
        };
    }

    // Core logging method
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

    generateAuditId(): string {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getClientIP(): string {
        // In a real implementation, this would be provided by the backend
        return '127.0.0.1'; // Placeholder
    }

    getBrowserInfo(): Record<string, any> {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    getDeviceInfo(): Record<string, any> {
        return {
            screenWidth: screen.width,
            screenHeight: screen.height,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    getLocationInfo(): Record<string, string> {
        // In a real implementation, this would be determined by IP geolocation
        return {
            country: 'US',
            region: 'Unknown',
            city: 'Unknown'
        };
    }

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

    isGDPRCompliant(action: string, consentGiven: boolean | null): boolean {
        const gdprActions: string[] = [
            AUDIT_ACTIONS.DATA_EXPORT,
            AUDIT_ACTIONS.DATA_DELETE,
            AUDIT_ACTIONS.CONSENT_REVOKE,
            AUDIT_ACTIONS.PRIVACY_SETTING_CHANGE
        ];

        return gdprActions.includes(action) && consentGiven !== null;
    }

    getRetentionPeriod(level: string): number {
        // HIPAA requires 6 years retention for audit logs
        const baseRetention = 6 * 365 * 24 * 60 * 60 * 1000; // 6 years in milliseconds

        // Critical events may require longer retention
        if (level === AUDIT_LEVELS.CRITICAL) {
            return baseRetention * 2; // 12 years
        }

        return baseRetention;
    }

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

    private async simulateBackendCall(auditEntry: AuditLogEntry): Promise<void> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // In a real implementation, this would be an actual API call
        console.log('Audit log would be sent to backend:', auditEntry.id);
    }

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

    // Convenience methods for common audit events
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

    // Query methods for audit logs
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

    getLocalAuditLogs(filters: AuditFilters = {}): AuditLogEntry[] {
        try {
            const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
            return this.filterAuditLogs(logs, filters);
        } catch (error) {
            console.error('Failed to get local audit logs:', error);
            return [];
        }
    }

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

    // Additional utility methods
    async clearLocalAuditLogs(): Promise<void> {
        try {
            localStorage.removeItem('audit_logs');
            console.log('Local audit logs cleared');
        } catch (error) {
            console.error('Failed to clear local audit logs:', error);
        }
    }

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

    // Method to export audit logs for compliance reporting
    exportAuditLogs(filters: AuditFilters = {}, format: 'json' | 'csv' = 'json'): string {
        const logs = this.getLocalAuditLogs(filters);

        if (format === 'csv') {
            return this.convertToCSV(logs);
        }

        return JSON.stringify(logs, null, 2);
    }

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

// Create singleton instance
export const auditLogger = new AuditLogger();

// React hook for audit logging
export function useAuditLogger(): AuditLogger {
    return auditLogger;
}

// Higher-order component for automatic audit logging
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