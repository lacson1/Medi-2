/**
 * Comprehensive tests for HIPAA-compliant Audit Logger
 * Tests all critical audit logging functionality for compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    AuditLogger,
    AUDIT_LEVELS,
    AUDIT_ACTIONS,
    type UserContext,
    type OrganizationContext,
    type LogParams,
    type AuditLogEntry,
} from './auditLogger';

describe('AuditLogger - HIPAA Compliance Tests', () => {
    let auditLogger: AuditLogger;

    beforeEach(() => {
        auditLogger = new AuditLogger();
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Session Management', () => {
        it('should generate unique session ID on initialization', () => {
            const logger1 = new AuditLogger();
            const logger2 = new AuditLogger();

            expect(logger1['sessionId']).toBeDefined();
            expect(logger2['sessionId']).toBeDefined();
            expect(logger1['sessionId']).not.toBe(logger2['sessionId']);
        });

        it('should format session ID correctly', () => {
            const sessionId = auditLogger['sessionId'];
            expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
        });
    });

    describe('User Context Management', () => {
        const mockUser = {
            id: 'user-123',
            name: 'Dr. John Doe',
            email: 'john.doe@hospital.com',
            role: 'doctor',
            organizationId: 'org-456',
            organizationName: 'General Hospital',
        };

        it('should set user context correctly', () => {
            auditLogger.setUserContext(mockUser);

            const userContext = auditLogger['userContext'];
            expect(userContext).toEqual({
                userId: 'user-123',
                userName: 'Dr. John Doe',
                userEmail: 'john.doe@hospital.com',
                userRole: 'doctor',
                organizationId: 'org-456',
                organizationName: 'General Hospital',
            });
        });

        it('should handle user context updates', () => {
            auditLogger.setUserContext(mockUser);

            const updatedUser = { ...mockUser, name: 'Dr. Jane Smith' };
            auditLogger.setUserContext(updatedUser);

            expect(auditLogger['userContext']?.userName).toBe('Dr. Jane Smith');
        });

        it('should start with null user context', () => {
            expect(auditLogger['userContext']).toBeNull();
        });
    });

    describe('Organization Context Management', () => {
        const mockOrg = {
            id: 'org-789',
            name: 'City Medical Center',
            type: 'hospital',
        };

        it('should set organization context correctly', () => {
            auditLogger.setOrganizationContext(mockOrg);

            const orgContext = auditLogger['organizationContext'];
            expect(orgContext).toEqual({
                organizationId: 'org-789',
                organizationName: 'City Medical Center',
                organizationType: 'hospital',
            });
        });

        it('should handle organization context updates', () => {
            auditLogger.setOrganizationContext(mockOrg);

            const updatedOrg = { ...mockOrg, type: 'clinic' };
            auditLogger.setOrganizationContext(updatedOrg);

            expect(auditLogger['organizationContext']?.organizationType).toBe('clinic');
        });
    });

    describe('Audit Log Entry Creation', () => {
        beforeEach(() => {
            const mockUser = {
                id: 'user-123',
                name: 'Dr. Test',
                email: 'test@hospital.com',
                role: 'doctor',
                organizationId: 'org-123',
                organizationName: 'Test Hospital',
            };
            auditLogger.setUserContext(mockUser);
        });

        it('should create basic audit log entry with required fields', async () => {
            const params: LogParams = {
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            };

            const entry = await auditLogger.log(params);

            expect(entry).toBeDefined();
            expect(entry?.id).toBeDefined();
            expect(entry?.sessionId).toBe(auditLogger['sessionId']);
            expect(entry?.timestamp).toBeDefined();
            expect(entry?.action).toBe(AUDIT_ACTIONS.PATIENT_VIEW);
            expect(entry?.level).toBe(AUDIT_LEVELS.INFO); // Default level
        });

        it('should include user context in audit entry', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });

            expect(entry?.userId).toBe('user-123');
            expect(entry?.userName).toBe('Dr. Test');
            expect(entry?.userEmail).toBe('test@hospital.com');
            expect(entry?.userRole).toBe('doctor');
        });

        it('should include organization context in audit entry', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });

            expect(entry?.organizationId).toBe('org-123');
            expect(entry?.organizationName).toBe('Test Hospital');
        });

        it('should handle custom log level', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.LOGIN_FAILED,
                level: AUDIT_LEVELS.WARNING,
            });

            expect(entry?.level).toBe(AUDIT_LEVELS.WARNING);
        });

        it('should include resource information', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_UPDATE,
                resource: 'patient',
                resourceId: 'patient-456',
                resourceType: 'Patient',
            });

            expect(entry?.resource).toBe('patient');
            expect(entry?.resourceId).toBe('patient-456');
            expect(entry?.resourceType).toBe('Patient');
        });

        it('should include patient information for patient-related actions', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
                patientId: 'patient-789',
                patientName: 'Jane Doe',
            });

            expect(entry?.patientId).toBe('patient-789');
            expect(entry?.patientName).toBe('Jane Doe');
        });

        it('should mark sensitive data access', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.MEDICAL_RECORD_VIEW,
                sensitiveDataAccessed: true,
            });

            expect(entry?.sensitiveDataAccessed).toBe(true);
        });

        it('should handle data masking flag', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
                dataMasked: true,
            });

            expect(entry?.dataMasked).toBe(true);
        });

        it('should capture emergency access events', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.BREAK_GLASS_ACCESS,
                emergencyAccess: true,
                breakGlassReason: 'Patient emergency - immediate care required',
            });

            expect(entry?.emergencyAccess).toBe(true);
            expect(entry?.breakGlassReason).toBe('Patient emergency - immediate care required');
        });

        it('should include consent information', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.DATA_EXPORT,
                consentGiven: true,
            });

            expect(entry?.consentGiven).toBe(true);
        });

        it('should handle compliance flags', async () => {
            const flags = ['HIPAA', 'GDPR', 'CCPA'];
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.DATA_EXPORT,
                complianceFlags: flags,
            });

            expect(entry?.complianceFlags).toEqual(flags);
        });

        it('should include custom details', async () => {
            const details = {
                changeType: 'email_update',
                oldValue: 'old@email.com',
                newValue: 'new@email.com',
            };

            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_UPDATE,
                details,
            });

            expect(entry?.details.changeType).toBe('email_update');
            expect(entry?.details.oldValue).toBe('old@email.com');
            expect(entry?.details.newValue).toBe('new@email.com');
        });
    });

    describe('HIPAA Compliance', () => {
        it('should mark HIPAA-compliant for patient data access', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
                sensitiveDataAccessed: true,
            });

            expect(entry?.complianceMetadata.hipaaCompliant).toBe(true);
        });

        it('should mark HIPAA-compliant for medical record access', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.MEDICAL_RECORD_VIEW,
                sensitiveDataAccessed: true,
            });

            expect(entry?.complianceMetadata.hipaaCompliant).toBe(true);
        });

        it('should mark audit logs as immutable', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });

            expect(entry?.complianceMetadata.immutable).toBe(true);
        });

        it('should set retention period based on log level', async () => {
            const criticalEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.BREAK_GLASS_ACCESS,
                level: AUDIT_LEVELS.CRITICAL,
            });

            const infoEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
                level: AUDIT_LEVELS.INFO,
            });

            expect(criticalEntry?.complianceMetadata.retentionPeriod).toBeDefined();
            expect(infoEntry?.complianceMetadata.retentionPeriod).toBeDefined();
        });
    });

    describe('GDPR Compliance', () => {
        it('should mark GDPR-compliant when consent is given', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.DATA_EXPORT,
                consentGiven: true,
            });

            expect(entry?.complianceMetadata.gdprCompliant).toBe(true);
        });

        it('should handle consent revocation', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.CONSENT_REVOKE,
                consentGiven: false,
            });

            expect(entry?.action).toBe(AUDIT_ACTIONS.CONSENT_REVOKE);
        });
    });

    describe('Audit Levels', () => {
        it('should support INFO level', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
                level: AUDIT_LEVELS.INFO,
            });

            expect(entry?.level).toBe('info');
        });

        it('should support WARNING level', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.LOGIN_FAILED,
                level: AUDIT_LEVELS.WARNING,
            });

            expect(entry?.level).toBe('warning');
        });

        it('should support ERROR level', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_DELETE,
                level: AUDIT_LEVELS.ERROR,
            });

            expect(entry?.level).toBe('error');
        });

        it('should support CRITICAL level', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.BREAK_GLASS_ACCESS,
                level: AUDIT_LEVELS.CRITICAL,
            });

            expect(entry?.level).toBe('critical');
        });
    });

    describe('Audit Actions', () => {
        it('should log authentication events', async () => {
            const loginEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.LOGIN,
            });
            expect(loginEntry?.action).toBe('login');

            const logoutEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.LOGOUT,
            });
            expect(logoutEntry?.action).toBe('logout');

            const failedEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.LOGIN_FAILED,
                level: AUDIT_LEVELS.WARNING,
            });
            expect(failedEntry?.action).toBe('login_failed');
        });

        it('should log patient data operations', async () => {
            const actions = [
                AUDIT_ACTIONS.PATIENT_VIEW,
                AUDIT_ACTIONS.PATIENT_CREATE,
                AUDIT_ACTIONS.PATIENT_UPDATE,
                AUDIT_ACTIONS.PATIENT_DELETE,
            ];

            for (const action of actions) {
                const entry = await auditLogger.log({ action });
                expect(entry?.action).toBe(action);
            }
        });

        it('should log medical record operations', async () => {
            const actions = [
                AUDIT_ACTIONS.MEDICAL_RECORD_VIEW,
                AUDIT_ACTIONS.MEDICAL_RECORD_CREATE,
                AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE,
                AUDIT_ACTIONS.MEDICAL_RECORD_DELETE,
            ];

            for (const action of actions) {
                const entry = await auditLogger.log({
                    action,
                    sensitiveDataAccessed: true,
                });
                expect(entry?.action).toBe(action);
            }
        });

        it('should log prescription operations', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
                patientId: 'patient-123',
                details: {
                    medication: 'Amoxicillin',
                    dosage: '500mg',
                },
            });

            expect(entry?.action).toBe('prescription_create');
        });

        it('should log lab result operations', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.LAB_RESULT_VIEW,
                patientId: 'patient-123',
                sensitiveDataAccessed: true,
            });

            expect(entry?.action).toBe('lab_result_view');
        });

        it('should log consent management', async () => {
            const createEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.CONSENT_CREATE,
                consentGiven: true,
            });
            expect(createEntry?.action).toBe('consent_create');

            const revokeEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.CONSENT_REVOKE,
                consentGiven: false,
            });
            expect(revokeEntry?.action).toBe('consent_revoke');
        });

        it('should log emergency access events', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.BREAK_GLASS_ACCESS,
                level: AUDIT_LEVELS.CRITICAL,
                emergencyAccess: true,
                breakGlassReason: 'Patient cardiac arrest',
            });

            expect(entry?.action).toBe('break_glass_access');
            expect(entry?.level).toBe('critical');
        });

        it('should log data export/import operations', async () => {
            const exportEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.DATA_EXPORT,
                consentGiven: true,
                details: { format: 'PDF', records: 25 },
            });
            expect(exportEntry?.action).toBe('data_export');

            const importEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.DATA_IMPORT,
                details: { format: 'CSV', records: 100 },
            });
            expect(importEntry?.action).toBe('data_import');
        });

        it('should log system configuration changes', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.SYSTEM_CONFIG_CHANGE,
                level: AUDIT_LEVELS.WARNING,
                details: {
                    setting: 'max_session_duration',
                    oldValue: '30',
                    newValue: '60',
                },
            });

            expect(entry?.action).toBe('system_config_change');
        });

        it('should log privacy events', async () => {
            const maskingEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.DATA_MASKING_APPLIED,
                dataMasked: true,
            });
            expect(maskingEntry?.action).toBe('data_masking_applied');

            const sensitiveEntry = await auditLogger.log({
                action: AUDIT_ACTIONS.SENSITIVE_DATA_ACCESS,
                sensitiveDataAccessed: true,
            });
            expect(sensitiveEntry?.action).toBe('sensitive_data_access');
        });
    });

    describe('Audit ID Generation', () => {
        it('should generate unique audit IDs', async () => {
            const entry1 = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });
            const entry2 = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });

            expect(entry1?.id).toBeDefined();
            expect(entry2?.id).toBeDefined();
            expect(entry1?.id).not.toBe(entry2?.id);
        });

        it('should format audit ID correctly', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });

            expect(entry?.id).toMatch(/^audit_\d+_[a-z0-9]+$/);
        });
    });

    describe('Timestamp Format', () => {
        it('should use ISO 8601 format for timestamps', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });

            expect(entry?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('should record accurate timestamps', async () => {
            const before = new Date().getTime();
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });
            const after = new Date().getTime();

            const entryTime = new Date(entry!.timestamp).getTime();
            expect(entryTime).toBeGreaterThanOrEqual(before);
            expect(entryTime).toBeLessThanOrEqual(after);
        });
    });

    describe('Error Handling', () => {
        it('should handle logging without user context gracefully', async () => {
            const entry = await auditLogger.log({
                action: AUDIT_ACTIONS.PATIENT_VIEW,
            });

            expect(entry).toBeDefined();
            expect(entry?.userId).toBeUndefined();
        });

        it('should handle minimal log parameters', async () => {
            const entry = await auditLogger.log({
                action: 'minimal_test',
            });

            expect(entry).toBeDefined();
            expect(entry?.action).toBe('minimal_test');
            expect(entry?.level).toBe(AUDIT_LEVELS.INFO);
        });
    });

    describe('Multiple Simultaneous Logs', () => {
        it('should handle concurrent logging', async () => {
            const promises = Array.from({ length: 10 }, (_, i) =>
                auditLogger.log({
                    action: AUDIT_ACTIONS.PATIENT_VIEW,
                    patientId: `patient-${i}`,
                })
            );

            const entries = await Promise.all(promises);

            expect(entries).toHaveLength(10);
            entries.forEach((entry, index) => {
                expect(entry?.patientId).toBe(`patient-${index}`);
            });

            // All entries should have unique IDs
            const ids = entries.map((e) => e?.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(10);
        });
    });
});
