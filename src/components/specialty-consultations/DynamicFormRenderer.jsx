import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DynamicFormRenderer({ schema, initialData = {}, onChange }) {
  const [formData, setFormData] = useState(initialData);

  const handleFieldChange = (fieldName, value) => {
    const updatedData = { ...formData, [fieldName]: value };
    setFormData(updatedData);
    if (onChange) {
      onChange(updatedData);
    }
  };

  const renderField = (fieldName, fieldSchema) => {
    const fieldType = fieldSchema.type;
    const fieldTitle = fieldSchema.title || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isRequired = schema.required?.includes(fieldName);
    const fieldValue = formData[fieldName] || '';

    // Handle enum (dropdown)
    if (fieldSchema.enum) {
      return (
        <div key={fieldName} className="space-y-2">
          <Label>
            {fieldTitle}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select 
            value={fieldValue} 
            onValueChange={(value) => handleFieldChange(fieldName, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${fieldTitle}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.enum.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Handle boolean (checkbox)
    if (fieldType === 'boolean') {
      return (
        <div key={fieldName} className="flex items-center space-x-2 py-2">
          <Checkbox
            id={fieldName}
            checked={!!formData[fieldName]}
            onCheckedChange={(checked) => handleFieldChange(fieldName, checked)}
          />
          <Label htmlFor={fieldName} className="cursor-pointer">
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
          <Label>
            {fieldTitle}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            type="number"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, parseFloat(e.target.value) || 0)}
            placeholder={fieldTitle}
            required={isRequired}
          />
        </div>
      );
    }

    // Handle string (default) - use textarea for fields with "notes", "plan", "findings", etc.
    const useTextarea = fieldName.toLowerCase().includes('note') || 
                        fieldName.toLowerCase().includes('plan') || 
                        fieldName.toLowerCase().includes('finding') ||
                        fieldName.toLowerCase().includes('assessment') ||
                        fieldName.toLowerCase().includes('diagnosis') ||
                        fieldName.toLowerCase().includes('symptoms');

    if (useTextarea) {
      return (
        <div key={fieldName} className="space-y-2">
          <Label>
            {fieldTitle}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={fieldTitle}
            required={isRequired}
            rows={3}
          />
        </div>
      );
    }

    return (
      <div key={fieldName} className="space-y-2">
        <Label>
          {fieldTitle}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          type="text"
          value={fieldValue}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          placeholder={fieldTitle}
          required={isRequired}
        />
      </div>
    );
  };

  if (!schema || !schema.properties) {
    return <p className="text-gray-500 text-sm">No form schema available</p>;
  }

  return (
    <div className="space-y-4">
      {Object.keys(schema.properties).map((fieldName) =>
        renderField(fieldName, schema.properties[fieldName])
      )}
    </div>
  );
}