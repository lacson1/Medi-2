import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, Users, UserPlus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationAssignment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningUser, setAssigningUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['all_users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: organizations = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
    initialData: [],
  });

  const assignOrgMutation = useMutation({
    mutationFn: ({ userId, orgId, orgName }) => 
      base44.entities.User.update(userId, { 
        organization_id: orgId,
        organization_name: orgName
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
      setAssigningUser(null);
      toast.success("Organization assigned successfully");
    },
    onError: () => {
      toast.error("Failed to assign organization");
    }
  });

  const handleAssign = (userId, orgId) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      assignOrgMutation.mutate({ userId, orgId, orgName: org.name });
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingUsers || loadingOrgs) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Organization Assignment
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Assign users to organizations and manage their access
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {organizations.length} Organizations
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="border-2 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {assigningUser?.id === user.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                          {user.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAssigningUser(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(user.id, assigningUser.selectedOrg)}
                          disabled={!assigningUser.selectedOrg}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Organization</label>
                      <Select
                        value={assigningUser.selectedOrg}
                        onValueChange={(v) => setAssigningUser({ ...assigningUser, selectedOrg: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose organization..." />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map(org => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name} ({org.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.organization_name ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{user.organization_name}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="mt-1 text-xs">
                            No Organization
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAssigningUser({ id: user.id, selectedOrg: user.organization_id || "" })}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {user.organization_id ? "Change" : "Assign"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}