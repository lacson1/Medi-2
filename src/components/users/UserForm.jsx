import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function UserForm({ user, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(user || {
    job_title: "",
    user_role: "doctor",
    department: "medical",
    phone: "",
    mobile: "",
    specialization: "",
    license_number: "",
    license_expiry: "",
    qualifications: [],
    certifications: [],
    years_of_experience: 0,
    languages: [],
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: ""
    },
    emergency_contact: {
      name: "",
      relationship: "",
      phone: ""
    },
    employment_type: "full_time",
    date_of_joining: new Date().toISOString().split('T')[0],
    shift: "day",
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    status: "active",
    profile_picture_url: "",
    bio: "",
    consultation_fee: 0,
    npi_number: "",
    dea_number: ""
  });

  const [newQualification, setNewQualification] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_picture_url: file_url });
    } catch (error) {
      alert("Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const addItem = (field, value, setterFn) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
      setterFn("");
    }
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.job_title) {
      alert("Please enter a job title");
      return;
    }
    
    if (!formData.phone && !formData.mobile) {
      alert("Please enter at least one phone number");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="contact">Contact & Address</TabsTrigger>
        </TabsList>

        {/* BASIC INFO TAB */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {formData.profile_picture_url ? (
                    <img src={formData.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <Label>Upload Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="mt-2"
                  />
                  {isUploadingPhoto && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input 
                required 
                value={formData.job_title} 
                onChange={e => setFormData({...formData, job_title: e.target.value})} 
                placeholder="e.g., Senior Cardiologist"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select required value={formData.user_role} onValueChange={v => setFormData({...formData, user_role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="lab_technician">Lab Technician</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="billing_staff">Billing Staff</SelectItem>
                  <SelectItem value="medical_assistant">Medical Assistant</SelectItem>
                  <SelectItem value="radiologist">Radiologist</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select required value={formData.department} onValueChange={v => setFormData({...formData, department: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="reception">Reception</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio / About</Label>
            <Textarea 
              value={formData.bio} 
              onChange={e => setFormData({...formData, bio: e.target.value})} 
              placeholder="Professional biography or introduction..."
              rows={4}
            />
          </div>
        </TabsContent>

        {/* PROFESSIONAL TAB */}
        <TabsContent value="professional" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input 
                value={formData.specialization} 
                onChange={e => setFormData({...formData, specialization: e.target.value})} 
                placeholder="e.g., Cardiology, Pediatrics"
              />
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input 
                type="number"
                min="0"
                value={formData.years_of_experience} 
                onChange={e => setFormData({...formData, years_of_experience: parseInt(e.target.value) || 0})} 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Medical License Number</Label>
              <Input 
                value={formData.license_number} 
                onChange={e => setFormData({...formData, license_number: e.target.value})} 
                placeholder="License #"
              />
            </div>
            <div className="space-y-2">
              <Label>License Expiry Date</Label>
              <Input 
                type="date"
                value={formData.license_expiry} 
                onChange={e => setFormData({...formData, license_expiry: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NPI Number (US)</Label>
              <Input 
                value={formData.npi_number} 
                onChange={e => setFormData({...formData, npi_number: e.target.value})} 
                placeholder="National Provider Identifier"
              />
            </div>
            <div className="space-y-2">
              <Label>DEA Number</Label>
              <Input 
                value={formData.dea_number} 
                onChange={e => setFormData({...formData, dea_number: e.target.value})} 
                placeholder="For prescribing controlled substances"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Consultation Fee ($)</Label>
            <Input 
              type="number"
              min="0"
              step="0.01"
              value={formData.consultation_fee} 
              onChange={e => setFormData({...formData, consultation_fee: parseFloat(e.target.value) || 0})} 
              placeholder="0.00"
            />
          </div>

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={newQualification}
                  onChange={e => setNewQualification(e.target.value)}
                  placeholder="e.g., MD, MBBS, BSN, MSN"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addItem('qualifications', newQualification, setNewQualification))}
                />
                <Button type="button" onClick={() => addItem('qualifications', newQualification, setNewQualification)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.qualifications || []).map((qual, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {qual}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('qualifications', idx)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={newCertification}
                  onChange={e => setNewCertification(e.target.value)}
                  placeholder="e.g., ACLS, BLS, PALS"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addItem('certifications', newCertification, setNewCertification))}
                />
                <Button type="button" onClick={() => addItem('certifications', newCertification, setNewCertification)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.certifications || []).map((cert, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {cert}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('certifications', idx)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Languages Spoken</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={newLanguage}
                  onChange={e => setNewLanguage(e.target.value)}
                  placeholder="e.g., English, Spanish, French"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addItem('languages', newLanguage, setNewLanguage))}
                />
                <Button type="button" onClick={() => addItem('languages', newLanguage, setNewLanguage)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.languages || []).map((lang, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {lang}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('languages', idx)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMPLOYMENT TAB */}
        <TabsContent value="employment" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={formData.employment_type} onValueChange={v => setFormData({...formData, employment_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Shift</Label>
              <Select value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day Shift</SelectItem>
                  <SelectItem value="night">Night Shift</SelectItem>
                  <SelectItem value="rotating">Rotating</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date of Joining</Label>
              <Input 
                type="date"
                value={formData.date_of_joining} 
                onChange={e => setFormData({...formData, date_of_joining: e.target.value})} 
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.availability[day]}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        availability: { ...formData.availability, [day]: checked }
                      })}
                    />
                    <Label htmlFor={day} className="capitalize cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT & ADDRESS TAB */}
        <TabsContent value="contact" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Office Phone *</Label>
              <Input 
                required 
                type="tel"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="(123) 456-7890"
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile Phone</Label>
              <Input 
                type="tel"
                value={formData.mobile} 
                onChange={e => setFormData({...formData, mobile: e.target.value})} 
                placeholder="(123) 456-7890"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input 
                  value={formData.address?.street || ""} 
                  onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} 
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    value={formData.address?.city || ""} 
                    onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input 
                    value={formData.address?.state || ""} 
                    onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input 
                    value={formData.address?.postal_code || ""} 
                    onChange={e => setFormData({...formData, address: {...formData.address, postal_code: e.target.value}})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input 
                    value={formData.address?.country || ""} 
                    onChange={e => setFormData({...formData, address: {...formData.address, country: e.target.value}})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input 
                    value={formData.emergency_contact?.name || ""} 
                    onChange={e => setFormData({...formData, emergency_contact: {...formData.emergency_contact, name: e.target.value}})} 
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input 
                    value={formData.emergency_contact?.relationship || ""} 
                    onChange={e => setFormData({...formData, emergency_contact: {...formData.emergency_contact, relationship: e.target.value}})} 
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  type="tel"
                  value={formData.emergency_contact?.phone || ""} 
                  onChange={e => setFormData({...formData, emergency_contact: {...formData.emergency_contact, phone: e.target.value}})} 
                  placeholder="(123) 456-7890"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save User"}
        </Button>
      </div>
    </form>
  );
}