
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function PrescriptionForm({ prescription, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(prescription || {
    medication_name: "",
    dosage: "",
    frequency: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    prescribing_doctor: "",
    status: "active",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.medication_name) {
      alert("Please enter medication name");
      return;
    }
    
    if (!formData.dosage) {
      alert("Please enter dosage");
      return;
    }
    
    if (!formData.frequency) {
      alert("Please enter frequency");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Medication Name *</Label>
        <Input 
          required 
          value={formData.medication_name} 
          onChange={e => setFormData({...formData, medication_name: e.target.value})} 
          placeholder="e.g., Amoxicillin"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dosage *</Label>
          <Input 
            required 
            value={formData.dosage} 
            onChange={e => setFormData({...formData, dosage: e.target.value})} 
            placeholder="e.g., 500mg" 
          />
        </div>
        <div className="space-y-2">
          <Label>Frequency *</Label>
          <Input 
            required 
            value={formData.frequency} 
            onChange={e => setFormData({...formData, frequency: e.target.value})} 
            placeholder="e.g., Twice a day" 
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Input 
            type="date" 
            required 
            value={formData.start_date} 
            onChange={e => setFormData({...formData, start_date: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input 
            type="date" 
            value={formData.end_date} 
            onChange={e => setFormData({...formData, end_date: e.target.value})} 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Prescribing Doctor</Label>
        <Input 
          value={formData.prescribing_doctor} 
          onChange={e => setFormData({...formData, prescribing_doctor: e.target.value})} 
          placeholder="Doctor's name"
        />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="discontinued">Discontinued</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea 
          value={formData.notes} 
          onChange={e => setFormData({...formData, notes: e.target.value})} 
          placeholder="Special instructions or notes..."
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Prescription"}
        </Button>
      </div>
    </form>
  );
}
