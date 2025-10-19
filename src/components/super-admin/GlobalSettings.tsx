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
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Globe,
  Database,
  Mail,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { mockApiClient } from "@/api/mockApiClient";

export default function GlobalSettings() {
  const { user, hasRole } = useAuth();
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'MediFlow Healthcare System',
    systemVersion: '1.0.0',
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',

    // Security Settings
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorRequired: false,

    // Email Settings
    emailEnabled: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    emailFromAddress: '',
    emailFromName: '',

    // Notification Settings
    notificationsEnabled: true,
    appointmentReminders: true,
    labResultNotifications: true,
    billingNotifications: true,
    systemAlerts: true,

    // Data Settings
    dataRetentionDays: 2555, // 7 years for HIPAA compliance
    backupEnabled: true,
    backupFrequency: 'daily',
    auditLogRetention: 2555,

    // UI Settings
    defaultLanguage: 'en',
    defaultTimezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'light'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});

  // Check if user has SuperAdmin role
  if (!hasRole('SuperAdmin')) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access Global Settings.
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
    loadSettings();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch from the database
      // For now, we'll simulate loading settings
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store original settings for comparison
      setOriginalSettings({ ...settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // In a real application, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOriginalSettings({ ...settings });
      setHasChanges(false);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: any, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      loadSettings();
    }
  };

  const SettingCard = ({ title, description, icon: Icon, children }: any) => (
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
                <Settings className="h-6 w-6 text-blue-600" />
                Global Settings
              </h1>
              <p className="text-sm text-gray-600">
                Configure system-wide settings and preferences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadSettings} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={resetToDefaults} variant="outline" size="sm">
                Reset Defaults
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

        {/* Settings Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Settings */}
          <SettingCard
            title="System Configuration"
            description="Basic system settings and maintenance options"
            icon={"Globe"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="System Name" description="Display name for the system">
                  <Input
                    value={settings.systemName}
                    onChange={(e) => handleSettingChange('systemName', e.target.value)}
                    className="w-48"
                  />
                </SettingRow>

                <SettingRow label="Maintenance Mode" description="Enable maintenance mode to restrict access">
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(value) => handleSettingChange('maintenanceMode', value)}
                  />
                </SettingRow>

                <SettingRow label="Debug Mode" description="Enable debug logging and features">
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(value) => handleSettingChange('debugMode', value)}
                  />
                </SettingRow>

                <SettingRow label="Log Level" description="Set the minimum log level">
                  <Select
                    value={settings.logLevel}
                    onValueChange={(value) => handleSettingChange('logLevel', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </>
            )}
          </SettingCard>

          {/* Security Settings */}
          <SettingCard
            title="Security Settings"
            description="Password policies and security configurations"
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
                <SettingRow label="Password Min Length" description="Minimum password length">
                  <Input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                    className="w-20"
                    min="6"
                    max="32"
                  />
                </SettingRow>

                <SettingRow label="Require Special Characters" description="Passwords must contain special characters">
                  <Switch
                    checked={settings.passwordRequireSpecialChars}
                    onCheckedChange={(value) => handleSettingChange('passwordRequireSpecialChars', value)}
                  />
                </SettingRow>

                <SettingRow label="Require Numbers" description="Passwords must contain numbers">
                  <Switch
                    checked={settings.passwordRequireNumbers}
                    onCheckedChange={(value) => handleSettingChange('passwordRequireNumbers', value)}
                  />
                </SettingRow>

                <SettingRow label="Session Timeout (minutes)" description="Auto-logout after inactivity">
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-20"
                    min="5"
                    max="480"
                  />
                </SettingRow>

                <SettingRow label="Max Login Attempts" description="Maximum failed login attempts before lockout">
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    className="w-20"
                    min="3"
                    max="10"
                  />
                </SettingRow>

                <SettingRow label="Two-Factor Authentication Required" description="Require 2FA for all users">
                  <Switch
                    checked={settings.twoFactorRequired}
                    onCheckedChange={(value) => handleSettingChange('twoFactorRequired', value)}
                  />
                </SettingRow>
              </>
            )}
          </SettingCard>

          {/* Email Settings */}
          <SettingCard
            title="Email Configuration"
            description="SMTP settings for system emails"
            icon={"Mail"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Email Enabled" description="Enable system email notifications">
                  <Switch
                    checked={settings.emailEnabled}
                    onCheckedChange={(value) => handleSettingChange('emailEnabled', value)}
                  />
                </SettingRow>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">SMTP Host</Label>
                    <Input
                      value={settings.smtpHost}
                      onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                      placeholder="smtp.example.com"
                      disabled={!settings.emailEnabled}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">SMTP Port</Label>
                      <Input
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                        disabled={!settings.emailEnabled}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Username</Label>
                      <Input
                        value={settings.smtpUsername}
                        onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                        disabled={!settings.emailEnabled}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">From Address</Label>
                    <Input
                      type="email"
                      value={settings.emailFromAddress}
                      onChange={(e) => handleSettingChange('emailFromAddress', e.target.value)}
                      placeholder="noreply@example.com"
                      disabled={!settings.emailEnabled}
                    />
                  </div>
                </div>
              </>
            )}
          </SettingCard>

          {/* Notification Settings */}
          <SettingCard
            title="Notification Preferences"
            description="Configure system notification settings"
            icon={"Bell"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Notifications Enabled" description="Enable all system notifications">
                  <Switch
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(value) => handleSettingChange('notificationsEnabled', value)}
                  />
                </SettingRow>

                <SettingRow label="Appointment Reminders" description="Send appointment reminder notifications">
                  <Switch
                    checked={settings.appointmentReminders}
                    onCheckedChange={(value) => handleSettingChange('appointmentReminders', value)}
                    disabled={!settings.notificationsEnabled}
                  />
                </SettingRow>

                <SettingRow label="Lab Result Notifications" description="Notify when lab results are available">
                  <Switch
                    checked={settings.labResultNotifications}
                    onCheckedChange={(value) => handleSettingChange('labResultNotifications', value)}
                    disabled={!settings.notificationsEnabled}
                  />
                </SettingRow>

                <SettingRow label="Billing Notifications" description="Send billing and payment notifications">
                  <Switch
                    checked={settings.billingNotifications}
                    onCheckedChange={(value) => handleSettingChange('billingNotifications', value)}
                    disabled={!settings.notificationsEnabled}
                  />
                </SettingRow>

                <SettingRow label="System Alerts" description="Send system-wide alerts and notifications">
                  <Switch
                    checked={settings.systemAlerts}
                    onCheckedChange={(value) => handleSettingChange('systemAlerts', value)}
                    disabled={!settings.notificationsEnabled}
                  />
                </SettingRow>
              </>
            )}
          </SettingCard>

          {/* Data Management */}
          <SettingCard
            title="Data Management"
            description="Data retention and backup settings"
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
                <SettingRow label="Data Retention (days)" description="How long to keep patient data (HIPAA: 7 years)">
                  <Input
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                    className="w-24"
                    min="365"
                    max="3650"
                  />
                </SettingRow>

                <SettingRow label="Backup Enabled" description="Enable automatic data backups">
                  <Switch
                    checked={settings.backupEnabled}
                    onCheckedChange={(value) => handleSettingChange('backupEnabled', value)}
                  />
                </SettingRow>

                <SettingRow label="Backup Frequency" description="How often to perform backups">
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) => handleSettingChange('backupFrequency', value)}
                    disabled={!settings.backupEnabled}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow label="Audit Log Retention (days)" description="How long to keep audit logs">
                  <Input
                    type="number"
                    value={settings.auditLogRetention}
                    onChange={(e) => handleSettingChange('auditLogRetention', parseInt(e.target.value))}
                    className="w-24"
                    min="90"
                    max="3650"
                  />
                </SettingRow>
              </>
            )}
          </SettingCard>

          {/* UI Settings */}
          <SettingCard
            title="User Interface"
            description="Default UI preferences and localization"
            icon={"Settings"}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <SettingRow label="Default Language" description="Default language for new users">
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(value) => handleSettingChange('defaultLanguage', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow label="Default Timezone" description="Default timezone for the system">
                  <Select
                    value={settings.defaultTimezone}
                    onValueChange={(value) => handleSettingChange('defaultTimezone', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow label="Date Format" description="Default date display format">
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => handleSettingChange('dateFormat', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow label="Time Format" description="12-hour or 24-hour time format">
                  <Select
                    value={settings.timeFormat}
                    onValueChange={(value) => handleSettingChange('timeFormat', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow label="Default Theme" description="Default theme for new users">
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => handleSettingChange('theme', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </>
            )}
          </SettingCard>
        </div>

        {/* Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system status and configuration summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">System Online</div>
                  <div className="text-sm text-gray-500">All services operational</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Database Connected</div>
                  <div className="text-sm text-gray-500">All data accessible</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {settings.emailEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <div className="font-medium">Email Service</div>
                  <div className="text-sm text-gray-500">
                    {settings.emailEnabled ? 'Configured and active' : 'Not configured'}
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
