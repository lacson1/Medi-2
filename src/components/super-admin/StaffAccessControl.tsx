// Staff Access Control Component
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dialog';
import { 
  Shield, 
  Users, 
  Building2,
  Settings, 
  Plus,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Key,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { SYSTEM_ROLES, PERMISSION_CATEGORIES } from '@/utils/enhancedRoleManagement';
import { mockApiClient } from "@/api/mockApiClient";

export default function StaffAccessControl() {
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [userPermissions, setUserPermissions] = useState({});

  // Check if user has SuperAdmin role
  if (!hasRole('SuperAdmin')) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access Staff Access Control.
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

  // Fetch users and organizations
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => mockApiClient.entities.User.list(),
  });

  const { data: organizationsData, isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => mockApiClient.entities.Organization.list(),
  });

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      // Initialize user permissions
      const permissions = {};
      usersData.forEach(user => {
        permissions[user.id] = {
          ...SYSTEM_ROLES[user.role]?.permissions || [],
          organizationOverrides: {}
        };
      });
      setUserPermissions(permissions);
    }
  }, [usersData]);

  useEffect(() => {
    if (organizationsData) {
      setOrganizations(organizationsData);
    }
  }, [organizationsData]);

  const handleEditPermissions = (userData: any) => {
    setSelectedUser(userData);
    setIsEditing(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      // Update user permissions in the system
      const updatedUser = {
        ...selectedUser,
        permissions: userPermissions[selectedUser.id],
        updatedAt: new Date().toISOString()
      };

      await mockApiClient.entities.User.update(selectedUser.id, updatedUser);
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      setIsEditing(false);
      setSelectedUser(null);
      
      console.log('User permissions updated successfully');
    } catch (error) {
      console.error('Failed to update user permissions:', error);
    }
  };

  const togglePermission = (permission, userId, organizationId = null) => {
    setUserPermissions(prev => {
      const userPerms = { ...prev[userId] };
      
      if (organizationId) {
        // Organization-specific permission override
        if (!userPerms.organizationOverrides[organizationId]) {
          userPerms.organizationOverrides[organizationId] = [];
        }
        
        const orgPerms = [...userPerms.organizationOverrides[organizationId]];
        if (orgPerms.includes(permission)) {
          userPerms.organizationOverrides[organizationId] = orgPerms.filter(p => p !== permission);
        } else {
          userPerms.organizationOverrides[organizationId] = [...orgPerms, permission];
        }
      } else {
        // Global permission
        if (userPerms.includes(permission)) {
          userPerms = userPerms.filter(p => p !== permission);
        } else {
          userPerms = [...userPerms, permission];
        }
      }
      
      return {
        ...prev,
        [userId]: userPerms
      };
    });
  };

  const hasPermission = (permission, userId, organizationId = null) => {
    const userPerms = userPermissions[userId];
    if (!userPerms) return false;

    if (organizationId && userPerms.organizationOverrides[organizationId]) {
      return userPerms.organizationOverrides[organizationId].includes(permission);
    }

    return userPerms.includes(permission);
  };

  const filteredUsers = users.filter(userData => {
    const matchesSearch = 
      userData.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrg = filterOrg === 'all' || userData.organization === filterOrg;
    const matchesRole = filterRole === 'all' || userData.role === filterRole;

    return matchesSearch && matchesOrg && matchesRole;
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

  const getPermissionDescription = (permission: any) => {
    const descriptions = {
      'system_admin': 'Full system administration access',
      'user_management': 'Create, edit, and manage user accounts',
      'role_management': 'Assign and modify user roles',
      'permission_management': 'Manage role permissions and access levels',
      'organization_management': 'Manage organization settings and data',
      'clinical_access': 'Access to clinical features and patient data',
      'patient_records': 'View and edit patient medical records',
      'prescription_rights': 'Create and manage prescriptions',
      'financial_access': 'Access to financial and billing data',
      'billing_management': 'Manage billing and payment processing',
      'lab_access': 'Access to laboratory management features',
      'pharmacy_access': 'Access to pharmacy management features',
      'basic_access': 'Basic system access and profile management'
    };
    return descriptions[permission] || 'System permission';
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Staff Access Control
              </h1>
              <p className="text-sm text-gray-600">
                Manage organization-level permission overrides for staff members
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={refetchUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
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
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
              <p className="text-xs text-muted-foreground">
                With access controls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Permission Categories</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(PERMISSION_CATEGORIES).length}</div>
              <p className="text-xs text-muted-foreground">
                Available categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custom Overrides</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(userPermissions).reduce((count: any, perms: any) => 
                  count + Object.keys(perms.organizationOverrides || {}).length, 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Organization overrides
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.keys(SYSTEM_ROLES).map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Access Control Table */}
        <Card>
          <CardHeader>
            <CardTitle>{"Staff Access Control"}</CardTitle>
            <CardDescription>
              Manage organization-level permission overrides for individual staff members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{"Staff Member"}</TableHead>
                    <TableHead>{"Role"}</TableHead>
                    <TableHead>{"Organization"}</TableHead>
                    <TableHead>{"Default Permissions"}</TableHead>
                    <TableHead>{"Organization Overrides"}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
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
                        No staff members found matching your criteria
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
                              <div className="text-sm text-gray-500">
                                {userData.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(userData.role)}>
                                {userData.role}
                              </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getOrganizationName(userData.organization)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {SYSTEM_ROLES[userData.role]?.permissions?.length || 0} permissions
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {userPermissions[userData.id]?.organizationOverrides ? 
                              Object.keys(userPermissions[userData.id].organizationOverrides).length : 0} overrides
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPermissions(userData)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Permissions Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit Permissions: {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogTitle>
              <DialogDescription>
                Manage organization-level permission overrides for this staff member
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">User Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span> {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                    <div>
                      <span className="text-gray-600">Role:</span> {selectedUser.role}
                    </div>
                    <div>
                      <span className="text-gray-600">Organization:</span> {getOrganizationName(selectedUser.organization)}
                    </div>
                    <div>
                      <span className="text-gray-600">Default Permissions:</span> {SYSTEM_ROLES[selectedUser.role]?.permissions?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Permission Categories */}
                {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="space-y-4">
                    <h4 className="font-semibold text-lg">{category.name}</h4>
                    
                    {/* Global Permissions */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-gray-700">Global Permissions</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {category.permissions.map((permission: any) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`global-${permission}`}
                              checked={hasPermission(permission, selectedUser.id)}
                              onCheckedChange={() => togglePermission(permission, selectedUser.id)}
                            />
                            <Label htmlFor={`global-${permission}`} className="text-sm">
                              {permission.replace(/_/g, ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Organization-Specific Overrides */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-gray-700">Organization-Specific Overrides</h5>
                      {organizations.map(org => (
                        <div key={org.id} className="p-3 border rounded-lg">
                          <h6 className="font-medium text-sm mb-2">{org.name}</h6>
                          <div className="grid grid-cols-2 gap-2">
                            {category.permissions.map((permission: any) => (
                              <div key={`${org.id}-${permission}`} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${org.id}-${permission}`}
                                  checked={hasPermission(permission, selectedUser.id, org.id)}
                                  onCheckedChange={() => togglePermission(permission, selectedUser.id, org.id)}
                                />
                                <Label htmlFor={`${org.id}-${permission}`} className="text-sm">
                                  {permission.replace(/_/g, ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePermissions}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>{"Access Control Information"}</CardTitle>
            <CardDescription>
              Understanding organization-level permission overrides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Permission Override System</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Default permissions are inherited from the user's role</li>
                  <li>• Organization overrides can enhance or restrict permissions at the organization level</li>
                  <li>• Overrides take precedence over default role permissions</li>
                  <li>• Changes are applied immediately and affect user access across the system</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Best Practices</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Use organization overrides sparingly to maintain security</li>
                  <li>• Document the reason for any permission overrides</li>
                  <li>• Regularly review and audit permission assignments</li>
                  <li>• Consider creating custom roles instead of individual overrides when possible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
