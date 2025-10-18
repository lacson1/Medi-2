// Comprehensive Automated Notification System
import { mockApiClient } from "@/api/mockApiClient";
import { auditLogger } from './auditLogger.tsx';

// Notification types
export const NOTIFICATION_TYPES = {
    APPOINTMENT_REMINDER: 'appointment_reminder',
    LAB_RESULT_READY: 'lab_result_ready',
    PRESCRIPTION_REFILL: 'prescription_refill',
    MEDICATION_ADHERENCE: 'medication_adherence',
    URGENT_TASK: 'urgent_task',
    LOW_STOCK_ALERT: 'low_stock_alert',
    EMERGENCY_ALERT: 'emergency_alert',
    SYSTEM_MAINTENANCE: 'system_maintenance',
    CONSENT_EXPIRY: 'consent_expiry',
    BREAK_GLASS_ACCESS: 'break_glass_access',
    DATA_EXPORT_COMPLETE: 'data_export_complete',
    PRIVACY_VIOLATION: 'privacy_violation'
};

// Notification channels
export const NOTIFICATION_CHANNELS = {
    EMAIL: 'email',
    SMS: 'sms',
    PHONE: 'phone',
    IN_APP: 'in_app',
    PUSH: 'push',
    WEBHOOK: 'webhook'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
    EMERGENCY: 'emergency'
};

// Notification templates
export const NOTIFICATION_TEMPLATES = {
    [NOTIFICATION_TYPES.APPOINTMENT_REMINDER]: {
        subject: 'Appointment Reminder - {patient_name}',
        email: `
Dear {patient_name},

This is a reminder that you have an appointment scheduled:

Date: {appointment_date}
Time: {appointment_time}
Provider: {provider_name}
Location: {location}

Please arrive 15 minutes early for check-in.

If you need to reschedule, please contact us at {phone_number}.

Best regards,
{organization_name}
        `,
        sms: 'Reminder: You have an appointment with {provider_name} on {appointment_date} at {appointment_time}. Reply STOP to opt out.',
        phone: 'Hello {patient_name}, this is a reminder about your appointment with {provider_name} on {appointment_date} at {appointment_time}.'
    },
    [NOTIFICATION_TYPES.LAB_RESULT_READY]: {
        subject: 'Lab Results Ready - {patient_name}',
        email: `
Dear {patient_name},

Your lab results are now available in your patient portal.

Test Date: {test_date}
Test Type: {test_type}
Provider: {provider_name}

Please log in to your patient portal to view your results, or contact your provider if you have any questions.

Best regards,
{organization_name}
        `,
        sms: 'Your lab results for {test_type} are ready. Please check your patient portal or contact your provider.',
        phone: 'Hello {patient_name}, your lab results for {test_type} are now available. Please check your patient portal.'
    },
    [NOTIFICATION_TYPES.PRESCRIPTION_REFILL]: {
        subject: 'Prescription Refill Reminder - {medication_name}',
        email: `
Dear {patient_name},

Your prescription for {medication_name} is due for a refill.

Current Prescription:
- Medication: {medication_name}
- Dosage: {dosage}
- Refills Remaining: {refills_remaining}
- Next Refill Date: {refill_date}

Please contact your pharmacy or schedule an appointment to renew your prescription.

Best regards,
{provider_name}
        `,
        sms: 'Your prescription for {medication_name} needs a refill. Contact your pharmacy or provider.',
        phone: 'Hello {patient_name}, your prescription for {medication_name} is due for a refill.'
    },
    [NOTIFICATION_TYPES.URGENT_TASK]: {
        subject: 'Urgent Task Alert - {task_title}',
        email: `
Urgent Task Alert

Task: {task_title}
Patient: {patient_name}
Priority: {priority}
Due: {due_date}
Assigned to: {assigned_to}

Description: {task_description}

Please address this task immediately.

Best regards,
System Administrator
        `,
        sms: 'URGENT: {task_title} for {patient_name} requires immediate attention.',
        phone: 'Urgent task alert: {task_title} for patient {patient_name} requires immediate attention.'
    },
    [NOTIFICATION_TYPES.LOW_STOCK_ALERT]: {
        subject: 'Low Stock Alert - {medication_name}',
        email: `
Low Stock Alert

Medication: {medication_name}
Current Stock: {current_stock}
Minimum Stock: {minimum_stock}
Supplier: {supplier}

Please reorder this medication to avoid stockout.

Best regards,
Pharmacy Management System
        `,
        sms: 'Low stock alert: {medication_name} - {current_stock} remaining.',
        phone: 'Low stock alert for {medication_name}. Current stock is {current_stock}.'
    },
    [NOTIFICATION_TYPES.BREAK_GLASS_ACCESS]: {
        subject: 'BREAK-GLASS ACCESS ALERT - {patient_name}',
        email: `
SECURITY ALERT: Break-Glass Access

Patient: {patient_name}
Accessed by: {user_name} ({user_role})
Reason: {reason}
Timestamp: {timestamp}
IP Address: {ip_address}

This access has been logged and will be reviewed.

Best regards,
Security System
        `,
        sms: 'SECURITY ALERT: Break-glass access to {patient_name} by {user_name}.',
        phone: 'Security alert: Break-glass access to patient {patient_name} by {user_name}.'
    }
};

// Notification scheduler class
export class NotificationScheduler {
    constructor() {
        this.scheduledNotifications = new Map();
        this.notificationQueue = [];
        this.isProcessing = false;
        this.retryAttempts = new Map();
        this.maxRetries = 3;
    }

    // Schedule a notification
    async scheduleNotification({
        type,
        priority = NOTIFICATION_PRIORITIES.MEDIUM,
        channels = [NOTIFICATION_CHANNELS.EMAIL],
        recipients = [],
        data = {},
        scheduledFor = null,
        patientId = null,
        patientName = null,
        userId = null,
        organizationId = null,
        metadata = {}
    }) {
        const notification = {
            id: this.generateNotificationId(),
            type,
            priority,
            channels,
            recipients,
            data,
            scheduledFor: scheduledFor || new Date(),
            patientId,
            patientName,
            userId,
            organizationId,
            metadata,
            status: 'scheduled',
            createdAt: new Date(),
            attempts: 0,
            lastAttempt: null,
            deliveredAt: null,
            errorMessage: null
        };

        // Store notification
        this.scheduledNotifications.set(notification.id, notification);

        // Add to processing queue
        this.notificationQueue.push(notification);

        // Log audit event
        await auditLogger.log({
            action: 'notification_scheduled',
            level: 'info',
            resource: 'notification',
            resourceId: notification.id,
            resourceType: 'notification',
            patientId,
            patientName,
            details: {
                type,
                priority,
                channels,
                scheduledFor: notification.scheduledFor
            }
        });

        // Start processing if not already running
        if (!this.isProcessing) {
            this.processNotificationQueue();
        }

        return notification;
    }

    // Process notification queue
    async processNotificationQueue() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();

            try {
                await this.processNotification(notification);
            } catch (error) {
                console.error('Failed to process notification:', error);
                await this.handleNotificationError(notification, error);
            }
        }

        this.isProcessing = false;
    }

    // Process individual notification
    async processNotification(notification) {
        const now = new Date();

        // Check if it's time to send
        if (notification.scheduledFor > now) {
            // Reschedule for later
            setTimeout(() => {
                this.notificationQueue.push(notification);
                this.processNotificationQueue();
            }, notification.scheduledFor.getTime() - now.getTime());
            return;
        }

        // Update notification status
        notification.status = 'processing';
        notification.lastAttempt = now;
        notification.attempts++;

        // Send through each channel
        const results = [];
        for (const channel of notification.channels) {
            try {
                const result = await this.sendNotification(notification, channel);
                results.push({ channel, success: true, result });
            } catch (error) {
                results.push({ channel, success: false, error: error.message });
            }
        }

        // Update notification status
        const allSuccessful = results.every(r => r.success);
        if (allSuccessful) {
            notification.status = 'delivered';
            notification.deliveredAt = now;
        } else {
            notification.status = 'failed';
            notification.errorMessage = results.filter(r => !r.success).map(r => r.error).join('; ');
        }

        // Log audit event
        await auditLogger.log({
            action: 'notification_sent',
            level: allSuccessful ? 'info' : 'warning',
            resource: 'notification',
            resourceId: notification.id,
            resourceType: 'notification',
            patientId: notification.patientId,
            patientName: notification.patientName,
            details: {
                type: notification.type,
                priority: notification.priority,
                channels: notification.channels,
                results,
                attempts: notification.attempts
            }
        });
    }

    // Send notification through specific channel
    async sendNotification(notification, channel) {
        const template = NOTIFICATION_TEMPLATES[notification.type];
        if (!template) {
            throw new Error(`No template found for notification type: ${notification.type}`);
        }

        // Prepare message content
        const content = this.prepareMessageContent(template, notification.data, channel);

        switch (channel) {
            case NOTIFICATION_CHANNELS.EMAIL:
                return await this.sendEmail(notification, content);
            case NOTIFICATION_CHANNELS.SMS:
                return await this.sendSMS(notification, content);
            case NOTIFICATION_CHANNELS.PHONE:
                return await this.sendPhoneCall(notification, content);
            case NOTIFICATION_CHANNELS.IN_APP:
                return await this.sendInAppNotification(notification, content);
            case NOTIFICATION_CHANNELS.PUSH:
                return await this.sendPushNotification(notification, content);
            case NOTIFICATION_CHANNELS.WEBHOOK:
                return await this.sendWebhook(notification, content);
            default:
                throw new Error(`Unsupported notification channel: ${channel}`);
        }
    }

    // Prepare message content with template variables
    prepareMessageContent(template, data, channel) {
        let content = '';

        switch (channel) {
            case NOTIFICATION_CHANNELS.EMAIL:
                content = template.email || template.subject;
                break;
            case NOTIFICATION_CHANNELS.SMS:
                content = template.sms || template.subject;
                break;
            case NOTIFICATION_CHANNELS.PHONE:
                content = template.phone || template.subject;
                break;
            default:
                content = template.subject;
        }

        // Replace template variables
        return this.replaceTemplateVariables(content, data);
    }

    // Replace template variables in content
    replaceTemplateVariables(content, data) {
        return content.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] || match;
        });
    }

    // Send email notification
    async sendEmail(notification, content) {
        const emailData = {
            to: notification.recipients,
            subject: this.replaceTemplateVariables(NOTIFICATION_TEMPLATES[notification.type].subject, notification.data),
            body: content,
            priority: notification.priority,
            metadata: notification.metadata
        };

        return await mockApiClient.notifications.sendEmail(emailData);
    }

    // Send SMS notification
    async sendSMS(notification, content) {
        const smsData = {
            to: notification.recipients,
            message: content,
            priority: notification.priority,
            metadata: notification.metadata
        };

        return await mockApiClient.notifications.sendSMS(smsData);
    }

    // Send phone call notification
    async sendPhoneCall(notification, content) {
        const phoneData = {
            to: notification.recipients,
            message: content,
            priority: notification.priority,
            metadata: notification.metadata
        };

        return await mockApiClient.notifications.sendPhoneCall(phoneData);
    }

    // Send in-app notification
    async sendInAppNotification(notification, content) {
        const inAppData = {
            userId: notification.userId,
            title: this.replaceTemplateVariables(NOTIFICATION_TEMPLATES[notification.type].subject, notification.data),
            message: content,
            type: notification.type,
            priority: notification.priority,
            metadata: notification.metadata
        };

        return await mockApiClient.notifications.sendInApp(inAppData);
    }

    // Send push notification
    async sendPushNotification(notification, content) {
        const pushData = {
            userId: notification.userId,
            title: this.replaceTemplateVariables(NOTIFICATION_TEMPLATES[notification.type].subject, notification.data),
            body: content,
            type: notification.type,
            priority: notification.priority,
            metadata: notification.metadata
        };

        return await mockApiClient.notifications.sendPush(pushData);
    }

    // Send webhook notification
    async sendWebhook(notification, content) {
        const webhookData = {
            url: notification.metadata.webhookUrl,
            payload: {
                type: notification.type,
                priority: notification.priority,
                content,
                data: notification.data,
                metadata: notification.metadata
            }
        };

        return await mockApiClient.notifications.sendWebhook(webhookData);
    }

    // Handle notification errors
    async handleNotificationError(notification, error) {
        const retryCount = this.retryAttempts.get(notification.id) || 0;

        if (retryCount < this.maxRetries) {
            // Retry with exponential backoff
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            this.retryAttempts.set(notification.id, retryCount + 1);

            setTimeout(() => {
                this.notificationQueue.push(notification);
                this.processNotificationQueue();
            }, delay);
        } else {
            // Mark as permanently failed
            notification.status = 'failed_permanently';
            notification.errorMessage = error.message;

            // Log critical audit event
            await auditLogger.log({
                action: 'notification_failed_permanently',
                level: 'critical',
                resource: 'notification',
                resourceId: notification.id,
                resourceType: 'notification',
                patientId: notification.patientId,
                patientName: notification.patientName,
                details: {
                    type: notification.type,
                    priority: notification.priority,
                    error: error.message,
                    attempts: notification.attempts
                }
            });
        }
    }

    // Generate unique notification ID
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get notification status
    getNotificationStatus(notificationId) {
        return this.scheduledNotifications.get(notificationId);
    }

    // Cancel notification
    async cancelNotification(notificationId) {
        const notification = this.scheduledNotifications.get(notificationId);
        if (notification && notification.status === 'scheduled') {
            notification.status = 'cancelled';

            // Remove from queue
            this.notificationQueue = this.notificationQueue.filter(n => n.id !== notificationId);

            // Log audit event
            await auditLogger.log({
                action: 'notification_cancelled',
                level: 'info',
                resource: 'notification',
                resourceId: notificationId,
                resourceType: 'notification',
                patientId: notification.patientId,
                patientName: notification.patientName,
                details: {
                    type: notification.type,
                    priority: notification.priority
                }
            });
        }
    }
}

// Create singleton instance
export const notificationScheduler = new NotificationScheduler();

// Convenience functions for common notifications
export async function scheduleAppointmentReminder({
    patientId,
    patientName,
    patientEmail,
    patientPhone,
    appointmentDate,
    appointmentTime,
    providerName,
    location,
    organizationName,
    phoneNumber,
    reminderHours = 24
}) {
    const scheduledFor = new Date(appointmentDate);
    scheduledFor.setHours(scheduledFor.getHours() - reminderHours);

    return await notificationScheduler.scheduleNotification({
        type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
        recipients: [patientEmail, patientPhone],
        data: {
            patient_name: patientName,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            provider_name: providerName,
            location,
            organization_name: organizationName,
            phone_number: phoneNumber
        },
        scheduledFor,
        patientId,
        patientName
    });
}

export async function scheduleLabResultNotification({
    patientId,
    patientName,
    patientEmail,
    testType,
    testDate,
    providerName,
    organizationName
}) {
    return await notificationScheduler.scheduleNotification({
        type: NOTIFICATION_TYPES.LAB_RESULT_READY,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
        recipients: [patientEmail],
        data: {
            patient_name: patientName,
            test_type: testType,
            test_date: testDate,
            provider_name: providerName,
            organization_name: organizationName
        },
        patientId,
        patientName
    });
}

export async function schedulePrescriptionRefillReminder({
    patientId,
    patientName,
    patientEmail,
    medicationName,
    dosage,
    refillsRemaining,
    refillDate,
    providerName
}) {
    return await notificationScheduler.scheduleNotification({
        type: NOTIFICATION_TYPES.PRESCRIPTION_REFILL,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
        recipients: [patientEmail],
        data: {
            patient_name: patientName,
            medication_name: medicationName,
            dosage,
            refills_remaining: refillsRemaining,
            refill_date: refillDate,
            provider_name: providerName
        },
        patientId,
        patientName
    });
}

export async function sendUrgentTaskAlert({
    taskTitle,
    patientName,
    priority,
    dueDate,
    assignedTo,
    taskDescription,
    userId,
    organizationId
}) {
    return await notificationScheduler.scheduleNotification({
        type: NOTIFICATION_TYPES.URGENT_TASK,
        priority: NOTIFICATION_PRIORITIES.CRITICAL,
        channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS, NOTIFICATION_CHANNELS.IN_APP],
        recipients: [assignedTo],
        data: {
            task_title: taskTitle,
            patient_name: patientName,
            priority,
            due_date: dueDate,
            assigned_to: assignedTo,
            task_description: taskDescription
        },
        userId,
        organizationId
    });
}

export async function sendBreakGlassAlert({
    patientId,
    patientName,
    userName,
    userRole,
    reason,
    ipAddress
}) {
    return await notificationScheduler.scheduleNotification({
        type: NOTIFICATION_TYPES.BREAK_GLASS_ACCESS,
        priority: NOTIFICATION_PRIORITIES.EMERGENCY,
        channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS, NOTIFICATION_CHANNELS.IN_APP],
        recipients: ['security@organization.com', 'admin@organization.com'],
        data: {
            patient_name: patientName,
            user_name: userName,
            user_role: userRole,
            reason,
            timestamp: new Date().toISOString(),
            ip_address: ipAddress
        },
        patientId,
        patientName
    });
}

// React hook for notifications
export function useNotifications() {
    return {
        scheduleNotification: notificationScheduler.scheduleNotification.bind(notificationScheduler),
        scheduleAppointmentReminder,
        scheduleLabResultNotification,
        schedulePrescriptionRefillReminder,
        sendUrgentTaskAlert,
        sendBreakGlassAlert,
        getNotificationStatus: notificationScheduler.getNotificationStatus.bind(notificationScheduler),
        cancelNotification: notificationScheduler.cancelNotification.bind(notificationScheduler)
    };
}