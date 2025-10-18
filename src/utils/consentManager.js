// Comprehensive Patient Consent & Privacy Management System
import { mockApiClient } from "@/api/mockApiClient";
import { auditLogger, AUDIT_ACTIONS } from './auditLogger.tsx';
import { notificationScheduler, NOTIFICATION_TYPES } from './notificationSystem';

// Consent types
export const CONSENT_TYPES = {
    TREATMENT: 'treatment',
    SURGERY: 'surgery',
    ANESTHESIA: 'anesthesia',
    PROCEDURE: 'procedure',
    RESEARCH: 'research',
    PRIVACY: 'privacy',
    HIPAA: 'hipaa',
    DATA_SHARING: 'data_sharing',
    TELEMEDICINE: 'telemedicine',
    PHARMACY: 'pharmacy',
    LAB_TESTING: 'lab_testing',
    EMERGENCY_CONTACT: 'emergency_contact',
    FAMILY_COMMUNICATION: 'family_communication',
    MARKETING: 'marketing',
    DATA_EXPORT: 'data_export',
    DATA_DELETION: 'data_deletion'
};

// Consent statuses
export const CONSENT_STATUSES = {
    PENDING: 'pending',
    OBTAINED: 'obtained',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
    WITHDRAWN: 'withdrawn',
    CONDITIONAL: 'conditional'
};

// Privacy levels
export const PRIVACY_LEVELS = {
    PUBLIC: 'public',
    INTERNAL: 'internal',
    CONFIDENTIAL: 'confidential',
    RESTRICTED: 'restricted',
    TOP_SECRET: 'top_secret'
};

// Data access levels
export const DATA_ACCESS_LEVELS = {
    NONE: 'none',
    VIEW: 'view',
    LIMITED: 'limited',
    FULL: 'full',
    EMERGENCY: 'emergency'
};

// Consent management class
export class ConsentManager {
    constructor() {
        this.consentCache = new Map();
        this.privacySettings = new Map();
        this.emergencyAccessLog = new Map();
        this.breakGlassAccessLog = new Map();
    }

    // Create new consent
    async createConsent({
        patientId,
        patientName,
        consentType,
        consentTitle,
        consentDetails,
        obtainedBy,
        witnessName,
        risksExplained = false,
        expiryDate = null,
        conditions = [],
        metadata = {}
    }) {
        const consent = {
            id: this.generateConsentId(),
            patientId,
            patientName,
            consentType,
            consentTitle,
            consentDetails,
            obtainedBy,
            witnessName,
            risksExplained,
            expiryDate,
            conditions,
            status: CONSENT_STATUSES.OBTAINED,
            obtainedAt: new Date(),
            metadata,
            version: 1,
            isActive: true
        };

        try {
            // Store consent
            await mockApiClient.consents.create(consent);
            this.consentCache.set(consent.id, consent);

            // Log audit event
            await auditLogger.logConsentChange(
                patientId,
                patientName,
                consentType,
                'create', {
                    consentId: consent.id,
                    obtainedBy,
                    witnessName,
                    risksExplained,
                    expiryDate
                }
            );

            // Schedule expiry notification if applicable
            if (expiryDate) {
                await this.scheduleConsentExpiryNotification(consent);
            }

            return consent;
        } catch (error) {
            console.error('Failed to create consent:', error);
            throw error;
        }
    }

    // Update consent
    async updateConsent(consentId, updates) {
        const consent = await this.getConsent(consentId);
        if (!consent) {
            throw new Error('Consent not found');
        }

        const updatedConsent = {
            ...consent,
            ...updates,
            version: consent.version + 1,
            updatedAt: new Date()
        };

        try {
            await mockApiClient.consents.update(consentId, updatedConsent);
            this.consentCache.set(consentId, updatedConsent);

            // Log audit event
            await auditLogger.logConsentChange(
                consent.patientId,
                consent.patientName,
                consent.consentType,
                'update', {
                    consentId,
                    updates,
                    previousVersion: consent.version
                }
            );

            return updatedConsent;
        } catch (error) {
            console.error('Failed to update consent:', error);
            throw error;
        }
    }

    // Revoke consent
    async revokeConsent(consentId, reason, revokedBy) {
        const consent = await this.getConsent(consentId);
        if (!consent) {
            throw new Error('Consent not found');
        }

        const updatedConsent = {
            ...consent,
            status: CONSENT_STATUSES.REVOKED,
            revokedAt: new Date(),
            revokedBy,
            revocationReason: reason,
            version: consent.version + 1,
            isActive: false
        };

        try {
            await mockApiClient.consents.update(consentId, updatedConsent);
            this.consentCache.set(consentId, updatedConsent);

            // Log audit event
            await auditLogger.logConsentChange(
                consent.patientId,
                consent.patientName,
                consent.consentType,
                'revoke', {
                    consentId,
                    reason,
                    revokedBy
                }
            );

            // Send notification to relevant staff
            await this.notifyConsentRevocation(consent, reason, revokedBy);

            return updatedConsent;
        } catch (error) {
            console.error('Failed to revoke consent:', error);
            throw error;
        }
    }

    // Get consent by ID
    async getConsent(consentId) {
        if (this.consentCache.has(consentId)) {
            return this.consentCache.get(consentId);
        }

        try {
            const consent = await mockApiClient.consents.get(consentId);
            this.consentCache.set(consentId, consent);
            return consent;
        } catch (error) {
            console.error('Failed to get consent:', error);
            return null;
        }
    }

    // Get patient consents
    async getPatientConsents(patientId, includeRevoked = false) {
        try {
            const consents = await mockApiClient.consents.getByPatient(patientId, { includeRevoked });
            return consents.filter(consent => includeRevoked || consent.isActive);
        } catch (error) {
            console.error('Failed to get patient consents:', error);
            return [];
        }
    }

    // Check if patient has given consent for specific action
    async hasConsent(patientId, consentType, specificAction = null) {
        const consents = await this.getPatientConsents(patientId);

        const relevantConsents = consents.filter(consent =>
            consent.consentType === consentType &&
            consent.status === CONSENT_STATUSES.OBTAINED &&
            consent.isActive
        );

        if (relevantConsents.length === 0) {
            return false;
        }

        // Check if consent has expired
        const validConsents = relevantConsents.filter(consent => {
            if (!consent.expiryDate) return true;
            return new Date(consent.expiryDate) > new Date();
        });

        if (validConsents.length === 0) {
            return false;
        }

        // Check specific action conditions if provided
        if (specificAction) {
            return validConsents.some(consent =>
                !consent.conditions ||
                consent.conditions.includes(specificAction) ||
                consent.conditions.length === 0
            );
        }

        return true;
    }

    // Set patient privacy preferences
    async setPrivacyPreferences({
        patientId,
        patientName,
        dataSharingPreferences = {},
        accessControlSettings = {},
        notificationPreferences = {},
        emergencyContactSettings = {},
        dataRetentionSettings = {},
        metadata = {}
    }) {
        const privacySettings = {
            id: this.generatePrivacySettingsId(),
            patientId,
            patientName,
            dataSharingPreferences,
            accessControlSettings,
            notificationPreferences,
            emergencyContactSettings,
            dataRetentionSettings,
            metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
        };

        try {
            await mockApiClient.privacy.create(privacySettings);
            this.privacySettings.set(patientId, privacySettings);

            // Log audit event
            await auditLogger.log({
                action: AUDIT_ACTIONS.PRIVACY_SETTING_CHANGE,
                level: 'info',
                resource: 'privacy_settings',
                resourceId: privacySettings.id,
                resourceType: 'privacy',
                patientId,
                patientName,
                details: {
                    dataSharingPreferences,
                    accessControlSettings,
                    notificationPreferences
                }
            });

            return privacySettings;
        } catch (error) {
            console.error('Failed to set privacy preferences:', error);
            throw error;
        }
    }

    // Get patient privacy preferences
    async getPrivacyPreferences(patientId) {
        if (this.privacySettings.has(patientId)) {
            return this.privacySettings.get(patientId);
        }

        try {
            const preferences = await mockApiClient.privacy.getByPatient(patientId);
            this.privacySettings.set(patientId, preferences);
            return preferences;
        } catch (error) {
            console.error('Failed to get privacy preferences:', error);
            return null;
        }
    }

    // Check data access permissions
    async checkDataAccess(userId, userRole, patientId, dataType, accessAction = 'view') {
        const privacyPrefs = await this.getPrivacyPreferences(patientId);
        if (!privacyPrefs) {
            // Default to restrictive if no preferences set
            return this.getDefaultAccessLevel(userRole, dataType);
        }

        const accessControlSettings = privacyPrefs.accessControlSettings;

        // Check role-based access
        const roleAccess = accessControlSettings[userRole] || {};
        const dataAccess = roleAccess[dataType] || 'none';

        // Check if user is explicitly denied access
        if (dataAccess === 'none') {
            return false;
        }

        // Check if user has emergency access rights
        if (dataAccess === 'emergency') {
            return await this.checkEmergencyAccess(userId, patientId, dataType);
        }

        return dataAccess;
    }

    // Emergency access (break-the-glass)
    async requestEmergencyAccess({
        userId,
        userName,
        userRole,
        patientId,
        patientName,
        reason,
        dataType,
        urgency = 'high',
        ipAddress = null
    }) {
        const emergencyAccess = {
            id: this.generateEmergencyAccessId(),
            userId,
            userName,
            userRole,
            patientId,
            patientName,
            reason,
            dataType,
            urgency,
            ipAddress,
            requestedAt: new Date(),
            status: 'pending',
            approvedAt: null,
            approvedBy: null,
            expiresAt: null
        };

        try {
            // Store emergency access request
            await mockApiClient.emergencyAccess.create(emergencyAccess);
            this.emergencyAccessLog.set(emergencyAccess.id, emergencyAccess);

            // Log audit event
            await auditLogger.logEmergencyAccess(
                patientId,
                patientName,
                reason, {
                    emergencyAccessId: emergencyAccess.id,
                    userId,
                    userRole,
                    dataType,
                    urgency
                }
            );

            // Send notification to administrators
            await notificationScheduler.scheduleNotification({
                type: NOTIFICATION_TYPES.BREAK_GLASS_ACCESS,
                priority: 'critical',
                channels: ['email', 'sms', 'in_app'],
                recipients: ['admin@organization.com', 'security@organization.com'],
                data: {
                    patient_name: patientName,
                    user_name: userName,
                    user_role: userRole,
                    reason,
                    urgency,
                    timestamp: new Date().toISOString(),
                    ip_address: ipAddress
                },
                patientId,
                patientName
            });

            return emergencyAccess;
        } catch (error) {
            console.error('Failed to request emergency access:', error);
            throw error;
        }
    }

    // Approve emergency access
    async approveEmergencyAccess(emergencyAccessId, approvedBy, expiresInHours = 24) {
        const emergencyAccess = this.emergencyAccessLog.get(emergencyAccessId);
        if (!emergencyAccess) {
            throw new Error('Emergency access request not found');
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);

        const updatedAccess = {
            ...emergencyAccess,
            status: 'approved',
            approvedAt: new Date(),
            approvedBy,
            expiresAt
        };

        try {
            await mockApiClient.emergencyAccess.update(emergencyAccessId, updatedAccess);
            this.emergencyAccessLog.set(emergencyAccessId, updatedAccess);

            // Log audit event
            await auditLogger.log({
                action: AUDIT_ACTIONS.EMERGENCY_ACCESS,
                level: 'critical',
                resource: 'emergency_access',
                resourceId: emergencyAccessId,
                resourceType: 'emergency_access',
                patientId: emergencyAccess.patientId,
                patientName: emergencyAccess.patientName,
                details: {
                    approvedBy,
                    expiresAt,
                    expiresInHours
                }
            });

            return updatedAccess;
        } catch (error) {
            console.error('Failed to approve emergency access:', error);
            throw error;
        }
    }

    // Check if emergency access is valid
    async checkEmergencyAccess(userId, patientId, dataType) {
        const emergencyAccesses = Array.from(this.emergencyAccessLog.values());

        const validAccess = emergencyAccesses.find(access =>
            access.userId === userId &&
            access.patientId === patientId &&
            access.dataType === dataType &&
            access.status === 'approved' &&
            new Date(access.expiresAt) > new Date()
        );

        return !!validAccess;
    }

    // Apply data masking based on user role and privacy settings
    async applyDataMasking(data, userRole, patientId, dataType) {
        const privacyPrefs = await this.getPrivacyPreferences(patientId);
        const accessLevel = await this.checkDataAccess(null, userRole, patientId, dataType);

        if (accessLevel === 'none') {
            return null;
        }

        if (accessLevel === 'limited' || accessLevel === 'masked') {
            return this.maskSensitiveData(data, userRole, dataType);
        }

        return data;
    }

    // Mask sensitive data based on role and type
    maskSensitiveData(data, userRole, dataType) {
        const maskedData = {...data };

        // Define masking rules by role and data type
        const maskingRules = {
            'receptionist': {
                'patient_records': ['ssn', 'medicalHistory', 'diagnoses', 'treatments'],
                'appointments': ['notes', 'diagnosis', 'treatment']
            },
            'billing': {
                'patient_records': ['ssn', 'medicalHistory', 'diagnoses', 'treatments', 'labResults'],
                'billing': [] // Billing staff can see billing data
            },
            'nurse': {
                'patient_records': ['ssn', 'financialInfo'],
                'medical_records': ['financialInfo']
            }
        };

        const rules = maskingRules[userRole] ? .[dataType] || [];

        rules.forEach(field => {
            if (maskedData[field]) {
                if (typeof maskedData[field] === 'string') {
                    maskedData[field] = this.maskString(maskedData[field]);
                } else if (typeof maskedData[field] === 'number') {
                    maskedData[field] = '***';
                }
            }
        });

        return maskedData;
    }

    // Mask string data
    maskString(str) {
        if (!str || str.length < 4) return '***';
        return str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2);
    }

    // Get default access level for role and data type
    getDefaultAccessLevel(userRole, dataType) {
        const defaultAccess = {
            'super_admin': 'full',
            'org_admin': 'full',
            'doctor': 'full',
            'nurse': 'limited',
            'pharmacist': 'limited',
            'lab_tech': 'limited',
            'billing': 'limited',
            'receptionist': 'limited',
            'staff': 'none'
        };

        return defaultAccess[userRole] || 'none';
    }

    // Schedule consent expiry notification
    async scheduleConsentExpiryNotification(consent) {
        if (!consent.expiryDate) return;

        const expiryDate = new Date(consent.expiryDate);
        const notificationDate = new Date(expiryDate);
        notificationDate.setDate(notificationDate.getDate() - 7); // 7 days before expiry

        await notificationScheduler.scheduleNotification({
            type: NOTIFICATION_TYPES.CONSENT_EXPIRY,
            priority: 'medium',
            channels: ['email', 'in_app'],
            recipients: ['admin@organization.com'],
            data: {
                patient_name: consent.patientName,
                consent_type: consent.consentType,
                consent_title: consent.consentTitle,
                expiry_date: consent.expiryDate
            },
            scheduledFor: notificationDate,
            patientId: consent.patientId,
            patientName: consent.patientName
        });
    }

    // Notify consent revocation
    async notifyConsentRevocation(consent, reason, revokedBy) {
        await notificationScheduler.scheduleNotification({
            type: 'consent_revoked',
            priority: 'high',
            channels: ['email', 'in_app'],
            recipients: ['admin@organization.com', 'legal@organization.com'],
            data: {
                patient_name: consent.patientName,
                consent_type: consent.consentType,
                consent_title: consent.consentTitle,
                reason,
                revoked_by: revokedBy,
                revoked_at: new Date().toISOString()
            },
            patientId: consent.patientId,
            patientName: consent.patientName
        });
    }

    // Generate unique IDs
    generateConsentId() {
        return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generatePrivacySettingsId() {
        return `privacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateEmergencyAccessId() {
        return `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // GDPR compliance methods
    async exportPatientData(patientId, requestedBy) {
        const consents = await this.getPatientConsents(patientId);
        const privacyPreferences = await this.getPrivacyPreferences(patientId);

        // Check if patient has given consent for data export
        const hasExportConsent = await this.hasConsent(patientId, CONSENT_TYPES.DATA_EXPORT);
        if (!hasExportConsent) {
            throw new Error('Patient has not consented to data export');
        }

        // Log audit event
        await auditLogger.logDataExport(
            patientId,
            privacyPreferences ? .patientName || 'Unknown',
            'gdpr_export', {
                requestedBy,
                exportType: 'gdpr_export',
                dataRetentionPeriod: '30_days'
            }
        );

        return {
            consents,
            privacyPreferences,
            exportedAt: new Date(),
            requestedBy
        };
    }

    async deletePatientData(patientId, requestedBy, reason) {
        const consents = await this.getPatientConsents(patientId);
        const privacyPreferences = await this.getPrivacyPreferences(patientId);

        // Check if patient has given consent for data deletion
        const hasDeletionConsent = await this.hasConsent(patientId, CONSENT_TYPES.DATA_DELETION);
        if (!hasDeletionConsent) {
            throw new Error('Patient has not consented to data deletion');
        }

        // Log audit event
        await auditLogger.log({
            action: AUDIT_ACTIONS.DATA_DELETE,
            level: 'critical',
            resource: 'patient_data',
            resourceId: patientId,
            resourceType: 'data_deletion',
            patientId,
            patientName: privacyPreferences ? .patientName || 'Unknown',
            details: {
                requestedBy,
                reason,
                deletionType: 'gdpr_deletion'
            }
        });

        // Perform data deletion
        await mockApiClient.patients.delete(patientId);
        await mockApiClient.consents.deleteByPatient(patientId);
        await mockApiClient.privacy.deleteByPatient(patientId);

        return {
            deletedAt: new Date(),
            requestedBy,
            reason
        };
    }
}

// Create singleton instance
export const consentManager = new ConsentManager();

// React hook for consent management
export function useConsentManager() {
    return {
        createConsent: consentManager.createConsent.bind(consentManager),
        updateConsent: consentManager.updateConsent.bind(consentManager),
        revokeConsent: consentManager.revokeConsent.bind(consentManager),
        getConsent: consentManager.getConsent.bind(consentManager),
        getPatientConsents: consentManager.getPatientConsents.bind(consentManager),
        hasConsent: consentManager.hasConsent.bind(consentManager),
        setPrivacyPreferences: consentManager.setPrivacyPreferences.bind(consentManager),
        getPrivacyPreferences: consentManager.getPrivacyPreferences.bind(consentManager),
        checkDataAccess: consentManager.checkDataAccess.bind(consentManager),
        requestEmergencyAccess: consentManager.requestEmergencyAccess.bind(consentManager),
        approveEmergencyAccess: consentManager.approveEmergencyAccess.bind(consentManager),
        applyDataMasking: consentManager.applyDataMasking.bind(consentManager),
        exportPatientData: consentManager.exportPatientData.bind(consentManager),
        deletePatientData: consentManager.deletePatientData.bind(consentManager)
    };
}