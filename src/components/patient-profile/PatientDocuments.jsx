import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Folder, Edit, Calendar, Download, FileText, Image, File } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const typeConfig = {
  lab_result: { icon: FileText, color: "bg-purple-100 text-purple-800", label: "Lab Result" },
  imaging_report: { icon: Image, color: "bg-blue-100 text-blue-800", label: "Imaging" },
  referral_letter: { icon: FileText, color: "bg-cyan-100 text-cyan-800", label: "Referral" },
  insurance_card: { icon: File, color: "bg-green-100 text-green-800", label: "Insurance" },
  other: { icon: File, color: "bg-gray-100 text-gray-800", label: "Other" },
};

export default function PatientDocuments({ documents, isLoading, onEdit }) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No documents uploaded</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc) => {
        const config = typeConfig[doc.document_type] || typeConfig.other;
        const DocIcon = config.icon;
        
        return (
          <Card key={doc.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <DocIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{doc.document_name}</h4>
                    <Badge className={config.color + " text-xs mt-1"}>{config.label}</Badge>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(doc.upload_date), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(doc)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}