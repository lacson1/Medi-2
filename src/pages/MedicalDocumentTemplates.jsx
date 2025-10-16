import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Plus, 
  Edit, 
  Search, 
  FileCheck,
  FileWarning,
  Shield,
  Briefcase,
  Heart
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import TemplateEditor from "../components/medical-documents/TemplateEditor";

const typeConfig = {
  sick_note: { icon: FileWarning, color: "bg-red-100 text-red-800", label: "Sick Note" },
  medical_letter: { icon: FileText, color: "bg-blue-100 text-blue-800", label: "Medical Letter" },
  insurance_letter: { icon: Shield, color: "bg-purple-100 text-purple-800", label: "Insurance Letter" },
  disability_certificate: { icon: FileCheck, color: "bg-orange-100 text-orange-800", label: "Disability Certificate" },
  fitness_certificate: { icon: Heart, color: "bg-green-100 text-green-800", label: "Fitness Certificate" },
  referral_letter: { icon: FileText, color: "bg-cyan-100 text-cyan-800", label: "Referral Letter" },
  prescription_letter: { icon: FileText, color: "bg-indigo-100 text-indigo-800", label: "Prescription Letter" },
  medical_report: { icon: FileText, color: "bg-slate-100 text-slate-800", label: "Medical Report" },
  other: { icon: FileText, color: "bg-gray-100 text-gray-800", label: "Other" },
};

export default function MedicalDocumentTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [modalContent, setModalContent] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['medical_document_templates'],
    queryFn: () => base44.entities.MedicalDocumentTemplate.list(),
    initialData: [],
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.MedicalDocumentTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_document_templates'] });
      setModalContent(null);
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MedicalDocumentTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_document_templates'] });
      setModalContent(null);
    },
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || template.document_type === selectedType;
    return matchesSearch && matchesType;
  });

  const openEditor = (template = null) => {
    setModalContent({
      title: template ? "Edit Template" : "Create New Template",
      form: (
        <TemplateEditor
          template={template}
          onSubmit={(data) => {
            if (template) {
              updateTemplateMutation.mutate({ id: template.id, data });
            } else {
              createTemplateMutation.mutate(data);
            }
          }}
          onCancel={() => setModalContent(null)}
          isSubmitting={createTemplateMutation.isPending || updateTemplateMutation.isPending}
        />
      )
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Document Templates</h1>
            <p className="text-gray-600 mt-1">Create and manage templates for sick notes, letters, and certificates</p>
          </div>
          <Button 
            onClick={() => openEditor()}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Template
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="sick_note">Sick Notes</option>
                <option value="medical_letter">Medical Letters</option>
                <option value="insurance_letter">Insurance Letters</option>
                <option value="disability_certificate">Disability Certificates</option>
                <option value="fitness_certificate">Fitness Certificates</option>
                <option value="referral_letter">Referral Letters</option>
                <option value="medical_report">Medical Reports</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchQuery || selectedType !== "all" 
                    ? "No templates found matching your criteria" 
                    : "No templates created yet. Click 'New Template' to get started."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const config = typeConfig[template.document_type] || typeConfig.other;
                  const Icon = config.icon;

                  return (
                    <Card key={template.id} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                              <Badge className={config.color + " text-xs mt-1"}>{config.label}</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditor(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        {template.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          {template.is_active ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {modalContent?.form}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}