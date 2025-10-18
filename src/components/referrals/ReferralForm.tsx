import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ReferralForm({ referral, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(referral || {
    referred_to: "",
    specialty: "",
    reason: "",
    date_referred: new Date().toISOString().split('T')[0],
    status: "pending",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.referred_to) {
      alert("Please enter who the patient is being referred to");
      return;
    }
    
    if (!formData.reason) {
      alert("Please enter the reason for referral");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Referred To *"}</Label>
          <Input 
            required 
            value={formData.referred_to} 
            onChange={e => setFormData({...formData, referred_to: e.target.value})} 
            placeholder="Doctor/Specialist name"
          />
        </div>
        <div className="space-y-2">
          <Label>{"Specialty"}</Label>
          <Input 
            value={formData.specialty} 
            onChange={e => setFormData({...formData, specialty: e.target.value})} 
            placeholder="e.g., Cardiology"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Date Referred *"}</Label>
          <Input 
            type="date" 
            required 
            value={formData.date_referred} 
            onChange={e => setFormData({...formData, date_referred: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <Label>{"Status"}</Label>
          <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>{"Reason for Referral *"}</Label>
        <Textarea 
          required
          value={formData.reason} 
          onChange={e => setFormData({...formData, reason: e.target.value})} 
          placeholder="Detailed reason for referral..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>{"Additional Notes"}</Label>
        <Textarea 
          value={formData.notes} 
          onChange={e => setFormData({...formData, notes: e.target.value})} 
          placeholder="Any additional information..."
          rows={2}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Referral"}
        </Button>
      </div>
    </form>
  );
}