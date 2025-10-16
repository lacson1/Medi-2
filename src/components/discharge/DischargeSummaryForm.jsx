import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function DischargeSummaryForm({ summary, patient, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(summary || {
    admission_date: new Date().toISOString().slice(0, 16),
    discharge_date: new Date().toISOString().slice(0, 16),
    admitting_diagnosis: "",
    discharge_diagnosis: "",
    hospital_course: "",
    procedures_performed: "",
    discharge_medications: [],
    discharge_instructions: "",
    follow_up_appointments: "",
    diet_instructions: "",
    activity_restrictions: "",
    condition_at_discharge: "improved",
    discharge_disposition: "home",
    attending_physician: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Admission Date *</Label>
          <Input type="datetime-local" required value={formData.admission_date} onChange={e => setFormData({...formData, admission_date: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Discharge Date *</Label>
          <Input type="datetime-local" required value={formData.discharge_date} onChange={e => setFormData({...formData, discharge_date: e.target.value})} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Admitting Diagnosis *</Label>
          <Textarea required value={formData.admitting_diagnosis} onChange={e => setFormData({...formData, admitting_diagnosis: e.target.value})} rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Discharge Diagnosis *</Label>
          <Textarea required value={formData.discharge_diagnosis} onChange={e => setFormData({...formData, discharge_diagnosis: e.target.value})} rows={2} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Hospital Course</Label>
        <Textarea value={formData.hospital_course} onChange={e => setFormData({...formData, hospital_course: e.target.value})} rows={4} placeholder="Summary of patient's hospital stay..." />
      </div>
      <div className="space-y-2">
        <Label>Procedures Performed</Label>
        <Textarea value={formData.procedures_performed} onChange={e => setFormData({...formData, procedures_performed: e.target.value})} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Condition at Discharge</Label>
          <Select value={formData.condition_at_discharge} onValueChange={v => setFormData({...formData, condition_at_discharge: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="improved">Improved</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="worsened">Worsened</SelectItem>
              <SelectItem value="deceased">Deceased</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Discharge Disposition</Label>
          <Select value={formData.discharge_disposition} onValueChange={v => setFormData({...formData, discharge_disposition: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="home_with_services">Home with Services</SelectItem>
              <SelectItem value="rehab">Rehabilitation Facility</SelectItem>
              <SelectItem value="nursing_facility">Nursing Facility</SelectItem>
              <SelectItem value="other_hospital">Other Hospital</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Discharge Instructions</Label>
        <Textarea value={formData.discharge_instructions} onChange={e => setFormData({...formData, discharge_instructions: e.target.value})} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Diet Instructions</Label>
          <Input value={formData.diet_instructions} onChange={e => setFormData({...formData, diet_instructions: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Activity Restrictions</Label>
          <Input value={formData.activity_restrictions} onChange={e => setFormData({...formData, activity_restrictions: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Follow-up Appointments</Label>
        <Textarea value={formData.follow_up_appointments} onChange={e => setFormData({...formData, follow_up_appointments: e.target.value})} rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Attending Physician</Label>
        <Input value={formData.attending_physician} onChange={e => setFormData({...formData, attending_physician: e.target.value})} placeholder="Dr. Smith" />
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Discharge Summary"}</Button>
      </div>
    </form>
  );
}