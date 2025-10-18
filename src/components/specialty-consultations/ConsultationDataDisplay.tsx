import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, FileText, Calendar, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PropTypes from 'prop-types';

export default function ConsultationDataDisplay({ data, schema }: any) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">No consultation data recorded</p>
      </div>
    );
  }

  const renderValue = (key, value, fieldSchema) => {
    if (value === null || value === undefined || value === '') {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 italic">Not recorded</span>
        </div>
      );
    }

    // Handle boolean
    if (typeof value === 'boolean' || fieldSchema?.type === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">Yes</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600 font-medium">No</span>
            </>
          )}
        </div>
      );
    }

    // Handle arrays (if any)
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {item}
            </Badge>
          ))}
        </div>
      );
    }

    // Handle objects (nested)
    if (typeof value === 'object') {
      return (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <div className="space-y-2 text-sm">
              {Object.entries(value).map(([subKey, subValue]) => (
                <div key={subKey} className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    {subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </span>
                  <span className="text-gray-900">{String(subValue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Handle long text (notes, findings, etc.)
    const isLongText = key.toLowerCase().includes('note') || 
                      key.toLowerCase().includes('finding') ||
                      key.toLowerCase().includes('assessment') ||
                      key.toLowerCase().includes('plan') ||
                      key.toLowerCase().includes('diagnosis');

    if (isLongText && String(value).length > 100) {
      return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-gray-900 whitespace-pre-wrap">{String(value)}</p>
        </div>
      );
    }

    // Default: render as string
    return <span className="text-gray-900 font-medium">{String(value)}</span>;
  };

  const getFieldTitle = (key: any) => {
    if (schema?.properties?.[key]?.title) {
      return schema.properties[key].title;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFieldIcon = (key: any) => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('date') || keyLower.includes('time')) return Calendar;
    if (keyLower.includes('note') || keyLower.includes('finding')) return FileText;
    if (keyLower.includes('doctor') || keyLower.includes('specialist')) return User;
    return FileText;
  };

  const getFieldCategory = (key: any) => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('symptom') || keyLower.includes('complaint')) return 'Symptoms';
    if (keyLower.includes('finding') || keyLower.includes('examination')) return 'Examination';
    if (keyLower.includes('diagnosis') || keyLower.includes('assessment')) return 'Assessment';
    if (keyLower.includes('plan') || keyLower.includes('treatment')) return 'Plan';
    if (keyLower.includes('note') || keyLower.includes('comment')) return 'Notes';
    return 'General';
  };

  // Group fields by category
  const groupedData = Object.entries(data).reduce((acc: any, [key, value]) => {
    const category = getFieldCategory(key);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, value, schema: schema?.properties?.[key] });
    return acc;
  }, {});

  const categoryOrder = ['Symptoms', 'Examination', 'Assessment', 'Plan', 'Notes', 'General'];
  const orderedCategories = categoryOrder.filter(cat => groupedData[cat]);

  return (
    <div className="space-y-6">
      {orderedCategories.map((category, categoryIndex) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {category}
            </h3>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid gap-4">
            {groupedData[category].map(({ key, value, schema }) => {
              const FieldIcon = getFieldIcon(key);
              return (
                <div key={key} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FieldIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        {getFieldTitle(key)}
                      </h4>
                      <div className="text-sm">
                        {renderValue(key, value, schema)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {categoryIndex < orderedCategories.length - 1 && (
            <Separator className="my-6" />
          )}
        </div>
      ))}
    </div>
  );
}

ConsultationDataDisplay.propTypes = {
  data: PropTypes.object,
  schema: PropTypes.object
};