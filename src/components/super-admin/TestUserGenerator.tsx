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
} from '@/components/ui/dialog';
import {
  UserPlus,
  Users,
  Building2,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Copy,
  Trash2,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SYSTEM_ROLES } from '@/utils/enhancedRoleManagement';
import { mockApiClient } from "@/api/mockApiClient";

// Test User Templates
const TEST_USER_TEMPLATES = {
  'doctor_general': {
    name: 'General Doctor',
    role: 'Doctor',
    specialization: 'General Practice',
    department: 'General Medicine',
    permissions: ['clinical_access', 'prescription_rights', 'patient_records', 'appointments'],
    color: '🟢'
  },
  'doctor_specialist': {
    name: 'Specialist Doctor',
    role: 'Doctor',
    specialization: 'Cardiology',
    department: 'Cardiology',
    permissions: ['clinical_access', 'prescription_rights', 'patient_records', 'appointments'],
    color: '🟢'
  },
  'nurse_rn': {
    name: 'Registered Nurse',
    role: 'Nurse',
    specialization: 'General Nursing',
    department: 'Nursing',
    permissions: ['clinical_support', 'patient_care', 'vital_signs', 'medication_assistance'],
    color: '🔷'
  },
  'nurse_specialist': {
    name: 'Specialist Nurse',
    role: 'Nurse',
    specialization: 'Critical Care',
    department: 'ICU',
    permissions: ['clinical_support', 'patient_care', 'vital_signs', 'medication_assistance'],
    color: '🔷'
  },
  'admin_clinic': {
    name: 'Clinic Administrator',
    role: 'Admin',
    specialization: 'Healthcare Administration',
    department: 'Administration',
    permissions: ['user_management', 'organization_settings', 'system_config', 'reports'],
    color: '🔵'
  },
  'pharmacist': {
    name: 'Pharmacist',
    role: 'Pharmacist',
    specialization: 'Clinical Pharmacy',
    department: 'Pharmacy',
    permissions: ['medication_management', 'prescription_verification', 'drug_interactions', 'inventory'],
    color: '🟠'
  },
  'lab_tech': {
    name: 'Lab Technician',
    role: 'Lab Technician',
    specialization: 'Clinical Laboratory',
    department: 'Laboratory',
    permissions: ['lab_order_management', 'specimen_processing', 'lab_results', 'equipment_maintenance'],
    color: '🔬'
  },
  'billing_specialist': {
    name: 'Billing Specialist',
    role: 'Billing Specialist',
    specialization: 'Medical Billing',
    department: 'Billing',
    permissions: ['financial_access', 'billing_management', 'insurance_claims', 'payment_processing'],
    color: '🟡'
  },
  'receptionist': {
    name: 'Receptionist',
    role: 'Receptionist',
    specialization: 'Front Desk Operations',
    department: 'Reception',
    permissions: ['patient_scheduling', 'patient_registration', 'appointment_management', 'check_in'],
    color: '🟣'
  },
  'staff': {
    name: 'Staff Member',
    role: 'Staff',
    specialization: 'Administrative Support',
    department: 'Administration',
    permissions: ['basic_access', 'profile_management', 'patient_info_view'],
    color: '⚪'
  }
};

// Sample names for generating test users
const SAMPLE_NAMES = {
  firstNames: [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
    'James', 'Jennifer', 'William', 'Jessica', 'Richard', 'Ashley', 'Charles',
    'Amanda', 'Thomas', 'Stephanie', 'Christopher', 'Nicole', 'Daniel', 'Elizabeth',
    'Matthew', 'Helen', 'Anthony', 'Deborah', 'Mark', 'Dorothy', 'Donald', 'Betty'
  ],
  lastNames: [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
  ]
};

export default function TestUserGenerator() {
  const { user, hasRole } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [generatedUsers, setGeneratedUsers] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [generationSettings, setGenerationSettings] = useState({
    count: 5,
    organization: '',
    roles: [],
    includeInactive: false,
    namePattern: 'random'
  });

  // Check if user has SuperAdmin role
  if (!hasRole('SuperAdmin')) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access Test User Generator.
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
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const orgsData = await mockApiClient.entities.Organization.list();
      setOrganizations(orgsData);

      // Set default organization
      if (orgsData.length > 0) {
        setGenerationSettings(prev => ({ ...prev, organization: orgsData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomName = () => {
    const firstName = SAMPLE_NAMES.firstNames[Math.floor(Math.random() * SAMPLE_NAMES.firstNames.length)];
    const lastName = SAMPLE_NAMES.lastNames[Math.floor(Math.random() * SAMPLE_NAMES.lastNames.length)];
    return { firstName, lastName };
  };

  const generateTestUsers = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const users = [];
      const selectedRoles = generationSettings.roles.length > 0
        ? generationSettings.roles
        : Object.keys(TEST_USER_TEMPLATES);

      for (let i = 0; i < generationSettings.count; i++) {
        const templateKey = selectedRoles[Math.floor(Math.random() * selectedRoles.length)];
        const template = TEST_USER_TEMPLATES[templateKey];
        const { firstName, lastName } = generateRandomName();

        const user = {
          id: `test-user-${Date.now()}-${i}`,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@testmediflow.com`,
          role: template.role,
          roleColor: template.color,
          specialization: template.specialization,
          licenseNumber: `${template.role.substring(0, 2).toUpperCase()}-TEST-${String(i + 1).padStart(3, '0')}`,
          phone: `+1-555-TEST-${String(i + 1).padStart(3, '0')}`,
          department: template.department,
          organization: generationSettings.organization,
          permissions: template.permissions,
          isActive: !generationSettings.includeInactive || Math.random() > 0.1,
          createdAt: new Date().toISOString(),
          isGenerated: true
        };

        users.push(user);
      }

      setGeneratedUsers(users);
      setIsGenerating(false);
      setShowPreview(true);
    }, 1000);
  };

  const saveGeneratedUsers = async () => {
    try {
      for (const user of generatedUsers) {
        await mockApiClient.entities.User.create(user);
      }

      setGeneratedUsers([]);
      setShowPreview(false);
      alert(`Successfully created ${generatedUsers.length} test users!`);
    } catch (error) {
      console.error('Failed to save users:', error);
      alert('Failed to save some users. Please try again.');
    }
  };

  const clearGeneratedUsers = () => {
    setGeneratedUsers([]);
    setShowPreview(false);
  };

  const exportUsers = () => {
    const dataStr = JSON.stringify(generatedUsers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-users-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-green-600" />
                Test User Generator
              </h1>
              <p className="text-sm text-gray-600">
                Generate test users with different roles for testing purposes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadOrganizations} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Generation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Generation Settings
            </CardTitle>
            <CardDescription>
              Configure how test users should be generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="userCount">Number of Users</Label>
                <Input
                  id="userCount"
                  type="number"
                  min="1"
                  max="50"
                  value={generationSettings.count}
                  onChange={(e) => setGenerationSettings(prev => ({
                    ...prev,
                    count: parseInt(e.target.value) || 1
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="organization">Organization</Label>
                <Select
                  value={generationSettings.organization}
                  onValueChange={(value) => setGenerationSettings(prev => ({
                    ...prev,
                    organization: value
                  }))}
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

              <div>
                <Label htmlFor="namePattern">Name Pattern</Label>
                <Select
                  value={generationSettings.namePattern}
                  onValueChange={(value) => setGenerationSettings(prev => ({
                    ...prev,
                    namePattern: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random Names</SelectItem>
                    <SelectItem value="sequential">Sequential Names</SelectItem>
                    <SelectItem value="template">Template Names</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label>Roles to Generate</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                {Object.entries(TEST_USER_TEMPLATES).map(([key, template]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={key}
                      checked={generationSettings.roles.includes(key)}
                      onChange={(e) => {
                        const roles = e.target.checked
                          ? [...generationSettings.roles, key]
                          : generationSettings.roles.filter(r => r !== key);
                        setGenerationSettings(prev => ({ ...prev, roles }));
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={key} className="text-sm">
                      {template.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeInactive"
                  checked={generationSettings.includeInactive}
                  onChange={(e) => setGenerationSettings(prev => ({
                    ...prev,
                    includeInactive: e.target.checked
                  }))}
                  className="rounded"
                />
                <Label htmlFor="includeInactive">Include some inactive users</Label>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={generateTestUsers}
                disabled={isGenerating || !generationSettings.organization}
                className="w-full md:w-auto"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Test Users
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Users Preview */}
        {showPreview && generatedUsers.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Generated Users Preview
                  </CardTitle>
                  <CardDescription>
                    Review the generated users before saving them
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={exportUsers} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={clearGeneratedUsers} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedUsers.map((userData: any) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{userData.roleColor}</span>
                            <div>
                              <div className="font-medium">
                                {userData.firstName} {userData.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userData.specialization}
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
                          <Badge
                            className={userData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {userData.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{userData.email}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button onClick={clearGeneratedUsers} variant="outline">
                  Cancel
                </Button>
                <Button onClick={saveGeneratedUsers}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save {generatedUsers.length} Users
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Templates Info */}
        <Card>
          <CardHeader>
            <CardTitle>Available Role Templates</CardTitle>
            <CardDescription>
              Predefined templates for different user roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(TEST_USER_TEMPLATES).map(([key, template]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{template.color}</span>
                    <h4 className="font-medium">{template.name}</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Role:</strong> {template.role}</div>
                    <div><strong>Specialization:</strong> {template.specialization}</div>
                    <div><strong>Department:</strong> {template.department}</div>
                    <div><strong>Permissions:</strong> {template.permissions.length} permissions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
