
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Search, Mail, Phone, Shield, Edit, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

import UserForm from "../components/users/UserForm";
import InviteUserForm from "../components/users/InviteUserForm";

const roleColors = {
  admin: "bg-purple-100 text-purple-800",
  user: "bg-blue-100 text-blue-800",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me(),
  });

  const isSuperAdmin = currentUser?.role === 'admin' && currentUser?.email === 'superadmin@mediflow.com';

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      // SuperAdmin sees all users, regular admin sees only their org
      if (isSuperAdmin) {
        return allUsers;
      }
      return allUsers.filter(u => u.organization_id === currentUser?.organization_id);
    },
    enabled: !!currentUser, // Changed from !!currentUser?.organization_id to !!currentUser as SuperAdmin doesn't need an org_id filter
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalContent(null);
      toast.success("User updated successfully");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
      toast.success("User removed successfully");
    },
  });

  const openEditModal = (user) => {
    setModalContent({
      title: "Edit User",
      content: (
        <UserForm
          user={user}
          onSubmit={(data) => updateUserMutation.mutate({ id: user.id, data })}
          onCancel={() => setModalContent(null)}
          isSubmitting={updateUserMutation.isPending}
        />
      )
    });
  };

  const openInviteModal = () => {
    setModalContent({
      title: "Invite User",
      content: (
        <InviteUserForm
          organization={currentUser?.organization_id}
          onSuccess={() => {
            setModalContent(null);
            toast.success("Invitation sent successfully");
          }}
          onCancel={() => setModalContent(null)}
        />
      )
    });
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSuperAdmin ? "All System Users" : "User Management"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isSuperAdmin 
                ? "Manage all users across all organizations" 
                : "Manage team members and their access"}
            </p>
          </div>
          {isAdmin && ( // Only admins can invite users
            <Button
              onClick={openInviteModal}
              className="bg-gradient-to-r from-blue-500 to-cyan-600"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite User
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">{user.job_title || 'Staff Member'}</p>
                        {isSuperAdmin && user.organization_name && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {user.organization_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Admins can edit/delete users, but not themselves */}
                    {isAdmin && user.id !== currentUser?.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                    )}
                    {user.department && (
                      <p className="text-sm text-gray-600">
                        <strong>Department:</strong> {user.department}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Badge className={roleColors[user.role]}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Badge className={statusColors[user.status || 'active']}>
                      {user.status || 'active'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          {modalContent?.content}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteTarget?.full_name} from your organization?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserMutation.mutate(deleteTarget.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
