import React from "react";
import DocumentTemplatesManager from "../components/medical-documents/DocumentTemplatesManager";

export default function MedicalDocumentTemplates() {
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <DocumentTemplatesManager />
      </div>
    </div>
  );
}