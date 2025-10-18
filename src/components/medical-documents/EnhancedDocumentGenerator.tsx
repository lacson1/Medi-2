import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApiClient } from "@/api/mockApiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Plus,
  Save,
  Eye,
  Download,
  Calendar,
  User,
  MapPin,
  Phone,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import PropTypes from "prop-types";

const DOCUMENT_TYPES = {
  sick_note: { label: "Sick Note", color: "bg-red-100 text-red-800", icon: "🏥" },
  medical_letter: { label: "Medical Letter", color: "bg-blue-100 text-blue-800", icon: "📋" },
  insurance_letter: { label: "Insurance Letter", color: "bg-purple-100 text-purple-800", icon: "📄" },
  disability_certificate: { label: "Disability Certificate", color: "bg-orange-100 text-orange-800", icon: "♿" },
  fitness_certificate: { label: "Fitness Certificate", color: "bg-green-100 text-green-800", icon: "💪" },
  referral_letter: { label: "Referral Letter", color: "bg-cyan-100 text-cyan-800", icon: "↗️" },
  prescription_letter: { label: "Prescription Letter", color: "bg-indigo-100 text-indigo-800", icon: "💊" },
  medical_report: { label: "Medical Report", color: "bg-slate-100 text-slate-800", icon: "📊" },
  discharge_summary: { label: "Discharge Summary", color: "bg-pink-100 text-pink-800", icon: "🏥" },
  consultation_note: { label: "Consultation Note", color: "bg-yellow-100 text-yellow-800", icon: "📝" },
  other: { label: "Other", color: "bg-gray-100 text-gray-800", icon: "📄" }
};

const QUICK_TEMPLATES = {
  sick_note: {
    title: "Medical Certificate - Sick Leave",
    content: `MEDICAL CERTIFICATE

To Whom It May Concern:

This is to certify that {patient_name} (DOB: {patient_dob}) has been examined by me on {date} and is suffering from {diagnosis}.

Based on my medical assessment, I recommend that the patient be excused from work/school for {duration} days from {valid_from} to {valid_until}.

The patient should follow the prescribed treatment and may return to normal activities on {return_date}.

If you have any questions, please do not hesitate to contact me.

Sincerely,
{doctor_name}
{doctor_title}
{clinic_name}
{clinic_contact}`
  },
  medical_letter: {
    title: "Medical Letter",
    content: `MEDICAL LETTER

Date: {date}

To: {recipient}

Re: {patient_name} - {patient_dob}

Dear {recipient_title},

I am writing to provide medical information regarding {patient_name}, who is under my care.

Medical History:
{medical_history}

Current Condition:
{current_condition}

Treatment Plan:
{treatment_plan}

Recommendations:
{recommendations}

Please feel free to contact me if you require any additional information.

Yours sincerely,
{doctor_name}
{doctor_title}
{clinic_name}`
  },
  referral_letter: {
    title: "Referral Letter",
    content: `REFERRAL LETTER

Date: {date}

To: {specialist_name}
{specialist_department}
{specialist_clinic}

Re: {patient_name} - {patient_dob}

Dear Dr. {specialist_name},

I am referring {patient_name} to you for {reason_for_referral}.

Patient Details:
- Name: {patient_name}
- DOB: {patient_dob}
- Address: {patient_address}
- Phone: {patient_phone}

Current Symptoms:
{current_symptoms}

Medical History:
{medical_history}

Current Medications:
{current_medications}

Examination Findings:
{examination_findings}

Reason for Referral:
{reason_for_referral}

Urgency: {urgency_level}

Please contact me if you need any additional information.

Yours sincerely,
{doctor_name}
{doctor_title}
{clinic_name}
{doctor_contact}`
  }
};

export default function EnhancedDocumentGenerator({ patient, onClose, onSave }: any) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [customVariables, setCustomVariables] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch patient's medical history and appointments for auto-population
  const { data: medicalHistory = [] } = useQuery({
    queryKey: ['patient_medical_history', patient?.id],
    queryFn: () => mockApiClient.entities.Encounter.filter({ patient_id: patient.id }),
    enabled: !!patient?.id
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['patient_prescriptions', patient?.id],
    queryFn: () => mockApiClient.entities.Prescription.filter({ patient_id: patient.id }),
    enabled: !!patient?.id
  });

  // Auto-populate document when type is selected
  useEffect(() => {
    if (selectedDocumentType && QUICK_TEMPLATES[selectedDocumentType]) {
      const template = QUICK_TEMPLATES[selectedDocumentType];
      setDocumentTitle(template.title);
      setDocumentContent(template.content);

      // Auto-populate common variables
      const autoVariables = {
        diagnosis: getLatestDiagnosis(),
        duration: "3-5",
        medical_history: getMedicalHistorySummary(),
        current_medications: getCurrentMedications(),
        current_symptoms: getCurrentSymptoms(),
        urgency_level: "Routine"
      };

      setCustomVariables(autoVariables);
    }
  }, [selectedDocumentType, medicalHistory, prescriptions, getLatestDiagnosis, getMedicalHistorySummary, getCurrentMedications, getCurrentSymptoms]);

  const getLatestDiagnosis = useCallback(() => {
    if (medicalHistory.length === 0) return "";
    const latest = medicalHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return latest.diagnosis || latest.chief_complaint || "General medical condition";
  }, [medicalHistory]);

  const getMedicalHistorySummary = useCallback(() => {
    if (medicalHistory.length === 0) return "No significant medical history";

    const recent = medicalHistory.slice(0, 3).map(encounter =>
      `${format(parseISO(encounter.created_at), 'MMM yyyy')}: ${encounter.diagnosis || encounter.chief_complaint || 'General consultation'}`
    ).join('\n');

    return recent;
  }, [medicalHistory]);

  const getCurrentMedications = useCallback(() => {
    if (prescriptions.length === 0) return "No current medications";

    const active = prescriptions.filter(p => p.status === 'active').map(p =>
      `${p.medication_name} - ${p.dosage} ${p.frequency}`
    ).join('\n');

    return active || "No current medications";
  }, [prescriptions]);

  const getCurrentSymptoms = useCallback(() => {
    if (medicalHistory.length === 0) return "";
    const latest = medicalHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return latest.chief_complaint || latest.symptoms || "";
  }, [medicalHistory]);

  const generateDocument = useCallback(() => {
    if (!documentContent) return;

    let content = documentContent;

    // Replace standard placeholders with real data
    const doctorName = user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Dr. [Name Required]';
    const doctorTitle = user?.title || user?.role || 'Medical Doctor';
    const clinicName = user?.organization?.name || user?.organization_name || 'Medical Practice';
    const clinicContact = user?.organization?.phone || user?.organization?.email || user?.phone || 'Contact information not available';
    const doctorContact = user?.phone || user?.email || 'Contact information not available';

    const replacements = {
      '{patient_name}': `${patient.first_name} ${patient.last_name}`,
      '{patient_dob}': format(new Date(patient.date_of_birth), 'MMMM d, yyyy'),
      '{patient_address}': patient.address || 'Address not provided',
      '{patient_phone}': patient.phone || 'Phone not provided',
      '{patient_email}': patient.email || 'Email not provided',
      '{date}': format(new Date(), 'MMMM d, yyyy'),
      '{doctor_name}': doctorName,
      '{doctor_title}': doctorTitle,
      '{clinic_name}': clinicName,
      '{clinic_contact}': clinicContact,
      '{doctor_contact}': doctorContact
    };

    // Replace custom variables
    Object.entries(customVariables).forEach(([key, value]) => {
      replacements[`{${key}}`] = value || `[${key.replace('_', ' ').toUpperCase()}]`;
    });

    // Apply all replacements
    Object.entries(replacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, 'g'), value);
    });

    return content;
  }, [documentContent, patient, user, customVariables]);

  const validateDocument = () => {
    const errors = {};

    if (!selectedDocumentType) {
      errors.documentType = "Please select a document type";
    }

    if (!documentTitle.trim()) {
      errors.documentTitle = "Document title is required";
    }

    if (!documentContent.trim()) {
      errors.documentContent = "Document content is required";
    }

    // Check for unresolved placeholders
    const unresolvedPlaceholders = documentContent.match(/\{\{[^}]+\}\}/g);
    if (unresolvedPlaceholders && unresolvedPlaceholders.length > 0) {
      const customPlaceholders = unresolvedPlaceholders.filter(placeholder => {
        const key = placeholder.replace(/[{}]/g, '');
        return !customVariables[key] && !['patient_name', 'patient_dob', 'patient_address', 'patient_phone', 'patient_email', 'date', 'doctor_name', 'doctor_title', 'clinic_name', 'clinic_contact', 'doctor_contact'].includes(key);
      });

      if (customPlaceholders.length > 0) {
        errors.unresolvedPlaceholders = `Unresolved placeholders: ${customPlaceholders.join(', ')}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDocument = async () => {
    if (!validateDocument()) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setIsGenerating(true);

    try {
      const generatedContent = generateDocument();
      const documentNumber = `DOC-${Date.now()}`;

      const documentData = {
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        document_title: documentTitle,
        document_type: selectedDocumentType,
        document_number: documentNumber,
        generated_content: generatedContent,
        issue_date: new Date().toISOString().split('T')[0],
        issued_by: user?.name || user?.first_name + ' ' + user?.last_name,
        status: 'issued',
        variable_data: customVariables,
        template_used: 'enhanced_generator'
      };

      await mockApiClient.entities.GeneratedMedicalDocument.create(documentData);

      // Invalidate queries to refresh the documents list
      queryClient.invalidateQueries({ queryKey: ['patient_medical_documents', patient.id] });

      toast.success("Document generated and saved successfully!");

      if (onSave) {
        onSave(documentData);
      }

      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Error saving document:', error);
      toast.error("Failed to save document. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDocument = () => {
    const generatedContent = generateDocument();

    // Create a more professional document format
    const documentHeader = `
MEDICAL DOCUMENT
${documentTitle}

Patient: ${patient.first_name} ${patient.last_name}
Date of Birth: ${format(new Date(patient.date_of_birth), 'MMMM d, yyyy')}
Document Date: ${format(new Date(), 'MMMM d, yyyy')}
Document Number: DOC-${Date.now()}

${'='.repeat(50)}

`;

    const fullDocument = documentHeader + generatedContent;

    // Create and download as text file (can be enhanced to PDF later)
    const blob = new Blob([fullDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Document downloaded successfully!");
  };

  const addCustomVariable = () => {
    const key = prompt("Enter variable name (e.g., 'diagnosis', 'duration'):");
    if (key && !customVariables[key]) {
      setCustomVariables(prev => ({
        ...prev,
        [key]: ""
      }));
    }
  };

  const removeCustomVariable = (key: any) => {
    setCustomVariables(prev => {
      const newVars = { ...prev };
      delete newVars[key];
      return newVars;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Medical Document Generator</h2>
            <p className="text-sm text-gray-600">Generate documents for {patient?.first_name} {patient?.last_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleDownloadDocument} disabled={!documentContent}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleSaveDocument} disabled={isGenerating || !documentTitle || !documentContent}>
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Document
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div className="w-1/2 border-r overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Document Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedDocumentType}
                    onValueChange={(value) => {
                      setSelectedDocumentType(value);
                      if (validationErrors.documentType) {
                        setValidationErrors(prev => ({ ...prev, documentType: null }));
                      }
                    }}
                  >
                    <SelectTrigger className={validationErrors.documentType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.documentType && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.documentType}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Document Title</Label>
                    <Input
                      value={documentTitle}
                      onChange={(e) => {
                        setDocumentTitle(e.target.value);
                        if (validationErrors.documentTitle) {
                          setValidationErrors(prev => ({ ...prev, documentTitle: null }));
                        }
                      }}
                      className={validationErrors.documentTitle ? "border-red-500" : ""}
                      placeholder="Enter document title"
                    />
                    {validationErrors.documentTitle && (
                      <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.documentTitle}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Document Content</Label>
                    <Textarea
                      value={documentContent}
                      onChange={(e) => {
                        setDocumentContent(e.target.value);
                        if (validationErrors.documentContent) {
                          setValidationErrors(prev => ({ ...prev, documentContent: null }));
                        }
                      }}
                      className={`font-mono text-sm ${validationErrors.documentContent ? "border-red-500" : ""}`}
                      placeholder="Enter document content with placeholders..."
                      rows={12}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Use placeholders like: {'{patient_name}'}, {'{date}'}, {'{doctor_name}'}, etc.
                    </div>
                    {validationErrors.documentContent && (
                      <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.documentContent}</span>
                      </div>
                    )}
                    {validationErrors.unresolvedPlaceholders && (
                      <div className="flex items-center gap-1 text-orange-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.unresolvedPlaceholders}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Variables */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Custom Variables</CardTitle>
                    <Button variant="outline" size="sm" onClick={addCustomVariable}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Variable
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(customVariables).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">{key.replace('_', ' ').toUpperCase()}</Label>
                        <Input
                          value={value}
                          onChange={(e) => setCustomVariables(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }))}
                          placeholder={`Enter ${key.replace('_', ' ')}`}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomVariable(key)}
                        className="mt-6"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {Object.keys(customVariables).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No custom variables added</p>
                      <p className="text-xs">Add variables to customize your document</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Document Preview</h3>
            </div>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="bg-white border rounded-lg p-8 whitespace-pre-wrap font-serif text-sm leading-relaxed shadow-sm">
                  {documentContent ? (
                    <div className="space-y-4">
                      <div className="text-center border-b pb-4 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{documentTitle}</h2>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Patient: {patient?.first_name} {patient?.last_name}</p>
                          <p>Date: {format(new Date(), 'MMMM d, yyyy')}</p>
                          <p>Document Number: DOC-{Date.now()}</p>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        {generateDocument()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Select a document type to see preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Info Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{patient?.first_name} {patient?.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{format(new Date(patient?.date_of_birth), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{patient?.address || 'No address'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{patient?.phone || 'No phone'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4 text-gray-500" />
                  <span><strong>Latest Diagnosis:</strong> {getLatestDiagnosis()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span><strong>Medical History:</strong> {medicalHistory.length} encounters</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span><strong>Current Medications:</strong> {prescriptions.filter(p => p.status === 'active').length} active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

EnhancedDocumentGenerator.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    date_of_birth: PropTypes.string.isRequired,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func,
  onSave: PropTypes.func
};
