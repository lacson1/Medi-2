import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Edit, Calendar, Download, Eye, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EnhancedDocumentGenerator from "../medical-documents/EnhancedDocumentGenerator";
import PropTypes from "prop-types";

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

export default function PatientMedicalDocuments({ documents, isLoading, onEdit, patient }: any) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const handleDownloadDocument = (doc: any) => {
    // Create a professional document format
    const documentHeader = `
MEDICAL DOCUMENT
${doc.document_title}

Patient: ${doc.patient_name}
Date of Birth: ${format(parseISO(doc.patient?.date_of_birth || doc.created_at), 'MMMM d, yyyy')}
Document Date: ${format(parseISO(doc.issue_date), 'MMMM d, yyyy')}
Document Number: ${doc.document_number || 'N/A'}
Issued By: ${doc.issued_by || 'N/A'}
Status: ${doc.status?.toUpperCase() || 'ISSUED'}

${'='.repeat(50)}

`;

    const fullDocument = documentHeader + doc.generated_content;

    // Create and download as text file
    const blob = new Blob([fullDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.document_title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'document'}_${doc.document_number || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDocumentSaved = () => {
    // Close the generator dialog
    setIsGeneratorOpen(false);
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">No medical documents generated</p>
        <Button onClick={() => setIsGeneratorOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Document
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Medical Documents</h3>
          <p className="text-sm text-gray-600">Generated medical documents and certificates</p>
        </div>
        <Button onClick={() => setIsGeneratorOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Document
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc: any) => {
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
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownloadDocument(doc)}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
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
            <div className="bg-white p-8 border rounded-lg shadow-sm">
              <div className="space-y-4">
                <div className="text-center border-b pb-4 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{previewDoc?.document_title}</h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Patient: {previewDoc?.patient_name}</p>
                    <p>Date: {format(parseISO(previewDoc?.issue_date), 'MMMM d, yyyy')}</p>
                    <p>Document Number: {previewDoc?.document_number || 'N/A'}</p>
                    <p>Issued By: {previewDoc?.issued_by || 'N/A'}</p>
                  </div>
                </div>
                <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed prose prose-sm max-w-none">
                  {previewDoc?.generated_content}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => handleDownloadDocument(previewDoc)}>
                <Download className="w-4 h-4 mr-2" />
                Download Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Generator Dialog */}
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
          <EnhancedDocumentGenerator
            patient={patient}
            onClose={() => setIsGeneratorOpen(false)}
            onSave={handleDocumentSaved}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

PatientMedicalDocuments.propTypes = {
  documents: PropTypes.array,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    date_of_birth: PropTypes.string.isRequired,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string
  }).isRequired
};