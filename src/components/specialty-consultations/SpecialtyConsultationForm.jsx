import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { Loader2 } from "lucide-react";

export default function SpecialtyConsultationForm({ consultation, patient, onSubmit, onCancel, isSubmitting }) {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(consultation?.specialist_id || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(consultation?.template_id || "");
  const [consultationDate, setConsultationDate] = useState(
    consultation?.consultation_date?.slice(0, 16) || new Date().toISOString().slice(0, 16)
  );
  const [summary, setSummary] = useState(consultation?.summary || "");
  const [status, setStatus] = useState(consultation?.status || "completed");
  const [consultationData, setConsultationData] = useState(consultation?.consultation_data || {});
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const { data: specialists = [] } = useQuery({
    queryKey: ['specialists'],
    queryFn: () => base44.entities.Specialist.list(),
    initialData: [],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['consultation_templates'],
    queryFn: () => base44.entities.ConsultationTemplate.list(),
    initialData: [],
  });

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedTemplateId, templates]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const specialist = specialists.find(s => s.id === selectedSpecialistId);
    const template = templates.find(t => t.id === selectedTemplateId);

    const formData = {
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      specialist_id: selectedSpecialistId,
      specialist_name: specialist?.full_name || "",
      template_id: selectedTemplateId,
      template_name: template?.name || "",
      consultation_date: consultationDate,
      status,
      summary,
      consultation_data: consultationData,
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Specialist *</Label>
          <Select required value={selectedSpecialistId} onValueChange={setSelectedSpecialistId}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialist" />
            </SelectTrigger>
            <SelectContent>
              {specialists.map((specialist) => (
                <SelectItem key={specialist.id} value={specialist.id}>
                  {specialist.full_name} - {specialist.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Consultation Template *</Label>
          <Select required value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Consultation Date & Time *</Label>
          <Input
            type="datetime-local"
            required
            value={consultationDate}
            onChange={(e) => setConsultationDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Summary / Chief Complaint *</Label>
        <Textarea
          required
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief overview of the consultation..."
          rows={2}
        />
      </div>

      {selectedTemplate && (
        <div className="border rounded-lg p-4 bg-blue-50/30">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedTemplate.name} - Form Fields
          </h3>
          <DynamicFormRenderer
            schema={selectedTemplate.template_schema}
            initialData={consultationData}
            onChange={setConsultationData}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedTemplateId}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : consultation ? "Update Consultation" : "Save Consultation"}
        </Button>
      </div>
    </form>
  );
}