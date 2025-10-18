import React, { useState } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Upload,
  Loader2,
  Save,
  Key,
  Users,
  Settings,
  Activity,
  Bell,
  Calendar,
  Clock,
  MapPin,
  Award,
  GraduationCap,
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import PermissionManager from "../components/profile/PermissionManager";
import OrganizationAssignment from "../components/profile/OrganizationAssignment";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => mockApiClient.auth.me(),
  });

  // Fetch user activity log
  const { data: activityLog = [], isLoading: activityLoading } = useQuery({
    queryKey: ['user-activity', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      // Mock activity data for now
      return [
        {
          id: 1,
          action: 'Profile Updated',
          description: 'Updated personal information',
          timestamp: new Date().toISOString(),
          type: 'profile'
        },
        {
          id: 2,
          action: 'Password Changed',
          description: 'Changed account password',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          type: 'security'
        },
        {
          id: 3,
          action: 'Login',
          description: 'Logged into the system',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          type: 'auth'
        }
      ];
    },
    enabled: !!currentUser?.id
  });

  // Fetch user preferences
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['user-preferences', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      return {
        notifications: {
          email: true,
          push: true,
          sms: false,
          appointment_reminders: true,
          billing_notifications: true,
          system_updates: true
        },
        privacy: {
          profile_visibility: 'organization',
          show_online_status: true,
          allow_direct_messages: true
        },
        appearance: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC'
        }
      };
    },
    enabled: !!currentUser?.id
  });

  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    if (currentUser) {
      console.log('Setting form data from current user:', currentUser);
      setFormData(currentUser);
    }
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.auth.updateMe(data),
    onSuccess: (updatedUser: any) => {
      queryClient.invalidateQueries({ queryKey: ['current_user'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.dismiss("profile-save");
      toast.success("Profile updated successfully");
      // Update the form data with the response
      setFormData(updatedUser);
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast.dismiss("profile-save");
      toast.error(error.message || "Failed to update profile. Please try again.");
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.auth.changePassword(data),
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      console.error('Password change error:', error);
      toast.error(error.message || "Failed to change password. Please try again.");
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const { file_url } = await mockApiClient.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_picture_url: file_url });
      toast.success("Photo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.full_name?.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!formData.email?.trim()) {
      toast.error("Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone numbers if provided
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (formData.mobile && !/^[\d\s\-\+\(\)]+$/.test(formData.mobile)) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    // Check if there are any changes to save
    const hasChanges = Object.keys(formData).some(key => {
      if (key === 'id' || key === 'organization_id' || key === 'organization_name' || key === 'last_login') {
        return false; // Skip system fields
      }
      return formData[key] !== currentUser?.[key];
    });

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    // Show loading state
    toast.loading("Saving profile...", { id: "profile-save" });

    console.log('Submitting profile data:', formData);
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const isSuperAdmin = currentUser?.role === 'admin' && currentUser?.email === 'superadmin@mediflow.com';

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">
              {isSuperAdmin ? "SuperAdmin Account Settings" : "Manage your account and permissions"}
            </p>
          </div>
          {isSuperAdmin && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              SuperAdmin
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span className="hidden sm:inline">Permissions</span>
                </TabsTrigger>
                <TabsTrigger value="organizations" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Org Access</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* ACTIVITY TAB */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Activity Log
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Track your recent account activity and changes
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {activityLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLog.map((activity: any) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {activity.type === 'profile' && <User className="w-5 h-5" />}
                          {activity.type === 'security' && <Shield className="w-5 h-5" />}
                          {activity.type === 'auth' && <Key className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                    {activityLog.length === 0 && (
                      <div className="text-center py-12">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No activity recorded yet</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERENCES TAB */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  Notification Preferences
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Customize how you receive notifications
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {preferencesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium">Appointment Reminders</Label>
                            <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
                          </div>
                          <Switch
                            checked={userPreferences?.notifications?.appointment_reminders || false}
                            onCheckedChange={(checked) => {
                              // Handle preference update
                              toast.success("Preference updated");
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium">Billing Notifications</Label>
                            <p className="text-sm text-gray-600">Receive notifications about billing and payments</p>
                          </div>
                          <Switch
                            checked={userPreferences?.notifications?.billing_notifications || false}
                            onCheckedChange={(checked) => {
                              // Handle preference update
                              toast.success("Preference updated");
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium">System Updates</Label>
                            <p className="text-sm text-gray-600">Get notified about system updates and maintenance</p>
                          </div>
                          <Switch
                            checked={userPreferences?.notifications?.system_updates || false}
                            onCheckedChange={(checked) => {
                              // Handle preference update
                              toast.success("Preference updated");
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Privacy Settings
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Profile Visibility</Label>
                          <Select
                            value={userPreferences?.privacy?.profile_visibility || 'organization'}
                            onValueChange={(value) => {
                              // Handle preference update
                              toast.success("Preference updated");
                            }}
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
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium">Show Online Status</Label>
                            <p className="text-sm text-gray-600">Let others see when you're online</p>
                          </div>
                          <Switch
                            checked={userPreferences?.privacy?.show_online_status || false}
                            onCheckedChange={(checked) => {
                              // Handle preference update
                              toast.success("Preference updated");
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium">Allow Direct Messages</Label>
                            <p className="text-sm text-gray-600">Allow other users to send you direct messages</p>
                          </div>
                          <Switch
                            checked={userPreferences?.privacy?.allow_direct_messages || false}
                            onCheckedChange={(checked) => {
                              // Handle preference update
                              toast.success("Preference updated");
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Appearance
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Theme</Label>
                          <Select
                            value={userPreferences?.appearance?.theme || 'light'}
                            onValueChange={(value) => {
                              // Handle preference update
                              toast.success("Theme updated");
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Language</Label>
                          <Select
                            value={userPreferences?.appearance?.language || 'en'}
                            onValueChange={(value) => {
                              // Handle preference update
                              toast.success("Language updated");
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Timezone</Label>
                          <Select
                            value={userPreferences?.appearance?.timezone || 'UTC'}
                            onValueChange={(value) => {
                              // Handle preference update
                              toast.success("Timezone updated");
                            }}
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
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle>{"Personal Information"}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                      {formData.profile_picture_url ? (
                        <img
                          src={formData.profile_picture_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentUser?.full_name?.charAt(0) || "U"
                      )}
                    </div>
                    <div>
                      <Label>{"Profile Photo"}</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="profile-photo"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('profile-photo').click()}
                          disabled={isUploadingPhoto}
                        >
                          {isUploadingPhoto ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload className="w-4 h-4 mr-2" /> Upload Photo</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{"Full Name"}</Label>
                      <Input
                        value={formData.full_name || ""}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{"Email"}</Label>
                      <Input
                        type="email"
                        value={formData.email || ""}
                        readOnly
                        className="bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label>{"Phone"}</Label>
                      <Input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{"Mobile"}</Label>
                      <Input
                        type="tel"
                        value={formData.mobile || ""}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{"Job Title"}</Label>
                      <Input
                        value={formData.job_title || ""}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="Your job title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{"Department"}</Label>
                      <Input
                        value={formData.department || ""}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Your department"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{"Specialization"}</Label>
                      <Input
                        value={formData.specialization || ""}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="Your specialization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{"License Number"}</Label>
                      <Input
                        value={formData.licenseNumber || ""}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        placeholder="Your license number"
                      />
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="space-y-2">
                    <Label>{"Qualifications"}</Label>
                    <Textarea
                      value={formData.qualifications || ""}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                      placeholder="Enter your qualifications (comma-separated)"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">Separate multiple qualifications with commas</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label>{"Professional Bio"}</Label>
                    <Textarea
                      value={formData.bio || ""}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  {/* Current Organization */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-10 h-10 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Current Organization</p>
                          <p className="font-semibold text-gray-900">
                            {currentUser?.organization_name || "No organization"}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {currentUser?.role}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600"
                    >
                      {updateProfileMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            {/* Password Change */}
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{"Current Password"}</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{"New Password"}</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{"Confirm New Password"}</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600"
                    >
                      {changePasswordMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Changing...</>
                      ) : (
                        <><Key className="w-4 h-4 mr-2" /> Change Password</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle>{"Account Information"}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Account Status</p>
                      <p className="text-sm text-gray-600">Your account is currently active</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Role</p>
                      <p className="text-sm text-gray-600">Your current system role</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">{currentUser?.role}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Last Login</p>
                      <p className="text-sm text-gray-600">When you last accessed the system</p>
                    </div>
                    <p className="text-sm font-medium">
                      {currentUser?.last_login ? new Date(currentUser.last_login).toLocaleString() : "Just now"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => mockApiClient.auth.logout()}
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERMISSIONS TAB (SuperAdmin Only) */}
          {isSuperAdmin && (
            <TabsContent value="permissions">
              <PermissionManager />
            </TabsContent>
          )}

          {/* ORGANIZATION ACCESS TAB (SuperAdmin Only) */}
          {isSuperAdmin && (
            <TabsContent value="organizations">
              <OrganizationAssignment />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}