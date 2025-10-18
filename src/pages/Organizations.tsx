
import React, { useState } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Search, Edit, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import OrganizationForm from "../components/organizations/OrganizationForm";

const typeColors = {
  hospital: "bg-red-100 text-red-800",
  clinic: "bg-blue-100 text-blue-800",
  private_practice: "bg-green-100 text-green-800",
  health_center: "bg-purple-100 text-purple-800",
  specialty_center: "bg-cyan-100 text-cyan-800",
  other: "bg-gray-100 text-gray-800",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => mockApiClient.auth.me(),
  });

  const isSuperAdmin = currentUser?.role === 'admin' && currentUser?.email === 'superadmin@mediflow.com';

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => mockApiClient.entities.Organization.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Organization.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setModalContent(null);
      toast.success("Organization created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create organization");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => mockApiClient.entities.Organization.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setModalContent(null);
      toast.success("Organization updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update organization");
    }
  });

  const openModal = (org = null) => {
    setModalContent({
      title: org ? "Edit Organization" : "New Organization",
      form: (
        <OrganizationForm
          organization={org}
          onSubmit={(data) => {
            if (org) {
              updateMutation.mutate({ id: org.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => setModalContent(null)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )
    });
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSuperAdmin ? "All Organizations" : "Organizations"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isSuperAdmin
                ? "Manage all organizations in the system"
                : "Manage healthcare organizations and facilities"}
            </p>
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-500 to-cyan-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Organization
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search organizations by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm ? "No organizations found" : "No organizations yet"}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {searchTerm ? "Try a different search term" : "Create your first organization to get started"}
              </p>
              {!searchTerm && (
                <Button onClick={() => openModal()} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Organization
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org: any) => (
              <Card key={org.id} className="border-2 hover:shadow-xl transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{org.name}</h3>
                        <Badge className={typeColors[org.type] || typeColors.other}>
                          {org.type?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openModal(org)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    {org.contact?.phone && (
                      <p className="text-gray-600">📞 {org.contact.phone}</p>
                    )}
                    {org.contact?.email && (
                      <p className="text-gray-600">📧 {org.contact.email}</p>
                    )}
                    {org.address?.city && (
                      <p className="text-gray-600">📍 {org.address.city}, {org.address.state}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Badge className={statusColors[org.status] || statusColors.active}>
                      {org.status}
                    </Badge>
                    {org.subscription && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{org.subscription.user_limit} users max</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
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
    </div>
  );
}
