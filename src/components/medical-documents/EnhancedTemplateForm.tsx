import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  Copy,
  Loader2
} from "lucide-react";
import { getSuggestedFieldsForDocumentType, getAllDocumentTypes } from "@/data/documentTypeFieldSuggestions";
import PropTypes from "prop-types";

const TEMPLATE_CATEGORIES = {
  general: "General",
  specialty: "Specialty",
  administrative: "Administrative",
  legal: "Legal",
  insurance: "Insurance"
};

export default function EnhancedTemplateForm({ template, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(template || {
    template_name: "",
    document_type: "sick_note",
    template_content: "",
    description: "",
    category: "general",
    is_active: true,
    variables: []
  });

  const [newVariable, setNewVariable] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    default_value: ""
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [usedSuggestedFields, setUsedSuggestedFields] = useState(new Set());
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addVariable = () => {
    if (newVariable.name && newVariable.label) {
      setFormData({
        ...formData,
        variables: [...formData.variables, { ...newVariable }]
      });
      setNewVariable({
        name: "",
        label: "",
        type: "text",
        required: false,
        default_value: ""
      });
    }
  };

  const removeVariable = (index: any) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index)
    });
  };

  const addSuggestedField = (suggestedField: any) => {
    const newVariable = {
      name: suggestedField.name,
      label: suggestedField.title,
      type: suggestedField.type === 'enum' ? 'select' : suggestedField.type,
      required: suggestedField.required,
      default_value: suggestedField.placeholder || ""
    };

    setFormData({
      ...formData,
      variables: [...formData.variables, newVariable]
    });
    setUsedSuggestedFields(new Set([...usedSuggestedFields, suggestedField.name]));

    // Add placeholder to template content if it's not already there
    const placeholder = `{${suggestedField.name}}`;
    if (!formData.template_content.includes(placeholder)) {
      setFormData(prev => ({
        ...prev,
        template_content: prev.template_content + `\n${placeholder}`
      }));
    }
  };

  const addAllSuggestedFields = () => {
    const suggestedFields = getSuggestedFieldsForDocumentType(formData.document_type);
    const newVariables = suggestedFields
      .filter(field => !usedSuggestedFields.has(field.name))
      .map(field => ({
        name: field.name,
        label: field.title,
        type: field.type === 'enum' ? 'select' : field.type,
        required: field.required,
        default_value: field.placeholder || ""
      }));

    setFormData({
      ...formData,
      variables: [...formData.variables, ...newVariables]
    });
    setUsedSuggestedFields(new Set([...usedSuggestedFields, ...suggestedFields.map(f => f.name)]));

    // Add all placeholders to template content
    const placeholders = suggestedFields
      .filter(field => !usedSuggestedFields.has(field.name))
      .map(field => `{${field.name}}`)
      .join('\n');

    if (placeholders) {
      setFormData(prev => ({
        ...prev,
        template_content: prev.template_content + '\n' + placeholders
      }));
    }
  };

  const getSuggestedFields = () => {
    return getSuggestedFieldsForDocumentType(formData.document_type);
  };

  const getDocumentTypeInfo = () => {
    const allTypes = getAllDocumentTypes();
    const typeInfo = allTypes.find(type => type === formData.document_type);
    if (typeInfo) {
      return {
        name: typeInfo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: "📄",
        color: "bg-gray-100 text-gray-800",
        description: "Custom document type"
      };
    }
    return {
      name: "Other",
      icon: "📄",
      color: "bg-gray-100 text-gray-800",
      description: "Custom document type"
    };
  };


  const generateTemplateContent = () => {
    const suggestedFields = getSuggestedFields();
    if (suggestedFields.length === 0) return "";

    const docTypeInfo = getDocumentTypeInfo();
    let content = `${docTypeInfo.name.toUpperCase()}\n\n`;

    // Add basic structure based on document type
    switch (formData.document_type) {
      case 'sick_note':
        content += `To Whom It May Concern:\n\n`;
        content += `This is to certify that {patient_name} (DOB: {patient_dob}) has been examined by me on {date} and is suffering from {diagnosis}.\n\n`;
        content += `Based on my medical assessment, I recommend that the patient be excused from work/school for {duration} days from {valid_from} to {valid_until}.\n\n`;
        content += `The patient should follow the prescribed treatment and may return to normal activities on {return_date}.\n\n`;
        content += `If you have any questions, please do not hesitate to contact me.\n\n`;
        content += `Sincerely,\n{doctor_name}\n{doctor_title}\n{clinic_name}\n{clinic_contact}`;
        break;
      case 'medical_letter':
        content += `Date: {date}\n\n`;
        content += `To: {recipient}\n\n`;
        content += `Re: {patient_name} - {patient_dob}\n\n`;
        content += `Dear {recipient_title},\n\n`;
        content += `I am writing regarding {patient_name} who is under my care for {current_condition}.\n\n`;
        content += `{medical_history}\n\n`;
        content += `{recommendations}\n\n`;
        content += `Please feel free to contact me if you need any additional information.\n\n`;
        content += `Sincerely,\n{doctor_name}\n{doctor_title}\n{clinic_name}\n{clinic_contact}`;
        break;
      default:
        content += `Document: {document_purpose}\n\n`;
        content += `Patient: {patient_name}\n`;
        content += `Date: {date}\n\n`;
        content += `{key_information}\n\n`;
        content += `{additional_details}\n\n`;
        content += `{doctor_name}\n{doctor_title}\n{clinic_name}`;
    }

    return content;
  };

  const useTemplateSuggestion = () => {
    const suggestedContent = generateTemplateContent();
    setFormData(prev => ({
      ...prev,
      template_content: suggestedContent
    }));
    addAllSuggestedFields();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Type Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  required
                  value={formData.template_name}
                  onChange={(e) => {
                    setFormData({ ...formData, template_name: e.target.value });
                    if (validationErrors.template_name) {
                      setValidationErrors(prev => ({ ...prev, template_name: null }));
                    }
                  }}
                  className={validationErrors.template_name ? "border-red-500" : ""}
                  placeholder="Enter template name"
                />
                {validationErrors.template_name && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.template_name}</span>
                  </div>
                )}
              </div>
              <div>
                <Label>Document Type *</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) => setFormData({ ...formData, document_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllDocumentTypes().map(type => {
                      const info = getDocumentTypeInfo(type);
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <span>{info.icon}</span>
                            <span>{info.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formData.document_type && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={getDocumentTypeInfo().color}>
                      {getDocumentTypeInfo().icon} {getDocumentTypeInfo().name}
                    </Badge>
                    <span className="text-sm text-gray-600">{getDocumentTypeInfo().description}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active Template</Label>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this template..."
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Fields */}
      {formData.document_type && getSuggestedFields().length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Suggested Fields for {getDocumentTypeInfo().name}</h4>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={addAllSuggestedFields}
                  variant="outline"
                  size="sm"
                  className="bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add All Fields
                </Button>
                <Button
                  type="button"
                  onClick={useTemplateSuggestion}
                  variant="outline"
                  size="sm"
                  className="bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getSuggestedFields().map((field: any) => (
                <div
                  key={field.name}
                  className={`p-3 rounded-lg border ${usedSuggestedFields.has(field.name)
                      ? 'bg-gray-100 border-gray-300 opacity-60'
                      : 'bg-white border-green-200 hover:border-green-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{field.title}</span>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{field.description}</p>
                      {field.placeholder && (
                        <p className="text-xs text-gray-500 italic">Placeholder: {field.placeholder}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => addSuggestedField(field)}
                      disabled={usedSuggestedFields.has(field.name)}
                      variant="outline"
                      size="sm"
                      className="ml-2"
                    >
                      {usedSuggestedFields.has(field.name) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Content */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Template Content *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isPreviewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(formData.template_content)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            {isPreviewMode ? (
              <div className="p-4 border rounded-lg bg-gray-50 whitespace-pre-wrap font-mono text-sm">
                {formData.template_content || "No content to preview"}
              </div>
            ) : (
              <Textarea
                value={formData.template_content}
                onChange={(e) => {
                  setFormData({ ...formData, template_content: e.target.value });
                  if (validationErrors.template_content) {
                    setValidationErrors(prev => ({ ...prev, template_content: null }));
                  }
                }}
                className={validationErrors.template_content ? "border-red-500" : ""}
                placeholder="Enter template content. Use {variable_name} for placeholders..."
                rows={12}
              />
            )}

            {validationErrors.template_content && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.template_content}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Variables */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Custom Variables</h3>
              <Button type="button" onClick={addVariable} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Variable
              </Button>
            </div>

            {formData.variables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No custom variables yet. Add variables to create dynamic placeholders.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.variables.map((variable, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Variable Name</Label>
                        <Input
                          value={variable.name}
                          onChange={(e) => {
                            const newVariables = [...formData.variables];
                            newVariables[index].name = e.target.value;
                            setFormData({ ...formData, variables: newVariables });
                          }}
                          placeholder="variable_name"
                          className="h-8"
                        />
                        {validationErrors[`variable_name_${index}`] && (
                          <div className="text-red-600 text-xs mt-1">
                            {validationErrors[`variable_name_${index}`]}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Display Label</Label>
                        <Input
                          value={variable.label}
                          onChange={(e) => {
                            const newVariables = [...formData.variables];
                            newVariables[index].label = e.target.value;
                            setFormData({ ...formData, variables: newVariables });
                          }}
                          placeholder="Variable Label"
                          className="h-8"
                        />
                        {validationErrors[`variable_label_${index}`] && (
                          <div className="text-red-600 text-xs mt-1">
                            {validationErrors[`variable_label_${index}`]}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={variable.type}
                          onValueChange={(value) => {
                            const newVariables = [...formData.variables];
                            newVariables[index].type = value;
                            setFormData({ ...formData, variables: newVariables });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Yes/No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Default Value</Label>
                        <Input
                          value={variable.default_value}
                          onChange={(e) => {
                            const newVariables = [...formData.variables];
                            newVariables[index].default_value = e.target.value;
                            setFormData({ ...formData, variables: newVariables });
                          }}
                          placeholder="Default value"
                          className="h-8"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeVariable(index)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : template ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}

EnhancedTemplateForm.propTypes = {
  template: PropTypes.shape({
    template_name: PropTypes.string,
    document_type: PropTypes.string,
    template_content: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    is_active: PropTypes.bool,
    variables: PropTypes.array,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};
