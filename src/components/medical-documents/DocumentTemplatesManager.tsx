import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApiClient } from "@/api/mockApiClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Save,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import PropTypes from "prop-types";
import EnhancedTemplateForm from "./EnhancedTemplateForm";

const DOCUMENT_TYPES = {
  sick_note: { label: "Sick Note", color: "bg-red-100 text-red-800" },
  medical_letter: { label: "Medical Letter", color: "bg-blue-100 text-blue-800" },
  insurance_letter: { label: "Insurance Letter", color: "bg-purple-100 text-purple-800" },
  disability_certificate: { label: "Disability Certificate", color: "bg-orange-100 text-orange-800" },
  fitness_certificate: { label: "Fitness Certificate", color: "bg-green-100 text-green-800" },
  referral_letter: { label: "Referral Letter", color: "bg-cyan-100 text-cyan-800" },
  prescription_letter: { label: "Prescription Letter", color: "bg-indigo-100 text-indigo-800" },
  medical_report: { label: "Medical Report", color: "bg-slate-100 text-slate-800" },
  discharge_summary: { label: "Discharge Summary", color: "bg-pink-100 text-pink-800" },
  consultation_note: { label: "Consultation Note", color: "bg-yellow-100 text-yellow-800" },
  other: { label: "Other", color: "bg-gray-100 text-gray-800" }
};

const TEMPLATE_CATEGORIES = {
  general: "General",
  specialty: "Specialty",
  administrative: "Administrative",
  legal: "Legal",
  insurance: "Insurance"
};

export default function DocumentTemplatesManager() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['medical_document_templates'],
    queryFn: () => mockApiClient.entities.MedicalDocumentTemplate.list(),
    initialData: []
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: any) => mockApiClient.entities.MedicalDocumentTemplate.create(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_document_templates'] });
      toast.success("Template created successfully!");
      setIsCreateModalOpen(false);
    },
    onError: (error: any) => {
      console.error('Error creating template:', error);
      toast.error("Failed to create template");
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, ...templateData }) => mockApiClient.entities.MedicalDocumentTemplate.update(id, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_document_templates'] });
      toast.success("Template updated successfully!");
      setIsEditModalOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      console.error('Error updating template:', error);
      toast.error("Failed to update template");
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: any) => mockApiClient.entities.MedicalDocumentTemplate.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_document_templates'] });
      toast.success("Template deleted successfully!");
    },
    onError: (error: any) => {
      console.error('Error deleting template:', error);
      toast.error("Failed to delete template");
    }
  });

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || filterType === "all" || template.document_type === filterType;
    const matchesCategory = !filterCategory || filterCategory === "all" || template.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteTemplate = (templateId: any) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleDuplicateTemplate = (template: any) => {
    const duplicatedTemplate = {
      ...template,
      template_name: `${template.template_name} (Copy)`,
      id: undefined
    };
    setSelectedTemplate(duplicatedTemplate);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Templates</h2>
          <p className="text-gray-600">Manage medical document templates for quick generation</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{"Create New Template"}</DialogTitle>
            </DialogHeader>
            <EnhancedTemplateForm
              template={null}
              onSubmit={(data) => createTemplateMutation.mutate(data)}
              onCancel={() => setIsCreateModalOpen(false)}
              isSubmitting={createTemplateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{"Search"}</Label>
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>{"Document Type"}</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{"Category"}</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template: any) => {
            const typeConfig = DOCUMENT_TYPES[template.document_type] || DOCUMENT_TYPES.other;

            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                    </div>
                    <Badge className={typeConfig.color}>
                      {typeConfig.label}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description || "No description provided"}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.is_active}
                        disabled
                        className="pointer-events-none"
                      />
                      <span className="text-xs text-gray-500">
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {TEMPLATE_CATEGORIES[template.category] || template.category}
                    </Badge>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredTemplates.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || (filterType && filterType !== "all") || (filterCategory && filterCategory !== "all")
                ? "Try adjusting your search criteria"
                : "Create your first document template to get started"
              }
            </p>
            {!searchTerm && filterType === "all" && filterCategory === "all" && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{"Edit Template"}</DialogTitle>
          </DialogHeader>
          <EnhancedTemplateForm
            template={selectedTemplate}
            onSubmit={(data) => updateTemplateMutation.mutate({ id: selectedTemplate.id, ...data })}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedTemplate(null);
            }}
            isSubmitting={updateTemplateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{"Template Preview"}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedTemplate.template_name}</h3>
                <div className="flex gap-2 mb-2">
                  <Badge className={DOCUMENT_TYPES[selectedTemplate.document_type]?.color || DOCUMENT_TYPES.other.color}>
                    {DOCUMENT_TYPES[selectedTemplate.document_type]?.label || 'Other'}
                  </Badge>
                  <Badge variant="outline">
                    {TEMPLATE_CATEGORIES[selectedTemplate.category] || selectedTemplate.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 whitespace-pre-wrap font-serif text-sm">
                {selectedTemplate.template_content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Form Component
function TemplateForm({ template, onSubmit, onCancel, isSubmitting }: any) {
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

  const validateForm = () => {
    const errors = {};

    if (!formData.template_name.trim()) {
      errors.template_name = "Template name is required";
    }

    if (!formData.template_content.trim()) {
      errors.template_content = "Template content is required";
    }

    // Check for valid placeholders
    const placeholders = formData.template_content.match(/\{\{[^}]+\}\}/g) || [];
    const validPlaceholders = ['patient_name', 'patient_dob', 'patient_address', 'patient_phone', 'patient_email', 'date', 'doctor_name', 'doctor_title', 'clinic_name', 'clinic_contact', 'doctor_contact'];
    const customPlaceholders = formData.variables.map(v => v.name);

    const invalidPlaceholders = placeholders.filter(placeholder => {
      const key = placeholder.replace(/[{}]/g, '');
      return !validPlaceholders.includes(key) && !customPlaceholders.includes(key);
    });

    if (invalidPlaceholders.length > 0) {
      errors.template_content = `Invalid placeholders found: ${invalidPlaceholders.join(', ')}. Please define custom variables for these placeholders.`;
    }

    // Validate variable names
    formData.variables.forEach((variable, index) => {
      if (!variable.name.trim()) {
        errors[`variable_name_${index}`] = "Variable name is required";
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
        errors[`variable_name_${index}`] = "Variable name must start with letter or underscore and contain only letters, numbers, and underscores";
      }

      if (!variable.label.trim()) {
        errors[`variable_label_${index}`] = "Variable label is required";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{"Template Name *"}</Label>
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
          <Label>{"Document Type *"}</Label>
          <Select
            value={formData.document_type}
            onValueChange={(value) => setFormData({ ...formData, document_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{"Category"}</Label>
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
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>{"Active Template"}</Label>
        </div>
      </div>

      <div>
        <Label>{"Description"}</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this template..."
          rows={3}
        />
      </div>

      <div>
        <Label>{"Template Content *"}</Label>
        <Textarea
          required
          value={formData.template_content}
          onChange={(e) => {
            setFormData({ ...formData, template_content: e.target.value });
            if (validationErrors.template_content) {
              setValidationErrors(prev => ({ ...prev, template_content: null }));
            }
          }}
          className={`font-mono text-sm ${validationErrors.template_content ? "border-red-500" : ""}`}
          placeholder="Use placeholders like: {patient_name}, {date}, {doctor_name}, etc."
          rows={10}
        />
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-semibold mb-1">Available Placeholders:</p>
          <p>
            {'{patient_name}'}, {'{date}'}, {'{patient_dob}'}, {'{patient_address}'}, {'{doctor_name}'}, {'{clinic_name}'} + any custom variables you add below
          </p>
        </div>
        {validationErrors.template_content && (
          <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
            <AlertCircle className="w-4 h-4" />
            <span>{validationErrors.template_content}</span>
          </div>
        )}
      </div>

      {/* Variables Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.variables.map((variable, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs">{variable.label}</Label>
                <Input
                  value={variable.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Type</Label>
                <Select value={variable.type} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeVariable(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="grid grid-cols-4 gap-2 items-end">
              <div>
                <Label className="text-xs">Variable Name</Label>
                <Input
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  placeholder="e.g., diagnosis"
                />
              </div>
              <div>
                <Label className="text-xs">Display Label</Label>
                <Input
                  value={newVariable.label}
                  onChange={(e) => setNewVariable({ ...newVariable, label: e.target.value })}
                  placeholder="e.g., Diagnosis"
                />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select
                  value={newVariable.type}
                  onValueChange={(value) => setNewVariable({ ...newVariable, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addVariable}
                disabled={!newVariable.name || !newVariable.label}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {template ? 'Update' : 'Create'} Template
        </Button>
      </div>
    </form>
  );
}

TemplateForm.propTypes = {
  template: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};
