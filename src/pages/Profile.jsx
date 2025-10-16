import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
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
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import PermissionManager from "../components/profile/PermissionManager";
import OrganizationAssignment from "../components/profile/OrganizationAssignment";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (currentUser) {
      setFormData(currentUser);
    }
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current_user'] });
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_picture_url: file_url });
      toast.success("Photo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
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

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Personal Information</CardTitle>
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
                      <Label>Profile Photo</Label>
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
                      <Label>Full Name</Label>
                      <Input
                        value={formData.full_name || ""}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
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
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile</Label>
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
                      <Label>Job Title</Label>
                      <Input
                        value={formData.job_title || ""}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="Your job title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input
                        value={formData.specialization || ""}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="Your specialization"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label>Professional Bio</Label>
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
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Account Settings</CardTitle>
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
                    onClick={() => base44.auth.logout()}
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