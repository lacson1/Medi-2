# Comprehensive Healthcare Data Access Control System

## Overview

This implementation provides a comprehensive role-based data access control system for healthcare applications, including:

1. **Enhanced Role-Based Access Control (RBAC)** - Specific permissions for healthcare roles
2. **Comprehensive Audit Logging** - HIPAA/GDPR compliant audit trails
3. **Automated Notification System** - Multi-channel notifications for appointments, lab results, and alerts
4. **Patient Consent & Privacy Management** - Break-the-glass access and privacy controls
5. **Sensitive Data Masking** - Role-based data masking for different staff roles

## Features Implemented

### 1. Enhanced Role-Based Access Control

#### Healthcare-Specific Roles

- **Doctors**: Full access to assigned patients' clinical data
- **Nurses**: Read/update vitals and basic care data with limited access
- **Pharmacists**: Read prescriptions and medication history
- **Receptionists**: Manage appointments with limited medical data access
- **Billing Staff**: Access billing and insurance with minimal clinical data

#### Key Files:
- `src/utils/enhancedRoleManagement.jsx` - Enhanced role definitions
- `src/components/ProtectedRoute.jsx` - Route protection with role checking

#### Usage Example:
```jsx
import { useAuth } from '@/contexts/AuthContext';
import { SYSTEM_ROLES } from '@/utils/enhancedRoleManagement';

function MyComponent() {
  const { user, hasPermission, hasRole } = useAuth();
  
  // Check specific permissions
  if (hasPermission('patient_records_full')) {
    // Show full patient data
  }
  
  // Check role
  if (hasRole('doctor')) {
    // Doctor-specific functionality
  }
}
```

### 2. Comprehensive Audit Logging System

#### HIPAA/GDPR Compliance Features

- **Automatic Logging**: All data access and modifications are logged
- **Immutable Audit Trail**: Audit logs cannot be modified
- **Real-time Monitoring**: Critical events trigger immediate alerts
- **Retention Management**: Configurable retention periods (6+ years for HIPAA)

#### Key Files:
- `src/utils/auditLogger.js` - Core audit logging system

#### Usage Example:
```jsx
import { auditLogger, AUDIT_ACTIONS } from '@/utils/auditLogger';

// Log patient access
await auditLogger.logPatientAccess(
  patientId,
  patientName,
  AUDIT_ACTIONS.PATIENT_VIEW,
  {
    accessReason: 'routine_care',
    userRole: user.role
  }
);

// Log emergency access
await auditLogger.logBreakGlassAccess(
  patientId,
  patientName,
  'Medical emergency',
  {
    userId: user.id,
    userRole: user.role
  }
);
```

### 3. Automated Notification System

#### Multi-Channel Notifications

- **Email**: Detailed notifications with templates
- **SMS**: Short-form notifications
- **Phone**: Voice notifications
- **In-App**: Real-time in-application notifications
- **Push**: Mobile push notifications
- **Webhook**: Integration with external systems

#### Notification Types

- Appointment reminders (24h before)
- Lab results ready notifications
- Prescription refill reminders
- Staff notifications for urgent tasks
- Low stock alerts for medicine inventory
- Break-glass access alerts

#### Key Files:
- `src/utils/notificationSystem.js` - Notification scheduling and delivery

#### Usage Example:
```jsx
import { 
  scheduleAppointmentReminder,
  scheduleLabResultNotification,
  sendBreakGlassAlert 
} from '@/utils/notificationSystem';

// Schedule appointment reminder
await scheduleAppointmentReminder({
  patientId: '123',
  patientName: 'John Doe',
  patientEmail: 'john@example.com',
  patientPhone: '+1234567890',
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00 AM',
  providerName: 'Dr. Smith',
  location: 'Main Clinic',
  organizationName: 'Bluequee2 Medical Center',
  phoneNumber: '+1234567890',
  reminderHours: 24
});

// Send break-glass alert
await sendBreakGlassAlert({
  patientId: '123',
  patientName: 'John Doe',
  userName: 'Dr. Smith',
  userRole: 'doctor',
  reason: 'Medical emergency',
  ipAddress: '192.168.1.1'
});
```

### 4. Patient Consent & Privacy Management

#### Consent Management Features

- **Consent Types**: Treatment, surgery, anesthesia, research, privacy, etc.
- **Consent Status Tracking**: Pending, obtained, expired, revoked
- **Consent Expiry Notifications**: Automatic reminders
- **Consent Revocation**: With audit trail and notifications

#### Privacy Controls

- **Data Sharing Preferences**: Patient-controlled data sharing
- **Access Control Settings**: Role-based access permissions
- **Notification Preferences**: Communication preferences
- **Data Retention Settings**: GDPR compliance

#### Break-the-Glass Access

- **Emergency Access Requests**: With justification and approval workflow
- **Time-Limited Access**: Automatic expiration
- **Audit Trail**: Complete logging of emergency access
- **Real-time Alerts**: Notifications to administrators

#### Key Files:
- `src/utils/consentManager.js` - Consent and privacy management

#### Usage Example:
```jsx
import { consentManager, CONSENT_TYPES } from '@/utils/consentManager';

// Create consent
await consentManager.createConsent({
  patientId: '123',
  patientName: 'John Doe',
  consentType: CONSENT_TYPES.TREATMENT,
  consentTitle: 'Consent for Surgical Procedure',
  consentDetails: 'Patient consents to undergo appendectomy',
  obtainedBy: 'Dr. Smith',
  witnessName: 'Nurse Johnson',
  risksExplained: true,
  expiryDate: '2024-12-31'
});

// Check consent
const hasConsent = await consentManager.hasConsent(
  patientId, 
  CONSENT_TYPES.TREATMENT
);

// Request emergency access
await consentManager.requestEmergencyAccess({
  userId: user.id,
  userName: user.name,
  userRole: user.role,
  patientId: '123',
  patientName: 'John Doe',
  reason: 'Medical emergency',
  dataType: 'patient_records',
  urgency: 'high'
});
```

### 5. Sensitive Data Masking

#### Role-Based Data Masking

- **Receptionists**: SSN, medical history, diagnoses masked
- **Billing Staff**: Medical history, diagnoses, lab results masked
- **Nurses**: SSN, financial information masked
- **Doctors**: Full access (no masking)

#### Data Masking Implementation

- **String Masking**: First 2 and last 2 characters visible
- **Number Masking**: Replaced with '***'
- **Conditional Masking**: Based on user role and data type

#### Usage Example:
```jsx
import { consentManager } from '@/utils/consentManager';

// Apply data masking
const maskedData = await consentManager.applyDataMasking(
  patientData,
  userRole,
  patientId,
  dataType
);
```

### 6. Data Access Control Component

#### Comprehensive Access Control

The `DataAccessControl` component provides:

- **Automatic Permission Checking**: Based on user role and patient consent
- **Data Masking**: Automatic application of data masking
- **Emergency Access**: Break-the-glass functionality
- **Audit Logging**: Automatic logging of access events
- **Visual Indicators**: Clear access level indicators

#### Key Files:
- `src/components/DataAccessControl.jsx` - Main access control component

#### Usage Example:
```jsx
import DataAccessControl from '@/components/DataAccessControl';

function PatientData({ patientId, patientName }) {
  return (
    <DataAccessControl
      patientId={patientId}
      patientName={patientName}
      dataType="patient_records"
      requireConsent={true}
      showAccessInfo={true}
      onAccessGranted={(accessInfo) => {
        console.log('Access granted:', accessInfo);
      }}
      onAccessDenied={(accessInfo) => {
        console.log('Access denied:', accessInfo);
      }}
    >
      <PatientRecords patientId={patientId} />
    </DataAccessControl>
  );
}
```

## Integration Examples

### 1. Enhanced Patient Profile

The `EnhancedPatientProfile` component demonstrates comprehensive integration:

- **Access Control**: Every data section is wrapped with access control
- **Audit Logging**: All access events are logged
- **Consent Management**: Integrated consent management
- **Emergency Access**: Break-the-glass functionality
- **Data Masking**: Automatic data masking based on user role

### 2. Higher-Order Component

Use the `withDataAccessControl` HOC for automatic access control:

```jsx
import { withDataAccessControl } from '@/components/DataAccessControl';

const ProtectedPatientComponent = withDataAccessControl(
  PatientComponent,
  {
    requireConsent: true,
    showAccessInfo: true,
    onAccessGranted: (accessInfo) => console.log('Access granted'),
    onAccessDenied: (accessInfo) => console.log('Access denied')
  }
);
```

## Configuration

### 1. Role Configuration

Update roles in `src/utils/enhancedRoleManagement.jsx`:

```jsx
export const SYSTEM_ROLES = {
  DOCTOR: {
    name: 'Doctor',
    key: 'doctor',
    permissions: [
      'patient_records_full',
      'medical_history_full',
      'prescription_rights',
      // ... other permissions
    ]
  }
  // ... other roles
};
```

### 2. Notification Templates

Customize notification templates in `src/utils/notificationSystem.js`:

```jsx
export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.APPOINTMENT_REMINDER]: {
    subject: 'Appointment Reminder - {patient_name}',
    email: `Dear {patient_name}, ...`,
    sms: 'Reminder: You have an appointment...',
    phone: 'Hello {patient_name}, this is a reminder...'
  }
};
```

### 3. Audit Configuration

Configure audit logging in `src/utils/auditLogger.js`:

```jsx
export const AUDIT_ACTIONS = {
  PATIENT_VIEW: 'patient_view',
  PATIENT_CREATE: 'patient_create',
  // ... other actions
};
```

## Security Considerations

### 1. HIPAA Compliance

- **Audit Logging**: All access events are logged with timestamps
- **Access Controls**: Role-based access with patient consent
- **Data Masking**: Sensitive data is masked based on user role
- **Emergency Access**: Break-the-glass with audit trail

### 2. GDPR Compliance

- **Consent Management**: Patient-controlled consent system
- **Data Export**: Right to data portability
- **Data Deletion**: Right to be forgotten
- **Privacy Settings**: Patient-controlled privacy preferences

### 3. Security Best Practices

- **Immutable Audit Logs**: Audit logs cannot be modified
- **Real-time Monitoring**: Critical events trigger immediate alerts
- **Access Expiration**: Emergency access automatically expires
- **Multi-factor Authentication**: Recommended for sensitive operations

## Monitoring and Alerts

### 1. Real-time Monitoring

The system provides real-time monitoring for:

- **Break-glass Access**: Immediate alerts to administrators
- **Consent Violations**: Alerts when access is attempted without consent
- **Failed Access Attempts**: Security monitoring
- **System Errors**: Technical issue alerts

### 2. Audit Reports

Generate audit reports for:

- **Compliance Audits**: HIPAA/GDPR compliance reports
- **Access Patterns**: User access behavior analysis
- **Security Incidents**: Break-glass access reports
- **Consent Management**: Consent status reports

## Testing

### 1. Unit Tests

Test individual components:

```jsx
import { render, screen } from '@testing-library/react';
import DataAccessControl from '@/components/DataAccessControl';

test('renders access denied for insufficient permissions', () => {
  render(
    <DataAccessControl
      patientId="123"
      patientName="John Doe"
      dataType="patient_records"
      requireConsent={true}
    >
      <div>Patient Data</div>
    </DataAccessControl>
  );
  
  expect(screen.getByText('Access Denied')).toBeInTheDocument();
});
```

### 2. Integration Tests

Test complete workflows:

```jsx
test('complete patient access workflow', async () => {
  // Test consent creation
  // Test access control
  // Test audit logging
  // Test data masking
});
```

## Deployment

### 1. Environment Configuration

Configure environment variables:

```env
# Audit logging
AUDIT_LOG_RETENTION_DAYS=2190  # 6 years for HIPAA
AUDIT_LOG_LEVEL=info

# Notifications
EMAIL_SERVICE_URL=https://api.emailservice.com
SMS_SERVICE_URL=https://api.smsservice.com
WEBHOOK_SECRET=your-webhook-secret

# Privacy settings
DEFAULT_CONSENT_EXPIRY_DAYS=365
EMERGENCY_ACCESS_EXPIRY_HOURS=24
```

### 2. Database Setup

Ensure proper database indexes for:

- **Audit Logs**: Timestamp, user_id, patient_id indexes
- **Consents**: Patient_id, consent_type, status indexes
- **Notifications**: Scheduled_for, status indexes

### 3. Monitoring Setup

Configure monitoring for:

- **Audit Log Volume**: Monitor audit log generation
- **Notification Delivery**: Monitor notification success rates
- **Access Patterns**: Monitor unusual access patterns
- **System Performance**: Monitor system performance impact

## Troubleshooting

### Common Issues

1. **Access Denied Errors**: Check user permissions and patient consent
2. **Notification Failures**: Check notification service configuration
3. **Audit Log Issues**: Check database connectivity and permissions
4. **Data Masking Problems**: Verify role configuration and data types

### Debug Mode

Enable debug mode for troubleshooting:

```jsx
// Enable debug logging
localStorage.setItem('audit_debug', 'true');
localStorage.setItem('notification_debug', 'true');
localStorage.setItem('consent_debug', 'true');
```

## Support

For technical support or questions about this implementation:

1. Check the documentation above
2. Review the code examples
3. Test with the provided test cases
4. Contact the development team for assistance

This comprehensive system provides enterprise-grade healthcare data access control with full HIPAA/GDPR compliance and modern security features.
