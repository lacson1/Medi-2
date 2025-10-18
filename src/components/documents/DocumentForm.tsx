import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockApiClient } from "@/api/mockApiClient";
import { Loader2, Upload } from "lucide-react";

export default function DocumentForm({ document, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(document || {
    document_name: "",
    document_type: "other",
    upload_date: new Date().toISOString().split('T')[0],
    file_url: ""
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.document_name) {
      alert("Please enter a document name");
      return;
    }
    
    let submissionData = { ...formData };
    
    if (file) {
      setIsUploading(true);
      try {
        const { file_url } = await mockApiClient.integrations.Core.UploadFile({ file });
        submissionData.file_url = file_url;
      } catch (error) {
        console.error("File upload failed", error);
        alert("Failed to upload file. Please try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    
    if (!submissionData.file_url && !document) {
      alert("Please select a file to upload");
      return;
    }
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>{"Document Name *"}</Label>
        <Input 
          required 
          value={formData.document_name} 
          onChange={e => setFormData({...formData, document_name: e.target.value})} 
          placeholder="e.g., Lab Results - Blood Test"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Document Type *"}</Label>
          <Select required value={formData.document_type} onValueChange={v => setFormData({...formData, document_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lab_result">Lab Result</SelectItem>
              <SelectItem value="imaging_report">Imaging Report</SelectItem>
              <SelectItem value="referral_letter">Referral Letter</SelectItem>
              <SelectItem value="insurance_card">Insurance Card</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{"Upload Date"}</Label>
          <Input 
            type="date" 
            value={formData.upload_date} 
            onChange={e => setFormData({...formData, upload_date: e.target.value})} 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{"Upload File "}{!document && "*"}</Label>
        <div className="flex items-center gap-2">
          <Input 
            type="file" 
            onChange={e => setFile(e.target.files[0])} 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Upload className="w-4 h-4" />
              {file.name}
            </div>
          )}
        </div>
        {formData.file_url && !file && (
          <a href={formData.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
            View current file
          </a>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Document"}
        </Button>
      </div>
    </form>
  );
}