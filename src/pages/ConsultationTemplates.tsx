import React, { useState } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TemplateFormBuilder from "../components/templates/TemplateFormBuilder";

export default function ConsultationTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['consultation_templates'],
    queryFn: () => mockApiClient.entities.ConsultationTemplate.list(),
    initialData: [],
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.ConsultationTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation_templates'] });
      setModalContent(null);
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => mockApiClient.entities.ConsultationTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation_templates'] });
      setModalContent(null);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: any) => mockApiClient.entities.ConsultationTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation_templates'] });
      setDeleteTarget(null);
    },
  });

  const handleSubmit = (templateData: any, editingTemplate: any) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateData });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  const openModal = (template = null) => {
    setModalContent({
      title: template ? "Edit Template" : "New Consultation Template",
      form: (
        <TemplateFormBuilder
          template={template}
          onSubmit={(data) => handleSubmit(data, template)}
          onCancel={() => setModalContent(null)}
          isSubmitting={createTemplateMutation.isPending || updateTemplateMutation.isPending}
        />
      )
    });
  };

  const filteredTemplates = templates.filter(template =>
    template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const specialtyColors = {
    'Cardiology': 'bg-red-100 text-red-800',
    'Neurology': 'bg-purple-100 text-purple-800',
    'Pediatrics': 'bg-blue-100 text-blue-800',
    'Orthopedics': 'bg-green-100 text-green-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Templates</h1>
            <p className="text-gray-600 mt-1">Create and manage custom consultation forms</p>
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Template
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search templates by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery ? "No templates found" : "No templates yet"}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {searchQuery ? "Try a different search term" : "Create your first consultation template to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => openModal()} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: any) => {
              const fieldCount = template.template_schema?.properties
                ? Object.keys(template.template_schema.properties).length
                : 0;

              return (
                <Card key={template.id} className="border-2 hover:shadow-xl transition-all group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                        {template.specialty && (
                          <Badge className={specialtyColors[template.specialty] || 'bg-gray-100 text-gray-800'}>
                            {template.specialty}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openModal(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteTarget(template)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span>{fieldCount} field{fieldCount !== 1 ? 's' : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          {modalContent?.form}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              Any consultations using this template will still retain their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTemplateMutation.mutate(deleteTarget.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}