import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export default function ConsultationDataDisplay({ data, schema }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 text-sm">No data recorded</p>;
  }

  const renderValue = (key, value, fieldSchema) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not recorded</span>;
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
              <XCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">No</span>
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
            <Badge key={idx} variant="outline">{item}</Badge>
          ))}
        </div>
      );
    }

    // Handle objects (nested)
    if (typeof value === 'object') {
      return (
        <div className="ml-4 space-y-2 text-sm">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <strong>{subKey.replace(/_/g, ' ')}:</strong> {String(subValue)}
            </div>
          ))}
        </div>
      );
    }

    // Default: render as string
    return <span className="text-gray-900">{String(value)}</span>;
  };

  const getFieldTitle = (key) => {
    if (schema?.properties?.[key]?.title) {
      return schema.properties[key].title;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => {
        const fieldSchema = schema?.properties?.[key];
        return (
          <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-0">
            <div className="col-span-1">
              <p className="text-sm font-semibold text-gray-600">{getFieldTitle(key)}</p>
            </div>
            <div className="col-span-2">
              {renderValue(key, value, fieldSchema)}
            </div>
          </div>
        );
      })}
    </div>
  );
}