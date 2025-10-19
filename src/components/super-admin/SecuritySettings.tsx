import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Save,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Network,
  FileText
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { mockApiClient } from "@/api/mockApiClient";

export default function SecuritySettings() {
  const { user, hasRole } = useAuth();
  const [securitySettings, setSecuritySettings] = useState({
    // Authentication Settings
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // days
      preventReuse: 5 // last 5 passwords
    },

    // Session Management
    sessionManagement: {
      timeout: 30, // minutes
      maxConcurrentSessions: 3,
      rememberMeDuration: 30, // days
      forceLogoutOnPasswordChange: true,
      requireReauthForSensitive: true
    },

    // Account Lockout
    accountLockout: {
      maxAttempts: 5,
      lockoutDuration: 15, // minutes
      progressiveDelay: true,
      maxLockoutDuration: 60 // minutes
    },

    // Two-Factor Authentication
    twoFactorAuth: {
      enabled: false,
      requiredForAdmins: true,
      requiredForDoctors: false,
      backupCodes: true,
      smsEnabled: false,
      emailEnabled: true,
      appEnabled: true
    },

    // API Security
    apiSecurity: {
      rateLimitEnabled: true,
      rateLimitRequests: parseInt(process.env.VITE_RATE_LIMIT_REQUESTS || '100'), // per minute
      apiKeyExpiration: parseInt(process.env.VITE_API_KEY_EXPIRATION || '365'), // days
      requireHttps: process.env.NODE_ENV === 'production',
      corsEnabled: true,
      allowedOrigins: process.env.VITE_ALLOWED_ORIGINS ?
        process.env.VITE_ALLOWED_ORIGINS.split(',') :
        ['https://yourdomain.com', 'https://www.yourdomain.com']
    },

    // Data Encryption
    dataEncryption: {
      encryptAtRest: true,
      encryptInTransit: true,
      encryptionAlgorithm: 'AES-256',
      keyRotationDays: 90,
      backupEncryption: true
    },

    // Audit & Monitoring
    auditMonitoring: {
      logAllAccess: true,
      logFailedAttempts: true,
      logDataChanges: true,
      realTimeAlerts: true,
      suspiciousActivityDetection: true,
      retentionDays: 2555 // 7 years for HIPAA
    },

    // Privacy Controls
    privacyControls: {
      dataAnonymization: true,
      consentRequired: true,
      rightToErasure: true,
      dataPortability: true,
      breachNotification: true,
      privacyByDesign: true
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('sk-******************************');

  // Check if user has SuperAdmin role
  if (!hasRole('SuperAdmin')) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access Security Settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              This feature is restricted to Super Admin users only.
            </p>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(securitySettings) !== JSON.stringify(originalSettings));
  }, [securitySettings, originalSettings]);

  const loadSecuritySettings = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch from the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store original settings for comparison
      setOriginalSettings({ ...securitySettings });
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // In a real application, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOriginalSettings({ ...securitySettings });
      setHasChanges(false);
      console.log('Security settings saved successfully');
    } catch (error) {
      console.error('Failed to save security settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNestedSettingChange = (category, key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const generateNewApiKey = async () => {
    try {
      // In a real application, this would generate a new API key
      const newKey = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setApiKey(newKey);
      console.log('New API key generated');
    } catch (error) {
      console.error('Failed to generate API key:', error);
    }
  };

  const SecurityCard = ({ title, description, icon: Icon, children }: any) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const SettingRow = ({ label, description, children }: any) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                Security Settings
              </h1>
              <p className="text-sm text-gray-600">
                Configure security policies, authentication, and data protection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadSecuritySettings} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleSaveSettings}
                size="sm"
                disabled={!hasChanges || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Alerts */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Changes to security settings may affect all users.
            Please review changes carefully before saving.
          </AlertDescription>
        </Alert>

        {/* Security Settings Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password Policy */}
          <SecurityCard
            title="Password Policy"
            description="Configure password requirements and policies"
            icon={"Lock"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Minimum Length" description="Minimum password length">
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => handleNestedSettingChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                    className="w-20"
                    min="6"
                    max="32"
                  />
                </SettingRow>

                <SettingRow label="Require Uppercase" description="Passwords must contain uppercase letters">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireUppercase}
                    onCheckedChange={(value) => handleNestedSettingChange('passwordPolicy', 'requireUppercase', value)}
                  />
                </SettingRow>

                <SettingRow label="Require Lowercase" description="Passwords must contain lowercase letters">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireLowercase}
                    onCheckedChange={(value) => handleNestedSettingChange('passwordPolicy', 'requireLowercase', value)}
                  />
                </SettingRow>

                <SettingRow label="Require Numbers" description="Passwords must contain numbers">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireNumbers}
                    onCheckedChange={(value) => handleNestedSettingChange('passwordPolicy', 'requireNumbers', value)}
                  />
                </SettingRow>

                <SettingRow label="Require Special Characters" description="Passwords must contain special characters">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(value) => handleNestedSettingChange('passwordPolicy', 'requireSpecialChars', value)}
                  />
                </SettingRow>

                <SettingRow label="Password Max Age (days)" description="How long passwords remain valid">
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.maxAge}
                    onChange={(e) => handleNestedSettingChange('passwordPolicy', 'maxAge', parseInt(e.target.value))}
                    className="w-20"
                    min="30"
                    max="365"
                  />
                </SettingRow>

                <SettingRow label="Prevent Password Reuse" description="Number of previous passwords to remember">
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.preventReuse}
                    onChange={(e) => handleNestedSettingChange('passwordPolicy', 'preventReuse', parseInt(e.target.value))}
                    className="w-20"
                    min="0"
                    max="10"
                  />
                </SettingRow>
              </>
            )}
          </SecurityCard>

          {/* Session Management */}
          <SecurityCard
            title="Session Management"
            description="Control user session behavior and security"
            icon={"Clock"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Session Timeout (minutes)" description="Auto-logout after inactivity">
                  <Input
                    type="number"
                    value={securitySettings.sessionManagement.timeout}
                    onChange={(e) => handleNestedSettingChange('sessionManagement', 'timeout', parseInt(e.target.value))}
                    className="w-20"
                    min="5"
                    max="480"
                  />
                </SettingRow>

                <SettingRow label="Max Concurrent Sessions" description="Maximum simultaneous sessions per user">
                  <Input
                    type="number"
                    value={securitySettings.sessionManagement.maxConcurrentSessions}
                    onChange={(e) => handleNestedSettingChange('sessionManagement', 'maxConcurrentSessions', parseInt(e.target.value))}
                    className="w-20"
                    min="1"
                    max="10"
                  />
                </SettingRow>

                <SettingRow label="Remember Me Duration (days)" description="How long 'Remember Me' lasts">
                  <Input
                    type="number"
                    value={securitySettings.sessionManagement.rememberMeDuration}
                    onChange={(e) => handleNestedSettingChange('sessionManagement', 'rememberMeDuration', parseInt(e.target.value))}
                    className="w-20"
                    min="1"
                    max="90"
                  />
                </SettingRow>

                <SettingRow label="Force Logout on Password Change" description="Logout all sessions when password changes">
                  <Switch
                    checked={securitySettings.sessionManagement.forceLogoutOnPasswordChange}
                    onCheckedChange={(value) => handleNestedSettingChange('sessionManagement', 'forceLogoutOnPasswordChange', value)}
                  />
                </SettingRow>

                <SettingRow label="Require Re-auth for Sensitive Actions" description="Require password confirmation for sensitive operations">
                  <Switch
                    checked={securitySettings.sessionManagement.requireReauthForSensitive}
                    onCheckedChange={(value) => handleNestedSettingChange('sessionManagement', 'requireReauthForSensitive', value)}
                  />
                </SettingRow>
              </>
            )}
          </SecurityCard>

          {/* Account Lockout */}
          <SecurityCard
            title="Account Lockout"
            description="Protect against brute force attacks"
            icon={"Users"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Max Login Attempts" description="Failed attempts before lockout">
                  <Input
                    type="number"
                    value={securitySettings.accountLockout.maxAttempts}
                    onChange={(e) => handleNestedSettingChange('accountLockout', 'maxAttempts', parseInt(e.target.value))}
                    className="w-20"
                    min="3"
                    max="10"
                  />
                </SettingRow>

                <SettingRow label="Lockout Duration (minutes)" description="How long accounts stay locked">
                  <Input
                    type="number"
                    value={securitySettings.accountLockout.lockoutDuration}
                    onChange={(e) => handleNestedSettingChange('accountLockout', 'lockoutDuration', parseInt(e.target.value))}
                    className="w-20"
                    min="5"
                    max="60"
                  />
                </SettingRow>

                <SettingRow label="Progressive Delay" description="Increase lockout time with repeated failures">
                  <Switch
                    checked={securitySettings.accountLockout.progressiveDelay}
                    onCheckedChange={(value) => handleNestedSettingChange('accountLockout', 'progressiveDelay', value)}
                  />
                </SettingRow>

                <SettingRow label="Max Lockout Duration (minutes)" description="Maximum lockout time with progressive delay">
                  <Input
                    type="number"
                    value={securitySettings.accountLockout.maxLockoutDuration}
                    onChange={(e) => handleNestedSettingChange('accountLockout', 'maxLockoutDuration', parseInt(e.target.value))}
                    className="w-20"
                    min="15"
                    max="1440"
                    disabled={!securitySettings.accountLockout.progressiveDelay}
                  />
                </SettingRow>
              </>
            )}
          </SecurityCard>

          {/* Two-Factor Authentication */}
          <SecurityCard
            title="Two-Factor Authentication"
            description="Configure multi-factor authentication options"
            icon={"Key"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="2FA Enabled" description="Enable two-factor authentication">
                  <Switch
                    checked={securitySettings.twoFactorAuth.enabled}
                    onCheckedChange={(value) => handleNestedSettingChange('twoFactorAuth', 'enabled', value)}
                  />
                </SettingRow>

                <SettingRow label="Required for Admins" description="Force 2FA for admin users">
                  <Switch
                    checked={securitySettings.twoFactorAuth.requiredForAdmins}
                    onCheckedChange={(value) => handleNestedSettingChange('twoFactorAuth', 'requiredForAdmins', value)}
                    disabled={!securitySettings.twoFactorAuth.enabled}
                  />
                </SettingRow>

                <SettingRow label="Required for Doctors" description="Force 2FA for doctor users">
                  <Switch
                    checked={securitySettings.twoFactorAuth.requiredForDoctors}
                    onCheckedChange={(value) => handleNestedSettingChange('twoFactorAuth', 'requiredForDoctors', value)}
                    disabled={!securitySettings.twoFactorAuth.enabled}
                  />
                </SettingRow>

                <SettingRow label="Backup Codes" description="Generate backup codes for 2FA">
                  <Switch
                    checked={securitySettings.twoFactorAuth.backupCodes}
                    onCheckedChange={(value) => handleNestedSettingChange('twoFactorAuth', 'backupCodes', value)}
                    disabled={!securitySettings.twoFactorAuth.enabled}
                  />
                </SettingRow>

                <SettingRow label="SMS Authentication" description="Allow SMS-based 2FA">
                  <Switch
                    checked={securitySettings.twoFactorAuth.smsEnabled}
                    onCheckedChange={(value) => handleNestedSettingChange('twoFactorAuth', 'smsEnabled', value)}
                    disabled={!securitySettings.twoFactorAuth.enabled}
                  />
                </SettingRow>

                <SettingRow label="Email Authentication" description="Allow email-based 2FA">
                  <Switch
                    checked={securitySettings.twoFactorAuth.emailEnabled}
                    onCheckedChange={(value) => handleNestedSettingChange('twoFactorAuth', 'emailEnabled', value)}
                    disabled={!securitySettings.twoFactorAuth.enabled}
                  />
                </SettingRow>

                <SettingRow label="App Authentication" description="Allow authenticator app 2FA">
                  <Switch
                    checked={securitySettings.twoFactorAuth.appEnabled}
                    onCheckedChange={(value) => handleNestedSettingChange('twoFactorAuth', 'appEnabled', value)}
                    disabled={!securitySettings.twoFactorAuth.enabled}
                  />
                </SettingRow>
              </>
            )}
          </SecurityCard>

          {/* API Security */}
          <SecurityCard
            title="API Security"
            description="Configure API access and rate limiting"
            icon={"Network"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Rate Limiting Enabled" description="Enable API rate limiting">
                  <Switch
                    checked={securitySettings.apiSecurity.rateLimitEnabled}
                    onCheckedChange={(value) => handleNestedSettingChange('apiSecurity', 'rateLimitEnabled', value)}
                  />
                </SettingRow>

                <SettingRow label="Rate Limit (requests/min)" description="Maximum requests per minute">
                  <Input
                    type="number"
                    value={securitySettings.apiSecurity.rateLimitRequests}
                    onChange={(e) => handleNestedSettingChange('apiSecurity', 'rateLimitRequests', parseInt(e.target.value))}
                    className="w-24"
                    min="10"
                    max="1000"
                    disabled={!securitySettings.apiSecurity.rateLimitEnabled}
                  />
                </SettingRow>

                <SettingRow label="API Key Expiration (days)" description="How long API keys remain valid">
                  <Input
                    type="number"
                    value={securitySettings.apiSecurity.apiKeyExpiration}
                    onChange={(e) => handleNestedSettingChange('apiSecurity', 'apiKeyExpiration', parseInt(e.target.value))}
                    className="w-24"
                    min="1"
                    max="365"
                  />
                </SettingRow>

                <SettingRow label="Require HTTPS" description="Force HTTPS for all API requests">
                  <Switch
                    checked={securitySettings.apiSecurity.requireHttps}
                    onCheckedChange={(value) => handleNestedSettingChange('apiSecurity', 'requireHttps', value)}
                  />
                </SettingRow>

                <SettingRow label="CORS Enabled" description="Enable Cross-Origin Resource Sharing">
                  <Switch
                    checked={securitySettings.apiSecurity.corsEnabled}
                    onCheckedChange={(value) => handleNestedSettingChange('apiSecurity', 'corsEnabled', value)}
                  />
                </SettingRow>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={showApiKey ? apiKey : 'sk-******************************'}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateNewApiKey}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SecurityCard>

          {/* Data Encryption */}
          <SecurityCard
            title="Data Encryption"
            description="Configure data encryption and key management"
            icon={"Database"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Encrypt at Rest" description="Encrypt data stored in database">
                  <Switch
                    checked={securitySettings.dataEncryption.encryptAtRest}
                    onCheckedChange={(value) => handleNestedSettingChange('dataEncryption', 'encryptAtRest', value)}
                  />
                </SettingRow>

                <SettingRow label="Encrypt in Transit" description="Encrypt data during transmission">
                  <Switch
                    checked={securitySettings.dataEncryption.encryptInTransit}
                    onCheckedChange={(value) => handleNestedSettingChange('dataEncryption', 'encryptInTransit', value)}
                  />
                </SettingRow>

                <SettingRow label="Encryption Algorithm" description="Algorithm used for encryption">
                  <Select
                    value={securitySettings.dataEncryption.encryptionAlgorithm}
                    onValueChange={(value) => handleNestedSettingChange('dataEncryption', 'encryptionAlgorithm', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES-256">AES-256</SelectItem>
                      <SelectItem value="AES-192">AES-192</SelectItem>
                      <SelectItem value="AES-128">AES-128</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow label="Key Rotation (days)" description="How often to rotate encryption keys">
                  <Input
                    type="number"
                    value={securitySettings.dataEncryption.keyRotationDays}
                    onChange={(e) => handleNestedSettingChange('dataEncryption', 'keyRotationDays', parseInt(e.target.value))}
                    className="w-24"
                    min="30"
                    max="365"
                  />
                </SettingRow>

                <SettingRow label="Backup Encryption" description="Encrypt backup files">
                  <Switch
                    checked={securitySettings.dataEncryption.backupEncryption}
                    onCheckedChange={(value) => handleNestedSettingChange('dataEncryption', 'backupEncryption', value)}
                  />
                </SettingRow>
              </>
            )}
          </SecurityCard>

          {/* Audit & Monitoring */}
          <SecurityCard
            title="Audit & Monitoring"
            description="Configure security monitoring and logging"
            icon={"FileText"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Log All Access" description="Log all data access events">
                  <Switch
                    checked={securitySettings.auditMonitoring.logAllAccess}
                    onCheckedChange={(value) => handleNestedSettingChange('auditMonitoring', 'logAllAccess', value)}
                  />
                </SettingRow>

                <SettingRow label="Log Failed Attempts" description="Log failed login attempts">
                  <Switch
                    checked={securitySettings.auditMonitoring.logFailedAttempts}
                    onCheckedChange={(value) => handleNestedSettingChange('auditMonitoring', 'logFailedAttempts', value)}
                  />
                </SettingRow>

                <SettingRow label="Log Data Changes" description="Log all data modifications">
                  <Switch
                    checked={securitySettings.auditMonitoring.logDataChanges}
                    onCheckedChange={(value) => handleNestedSettingChange('auditMonitoring', 'logDataChanges', value)}
                  />
                </SettingRow>

                <SettingRow label="Real-time Alerts" description="Send alerts for security events">
                  <Switch
                    checked={securitySettings.auditMonitoring.realTimeAlerts}
                    onCheckedChange={(value) => handleNestedSettingChange('auditMonitoring', 'realTimeAlerts', value)}
                  />
                </SettingRow>

                <SettingRow label="Suspicious Activity Detection" description="Detect and alert on suspicious patterns">
                  <Switch
                    checked={securitySettings.auditMonitoring.suspiciousActivityDetection}
                    onCheckedChange={(value) => handleNestedSettingChange('auditMonitoring', 'suspiciousActivityDetection', value)}
                  />
                </SettingRow>

                <SettingRow label="Retention Period (days)" description="How long to keep audit logs">
                  <Input
                    type="number"
                    value={securitySettings.auditMonitoring.retentionDays}
                    onChange={(e) => handleNestedSettingChange('auditMonitoring', 'retentionDays', parseInt(e.target.value))}
                    className="w-24"
                    min="90"
                    max="3650"
                  />
                </SettingRow>
              </>
            )}
          </SecurityCard>

          {/* Privacy Controls */}
          <SecurityCard
            title="Privacy Controls"
            description="Configure privacy and data protection settings"
            icon={"Shield"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Data Anonymization" description="Anonymize data for analytics">
                  <Switch
                    checked={securitySettings.privacyControls.dataAnonymization}
                    onCheckedChange={(value) => handleNestedSettingChange('privacyControls', 'dataAnonymization', value)}
                  />
                </SettingRow>

                <SettingRow label="Consent Required" description="Require explicit consent for data processing">
                  <Switch
                    checked={securitySettings.privacyControls.consentRequired}
                    onCheckedChange={(value) => handleNestedSettingChange('privacyControls', 'consentRequired', value)}
                  />
                </SettingRow>

                <SettingRow label="Right to Erasure" description="Allow users to request data deletion">
                  <Switch
                    checked={securitySettings.privacyControls.rightToErasure}
                    onCheckedChange={(value) => handleNestedSettingChange('privacyControls', 'rightToErasure', value)}
                  />
                </SettingRow>

                <SettingRow label="Data Portability" description="Allow users to export their data">
                  <Switch
                    checked={securitySettings.privacyControls.dataPortability}
                    onCheckedChange={(value) => handleNestedSettingChange('privacyControls', 'dataPortability', value)}
                  />
                </SettingRow>

                <SettingRow label="Breach Notification" description="Automatically notify users of data breaches">
                  <Switch
                    checked={securitySettings.privacyControls.breachNotification}
                    onCheckedChange={(value) => handleNestedSettingChange('privacyControls', 'breachNotification', value)}
                  />
                </SettingRow>

                <SettingRow label="Privacy by Design" description="Apply privacy principles to all features">
                  <Switch
                    checked={securitySettings.privacyControls.privacyByDesign}
                    onCheckedChange={(value) => handleNestedSettingChange('privacyControls', 'privacyByDesign', value)}
                  />
                </SettingRow>
              </>
            )}
          </SecurityCard>
        </div>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Status
            </CardTitle>
            <CardDescription>
              Current security posture and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                {securitySettings.twoFactorAuth.enabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">
                    {securitySettings.twoFactorAuth.enabled ? 'Enabled' : 'Not enabled'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {securitySettings.dataEncryption.encryptAtRest ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <div className="font-medium">Data Encryption</div>
                  <div className="text-sm text-gray-500">
                    {securitySettings.dataEncryption.encryptAtRest ? 'Enabled' : 'Not enabled'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {securitySettings.auditMonitoring.logAllAccess ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <div className="font-medium">Audit Logging</div>
                  <div className="text-sm text-gray-500">
                    {securitySettings.auditMonitoring.logAllAccess ? 'Comprehensive' : 'Limited'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
