import React, { useState, useEffect } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DynamicFormRenderer from "./DynamicFormRenderer";
import TemplatePreview from "./TemplatePreview";
import { Loader2, AlertCircle, CheckCircle, Search, Calendar, User, FileText, Clock, Eye } from "lucide-react";

export default function SpecialtyConsultationForm({ consultation, patient, onSubmit, onCancel, isSubmitting }: any) {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(consultation?.specialist_id || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(consultation?.template_id || "");
  const [consultationDate, setConsultationDate] = useState(
    consultation?.consultation_date?.slice(0, 16) || new Date().toISOString().slice(0, 16)
  );
  const [summary, setSummary] = useState(consultation?.summary || "");
  const [status, setStatus] = useState(consultation?.status || "completed");
  const [consultationData, setConsultationData] = useState(consultation?.consultation_data || {});
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [specialistSearch, setSpecialistSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { data: specialists = [] } = useQuery({
    queryKey: ['specialists'],
    queryFn: () => mockApiClient.entities.Specialist.list(),
    initialData: [],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['consultation_templates'],
    queryFn: () => mockApiClient.entities.ConsultationTemplate.list(),
    initialData: [],
  });

  // Filter specialists and templates based on search
  const filteredSpecialists = specialists.filter(specialist =>
    specialist.full_name.toLowerCase().includes(specialistSearch.toLowerCase()) ||
    specialist.specialty.toLowerCase().includes(specialistSearch.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(templateSearch.toLowerCase()))
  );

  // Validation functions
  const validateField = (fieldName: any, value: any) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'specialist':
        if (!value) {
          newErrors.specialist = 'Please select a specialist';
        } else {
          delete newErrors.specialist;
        }
        break;
      case 'template':
        if (!value) {
          newErrors.template = 'Please select a consultation template';
        } else {
          delete newErrors.template;
        }
        break;
      case 'consultationDate':
        if (!value) {
          newErrors.consultationDate = 'Please select a consultation date and time';
        } else if (new Date(value) < new Date()) {
          newErrors.consultationDate = 'Consultation date cannot be in the past';
        } else {
          delete newErrors.consultationDate;
        }
        break;
      case 'summary':
        if (!value || value.trim().length < 10) {
          newErrors.summary = 'Summary must be at least 10 characters long';
        } else {
          delete newErrors.summary;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldBlur = (fieldName: any, value: any) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  const isFormValid = () => {
    const requiredFields = {
      specialist: selectedSpecialistId,
      template: selectedTemplateId,
      consultationDate,
      summary
    };

    let isValid = true;
    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!validateField(field, value)) {
        isValid = false;
      }
    });

    return isValid;
  };

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedTemplateId, templates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      // Mark all fields as touched to show validation errors
      setTouched({
        specialist: true,
        template: true,
        consultationDate: true,
        summary: true
      });
      return;
    }

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Info Header */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-blue-600" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h3>
              <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Consultation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialist Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Specialist *
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search specialists..."
                      value={specialistSearch}
                      onChange={(e) => setSpecialistSearch(e.target.value)}
                      className="pl-10"
                      aria-label="Search specialists"
                      role="searchbox"
                    />
                  </div>
                  <Select
                    required
                    value={selectedSpecialistId}
                    onValueChange={(value) => {
                      setSelectedSpecialistId(value);
                      handleFieldBlur('specialist', value);
                    }}
                  >
                    <SelectTrigger
                      className={errors.specialist && touched.specialist ? "border-red-500" : ""}
                      aria-label="Select specialist"
                      aria-describedby={errors.specialist && touched.specialist ? "specialist-error" : undefined}
                    >
                      <SelectValue placeholder="Select specialist" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSpecialists.map((specialist: any) => (
                        <SelectItem key={specialist.id} value={specialist.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{specialist.full_name}</span>
                            <span className="text-sm text-gray-500">{specialist.specialty}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialist && touched.specialist && (
                    <Alert variant="destructive" className="py-2" id="specialist-error" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.specialist}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Consultation Template *
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="pl-10"
                      aria-label="Search consultation templates"
                      role="searchbox"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      required
                      value={selectedTemplateId}
                      onValueChange={(value) => {
                        setSelectedTemplateId(value);
                        handleFieldBlur('template', value);
                      }}
                      className="flex-1"
                    >
                      <SelectTrigger className={errors.template && touched.template ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTemplates.map((template: any) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{template.name}</span>
                              {template.description && (
                                <span className="text-sm text-gray-500">{template.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const template = templates.find(t => t.id === selectedTemplateId);
                        if (template) setPreviewTemplate(template);
                      }}
                      disabled={!selectedTemplateId}
                      className="flex-shrink-0"
                      aria-label="Preview selected template"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.template && touched.template && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.template}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date and Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Consultation Date & Time *
                </Label>
                <Input
                  type="datetime-local"
                  required
                  value={consultationDate}
                  onChange={(e) => {
                    setConsultationDate(e.target.value);
                    handleFieldBlur('consultationDate', e.target.value);
                  }}
                  className={errors.consultationDate && touched.consultationDate ? "border-red-500" : ""}
                />
                {errors.consultationDate && touched.consultationDate && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.consultationDate}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="reviewed">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Reviewed</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Summary / Chief Complaint *
              </Label>
              <Textarea
                required
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  handleFieldBlur('summary', e.target.value);
                }}
                placeholder="Brief overview of the consultation..."
                rows={3}
                className={errors.summary && touched.summary ? "border-red-500" : ""}
              />
              {errors.summary && touched.summary && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.summary}</AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-gray-500">
                {summary.length}/500 characters (minimum 10 required)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Template Preview */}
        {previewTemplate && (
          <TemplatePreview
            template={previewTemplate}
            onSelect={(template) => {
              setSelectedTemplateId(template.id);
              setPreviewTemplate(null);
              handleFieldBlur('template', template.id);
            }}
            onClose={() => setPreviewTemplate(null)}
          />
        )}

        {/* Dynamic Form Section */}
        {selectedTemplate && !previewTemplate && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                {selectedTemplate.name} - Form Fields
              </CardTitle>
              {selectedTemplate.description && (
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <DynamicFormRenderer
                schema={selectedTemplate.template_schema}
                initialData={consultationData}
                onChange={setConsultationData}
              />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className="min-w-[140px]"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : consultation ? "Update Consultation" : "Save Consultation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}