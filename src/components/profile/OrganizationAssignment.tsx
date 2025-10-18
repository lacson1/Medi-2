import React, { useState } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Building2,
  Users,
  UserPlus,
  Save,
  X,
  Filter,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Copy,
  Eye,
  EyeOff,
  Settings,
  Key,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Globe,
  Shield,
  UserCheck,
  UserX
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function OrganizationAssignment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningUser, setAssigningUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterOrg, setFilterOrg] = useState("all");
  const [activeTab, setActiveTab] = useState("users");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['all_users'],
    queryFn: () => mockApiClient.entities.User.list(),
    initialData: [],
  });

  const { data: organizations = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => mockApiClient.entities.Organization.list(),
    initialData: [],
  });

  const assignOrgMutation = useMutation({
    mutationFn: ({ userId, orgId, orgName }) =>
      mockApiClient.entities.User.update(userId, {
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

  const bulkAssignMutation = useMutation({
    mutationFn: async ({ userIds, orgId, orgName }) => {
      const promises = userIds.map(id =>
        mockApiClient.entities.User.update(id, {
          organization_id: orgId,
          organization_name: orgName
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
      setSelectedUsers([]);
      setShowBulkActions(false);
      toast.success("Bulk assignment completed successfully");
    },
    onError: () => {
      toast.error("Failed to perform bulk assignment");
    }
  });

  const removeFromOrgMutation = useMutation({
    mutationFn: (userId: any) =>
      mockApiClient.entities.User.update(userId, {
        organization_id: null,
        organization_name: null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
      toast.success("User removed from organization");
    },
    onError: () => {
      toast.error("Failed to remove user from organization");
    }
  });

  const handleAssign = (userId: any, orgId: any) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      assignOrgMutation.mutate({ userId, orgId, orgName: org.name });
    }
  };

  const handleBulkAssign = (orgId: any) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      bulkAssignMutation.mutate({ userIds: selectedUsers, orgId, orgName: org.name });
    }
  };

  const handleSelectUser = (userId: any) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleRemoveFromOrg = (userId: any) => {
    if (window.confirm("Are you sure you want to remove this user from their organization?")) {
      removeFromOrgMutation.mutate(userId);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrg = filterOrg === "all" ||
      (filterOrg === "unassigned" && !user.organization_id) ||
      user.organization_id === filterOrg;

    return matchesSearch && matchesOrg;
  });

  if (loadingUsers || loadingOrgs) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Organization Assignment
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Assign users to organizations and manage their access across the system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {organizations.length} Organizations
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['all_users', 'organizations'] })}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterOrg} onValueChange={setFilterOrg}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Building2 className="w-4 h-4 mr-2" />
                          Assign to Organization
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {organizations.map(org => (
                          <DropdownMenuItem
                            key={org.id}
                            onClick={() => handleBulkAssign(org.id)}
                          >
                            <Building2 className="w-4 h-4 mr-2" />
                            {org.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUsers([])}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organizations Overview */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Organizations Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {organizations.map(org => {
                  const orgUsers = users.filter(user => user.organization_id === org.id);
                  return (
                    <Card key={org.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold">{org.name}</h4>
                          </div>
                          <Badge variant="outline">{org.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{orgUsers.length} users</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const unassignedUsers = users.filter(user => !user.organization_id);
                              if (unassignedUsers.length > 0) {
                                setSelectedUsers(unassignedUsers.map(u => u.id));
                                toast.success(`Selected ${unassignedUsers.length} unassigned users`);
                              } else {
                                toast.info("No unassigned users available");
                              }
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Quick Assign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((user: any) => (
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
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
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
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setAssigningUser({ id: user.id, selectedOrg: user.organization_id || "" })}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              {user.organization_id ? "Change Organization" : "Assign Organization"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Email
                            </DropdownMenuItem>
                            {user.organization_id && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleRemoveFromOrg(user.id)}
                                  className="text-red-600"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Remove from Organization
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
    </div>
  );
}