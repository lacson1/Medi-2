
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AllergyField, ConditionField, InsuranceField } from "@/components/forms/EnhancedFormFields";

export default function PatientForm({ patient, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(patient || {
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    blood_type: "unknown",
    allergies: [],
    medical_conditions: [],
    medications: [],
    emergency_contact: {},
    insurance_provider: "",
    insurance_id: "",
    status: "active"
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.first_name || !formData.last_name) {
      alert("First name and last name are required");
      return;
    }

    if (!formData.date_of_birth) {
      alert("Date of birth is required");
      return;
    }

    onSubmit(formData);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()]
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: any) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        medical_conditions: [...(prev.medical_conditions || []), newCondition.trim()]
      }));
      setNewCondition("");
    }
  };

  const removeCondition = (index: any) => {
    setFormData(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions.filter((_, i) => i !== index)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-none shadow-xl mb-8">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle>{patient ? "Edit Patient" : "New Patient"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{"First Name *"}</Label>
                <Input
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Last Name *"}</Label>
                <Input
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Date of Birth *"}</Label>
                <Input
                  required
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{"Gender"}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{"Phone"}</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(123) 456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Email"}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Blood Type"}</Label>
                <Select
                  value={formData.blood_type}
                  onValueChange={(value) => setFormData({ ...formData, blood_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{"Status"}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{"Address"}</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                placeholder="Enter full address"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <InsuranceField
                  name="insurance_provider"
                  label="Insurance Provider"
                  placeholder="Select insurance provider"
                  value={formData.insurance_provider}
                  onChange={(value) => setFormData({ ...formData, insurance_provider: value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{"Insurance ID"}</Label>
                <Input
                  value={formData.insurance_id}
                  onChange={(e) => setFormData({ ...formData, insurance_id: e.target.value })}
                  placeholder="Enter insurance ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{"Allergies"}</Label>
              <div className="flex gap-2">
                <AllergyField
                  name="newAllergy"
                  placeholder="Add allergy (e.g., Penicillin, Shellfish)"
                  value={newAllergy}
                  onChange={(value) => setNewAllergy(value)}
                  onSelect={(suggestion) => {
                    setNewAllergy(suggestion.label);
                    addAllergy();
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={addAllergy} size="icon" aria-label="Add allergy">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.allergies?.map((allergy, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700 gap-1">
                    {allergy}
                    <button type="button" onClick={() => removeAllergy(idx)} aria-label={`Remove ${allergy} allergy`}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{"Medical Conditions"}</Label>
              <div className="flex gap-2">
                <ConditionField
                  name="newCondition"
                  placeholder="Add condition (e.g., Hypertension, Diabetes)"
                  value={newCondition}
                  onChange={(value) => setNewCondition(value)}
                  onSelect={(suggestion) => {
                    setNewCondition(suggestion.label);
                    addCondition();
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={addCondition} size="icon" aria-label="Add medical condition">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.medical_conditions?.map((condition, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {condition}
                    <button type="button" onClick={() => removeCondition(idx)} aria-label={`Remove ${condition} condition`}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {isSubmitting ? "Saving..." : patient ? "Update Patient" : "Add Patient"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
