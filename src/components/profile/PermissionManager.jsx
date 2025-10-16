import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shield, Users, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function PermissionManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all_users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
      setEditingUser(null);
      toast.success("Permissions updated successfully");
    },
    onError: () => {
      toast.error("Failed to update permissions");
    }
  });

  const handleSave = (userId, newRole, newStatus) => {
    updateUserMutation.mutate({
      id: userId,
      data: { role: newRole, status: newStatus }
    });
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    admin: "bg-purple-100 text-purple-800",
    user: "bg-blue-100 text-blue-800",
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
    on_leave: "bg-yellow-100 text-yellow-800",
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              User Permissions Manager
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Manage user roles and access across all organizations
            </p>
          </div>
          <Badge className="bg-purple-100 text-purple-800">
            {filteredUsers.length} Users
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search users by name, email, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="border-2 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {editingUser?.id === user.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
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
                          onClick={() => setEditingUser(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(user.id, editingUser.role, editingUser.status)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select
                          value={editingUser.role}
                          onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={editingUser.status}
                          onValueChange={(v) => setEditingUser({ ...editingUser, status: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.organization_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            <Users className="w-3 h-3 inline mr-1" />
                            {user.organization_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                      <Badge className={statusColors[user.status || 'active']}>
                        {user.status || 'active'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingUser({ ...user })}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
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
  );
}