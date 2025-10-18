import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Building2,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Key
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SYSTEM_ROLES } from '@/utils/enhancedRoleManagement';
import { mockApiClient } from "@/api/mockApiClient";

export default function UserManagement() {
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Staff',
    organization: '',
    specialization: '',
    qualifications: [],
    department: '',
    licenseNumber: '',
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterOrg, setFilterOrg] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Check if user has SuperAdmin role
  if (!hasRole('SuperAdmin')) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access User Management.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              This feature is restricted to Super Admin users only.
            </p>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, orgsData] = await Promise.all([
        mockApiClient.entities.User.list(),
        mockApiClient.entities.Organization.list()
      ]);

      setUsers(usersData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (userData: any) => {
    setSelectedUser({ ...userData });
    setIsEditing(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      // Prepare user data for update
      const userData = { ...selectedUser };

      // Handle password change if provided
      if (userData.newPassword && userData.confirmPassword) {
        if (userData.newPassword !== userData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        userData.password = userData.newPassword;
        delete userData.newPassword;
        delete userData.confirmPassword;
      }

      // Update user in the system
      await mockApiClient.entities.User.update(selectedUser.id, userData);

      // Update local state
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? userData : u));
      setIsEditing(false);
      setSelectedUser(null);

      // Show success message
      console.log('User updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      // Show error message
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) return;

    try {
      const userData = {
        ...newUser,
        permissions: SYSTEM_ROLES[newUser.role]?.permissions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const createdUser = await mockApiClient.entities.User.create(userData);
      setUsers(prev => [...prev, createdUser]);
      setIsCreating(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'Staff',
        organization: '',
        specialization: '',
        qualifications: [],
        department: '',
        licenseNumber: '',
        isActive: true
      });
      console.log('User created successfully');
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await mockApiClient.entities.User.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const updatedUser = { ...userToUpdate, isActive: !userToUpdate.isActive };
      await mockApiClient.entities.User.update(userId, updatedUser);

      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleAssignRole = async (userId, newRole) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const updatedUser = {
        ...userToUpdate,
        role: newRole,
        permissions: SYSTEM_ROLES[newRole]?.permissions || []
      };

      await mockApiClient.entities.User.update(userId, updatedUser);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleAssignOrganization = async (userId, orgId) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const updatedUser = { ...userToUpdate, organization: orgId };
      await mockApiClient.entities.User.update(userId, updatedUser);

      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (error) {
      console.error('Failed to assign organization:', error);
    }
  };

  const filteredUsers = users.filter(userData => {
    const matchesSearch =
      userData.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || userData.role === filterRole;
    const matchesOrg = filterOrg === 'all' || userData.organization === filterOrg;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && userData.isActive) ||
      (filterStatus === 'inactive' && !userData.isActive);

    return matchesSearch && matchesRole && matchesOrg && matchesStatus;
  });

  const getRoleColor = (role: any) => {
    const colors = {
      'SuperAdmin': 'bg-purple-100 text-purple-800',
      'Doctor': 'bg-green-100 text-green-800',
      'Nurse': 'bg-blue-100 text-blue-800',
      'Admin': 'bg-orange-100 text-orange-800',
      'Pharmacist': 'bg-yellow-100 text-yellow-800',
      'Lab Technician': 'bg-indigo-100 text-indigo-800',
      'Billing Specialist': 'bg-pink-100 text-pink-800',
      'Receptionist': 'bg-cyan-100 text-cyan-800',
      'Staff': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getOrganizationName = (orgId: any) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'Unknown';
  };

  const getRoleStats = () => {
    const stats = {};
    users.forEach(userData => {
      stats[userData.role] = (stats[userData.role] || 0) + 1;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                User Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage users, roles, and permissions across all organizations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setIsCreating(true)} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
              <p className="text-xs text-muted-foreground">
                Total organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roles</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(roleStats).length}</div>
              <p className="text-xs text-muted-foreground">
                Different roles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.keys(roleStats).map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterOrg} onValueChange={setFilterOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>{"Users"}</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and organization assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{"User"}</TableHead>
                    <TableHead>{"Role"}</TableHead>
                    <TableHead>{"Organization"}</TableHead>
                    <TableHead>{"Status"}</TableHead>
                    <TableHead>{"Last Active"}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((userData: any) => (
                      <TableRow key={userData.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {userData.firstName} {userData.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {userData.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getRoleColor(userData.role)}>
                              {userData.roleColor} {userData.role}
                            </Badge>
                            <Select
                              value={userData.role}
                              onValueChange={(value) => handleAssignRole(userData.id, value)}
                            >
                              <SelectTrigger className="w-32 h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(SYSTEM_ROLES).map(role => (
                                  <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{getOrganizationName(userData.organization)}</span>
                            <Select
                              value={userData.organization}
                              onValueChange={(value) => handleAssignOrganization(userData.id, value)}
                            >
                              <SelectTrigger className="w-32 h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {organizations.map(org => (
                                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={userData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {userData.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(userData.id)}
                              className="h-6 px-2 text-xs"
                            >
                              {userData.isActive ? <UserMinus className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(userData)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(userData.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User: {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
              <DialogDescription>
                Modify user details, role, and permissions
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={selectedUser.firstName}
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={selectedUser.lastName}
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={selectedUser.phone}
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={selectedUser.licenseNumber}
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={selectedUser.specialization || ''}
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={selectedUser.department || ''}
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={selectedUser.licenseNumber || ''}
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input
                      id="qualifications"
                      value={Array.isArray(selectedUser.qualifications) ? selectedUser.qualifications.join(', ') : ''}
                      onChange={(e) => setSelectedUser(prev => ({
                        ...prev,
                        qualifications: e.target.value.split(',').map(q => q.trim()).filter(q => q)
                      }))}
                      placeholder="Enter qualifications (comma separated)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value) => setSelectedUser(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(SYSTEM_ROLES).map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Select
                      value={selectedUser.organization}
                      onValueChange={(value) => setSelectedUser(prev => ({ ...prev, organization: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Password Management</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        onChange={(e) => setSelectedUser(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        onChange={(e) => setSelectedUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={selectedUser.isActive}
                    onChange={(e) => setSelectedUser(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active User</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUser}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{"Create New User"}</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newFirstName">First Name</Label>
                  <Input
                    id="newFirstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="newLastName">Last Name</Label>
                  <Input
                    id="newLastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newEmail">Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="newPhone">Phone</Label>
                <Input
                  id="newPhone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newSpecialization">Specialization</Label>
                  <Input
                    id="newSpecialization"
                    value={newUser.specialization}
                    onChange={(e) => setNewUser(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="Enter specialization"
                  />
                </div>
                <div>
                  <Label htmlFor="newDepartment">Department</Label>
                  <Input
                    id="newDepartment"
                    value={newUser.department}
                    onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newLicenseNumber">License Number</Label>
                  <Input
                    id="newLicenseNumber"
                    value={newUser.licenseNumber}
                    onChange={(e) => setNewUser(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <Label htmlFor="newQualifications">Qualifications</Label>
                  <Input
                    id="newQualifications"
                    value={newUser.qualifications.join(', ')}
                    onChange={(e) => setNewUser(prev => ({
                      ...prev,
                      qualifications: e.target.value.split(',').map(q => q.trim()).filter(q => q)
                    }))}
                    placeholder="Enter qualifications (comma separated)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newRole">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SYSTEM_ROLES).map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newOrganization">Organization</Label>
                  <Select
                    value={newUser.organization}
                    onValueChange={(value) => setNewUser(prev => ({ ...prev, organization: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newIsActive"
                  checked={newUser.isActive}
                  onChange={(e) => setNewUser(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="newIsActive">Active User</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
