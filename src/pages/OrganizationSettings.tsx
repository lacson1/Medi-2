import React, { useState } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationSettings() {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: loadingUser } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => mockApiClient.auth.me(),
  });

  const { data: organization, isLoading: loadingOrg } = useQuery({
    queryKey: ['organization', currentUser?.organization_id],
    queryFn: async () => {
      if (!currentUser?.organization_id) return null;
      const orgs = await mockApiClient.entities.Organization.filter({ id: currentUser.organization_id });
      return orgs[0] || null;
    },
    enabled: !!currentUser?.organization_id,
  });

  const [formData, setFormData] = useState(organization || {});

  React.useEffect(() => {
    if (organization) {
      setFormData(organization);
    }
  }, [organization]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Organization.update(organization.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success("Organization settings updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update organization settings");
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await mockApiClient.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (loadingUser || loadingOrg) {
    return (
      <div className="p-8">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No organization found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
          <p className="text-gray-600 mt-1">Manage your organization's information and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle>{"Basic Information"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <Label>{"Organization Logo"}</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload').click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{"Organization Name *"}</Label>
                  <Input
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Type *"}</Label>
                  <Select
                    value={formData.type || "clinic"}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="private_practice">Private Practice</SelectItem>
                      <SelectItem value="health_center">Health Center</SelectItem>
                      <SelectItem value="specialty_center">Specialty Center</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{"Registration Number"}</Label>
                  <Input
                    value={formData.registration_number || ""}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Tax ID"}</Label>
                  <Input
                    value={formData.tax_id || ""}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle>{"Contact Information"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{"Phone"}</Label>
                  <Input
                    value={formData.contact?.phone || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Email"}</Label>
                  <Input
                    type="email"
                    value={formData.contact?.email || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Website"}</Label>
                  <Input
                    value={formData.contact?.website || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, website: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Emergency Phone"}</Label>
                  <Input
                    value={formData.contact?.emergency_phone || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, emergency_phone: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle>{"Address"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>{"Street Address"}</Label>
                <Input
                  value={formData.address?.street || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{"City"}</Label>
                  <Input
                    value={formData.address?.city || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{State/Province}</Label>
                  <Input
                    value={formData.address?.state || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Postal Code"}</Label>
                  <Input
                    value={formData.address?.postal_code || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, postal_code: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Country"}</Label>
                  <Input
                    value={formData.address?.country || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, country: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-cyan-600"
            >
              {updateMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}