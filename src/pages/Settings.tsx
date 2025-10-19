// Settings Pages Component
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Moon,
  Sun,
  Languages,
  Clock,
  Volume2,
  VolumeX,
  Database,
  Network,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Download,
  Upload,
  HardDrive,
  Cpu,
  MemoryStick,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Users,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  CreditCard,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  PieChart,
  LineChart,
  Trash2
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { mockApiClient } from "@/api/mockApiClient";
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user settings from database
  const { data: userSettings, isLoading: settingsLoading, refetch } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const settings = await mockApiClient.entities.UserSettings.list();
      return settings.find(s => s.user_id === user.id) || {
        user_id: user.id,
        notifications: {
          email: true,
          push: true,
          sms: false,
          appointment_reminders: true,
          billing_notifications: true,
          system_updates: true,
          marketing: false
        },
        privacy: {
          profile_visibility: 'organization',
          show_online_status: true,
          allow_direct_messages: true,
          data_sharing: false,
          analytics_tracking: true
        },
        appearance: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          date_format: 'MM/DD/YYYY',
          time_format: '12h'
        },
        security: {
          two_factor_auth: false,
          session_timeout: 30,
          login_notifications: true,
          password_expiry_days: 90,
          require_password_change: false
        }
      };
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      if (userSettings?.id) {
        return mockApiClient.entities.UserSettings.update(userSettings.id, newSettings);
      } else {
        return mockApiClient.entities.UserSettings.create(newSettings);
      }
    },
    onSuccess: () => {
      refetch();
      toast.success('Settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  useEffect(() => {
    if (userSettings) {
      setSettings(userSettings);
      setIsLoading(false);
    }
  }, [userSettings]);

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (isLoading || settingsLoading) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              System Settings
            </h1>
            <p className="text-sm text-gray-600">
              Customize your MediFlow experience
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={refetch} variant="outline" size="sm" disabled={settingsLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleSaveSettings} 
              disabled={updateSettingsMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateSettingsMutation.isPending ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Settings</>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-auto">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.email || false}
                      onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.push || false}
                      onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.sms || false}
                      onCheckedChange={(checked) => updateSetting('notifications', 'sms', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Appointment Reminders</Label>
                      <p className="text-sm text-gray-600">Get reminded about upcoming appointments</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.appointment_reminders || false}
                      onCheckedChange={(checked) => updateSetting('notifications', 'appointment_reminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Billing Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications about billing and payments</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.billing_notifications || false}
                      onCheckedChange={(checked) => updateSetting('notifications', 'billing_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">System Updates</Label>
                      <p className="text-sm text-gray-600">Get notified about system updates and maintenance</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.system_updates || false}
                      onCheckedChange={(checked) => updateSetting('notifications', 'system_updates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Marketing Communications</Label>
                      <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.marketing || false}
                      onCheckedChange={(checked) => updateSetting('notifications', 'marketing', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Profile Visibility</Label>
                    <Select
                      value={settings.privacy?.profile_visibility || 'organization'}
                      onValueChange={(value) => updateSetting('privacy', 'profile_visibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="organization">Organization Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600">Who can see your profile information</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Show Online Status</Label>
                      <p className="text-sm text-gray-600">Let others see when you're online</p>
                    </div>
                    <Switch
                      checked={settings.privacy?.show_online_status || false}
                      onCheckedChange={(checked) => updateSetting('privacy', 'show_online_status', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Allow Direct Messages</Label>
                      <p className="text-sm text-gray-600">Allow other users to send you direct messages</p>
                    </div>
                    <Switch
                      checked={settings.privacy?.allow_direct_messages || false}
                      onCheckedChange={(checked) => updateSetting('privacy', 'allow_direct_messages', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Data Sharing</Label>
                      <p className="text-sm text-gray-600">Allow sharing of anonymized data for research</p>
                    </div>
                    <Switch
                      checked={settings.privacy?.data_sharing || false}
                      onCheckedChange={(checked) => updateSetting('privacy', 'data_sharing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Analytics Tracking</Label>
                      <p className="text-sm text-gray-600">Allow tracking of usage analytics</p>
                    </div>
                    <Switch
                      checked={settings.privacy?.analytics_tracking || false}
                      onCheckedChange={(checked) => updateSetting('privacy', 'analytics_tracking', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance & Localization
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Theme</Label>
                    <Select
                      value={settings.appearance?.theme || 'light'}
                      onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Language</Label>
                    <Select
                      value={settings.appearance?.language || 'en'}
                      onValueChange={(value) => updateSetting('appearance', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Timezone</Label>
                    <Select
                      value={settings.appearance?.timezone || 'UTC'}
                      onValueChange={(value) => updateSetting('appearance', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Date Format</Label>
                    <Select
                      value={settings.appearance?.date_format || 'MM/DD/YYYY'}
                      onValueChange={(value) => updateSetting('appearance', 'date_format', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Time Format</Label>
                    <Select
                      value={settings.appearance?.time_format || '12h'}
                      onValueChange={(value) => updateSetting('appearance', 'time_format', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={settings.security?.two_factor_auth || false}
                      onCheckedChange={(checked) => updateSetting('security', 'two_factor_auth', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Session Timeout (minutes)</Label>
                    <Select
                      value={settings.security?.session_timeout?.toString() || '30'}
                      onValueChange={(value) => updateSetting('security', 'session_timeout', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Login Notifications</Label>
                      <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                    </div>
                    <Switch
                      checked={settings.security?.login_notifications || false}
                      onCheckedChange={(checked) => updateSetting('security', 'login_notifications', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Password Expiry (days)</Label>
                    <Select
                      value={settings.security?.password_expiry_days?.toString() || '90'}
                      onValueChange={(value) => updateSetting('security', 'password_expiry_days', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="0">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Require Password Change</Label>
                      <p className="text-sm text-gray-600">Force password change on next login</p>
                    </div>
                    <Switch
                      checked={settings.security?.require_password_change || false}
                      onCheckedChange={(checked) => updateSetting('security', 'require_password_change', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Manage your data, exports, and storage preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Data Export
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                        <CardContent className="p-4 text-center">
                          <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <h4 className="font-medium">Export All Data</h4>
                          <p className="text-sm text-gray-600 mb-3">Download all your data in JSON format</p>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </Button>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
                        <CardContent className="p-4 text-center">
                          <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <h4 className="font-medium">Export Reports</h4>
                          <p className="text-sm text-gray-600 mb-3">Generate and download activity reports</p>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Report
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Storage Management
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">Storage Used</p>
                          <p className="text-sm text-gray-600">Documents, images, and attachments</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">2.3 GB / 10 GB</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">Cache Size</p>
                          <p className="text-sm text-gray-600">Temporary files and cache</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800">156 MB</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Cache
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Optimize Storage
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Data Privacy
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Auto-delete Old Data</Label>
                          <p className="text-sm text-gray-600">Automatically remove data older than specified period</p>
                        </div>
                        <Switch
                          checked={settings.data?.auto_delete || false}
                          onCheckedChange={(checked) => updateSetting('data', 'auto_delete', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Data Retention Period</Label>
                        <Select
                          value={settings.data?.retention_period || '1year'}
                          onValueChange={(value) => updateSetting('data', 'retention_period', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6months">6 Months</SelectItem>
                            <SelectItem value="1year">1 Year</SelectItem>
                            <SelectItem value="2years">2 Years</SelectItem>
                            <SelectItem value="5years">5 Years</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system preferences and performance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-2">
                        <CardContent className="p-4 text-center">
                          <Cpu className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <h4 className="font-medium">CPU Usage</h4>
                          <p className="text-2xl font-bold text-blue-600">23%</p>
                          <p className="text-sm text-gray-600">Current load</p>
                        </CardContent>
                      </Card>
                      <Card className="border-2">
                        <CardContent className="p-4 text-center">
                          <MemoryStick className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <h4 className="font-medium">Memory</h4>
                          <p className="text-2xl font-bold text-green-600">1.2 GB</p>
                          <p className="text-sm text-gray-600">Used / 4 GB</p>
                        </CardContent>
                      </Card>
                      <Card className="border-2">
                        <CardContent className="p-4 text-center">
                          <Wifi className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <h4 className="font-medium">Network</h4>
                          <p className="text-2xl font-bold text-purple-600">45 Mbps</p>
                          <p className="text-sm text-gray-600">Download speed</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Performance Settings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Auto-refresh Data</Label>
                          <p className="text-sm text-gray-600">Automatically refresh data in the background</p>
                        </div>
                        <Switch
                          checked={settings.system?.auto_refresh || true}
                          onCheckedChange={(checked) => updateSetting('system', 'auto_refresh', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Refresh Interval</Label>
                        <Select
                          value={settings.system?.refresh_interval || '30s'}
                          onValueChange={(value) => updateSetting('system', 'refresh_interval', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15s">15 seconds</SelectItem>
                            <SelectItem value="30s">30 seconds</SelectItem>
                            <SelectItem value="1m">1 minute</SelectItem>
                            <SelectItem value="5m">5 minutes</SelectItem>
                            <SelectItem value="manual">Manual only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Enable Caching</Label>
                          <p className="text-sm text-gray-600">Cache frequently accessed data for better performance</p>
                        </div>
                        <Switch
                          checked={settings.system?.enable_caching || true}
                          onCheckedChange={(checked) => updateSetting('system', 'enable_caching', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      Network Settings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Offline Mode</Label>
                          <p className="text-sm text-gray-600">Enable offline functionality when connection is poor</p>
                        </div>
                        <Switch
                          checked={settings.system?.offline_mode || false}
                          onCheckedChange={(checked) => updateSetting('system', 'offline_mode', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Connection Quality</Label>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                          <Wifi className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
