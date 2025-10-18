import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, X } from "lucide-react";
// Removed puppyTemplateSuggestions import - using generic template suggestions instead
import PropTypes from "prop-types";

// Generic template suggestions
const getGenericFieldSuggestions = (specialty: string, existingFields: any[]) => {
  const commonFields = [
    { name: "notes", title: "Notes", type: "text", required: false },
    { name: "follow_up_date", title: "Follow-up Date", type: "string", required: false },
    { name: "status", title: "Status", type: "enum", required: true, enumOptions: "Active, Completed, Pending, Cancelled" }
  ];

  const specialtyFields: Record<string, any[]> = {
    "Cardiology": [
      { name: "heart_rate", title: "Heart Rate (bpm)", type: "number", required: true },
      { name: "blood_pressure", title: "Blood Pressure", type: "string", required: true }
    ],
    "Dermatology": [
      { name: "skin_condition", title: "Skin Condition", type: "enum", required: true, enumOptions: "Normal, Dry, Oily, Irritated" },
      { name: "lesions", title: "Lesions Present", type: "boolean", required: false }
    ],
    "General": [
      { name: "vital_signs", title: "Vital Signs", type: "text", required: false },
      { name: "symptoms", title: "Symptoms", type: "text", required: false }
    ]
  };

  const existingFieldNames = existingFields.map(f => f.name.toLowerCase());
  const suggestions = [...commonFields];

  if (specialtyFields[specialty]) {
    suggestions.push(...specialtyFields[specialty]);
  }

  return suggestions.filter(field => !existingFieldNames.includes(field.name.toLowerCase())).slice(0, 5);
};

const getGenericTemplateSuggestions = (specialty: string) => {
  return [
    {
      name: `${specialty} Consultation`,
      specialty: specialty,
      description: `Standard consultation template for ${specialty}`,
      suggestedFields: getGenericFieldSuggestions(specialty, [])
    }
  ];
};

export default function AITemplateSuggestions({
  specialty,
  existingFields,
  onAddField,
  onAddTemplate,
  onDismiss
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [templateSuggestions, setTemplateSuggestions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (specialty) {
      // Generic field suggestions based on specialty
      const fieldSuggestions = getGenericFieldSuggestions(specialty, existingFields);
      setSuggestions(fieldSuggestions);

      // Generic template suggestions for the specialty
      const templates = getGenericTemplateSuggestions(specialty);
      setTemplateSuggestions(templates);
    }
  }, [specialty, existingFields]);

  const handleAddField = (suggestion: any) => {
    const fieldData = {
      id: Math.random().toString(36).substr(2, 9),
      name: suggestion.name,
      title: suggestion.title,
      type: suggestion.type,
      required: suggestion.required || false,
      enumOptions: suggestion.enumOptions || '',
    };
    onAddField(fieldData);
  };

  const handleUseTemplate = (template: any) => {
    const fields = template.suggestedFields.map(field => ({
      id: Math.random().toString(36).substr(2, 9),
      name: field.name,
      title: field.title,
      type: field.type,
      required: field.required || false,
      enumOptions: field.enumOptions || '',
    }));
    onAddTemplate(template.name, template.description, fields);
  };

  if (!specialty || (suggestions.length === 0 && templateSuggestions.length === 0)) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">AI Template Suggestions</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-blue-700">
          AI-powered suggestions for {specialty} templates based on veterinary best practices
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Template Suggestions */}
          {templateSuggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Suggested Templates</h4>
              <div className="space-y-2">
                {templateSuggestions.map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.suggestedFields.length} fields
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.specialty}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="ml-3 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Suggested Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex-1">
                      <span className="font-medium text-sm">{suggestion.title}</span>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type}
                        </Badge>
                        {suggestion.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddField(suggestion)}
                      className="ml-2"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Disclaimer */}
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            <strong>Note:</strong> These suggestions are AI-generated based on veterinary best practices.
            Always review and customize fields according to your specific needs and clinical judgment.
          </div>
        </CardContent>
      )}
    </Card>
  );
}

AITemplateSuggestions.propTypes = {
  specialty: PropTypes.string,
  existingFields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    required: PropTypes.bool.isRequired,
    enumOptions: PropTypes.string.isRequired,
  })).isRequired,
  onAddField: PropTypes.func.isRequired,
  onAddTemplate: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
