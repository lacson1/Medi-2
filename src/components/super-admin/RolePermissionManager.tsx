import React, { useState, useEffect } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Shield,
  Users,
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
  Copy,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SYSTEM_ROLES, PERMISSION_CATEGORIES } from '@/utils/enhancedRoleManagement';
import { mockApiClient } from "@/api/mockApiClient";

// Role Templates
const ROLE_TEMPLATES = {
  'custom_doctor': {
    name: 'Custom Doctor',
    description: 'Doctor with custom permissions',
    baseRole: 'Doctor',
    permissions: ['clinical_access', 'patient_records', 'prescription_rights', 'appointments']
  },
  'custom_nurse': {
    name: 'Custom Nurse',
    description: 'Nurse with custom permissions',
    baseRole: 'Nurse',
    permissions: ['clinical_support', 'patient_care', 'vital_signs', 'medication_assistance']
  },
  'custom_admin': {
    name: 'Custom Admin',
    description: 'Admin with custom permissions',
    baseRole: 'Admin',
    permissions: ['user_management', 'organization_settings', 'reports']
  },
  'read_only_user': {
    name: 'Read-Only User',
    description: 'User with view-only permissions',
    baseRole: 'Staff',
    permissions: ['patient_info_view', 'appointment_view', 'basic_reports']
  },
  'billing_only': {
    name: 'Billing Only',
    description: 'User with billing-only permissions',
    baseRole: 'Billing Specialist',
    permissions: ['financial_access', 'billing_management', 'payment_processing']
  }
};

export default function RolePermissionManager() {
  const { user, hasRole } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [],
    color: '⚪',
    level: 5
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has SuperAdmin role
  if (!hasRole('SuperAdmin')) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the Role Permission Manager.
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
    loadRolesAndPermissions();
  }, []);

  const loadRolesAndPermissions = async () => {
    setIsLoading(true);
    try {
      // Load system roles
      const systemRoles = Object.values(SYSTEM_ROLES).map(role => ({
        ...role,
        isSystem: true,
        isCustom: false
      }));

      // Load custom roles from database
      const customRolesData = await mockApiClient.entities.Role.list();
      const customRoles = customRolesData.map(role => ({
        ...role,
        isSystem: false,
        isCustom: true
      }));

      // Load all permissions
      const allPermissions = [];
      Object.values(PERMISSION_CATEGORIES).forEach(category => {
        category.permissions.forEach(permission => {
          allPermissions.push({
            key: permission,
            category: category.name,
            description: getPermissionDescription(permission)
          });
        });
      });

      setRoles([...systemRoles, ...customRoles]);
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Failed to load roles and permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionDescription = (permission: any) => {
    const descriptions = {
      'system_admin': 'Full system administration access',
      'full_system_access': 'Complete system access across all organizations',
      'cross_organization_access': 'Access to data across multiple organizations',
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

  const handleCreateRole = () => {
    setIsCreating(true);
    setNewRole({
      name: '',
      description: '',
      permissions: [],
      color: '⚪',
      level: 5
    });
  };

  const handleSaveRole = async () => {
    if (!newRole.name.trim()) return;

    try {
      const roleData = {
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        color: newRole.color,
        level: newRole.level,
        isSystem: false,
        isCustom: true
      };

      const createdRole = await mockApiClient.entities.Role.create(roleData);

      setRoles(prev => [...prev, createdRole]);
      setIsCreating(false);
      setNewRole({
        name: '',
        description: '',
        permissions: [],
        color: '⚪',
        level: 5
      });

      console.log('Role created successfully');
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleEditRole = (role: any) => {
    if (role.isSystem) return; // Can't edit system roles
    setSelectedRole(role);
    setIsEditing(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      await mockApiClient.entities.Role.update(selectedRole.id, selectedRole);

      setRoles(prev => prev.map(role =>
        role.id === selectedRole.id ? selectedRole : role
      ));
      setIsEditing(false);
      setSelectedRole(null);

      console.log('Role updated successfully');
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (confirm('Are you sure you want to delete this custom role?')) {
      try {
        await mockApiClient.entities.Role.delete(roleId);
        setRoles(prev => prev.filter(role => role.id !== roleId));
        console.log('Role deleted successfully');
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  const handleCopyRole = async (role) => {
    try {
      const roleData = {
        name: `${role.name} (Copy)`,
        description: role.description,
        permissions: [...role.permissions],
        color: role.color,
        level: role.level,
        isSystem: false,
        isCustom: true
      };

      const createdRole = await mockApiClient.entities.Role.create(roleData);
      setRoles(prev => [...prev, createdRole]);
      console.log('Role copied successfully');
    } catch (error) {
      console.error('Failed to copy role:', error);
    }
  };

  const handleApplyTemplate = (template: any) => {
    setNewRole(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      permissions: [...template.permissions]
    }));
  };

  const togglePermission = (permission: any, role: any) => {
    if (role.isSystem) return; // Can't modify system roles

    const updatedPermissions = role.permissions.includes(permission)
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission];

    if (isEditing && selectedRole) {
      setSelectedRole(prev => ({
        ...prev,
        permissions: updatedPermissions
      }));
    } else if (isCreating) {
      setNewRole(prev => ({
        ...prev,
        permissions: updatedPermissions
      }));
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' ||
      (filterCategory === 'system' && role.isSystem) ||
      (filterCategory === 'custom' && role.isCustom);
    return matchesSearch && matchesCategory;
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
    return colors[role.name] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                Role Permission Manager
              </h1>
              <p className="text-sm text-gray-600">
                Manage user roles and permissions across all organizations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadRolesAndPermissions} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleCreateRole} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </div>
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
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="system">System Roles</SelectItem>
                  <SelectItem value="custom">Custom Roles</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {filteredRoles.length} of {roles.length} roles
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>{Roles & Permissions}</CardTitle>
            <CardDescription>
              Manage system and custom roles with their associated permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{"Role"}</TableHead>
                    <TableHead>{"Type"}</TableHead>
                    <TableHead>{"Level"}</TableHead>
                    <TableHead>{"Permissions"}</TableHead>
                    <TableHead>{"Users"}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No roles found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role: any) => (
                      <TableRow key={role.id || role.key} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{role.color}</span>
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="text-sm text-gray-500">{role.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={role.isSystem ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                            {role.isSystem ? 'System' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {role.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {role.permissions.length} permissions
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {Math.floor(Math.random() * 10) + 1} users
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                              disabled={role.isSystem}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyRole(role)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {!role.isSystem && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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

        {/* Create Role Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{"Create New Role"}</DialogTitle>
              <DialogDescription>
                Create a custom role with specific permissions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="roleLevel">Level</Label>
                  <Select
                    value={newRole.level.toString()}
                    onValueChange={(value) => setNewRole(prev => ({ ...prev, level: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 (Highest)</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                      <SelectItem value="5">Level 5</SelectItem>
                      <SelectItem value="6">Level 6 (Lowest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="roleDescription">Description</Label>
                <Input
                  id="roleDescription"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description"
                />
              </div>

              <div>
                <Label>{"Role Templates"}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyTemplate(template)}
                      className="justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>{"Permissions"}</Label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4 mt-2">
                  {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                    <div key={categoryKey} className="mb-4">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">{category.name}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {category.permissions.map((permission: any) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={newRole.permissions.includes(permission)}
                              onCheckedChange={() => {
                                const updatedPermissions = newRole.permissions.includes(permission)
                                  ? newRole.permissions.filter(p => p !== permission)
                                  : [...newRole.permissions, permission];
                                setNewRole(prev => ({ ...prev, permissions: updatedPermissions }));
                              }}
                            />
                            <Label htmlFor={permission} className="text-sm">
                              {permission.replace(/_/g, ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRole} disabled={!newRole.name.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
              <DialogDescription>
                Modify permissions for this custom role
              </DialogDescription>
            </DialogHeader>

            {selectedRole && (
              <div className="space-y-4">
                <div>
                  <Label>{"Permissions"}</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-4 mt-2">
                    {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                      <div key={categoryKey} className="mb-4">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">{category.name}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {category.permissions.map((permission: any) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-${permission}`}
                                checked={selectedRole.permissions.includes(permission)}
                                onCheckedChange={() => togglePermission(permission, selectedRole)}
                              />
                              <Label htmlFor={`edit-${permission}`} className="text-sm">
                                {permission.replace(/_/g, ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
