import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Edit, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import ConsultationDataDisplay from "../specialty-consultations/ConsultationDataDisplay";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800" },
  completed: { color: "bg-green-100 text-green-800" },
  reviewed: { color: "bg-blue-100 text-blue-800" },
};

export default function PatientSpecialtyConsultations({ consultations, templates, isLoading, onEdit }) {
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpanded = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!consultations || consultations.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCog className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No specialty consultations recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {consultations.map((consultation) => {
        const config = statusConfig[consultation.status] || {};
        const date = parseISO(consultation.consultation_date);
        const isExpanded = expandedIds.includes(consultation.id);
        const template = templates?.find(t => t.id === consultation.template_id);

        return (
          <Card key={consultation.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCog className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-lg">{consultation.specialist_name}</CardTitle>
                    <Badge className={config.color}>{consultation.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{consultation.template_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Calendar className="w-4 h-4" />
                    {format(date, "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(consultation)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {consultation.summary && (
                <p className="text-gray-700 mt-2 font-medium">{consultation.summary}</p>
              )}
            </CardHeader>

            <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(consultation.id)}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 border-t">
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View Details
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-4">
                  <ConsultationDataDisplay
                    data={consultation.consultation_data}
                    schema={template?.template_schema}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}