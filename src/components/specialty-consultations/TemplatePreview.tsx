import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Eye, Calendar, User, CheckCircle } from "lucide-react";
import PropTypes from 'prop-types';

export default function TemplatePreview({ template, onSelect, onClose }: any) {
  if (!template) return null;

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

  const getFieldTypeLabel = (fieldType: any, fieldSchema: any) => {
    if (fieldSchema?.enum) return `Dropdown (${fieldSchema.enum.length} options)`;
    if (fieldType === 'boolean') return 'Checkbox';
    if (fieldType === 'number') return 'Number Input';
    if (fieldType === 'string') {
      const nameLower = fieldSchema?.title?.toLowerCase() || '';
      if (nameLower.includes('note') || nameLower.includes('finding')) return 'Text Area';
      return 'Text Input';
    }
    return fieldType;
  };

  // Group fields by category
  const groupedFields = Object.entries(template.template_schema?.properties || {}).reduce((acc: any, [fieldName, fieldSchema]) => {
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
    <Card className="border-l-4 border-l-blue-500 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">{template.name}</CardTitle>
              {template.description && (
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Template Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(template.template_schema?.properties || {}).length}
            </div>
            <div className="text-sm text-gray-600">Total Fields</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {template.template_schema?.required?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Required</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orderedCategories.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>

        {/* Field Categories */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Form Fields Preview
          </h3>
          
          {orderedCategories.map((category, categoryIndex) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium text-gray-600">{category}</h4>
                <Separator className="flex-1" />
                <Badge variant="outline" className="text-xs">
                  {groupedFields[category].length} fields
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {groupedFields[category].map(({ fieldName, fieldSchema }) => {
                  const FieldIcon = getFieldIcon(fieldName, fieldSchema.type);
                  const isRequired = template.template_schema?.required?.includes(fieldName);
                  
                  return (
                    <div key={fieldName} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FieldIcon className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {fieldSchema.title || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {isRequired && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {getFieldTypeLabel(fieldSchema.type, fieldSchema)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {categoryIndex < orderedCategories.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button onClick={() => onSelect(template)} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

TemplatePreview.propTypes = {
  template: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
