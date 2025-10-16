import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function ConsentForm({ consent, patient, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(consent || {
    consent_type: "treatment",
    consent_title: "",
    consent_date: new Date().toISOString().slice(0, 16),
    consent_details: "",
    risks_explained: false,
    witness_name: "",
    obtained_by: "",
    consent_form_url: "",
    status: "obtained",
    expiry_date: "",
    notes: ""
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let submissionData = { ...formData };
    if (file) {
      setIsUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        submissionData.consent_form_url = file_url;
      } catch (error) {
        console.error("File upload failed", error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Consent Type *</Label>
          <Select required value={formData.consent_type} onValueChange={v => setFormData({...formData, consent_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="treatment">Treatment</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="anesthesia">Anesthesia</SelectItem>
              <SelectItem value="procedure">Procedure</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="privacy">Privacy/HIPAA</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="obtained">Obtained</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Consent Title *</Label>
        <Input required value={formData.consent_title} onChange={e => setFormData({...formData, consent_title: e.target.value})} placeholder="e.g., Consent for Surgical Procedure" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date Obtained *</Label>
          <Input type="datetime-local" required value={formData.consent_date} onChange={e => setFormData({...formData, consent_date: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Expiry Date (if applicable)</Label>
          <Input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Consent Details</Label>
        <Textarea value={formData.consent_details} onChange={e => setFormData({...formData, consent_details: e.target.value})} rows={3} placeholder="Detailed description of what patient consented to..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Obtained By</Label>
          <Input value={formData.obtained_by} onChange={e => setFormData({...formData, obtained_by: e.target.value})} placeholder="Provider name" />
        </div>
        <div className="space-y-2">
          <Label>Witness Name</Label>
          <Input value={formData.witness_name} onChange={e => setFormData({...formData, witness_name: e.target.value})} />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="risks_explained"
          checked={formData.risks_explained}
          onCheckedChange={(checked) => setFormData({...formData, risks_explained: checked})}
        />
        <Label htmlFor="risks_explained" className="cursor-pointer">Risks and benefits were explained to patient</Label>
      </div>
      <div className="space-y-2">
        <Label>Signed Consent Form</Label>
        <Input type="file" onChange={e => setFile(e.target.files[0])} />
        {formData.consent_form_url && !file && <a href={formData.consent_form_url} target="_blank" className="text-sm text-blue-600">View current file</a>}
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Consent"}
        </Button>
      </div>
    </form>
  );
}