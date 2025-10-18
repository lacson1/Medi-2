import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Loader2, Sparkles, Lightbulb, CheckCircle } from "lucide-react";
import AITemplateSuggestions from "./AITemplateSuggestions";
import { getSuggestedFieldsForDocumentType, getAllDocumentTypes, getDocumentTypeInfo } from "@/data/documentTypeFieldSuggestions";
import PropTypes from "prop-types";

const FIELD_TYPES = [
  { value: 'string', label: 'Text (Short)' },
  { value: 'text', label: 'Text (Long/Notes)' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No (Checkbox)' },
  { value: 'enum', label: 'Dropdown (Select)' },
];

export default function TemplateFormBuilder({ template, onSubmit, onCancel, isSubmitting }: any) {
  const [name, setName] = useState(template?.name || "");
  const [specialty, setSpecialty] = useState(template?.specialty || "");
  const [description, setDescription] = useState(template?.description || "");
  const [documentType, setDocumentType] = useState(template?.document_type || "");
  const [fields, setFields] = useState(() => {
    if (template?.template_schema?.properties) {
      return Object.keys(template.template_schema.properties).map(key => ({
        id: Math.random().toString(36).substr(2, 9),
        name: key,
        title: template.template_schema.properties[key].title || key,
        type: template.template_schema.properties[key].enum ? 'enum' : template.template_schema.properties[key].type,
        required: template.template_schema.required?.includes(key) || false,
        enumOptions: template.template_schema.properties[key].enum?.join(', ') || '',
      }));
    }
    return [];
  });
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showSuggestedFields, setShowSuggestedFields] = useState(false);
  const [usedSuggestedFields, setUsedSuggestedFields] = useState(new Set());

  const addField = () => {
    setFields([...fields, {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      title: '',
      type: 'string',
      required: false,
      enumOptions: '',
    }]);
  };

  const updateField = (id: any, updates: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: any) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const moveField = (index: any, direction: any) => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const handleAddSuggestedField = (suggestedField: any) => {
    setFields([...fields, suggestedField]);
  };

  const handleUseSuggestedTemplate = (templateName, templateDescription, suggestedFields) => {
    setName(templateName);
    setDescription(templateDescription);
    setFields(suggestedFields);
    setShowAISuggestions(false);
  };

  const toggleAISuggestions = () => {
    setShowAISuggestions(!showAISuggestions);
  };

  const toggleSuggestedFields = () => {
    setShowSuggestedFields(!showSuggestedFields);
  };

  const addSuggestedField = (suggestedField: any) => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      name: suggestedField.name,
      title: suggestedField.title,
      type: suggestedField.type,
      required: suggestedField.required,
      enumOptions: suggestedField.enumOptions || '',
    };
    setFields([...fields, newField]);
    setUsedSuggestedFields(new Set([...usedSuggestedFields, suggestedField.name]));
  };

  const addAllSuggestedFields = () => {
    const suggestedFields = getSuggestedFieldsForDocumentType(documentType);
    const newFields = suggestedFields
      .filter(field => !usedSuggestedFields.has(field.name))
      .map(field => ({
        id: Math.random().toString(36).substr(2, 9),
        name: field.name,
        title: field.title,
        type: field.type,
        required: field.required,
        enumOptions: field.enumOptions || '',
      }));
    setFields([...fields, ...newFields]);
    setUsedSuggestedFields(new Set([...usedSuggestedFields, ...suggestedFields.map(f => f.name)]));
  };

  const getSuggestedFields = () => {
    return getSuggestedFieldsForDocumentType(documentType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build JSON Schema from fields
    const properties = {};
    const required = [];

    fields.forEach(field => {
      if (!field.name) return;

      const fieldSchema = {
        title: field.title || field.name,
      };

      if (field.type === 'enum') {
        fieldSchema.type = 'string';
        fieldSchema.enum = field.enumOptions.split(',').map(o => o.trim()).filter(Boolean);
      } else if (field.type === 'text') {
        fieldSchema.type = 'string';
      } else {
        fieldSchema.type = field.type;
      }

      properties[field.name] = fieldSchema;

      if (field.required) {
        required.push(field.name);
      }
    });

    const templateData = {
      name,
      specialty,
      description,
      document_type: documentType,
      template_schema: {
        type: 'object',
        properties,
        required,
      }
    };

    onSubmit(templateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Template Name *"}</Label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Cardiology Follow-up"
          />
        </div>
        <div className="space-y-2">
          <Label>{"Specialty"}</Label>
          <Input
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="e.g., Cardiology"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{"Document Type *"}</Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
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
        {documentType && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className={getDocumentTypeInfo(documentType).color}>
              {getDocumentTypeInfo(documentType).icon} {getDocumentTypeInfo(documentType).name}
            </Badge>
            <span className="text-sm text-gray-600">{getDocumentTypeInfo(documentType).description}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>{"Description"}</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of what this template is used for..."
          rows={2}
        />
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Form Fields</h3>
          <div className="flex gap-2">
            {documentType && getSuggestedFields().length > 0 && (
              <Button
                type="button"
                onClick={toggleSuggestedFields}
                variant="outline"
                size="sm"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Suggested Fields
              </Button>
            )}
            {specialty && (
              <Button
                type="button"
                onClick={toggleAISuggestions}
                variant="outline"
                size="sm"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Suggestions
              </Button>
            )}
            <Button type="button" onClick={addField} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
        </div>

        {/* Suggested Fields Component */}
        {showSuggestedFields && documentType && getSuggestedFields().length > 0 && (
          <div className="mb-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Suggested Fields for {getDocumentTypeInfo(documentType).name}</h4>
                  </div>
                  <Button
                    type="button"
                    onClick={addAllSuggestedFields}
                    variant="outline"
                    size="sm"
                    className="bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add All
                  </Button>
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
          </div>
        )}

        {/* AI Suggestions Component */}
        {showAISuggestions && specialty && (
          <div className="mb-6">
            <AITemplateSuggestions
              specialty={specialty}
              existingFields={fields}
              onAddField={handleAddSuggestedField}
              onAddTemplate={handleUseSuggestedTemplate}
              onDismiss={() => setShowAISuggestions(false)}
            />
          </div>
        )}

        {fields.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">No fields yet. Add fields to build your form.</p>
              <Button type="button" onClick={addField} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Field
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id} className="border-2">
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-1 flex flex-col gap-1 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveField(index, 'up')}
                        disabled={index === 0}
                      >
                        <GripVertical className="w-3 h-3" />
                      </Button>
                      <span className="text-xs text-gray-400 text-center">{index + 1}</span>
                    </div>

                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Field Name *</Label>
                      <Input
                        required
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                        placeholder="field_name"
                        className="h-9"
                      />
                    </div>

                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Display Label</Label>
                      <Input
                        value={field.title}
                        onChange={(e) => updateField(field.id, { title: e.target.value })}
                        placeholder="Field Label"
                        className="h-9"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select value={field.type} onValueChange={(value) => updateField(field.id, { type: value })}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {field.type === 'enum' && (
                      <div className="col-span-12 ml-10 space-y-1">
                        <Label className="text-xs">Options (comma-separated)</Label>
                        <Input
                          value={field.enumOptions}
                          onChange={(e) => updateField(field.id, { enumOptions: e.target.value })}
                          placeholder="Option 1, Option 2, Option 3"
                          className="h-9"
                        />
                      </div>
                    )}

                    <div className="col-span-2 flex items-center justify-center pt-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                        <Label htmlFor={`required-${field.id}`} className="text-xs cursor-pointer">
                          Required
                        </Label>
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end pt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || fields.length === 0}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : template ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}

TemplateFormBuilder.propTypes = {
  template: PropTypes.shape({
    name: PropTypes.string,
    specialty: PropTypes.string,
    description: PropTypes.string,
    document_type: PropTypes.string,
    template_schema: PropTypes.shape({
      properties: PropTypes.object,
      required: PropTypes.array,
    }),
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};