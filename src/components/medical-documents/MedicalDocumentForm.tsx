import { useState, useEffect, useCallback } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import PropTypes from "prop-types";

export default function MedicalDocumentForm({ patient, document, onSubmit, onCancel, isSubmitting }: any) {
  const { user } = useAuth();
  const [selectedTemplateId, setSelectedTemplateId] = useState(document?.template_id || "");
  const [formData, setFormData] = useState({
    document_title: document?.document_title || "",
    issue_date: document?.issue_date || new Date().toISOString().split('T')[0],
    valid_from: document?.valid_from || new Date().toISOString().split('T')[0],
    valid_until: document?.valid_until || "",
    issued_by: document?.issued_by || (user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || ""),
    notes: document?.notes || "",
    variable_data: document?.variable_data || {},
    status: document?.status || "issued"
  });
  const [generatedContent, setGeneratedContent] = useState(document?.generated_content || "");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const { data: templates = [] } = useQuery({
    queryKey: ['medical_document_templates'],
    queryFn: () => mockApiClient.entities.MedicalDocumentTemplate.list(),
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
  }, [selectedTemplate, formData.variable_data, formData.issue_date, formData.valid_from, formData.valid_until, generatePreview]);

  const generatePreview = useCallback(() => {
    if (!selectedTemplate) return;

    let content = selectedTemplate.template_content;

    // Get user and organization data
    const doctorName = formData.issued_by || user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Dr. [Name Required]';
    const doctorTitle = user?.title || user?.role || 'Medical Doctor';
    const clinicName = user?.organization?.name || user?.organization_name || 'Medical Practice';
    const clinicContact = user?.organization?.phone || user?.organization?.email || user?.phone || 'Contact information not available';
    const doctorContact = user?.phone || user?.email || 'Contact information not available';

    // Replace standard placeholders with real data
    const replacements = {
      '{patient_name}': `${patient.first_name} ${patient.last_name}`,
      '{patient_dob}': format(new Date(patient.date_of_birth), 'MMMM d, yyyy'),
      '{patient_address}': patient.address || 'Address not provided',
      '{patient_phone}': patient.phone || 'Phone not provided',
      '{patient_email}': patient.email || 'Email not provided',
      '{date}': format(new Date(formData.issue_date), 'MMMM d, yyyy'),
      '{doctor_name}': doctorName,
      '{doctor_title}': doctorTitle,
      '{clinic_name}': clinicName,
      '{clinic_contact}': clinicContact,
      '{doctor_contact}': doctorContact,
      '{valid_from}': formData.valid_from ? format(new Date(formData.valid_from), 'MMMM d, yyyy') : '',
      '{valid_until}': formData.valid_until ? format(new Date(formData.valid_until), 'MMMM d, yyyy') : '',
    };

    Object.entries(replacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, 'g'), value);
    });

    // Replace custom variables
    if (selectedTemplate.variables) {
      selectedTemplate.variables.forEach(variable => {
        const value = formData.variable_data[variable.name] || variable.default_value || `[${variable.label} - Required]`;
        content = content.replace(new RegExp(`{${variable.name}}`, 'g'), value);
      });
    }

    setGeneratedContent(content);
  }, [selectedTemplate, formData, patient, user]);

  const handleVariableChange = (variableName: any, value: any) => {
    setFormData({
      ...formData,
      variable_data: {
        ...formData.variable_data,
        [variableName]: value
      }
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!selectedTemplateId) {
      errors.template = "Please select a template";
    }

    if (!formData.document_title.trim()) {
      errors.document_title = "Document title is required";
    }

    if (!formData.issued_by.trim()) {
      errors.issued_by = "Issuer name is required";
    }

    if (!formData.issue_date) {
      errors.issue_date = "Issue date is required";
    }

    // Validate required template variables
    if (selectedTemplate && selectedTemplate.variables) {
      selectedTemplate.variables.forEach(variable => {
        if (variable.required && (!formData.variable_data[variable.name] || !formData.variable_data[variable.name].trim())) {
          errors[`variable_${variable.name}`] = `${variable.label} is required`;
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
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
          <Label>{"Select Template *"}</Label>
          <Select
            required
            value={selectedTemplateId}
            onValueChange={(value) => {
              setSelectedTemplateId(value);
              if (validationErrors.template) {
                setValidationErrors(prev => ({ ...prev, template: null }));
              }
            }}
          >
            <SelectTrigger className={validationErrors.template ? "border-red-500" : ""}>
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {activeTemplates.map((template: any) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.template_name} ({template.document_type.replace('_', ' ')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.template && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{validationErrors.template}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{"Document Title *"}</Label>
          <Input
            required
            value={formData.document_title}
            onChange={(e) => {
              setFormData({ ...formData, document_title: e.target.value });
              if (validationErrors.document_title) {
                setValidationErrors(prev => ({ ...prev, document_title: null }));
              }
            }}
            className={validationErrors.document_title ? "border-red-500" : ""}
            placeholder="Enter document title"
          />
          {validationErrors.document_title && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{validationErrors.document_title}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{"Issued By *"}</Label>
          <Input
            required
            value={formData.issued_by}
            onChange={(e) => {
              setFormData({ ...formData, issued_by: e.target.value });
              if (validationErrors.issued_by) {
                setValidationErrors(prev => ({ ...prev, issued_by: null }));
              }
            }}
            className={validationErrors.issued_by ? "border-red-500" : ""}
            placeholder="Doctor's name"
          />
          {validationErrors.issued_by && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{validationErrors.issued_by}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{"Issue Date *"}</Label>
          <Input
            type="date"
            required
            value={formData.issue_date}
            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{"Status"}</Label>
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
          <Label>{"Valid From"}</Label>
          <Input
            type="date"
            value={formData.valid_from}
            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{"Valid Until"}</Label>
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
                      onChange={(e) => {
                        handleVariableChange(variable.name, e.target.value);
                        if (validationErrors[`variable_${variable.name}`]) {
                          setValidationErrors(prev => ({ ...prev, [`variable_${variable.name}`]: null }));
                        }
                      }}
                      className={validationErrors[`variable_${variable.name}`] ? "border-red-500" : ""}
                      rows={3}
                    />
                  ) : variable.type === 'select' ? (
                    <Select
                      required={variable.required}
                      value={formData.variable_data[variable.name] || variable.default_value || ""}
                      onValueChange={(v) => {
                        handleVariableChange(variable.name, v);
                        if (validationErrors[`variable_${variable.name}`]) {
                          setValidationErrors(prev => ({ ...prev, [`variable_${variable.name}`]: null }));
                        }
                      }}
                    >
                      <SelectTrigger className={validationErrors[`variable_${variable.name}`] ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
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
                      onChange={(e) => {
                        handleVariableChange(variable.name, e.target.value);
                        if (validationErrors[`variable_${variable.name}`]) {
                          setValidationErrors(prev => ({ ...prev, [`variable_${variable.name}`]: null }));
                        }
                      }}
                      className={validationErrors[`variable_${variable.name}`] ? "border-red-500" : ""}
                    />
                  )}
                  {validationErrors[`variable_${variable.name}`] && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors[`variable_${variable.name}`]}</span>
                    </div>
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
        <Label>{"Internal Notes"}</Label>
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

MedicalDocumentForm.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    date_of_birth: PropTypes.string.isRequired,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string
  }).isRequired,
  document: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};