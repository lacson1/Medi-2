import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TelemedicineForm({ session, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(session || {
    session_date: new Date().toISOString().slice(0, 16),
    session_topic: "",
    status: "scheduled",
    meeting_link: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Session Topic *</Label>
        <Input required value={formData.session_topic} onChange={e => setFormData({...formData, session_topic: e.target.value})} placeholder="e.g., Follow-up Consultation" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date & Time *</Label>
          <Input type="datetime-local" required value={formData.session_date} onChange={e => setFormData({...formData, session_date: e.target.value})} />
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
      </div>
      <div className="space-y-2">
        <Label>Meeting Link</Label>
        <Input value={formData.meeting_link} onChange={e => setFormData({...formData, meeting_link: e.target.value})} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Additional details about the session..." />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Session"}</Button>
      </div>
    </form>
  );
}