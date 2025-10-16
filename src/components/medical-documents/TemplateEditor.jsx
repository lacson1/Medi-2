import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function TemplateEditor({ template, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(template || {
    template_name: "",
    document_type: "sick_note",
    template_content: "",
    description: "",
    variables: [],
    is_active: true,
    category: "general"
  });

  const [newVariable, setNewVariable] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
    default_value: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addVariable = () => {
    if (newVariable.name && newVariable.label) {
      setFormData({
        ...formData,
        variables: [...(formData.variables || []), { ...newVariable }]
      });
      setNewVariable({
        name: "",
        label: "",
        type: "text",
        required: false,
        options: [],
        default_value: ""
      });
    }
  };

  const removeVariable = (index) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Template Name *</Label>
          <Input
            required
            value={formData.template_name}
            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
            placeholder="e.g., Standard Sick Note"
          />
        </div>
        <div className="space-y-2">
          <Label>Document Type *</Label>
          <Select
            required
            value={formData.document_type}
            onValueChange={(v) => setFormData({ ...formData, document_type: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sick_note">Sick Note</SelectItem>
              <SelectItem value="medical_letter">Medical Letter</SelectItem>
              <SelectItem value="insurance_letter">Insurance Letter</SelectItem>
              <SelectItem value="disability_certificate">Disability Certificate</SelectItem>
              <SelectItem value="fitness_certificate">Fitness Certificate</SelectItem>
              <SelectItem value="referral_letter">Referral Letter</SelectItem>
              <SelectItem value="prescription_letter">Prescription Letter</SelectItem>
              <SelectItem value="medical_report">Medical Report</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="specialist">Specialist</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="employment">Employment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex items-center justify-between pt-6">
          <Label>Is Active</Label>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="When should this template be used?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Template Content *</Label>
        <Textarea
          required
          value={formData.template_content}
          onChange={(e) => setFormData({ ...formData, template_content: e.target.value })}
          placeholder="Use placeholders like: {{patient_name}}, {{date}}, {{diagnosis}}, etc."
          rows={10}
          className="font-mono text-sm"
        />
        <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Available Placeholders:</p>
            <p>
              {'{{patient_name}}'}, {'{{date}}'}, {'{{patient_dob}}'}, {'{{patient_address}}'}, {'{{doctor_name}}'}, {'{{clinic_name}}'} + any custom variables you add below
            </p>
          </div>
        </div>
      </div>

      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Custom Variables</h3>
          
          {formData.variables && formData.variables.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.variables.map((variable, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-sm">{variable.label}</span>
                    <Badge className="ml-2 text-xs">{`{{${variable.name}}}`}</Badge>
                    <Badge variant="outline" className="ml-2 text-xs">{variable.type}</Badge>
                    {variable.required && <Badge className="ml-2 text-xs bg-red-100 text-red-800">Required</Badge>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariable(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Variable name (e.g., diagnosis)"
              value={newVariable.name}
              onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
            />
            <Input
              placeholder="Display label (e.g., Diagnosis)"
              value={newVariable.label}
              onChange={(e) => setNewVariable({ ...newVariable, label: e.target.value })}
            />
            <Select
              value={newVariable.type}
              onValueChange={(v) => setNewVariable({ ...newVariable, type: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="textarea">Long Text</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="select">Dropdown</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={newVariable.required}
                onCheckedChange={(v) => setNewVariable({ ...newVariable, required: v })}
              />
              <span className="text-sm">Required</span>
            </div>
          </div>
          <Button type="button" onClick={addVariable} variant="outline" className="w-full mt-3">
            <Plus className="w-4 h-4 mr-2" />
            Add Variable
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : template ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}