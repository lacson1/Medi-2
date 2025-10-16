import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function SurgeryForm({ surgery, patient, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(surgery || {
    surgery_name: "",
    surgery_date: new Date().toISOString().slice(0, 16),
    surgeon_name: "",
    anesthesiologist: "",
    surgery_type: "elective",
    status: "scheduled",
    pre_op_diagnosis: "",
    post_op_diagnosis: "",
    procedure_details: "",
    complications: "",
    estimated_duration: "",
    actual_duration: "",
    blood_loss: "",
    anesthesia_type: "general",
    operating_room: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Surgery Name *</Label>
        <Input required value={formData.surgery_name} onChange={e => setFormData({...formData, surgery_name: e.target.value})} placeholder="e.g., Appendectomy" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Surgery Date & Time *</Label>
          <Input type="datetime-local" required value={formData.surgery_date} onChange={e => setFormData({...formData, surgery_date: e.target.value})} />
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
              <SelectItem value="postponed">Postponed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Surgeon Name *</Label>
          <Input required value={formData.surgeon_name} onChange={e => setFormData({...formData, surgeon_name: e.target.value})} placeholder="Dr. Smith" />
        </div>
        <div className="space-y-2">
          <Label>Anesthesiologist</Label>
          <Input value={formData.anesthesiologist} onChange={e => setFormData({...formData, anesthesiologist: e.target.value})} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Surgery Type</Label>
          <Select value={formData.surgery_type} onValueChange={v => setFormData({...formData, surgery_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="elective">Elective</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Anesthesia Type</Label>
          <Select value={formData.anesthesia_type} onValueChange={v => setFormData({...formData, anesthesia_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="sedation">Sedation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Operating Room</Label>
          <Input value={formData.operating_room} onChange={e => setFormData({...formData, operating_room: e.target.value})} placeholder="OR-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Pre-op Diagnosis</Label>
          <Textarea value={formData.pre_op_diagnosis} onChange={e => setFormData({...formData, pre_op_diagnosis: e.target.value})} rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Post-op Diagnosis</Label>
          <Textarea value={formData.post_op_diagnosis} onChange={e => setFormData({...formData, post_op_diagnosis: e.target.value})} rows={2} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Procedure Details</Label>
        <Textarea value={formData.procedure_details} onChange={e => setFormData({...formData, procedure_details: e.target.value})} rows={3} placeholder="Detailed description of surgical procedure performed..." />
      </div>
      <div className="space-y-2">
        <Label>Complications</Label>
        <Textarea value={formData.complications} onChange={e => setFormData({...formData, complications: e.target.value})} rows={2} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Est. Duration (min)</Label>
          <Input type="number" value={formData.estimated_duration} onChange={e => setFormData({...formData, estimated_duration: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Actual Duration (min)</Label>
          <Input type="number" value={formData.actual_duration} onChange={e => setFormData({...formData, actual_duration: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Blood Loss (mL)</Label>
          <Input value={formData.blood_loss} onChange={e => setFormData({...formData, blood_loss: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Surgery"}</Button>
      </div>
    </form>
  );
}