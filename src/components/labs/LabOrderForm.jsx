import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function LabOrderForm({ labOrder, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(labOrder || {
    test_name: "",
    date_ordered: new Date().toISOString().split('T')[0],
    ordering_doctor: "",
    status: "ordered",
    results_summary: "",
    result_file_url: ""
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
            submissionData.result_file_url = file_url;
            submissionData.status = 'completed';
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
      <div className="space-y-2">
        <Label>Test Name *</Label>
        <Input required value={formData.test_name} onChange={e => setFormData({...formData, test_name: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date Ordered *</Label>
          <Input type="date" required value={formData.date_ordered} onChange={e => setFormData({...formData, date_ordered: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Ordering Doctor</Label>
          <Input value={formData.ordering_doctor} onChange={e => setFormData({...formData, ordering_doctor: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
          </Select>
      </div>
      <div className="space-y-2">
        <Label>Results Summary</Label>
        <Textarea value={formData.results_summary} onChange={e => setFormData({...formData, results_summary: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>Result File</Label>
        <Input type="file" onChange={e => setFile(e.target.files[0])} />
        {formData.result_file_url && !file && <a href={formData.result_file_url} target="_blank" className="text-sm text-blue-600">View current file</a>}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Lab Order"}
        </Button>
      </div>
    </form>
  );
}