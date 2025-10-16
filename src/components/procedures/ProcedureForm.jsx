import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProcedureForm({ procedure, patient, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(procedure || {
    procedure_name: "",
    procedure_date: new Date().toISOString().slice(0, 16),
    performed_by: "",
    procedure_type: "therapeutic",
    location: "",
    indication: "",
    procedure_details: "",
    findings: "",
    complications: "",
    specimens_collected: "",
    status: "completed",
    follow_up_required: false,
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Procedure Name *</Label>
        <Input required value={formData.procedure_name} onChange={e => setFormData({...formData, procedure_name: e.target.value})} placeholder="e.g., Colonoscopy" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Procedure Date & Time *</Label>
          <Input type="datetime-local" required value={formData.procedure_date} onChange={e => setFormData({...formData, procedure_date: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Performed By *</Label>
          <Input required value={formData.performed_by} onChange={e => setFormData({...formData, performed_by: e.target.value})} placeholder="Provider name" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Procedure Type</Label>
          <Select value={formData.procedure_type} onValueChange={v => setFormData({...formData, procedure_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="diagnostic">Diagnostic</SelectItem>
              <SelectItem value="therapeutic">Therapeutic</SelectItem>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Exam Room 1" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Indication</Label>
        <Input value={formData.indication} onChange={e => setFormData({...formData, indication: e.target.value})} placeholder="Reason for procedure" />
      </div>
      <div className="space-y-2">
        <Label>Procedure Details</Label>
        <Textarea value={formData.procedure_details} onChange={e => setFormData({...formData, procedure_details: e.target.value})} rows={3} placeholder="Description of what was done..." />
      </div>
      <div className="space-y-2">
        <Label>Findings</Label>
        <Textarea value={formData.findings} onChange={e => setFormData({...formData, findings: e.target.value})} rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Complications</Label>
        <Textarea value={formData.complications} onChange={e => setFormData({...formData, complications: e.target.value})} rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Specimens Collected</Label>
        <Input value={formData.specimens_collected} onChange={e => setFormData({...formData, specimens_collected: e.target.value})} />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="follow_up_required"
          checked={formData.follow_up_required}
          onCheckedChange={(checked) => setFormData({...formData, follow_up_required: checked})}
        />
        <Label htmlFor="follow_up_required" className="cursor-pointer">Follow-up required</Label>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Procedure"}</Button>
      </div>
    </form>
  );
}