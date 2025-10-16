import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload } from "lucide-react";

export default function OrganizationForm({ organization, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(organization || {
    name: "",
    type: "clinic",
    registration_number: "",
    tax_id: "",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: ""
    },
    contact: {
      phone: "",
      email: "",
      website: "",
      emergency_phone: ""
    },
    logo_url: "",
    settings: {
      timezone: "America/New_York",
      currency: "USD",
      date_format: "MM/DD/YYYY",
      appointment_duration: 30
    },
    subscription: {
      plan: "basic",
      status: "active",
      user_limit: 5,
      patient_limit: 100
    },
    status: "active"
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
    } catch (error) {
      alert("Failed to upload logo. Please try again.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      alert("Please enter organization name");
      return;
    }
    
    if (!formData.type) {
      alert("Please select organization type");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Basic Information</h3>
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <Label>Organization Logo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo}
              className="mt-2"
            />
            {isUploadingLogo && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Uploading...
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Organization Name *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., City Medical Center"
            />
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              required
              value={formData.type}
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
            <Label>Registration Number</Label>
            <Input
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              placeholder="Business registration #"
            />
          </div>
          <div className="space-y-2">
            <Label>Tax ID</Label>
            <Input
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              placeholder="Tax identification #"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              type="tel"
              value={formData.contact.phone}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, phone: e.target.value }
              })}
              placeholder="(123) 456-7890"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.contact.email}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, email: e.target.value }
              })}
              placeholder="contact@organization.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              type="url"
              value={formData.contact.website}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, website: e.target.value }
              })}
              placeholder="https://www.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Emergency Phone</Label>
            <Input
              type="tel"
              value={formData.contact.emergency_phone}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, emergency_phone: e.target.value }
              })}
              placeholder="Emergency contact"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg">Address</h3>
        <div className="space-y-2">
          <Label>Street Address</Label>
          <Input
            value={formData.address.street}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, street: e.target.value }
            })}
            placeholder="123 Main St"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={formData.address.city}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value }
              })}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <Label>State/Province</Label>
            <Input
              value={formData.address.state}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, state: e.target.value }
              })}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <Label>Postal Code</Label>
            <Input
              value={formData.address.postal_code}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, postal_code: e.target.value }
              })}
              placeholder="12345"
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={formData.address.country}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, country: e.target.value }
              })}
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      {/* Subscription Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg">Subscription & Limits</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select
              value={formData.subscription.plan}
              onValueChange={(v) => setFormData({
                ...formData,
                subscription: { ...formData.subscription, plan: v }
              })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>User Limit</Label>
            <Input
              type="number"
              min="1"
              value={formData.subscription.user_limit}
              onChange={(e) => setFormData({
                ...formData,
                subscription: { ...formData.subscription, user_limit: parseInt(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Patient Limit</Label>
            <Input
              type="number"
              min="1"
              value={formData.subscription.patient_limit}
              onChange={(e) => setFormData({
                ...formData,
                subscription: { ...formData.subscription, patient_limit: parseInt(e.target.value) }
              })}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploadingLogo}
          className="bg-gradient-to-r from-blue-500 to-cyan-600"
        >
          {isSubmitting ? "Saving..." : organization ? "Update Organization" : "Create Organization"}
        </Button>
      </div>
    </form>
  );
}