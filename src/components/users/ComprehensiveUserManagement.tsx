import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApiClient } from "@/api/mockApiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, UserPlus, Search, Shield, Building2, Edit, Trash2, Mail, Phone, Calendar, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
    SYSTEM_ROLES,
    canManageUser,
    canAssignRole,
    getAvailableRoles
} from "@/utils/enhancedRoleManagement.jsx";

import UserForm from "./UserForm";
import InviteUserForm from "./InviteUserForm";
import RolePermissionEditor from "./RolePermissionEditor";

const roleColors = {
    super_admin: "bg-purple-100 text-purple-800 border-purple-200",
    org_admin: "bg-blue-100 text-blue-800 border-blue-200",
    doctor: "bg-green-100 text-green-800 border-green-200",
    nurse: "bg-cyan-100 text-cyan-800 border-cyan-200",
    pharmacist: "bg-orange-100 text-orange-800 border-orange-200",
    lab_tech: "bg-indigo-100 text-indigo-800 border-indigo-200",
    billing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    receptionist: "bg-pink-100 text-pink-800 border-pink-200",
    staff: "bg-gray-100 text-gray-800 border-gray-200"
};

const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800"
};

export default function ComprehensiveUserManagement() {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedOrganization, setSelectedOrganization] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [modalContent, setModalContent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const queryClient = useQueryClient();

    // Check if current user is super admin
    const isSuperAdmin = currentUser?.role === 'super_admin';

    // Fetch users with enhanced filtering
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['comprehensive_users'],
        queryFn: async () => {
            const allUsers = await mockApiClient.entities.User.list();
            return allUsers.map(user => ({
                ...user,
                roleInfo: SYSTEM_ROLES[user.role?.toUpperCase()] || SYSTEM_ROLES.STAFF,
                organizationName: user.organization_name || 'No Organization'
            }));
        },
        initialData: [],
    });

    // Fetch organizations for super admin
    const { data: organizations = [] } = useQuery({
        queryKey: ['organizations_for_user_mgmt'],
        queryFn: () => mockApiClient.entities.Organization.list(),
        enabled: isSuperAdmin,
        initialData: [],
    });

    // Filter users based on search and filters
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.job_title?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = selectedRole === "all" || user.role === selectedRole;
            const matchesOrg = selectedOrganization === "all" || user.organization_id === selectedOrganization;
            const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;

            return matchesSearch && matchesRole && matchesOrg && matchesStatus;
        });
    }, [users, searchTerm, selectedRole, selectedOrganization, selectedStatus]);

    // Mutations
    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }) => mockApiClient.entities.User.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comprehensive_users'] });
            setModalContent(null);
            toast.success("User updated successfully");
        },
        onError: () => {
            toast.error("Failed to update user");
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: any) => mockApiClient.entities.User.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comprehensive_users'] });
            setDeleteTarget(null);
            toast.success("User removed successfully");
        },
        onError: () => {
            toast.error("Failed to remove user");
        }
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: ({ userIds, data }) => {
            return Promise.all(userIds.map(id => mockApiClient.entities.User.update(id, data)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comprehensive_users'] });
            setSelectedUsers([]);
            setBulkAction(null);
            toast.success("Bulk update completed");
        },
        onError: () => {
            toast.error("Failed to perform bulk update");
        }
    });

    // Modal handlers
    const openEditModal = (user: any) => {
        setModalContent({
            title: "Edit User",
            content: (
                <UserForm
                    user={user}
                    onSubmit={(data) => updateUserMutation.mutate({ id: user.id, data })}
                    onCancel={() => setModalContent(null)}
                    isSubmitting={updateUserMutation.isPending}
                    availableRoles={getAvailableRoles(currentUser?.role)}
                    organizations={organizations}
                    isSuperAdmin={isSuperAdmin}
                />
            )
        });
    };

    const openInviteModal = () => {
        setModalContent({
            title: "Invite New User",
            content: (
                <InviteUserForm
                    organization={currentUser?.organization_id}
                    organizations={organizations}
                    isSuperAdmin={isSuperAdmin}
                    onSuccess={() => {
                        setModalContent(null);
                        toast.success("Invitation sent successfully");
                    }}
                    onCancel={() => setModalContent(null)}
                />
            )
        });
    };

    const openRoleEditor = (user: any) => {
        setModalContent({
            title: `Edit Permissions - ${user.full_name}`,
            content: (
                <RolePermissionEditor
                    user={user}
                    onSave={(role, permissions) => {
                        updateUserMutation.mutate({
                            id: user.id,
                            data: { role, permissions }
                        });
                    }}
                    onCancel={() => setModalContent(null)}
                    isSubmitting={updateUserMutation.isPending}
                />
            )
        });
    };

    // Bulk actions
    const handleBulkAction = (action: any) => {
        if (selectedUsers.length === 0) {
            toast.error("Please select users first");
            return;
        }

        switch (action) {
            case 'activate':
                bulkUpdateMutation.mutate({
                    userIds: selectedUsers,
                    data: { status: 'active' }
                });
                break;
            case 'deactivate':
                bulkUpdateMutation.mutate({
                    userIds: selectedUsers,
                    data: { status: 'inactive' }
                });
                break;
            case 'suspend':
                bulkUpdateMutation.mutate({
                    userIds: selectedUsers,
                    data: { status: 'suspended' }
                });
                break;
            case 'delete':
                setDeleteTarget({ ids: selectedUsers, bulk: true });
                break;
        }
    };

    // User selection
    const toggleUserSelection = (userId: any) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAllUsers = () => {
        setSelectedUsers(filteredUsers.map(user => user.id));
    };

    const clearSelection = () => {
        setSelectedUsers([]);
    };

    // Statistics
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.status === 'active').length;
        const inactive = users.filter(u => u.status === 'inactive').length;
        const suspended = users.filter(u => u.status === 'suspended').length;
        const pending = users.filter(u => u.status === 'pending').length;

        return { total, active, inactive, suspended, pending };
    }, [users]);

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isSuperAdmin ? "System User Management" : "User Management"}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isSuperAdmin
                                ? "Manage all users across all organizations"
                                : "Manage team members and their access"}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {canAssignRole(currentUser?.role, 'staff') && (
                            <Button
                                onClick={openInviteModal}
                                className="bg-gradient-to-r from-blue-500 to-cyan-600"
                            >
                                <UserPlus className="w-5 h-5 mr-2" />
                                Invite User
                            </Button>
                        )}
                        {isSuperAdmin && (
                            <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <Shield className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Inactive</p>
                                    <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                                </div>
                                <Users className="w-8 h-8 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Suspended</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                                </div>
                                <Shield className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search users by name, email, or job title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {Object.values(SYSTEM_ROLES).map(role => (
                                        <SelectItem key={role.key} value={role.key}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isSuperAdmin && (
                                <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Organizations</SelectItem>
                                        {organizations.map(org => (
                                            <SelectItem key={org.id} value={org.id}>
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-blue-700">
                                        {selectedUsers.length} user(s) selected
                                    </span>
                                    <Button variant="outline" size="sm" onClick={clearSelection}>
                                        Clear Selection
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('activate')}
                                    >
                                        Activate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('deactivate')}
                                    >
                                        Deactivate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('suspend')}
                                    >
                                        Suspend
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleBulkAction('delete')}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Users ({filteredUsers.length})
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={selectAllUsers}>
                                    Select All
                                </Button>
                                <Button variant="outline" size="sm" onClick={clearSelection}>
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg mb-2">No users found</p>
                                <p className="text-gray-400 text-sm">
                                    {searchTerm ? "Try adjusting your search criteria" : "Invite your first user to get started"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredUsers.map((user: any) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleUserSelection(user.id)}
                                                className="w-4 h-4"
                                            />
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                                                {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                                                    <Badge className={roleColors[user.role] || roleColors.staff}>
                                                        {user.roleInfo?.name || 'Staff'}
                                                    </Badge>
                                                    <Badge className={statusColors[user.status] || statusColors.active}>
                                                        {user.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </span>
                                                    {user.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {user.phone}
                                                        </span>
                                                    )}
                                                    {isSuperAdmin && user.organizationName && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {user.organizationName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {canManageUser(currentUser?.role, user.role, currentUser?.organization_id, user.organization_id) && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditModal(user)}
                                                        title="Edit User"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openRoleEditor(user)}
                                                        title="Edit Permissions"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </Button>
                                                    {user.id !== currentUser?.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeleteTarget(user)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{modalContent?.title}</DialogTitle>
                    </DialogHeader>
                    {modalContent?.content}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{"Confirm Deletion"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget?.bulk ? (
                                `Are you sure you want to delete ${deleteTarget.ids.length} selected users? This action cannot be undone.`
                            ) : (
                                `Are you sure you want to delete ${deleteTarget?.full_name}? This action cannot be undone.`
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteTarget?.bulk) {
                                    bulkUpdateMutation.mutate({
                                        userIds: deleteTarget.ids,
                                        data: { status: 'deleted' }
                                    });
                                } else {
                                    deleteUserMutation.mutate(deleteTarget.id);
                                }
                            }}
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

ComprehensiveUserManagement.propTypes = {
    // No props needed as it uses context
};
