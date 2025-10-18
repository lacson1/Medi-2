import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText, User, AlertCircle, CheckCircle } from "lucide-react";
import PropTypes from 'prop-types';

export default function DynamicFormRenderer({ schema, initialData = {}, onChange }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleFieldChange = (fieldName: any, value: any) => {
    const updatedData = { ...formData, [fieldName]: value };
    setFormData(updatedData);

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }

    if (onChange) {
      onChange(updatedData);
    }
  };

  const validateField = (fieldName, value, fieldSchema) => {
    const isRequired = schema.required?.includes(fieldName);

    if (isRequired && (!value || value === '')) {
      return `${fieldSchema.title || fieldName} is required`;
    }

    if (fieldSchema.minLength && String(value).length < fieldSchema.minLength) {
      return `Minimum ${fieldSchema.minLength} characters required`;
    }

    if (fieldSchema.maxLength && String(value).length > fieldSchema.maxLength) {
      return `Maximum ${fieldSchema.maxLength} characters allowed`;
    }

    return null;
  };

  const getFieldIcon = (fieldName: any, fieldType: any) => {
    const nameLower = fieldName.toLowerCase();
    if (nameLower.includes('date') || nameLower.includes('time')) return Calendar;
    if (nameLower.includes('note') || nameLower.includes('finding')) return FileText;
    if (nameLower.includes('doctor') || nameLower.includes('specialist')) return User;
    if (fieldType === 'boolean') return CheckCircle;
    return FileText;
  };

  const getFieldCategory = (fieldName: any) => {
    const nameLower = fieldName.toLowerCase();
    if (nameLower.includes('symptom') || nameLower.includes('complaint')) return 'Symptoms';
    if (nameLower.includes('finding') || nameLower.includes('examination')) return 'Examination';
    if (nameLower.includes('diagnosis') || nameLower.includes('assessment')) return 'Assessment';
    if (nameLower.includes('plan') || nameLower.includes('treatment')) return 'Plan';
    if (nameLower.includes('note') || nameLower.includes('comment')) return 'Notes';
    return 'General';
  };

  const renderField = (fieldName: any, fieldSchema: any) => {
    const fieldType = fieldSchema.type;
    const fieldTitle = fieldSchema.title || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isRequired = schema.required?.includes(fieldName);
    const fieldValue = formData[fieldName] || '';
    const fieldIcon = getFieldIcon(fieldName, fieldType);
    const FieldIcon = fieldIcon;
    const hasError = errors[fieldName];

    // Handle enum (dropdown)
    if (fieldSchema.enum) {
      return (
        <div key={fieldName} className="space-y-2">
          <Label className="flex items-center gap-2">
            <FieldIcon className="w-4 h-4 text-gray-600" />
            {fieldTitle}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={fieldValue}
            onValueChange={(value) => {
              handleFieldChange(fieldName, value);
              const error = validateField(fieldName, value, fieldSchema);
              if (error) setErrors(prev => ({ ...prev, [fieldName]: error }));
            }}
          >
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder={`Select ${fieldTitle}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.enum.map((option: any) => (
                <SelectItem key={option} value={option}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{option}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{hasError}</AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    // Handle boolean (checkbox)
    if (fieldType === 'boolean') {
      return (
        <div key={fieldName} className="flex items-center space-x-3 py-3 bg-gray-50 rounded-lg px-4">
          <Checkbox
            id={fieldName}
            checked={!!formData[fieldName]}
            onCheckedChange={(checked) => handleFieldChange(fieldName, checked)}
          />
          <Label htmlFor={fieldName} className="cursor-pointer flex items-center gap-2 flex-1">
            <FieldIcon className="w-4 h-4 text-gray-600" />
            {fieldTitle}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
      );
    }

    // Handle number
    if (fieldType === 'number') {
      return (
        <div key={fieldName} className="space-y-2">
          <Label className="flex items-center gap-2">
            <FieldIcon className="w-4 h-4 text-gray-600" />
            {fieldTitle}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            type="number"
            value={fieldValue}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              handleFieldChange(fieldName, value);
              const error = validateField(fieldName, value, fieldSchema);
              if (error) setErrors(prev => ({ ...prev, [fieldName]: error }));
            }}
            placeholder={fieldTitle}
            required={isRequired}
            className={hasError ? "border-red-500" : ""}
          />
          {hasError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{hasError}</AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    // Handle string (default) - use textarea for fields with "notes", "plan", "findings", etc.
    const useTextarea = fieldName.toLowerCase().includes('note') ||
      fieldName.toLowerCase().includes('plan') ||
      fieldName.toLowerCase().includes('finding') ||
      fieldName.toLowerCase().includes('assessment') ||
      fieldName.toLowerCase().includes('diagnosis') ||
      fieldName.toLowerCase().includes('symptoms') ||
      fieldName.toLowerCase().includes('comment');

    if (useTextarea) {
      return (
        <div key={fieldName} className="space-y-2">
          <Label className="flex items-center gap-2">
            <FieldIcon className="w-4 h-4 text-gray-600" />
            {fieldTitle}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            value={fieldValue}
            onChange={(e) => {
              handleFieldChange(fieldName, e.target.value);
              const error = validateField(fieldName, e.target.value, fieldSchema);
              if (error) setErrors(prev => ({ ...prev, [fieldName]: error }));
            }}
            placeholder={fieldTitle}
            required={isRequired}
            rows={4}
            className={hasError ? "border-red-500" : ""}
          />
          {hasError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{hasError}</AlertDescription>
            </Alert>
          )}
          <p className="text-xs text-gray-500">
            {fieldValue.length} characters
            {fieldSchema.maxLength && ` (max ${fieldSchema.maxLength})`}
          </p>
        </div>
      );
    }

    return (
      <div key={fieldName} className="space-y-2">
        <Label className="flex items-center gap-2">
          <FieldIcon className="w-4 h-4 text-gray-600" />
          {fieldTitle}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          type="text"
          value={fieldValue}
          onChange={(e) => {
            handleFieldChange(fieldName, e.target.value);
            const error = validateField(fieldName, e.target.value, fieldSchema);
            if (error) setErrors(prev => ({ ...prev, [fieldName]: error }));
          }}
          placeholder={fieldTitle}
          required={isRequired}
          className={hasError ? "border-red-500" : ""}
        />
        {hasError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{{ hasError }}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  if (!schema || !schema.properties) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">No form schema available</p>
      </div>
    );
  }

  // Group fields by category
  const groupedFields = Object.entries(schema.properties).reduce((acc: any, [fieldName, fieldSchema]) => {
    const category = getFieldCategory(fieldName);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ fieldName, fieldSchema });
    return acc;
  }, {});

  const categoryOrder = ['Symptoms', 'Examination', 'Assessment', 'Plan', 'Notes', 'General'];
  const orderedCategories = categoryOrder.filter(cat => groupedFields[cat]);

  return (
    <div className="space-y-6">
      {orderedCategories.map((category, categoryIndex) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {category}
            </h3>
            <Separator className="flex-1" />
          </div>

          <div className="grid gap-4">
            {groupedFields[category].map(({ fieldName, fieldSchema }) =>
              renderField(fieldName, fieldSchema)
            )}
          </div>

          {categoryIndex < orderedCategories.length - 1 && (
            <Separator className="my-6" />
          )}
        </div>
      ))}
    </div>
  );
}

DynamicFormRenderer.propTypes = {
  schema: PropTypes.object,
  initialData: PropTypes.object,
  onChange: PropTypes.func
};