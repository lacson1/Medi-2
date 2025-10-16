import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function VaccinationForm({ vaccination, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(vaccination || {
    vaccine_name: "",
    date_administered: new Date().toISOString().split('T')[0],
    administrator: "",
    lot_number: "",
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
          <Label>Vaccine Name *</Label>
          <Input required value={formData.vaccine_name} onChange={e => setFormData({...formData, vaccine_name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Date Administered *</Label>
          <Input type="date" required value={formData.date_administered} onChange={e => setFormData({...formData, date_administered: e.target.value})} />
        </div>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Administrator</Label>
          <Input value={formData.administrator} onChange={e => setFormData({...formData, administrator: e.target.value})} placeholder="e.g., Jane Doe, RN" />
        </div>
        <div className="space-y-2">
          <Label>Lot Number</Label>
          <Input value={formData.lot_number} onChange={e => setFormData({...formData, lot_number: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g., Administered in left deltoid" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Vaccination"}</Button>
      </div>
    </form>
  );
}