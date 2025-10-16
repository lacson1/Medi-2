import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Edit, Calendar, Download, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const typeConfig = {
  sick_note: { color: "bg-red-100 text-red-800", label: "Sick Note" },
  medical_letter: { color: "bg-blue-100 text-blue-800", label: "Medical Letter" },
  insurance_letter: { color: "bg-purple-100 text-purple-800", label: "Insurance Letter" },
  disability_certificate: { color: "bg-orange-100 text-orange-800", label: "Disability Certificate" },
  fitness_certificate: { color: "bg-green-100 text-green-800", label: "Fitness Certificate" },
  referral_letter: { color: "bg-cyan-100 text-cyan-800", label: "Referral Letter" },
  prescription_letter: { color: "bg-indigo-100 text-indigo-800", label: "Prescription Letter" },
  medical_report: { color: "bg-slate-100 text-slate-800", label: "Medical Report" },
  other: { color: "bg-gray-100 text-gray-800", label: "Other" },
};

const statusConfig = {
  draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
  issued: { color: "bg-green-100 text-green-800", label: "Issued" },
  voided: { color: "bg-red-100 text-red-800", label: "Voided" },
  expired: { color: "bg-orange-100 text-orange-800", label: "Expired" },
};

export default function PatientMedicalDocuments({ documents, isLoading, onEdit }) {
  const [previewDoc, setPreviewDoc] = React.useState(null);

  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No medical documents generated</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => {
          const config = typeConfig[doc.document_type] || typeConfig.other;
          const statusConf = statusConfig[doc.status] || statusConfig.issued;

          return (
            <Card key={doc.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-gray-900 mb-1">{doc.document_title}</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={config.color}>{config.label}</Badge>
                        <Badge className={statusConf.color}>{statusConf.label}</Badge>
                        {doc.document_number && (
                          <Badge variant="outline" className="text-xs">{doc.document_number}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Issued: {format(parseISO(doc.issue_date), "MMM d, yyyy")}</span>
                        </div>
                        {doc.issued_by && (
                          <div>By: {doc.issued_by}</div>
                        )}
                        {doc.valid_from && doc.valid_until && (
                          <div className="col-span-2 text-xs text-gray-500">
                            Valid: {format(parseISO(doc.valid_from), "MMM d, yyyy")} - {format(parseISO(doc.valid_until), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPreviewDoc(doc)}
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(doc)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewDoc?.document_title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="bg-white p-8 border rounded-lg whitespace-pre-wrap font-serif text-sm">
              {previewDoc?.generated_content}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}