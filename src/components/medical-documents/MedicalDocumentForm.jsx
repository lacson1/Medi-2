import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { format } from "date-fns";

export default function MedicalDocumentForm({ patient, document, onSubmit, onCancel, isSubmitting }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(document?.template_id || "");
  const [formData, setFormData] = useState({
    document_title: document?.document_title || "",
    issue_date: document?.issue_date || new Date().toISOString().split('T')[0],
    valid_from: document?.valid_from || new Date().toISOString().split('T')[0],
    valid_until: document?.valid_until || "",
    issued_by: document?.issued_by || "",
    notes: document?.notes || "",
    variable_data: document?.variable_data || {},
    status: document?.status || "issued"
  });
  const [generatedContent, setGeneratedContent] = useState(document?.generated_content || "");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['medical_document_templates'],
    queryFn: () => base44.entities.MedicalDocumentTemplate.list(),
    initialData: [],
  });

  const activeTemplates = templates.filter(t => t.is_active);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template);
      
      if (template && !document) {
        setFormData(prev => ({
          ...prev,
          document_title: template.template_name
        }));
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedTemplateId, templates, document]);

  useEffect(() => {
    if (selectedTemplate) {
      generatePreview();
    }
  }, [selectedTemplate, formData.variable_data, formData.issue_date, formData.valid_from, formData.valid_until]);

  const generatePreview = () => {
    if (!selectedTemplate) return;

    let content = selectedTemplate.template_content;
    
    // Replace standard placeholders
    const replacements = {
      '{{patient_name}}': `${patient.first_name} ${patient.last_name}`,
      '{{date}}': format(new Date(formData.issue_date), 'MMMM d, yyyy'),
      '{{patient_dob}}': format(new Date(patient.date_of_birth), 'MMMM d, yyyy'),
      '{{patient_address}}': patient.address || '',
      '{{doctor_name}}': formData.issued_by || '[Doctor Name]',
      '{{clinic_name}}': '[Your Clinic Name]',
      '{{valid_from}}': formData.valid_from ? format(new Date(formData.valid_from), 'MMMM d, yyyy') : '',
      '{{valid_until}}': formData.valid_until ? format(new Date(formData.valid_until), 'MMMM d, yyyy') : '',
    };

    Object.entries(replacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, 'g'), value);
    });

    // Replace custom variables
    if (selectedTemplate.variables) {
      selectedTemplate.variables.forEach(variable => {
        const value = formData.variable_data[variable.name] || `[${variable.label}]`;
        content = content.replace(new RegExp(`{{${variable.name}}}`, 'g'), value);
      });
    }

    setGeneratedContent(content);
  };

  const handleVariableChange = (variableName, value) => {
    setFormData({
      ...formData,
      variable_data: {
        ...formData.variable_data,
        [variableName]: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedTemplateId) {
      alert("Please select a template");
      return;
    }

    const template = templates.find(t => t.id === selectedTemplateId);
    
    const documentNumber = `DOC-${Date.now()}`;
    
    const submissionData = {
      ...formData,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      template_id: selectedTemplateId,
      template_name: template.template_name,
      document_type: template.document_type,
      generated_content: generatedContent,
      document_number: documentNumber
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Select Template *</Label>
          <Select
            required
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {activeTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.template_name} ({template.document_type.replace('_', ' ')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Document Title *</Label>
          <Input
            required
            value={formData.document_title}
            onChange={(e) => setFormData({ ...formData, document_title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Issued By *</Label>
          <Input
            required
            value={formData.issued_by}
            onChange={(e) => setFormData({ ...formData, issued_by: e.target.value })}
            placeholder="Doctor's name"
          />
        </div>

        <div className="space-y-2">
          <Label>Issue Date *</Label>
          <Input
            type="date"
            required
            value={formData.issue_date}
            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Valid From</Label>
          <Input
            type="date"
            value={formData.valid_from}
            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Valid Until</Label>
          <Input
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          />
        </div>
      </div>

      {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-gray-900">Template Variables</h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedTemplate.variables.map((variable, idx) => (
                <div key={idx} className="space-y-2">
                  <Label>
                    {variable.label}
                    {variable.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {variable.type === 'textarea' ? (
                    <Textarea
                      required={variable.required}
                      value={formData.variable_data[variable.name] || variable.default_value || ""}
                      onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                      rows={3}
                    />
                  ) : variable.type === 'select' ? (
                    <Select
                      required={variable.required}
                      value={formData.variable_data[variable.name] || variable.default_value || ""}
                      onValueChange={(v) => handleVariableChange(variable.name, v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {variable.options?.map((option, i) => (
                          <SelectItem key={i} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={variable.type}
                      required={variable.required}
                      value={formData.variable_data[variable.name] || variable.default_value || ""}
                      onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {generatedContent && (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Document Preview</h3>
            </div>
            <div className="bg-white p-6 border rounded-lg whitespace-pre-wrap font-serif text-sm">
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label>Internal Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes (not included in document)"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedTemplateId}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Generating..." : document ? "Update Document" : "Generate Document"}
        </Button>
      </div>
    </form>
  );
}