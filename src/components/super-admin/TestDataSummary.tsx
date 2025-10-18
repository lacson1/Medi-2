import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Database, 
  Users, 
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApiClient } from "@/api/mockApiClient";

export default function TestDataSummary() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState({
    users: [],
    organizations: [],
    patients: [],
    appointments: [],
    isLoading: true
  });

  // Check if user has SuperAdmin role
  if (!hasRole('SuperAdmin')) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access Test Data Summary.
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
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      const [users, organizations, patients, appointments] = await Promise.all([
        mockApiClient.entities.User.list(),
        mockApiClient.entities.Organization.list(),
        mockApiClient.entities.Patient.list(),
        mockApiClient.entities.Appointment.list()
      ]);

      setData({
        users,
        organizations,
        patients,
        appointments,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load test data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getRoleStats = () => {
    const stats = {};
    data.users.forEach(user => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    return stats;
  };

  const getOrganizationStats = () => {
    const stats = {};
    data.users.forEach(user => {
      const org = data.organizations.find(o => o.id === user.organization);
      const orgName = org ? org.name : 'Unknown';
      stats[orgName] = (stats[orgName] || 0) + 1;
    });
    return stats;
  };

  const exportTestData = () => {
    const exportData = {
      summary: {
        totalUsers: data.users.length,
        totalOrganizations: data.organizations.length,
        totalPatients: data.patients.length,
        totalAppointments: data.appointments.length,
        generatedAt: new Date().toISOString()
      },
      users: data.users,
      organizations: data.organizations,
      patients: data.patients,
      appointments: data.appointments
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-data-summary-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const roleStats = getRoleStats();
  const orgStats = getOrganizationStats();

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Database className="h-6 w-6 text-blue-600" />
                Test Data Summary
              </h1>
              <p className="text-sm text-gray-600">
                Overview of all test users, organizations, and data created for testing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadTestData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportTestData} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.users.length}</div>
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
              <div className="text-2xl font-bold">{data.organizations.length}</div>
              <p className="text-xs text-muted-foreground">
                Test organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.patients.length}</div>
              <p className="text-xs text-muted-foreground">
                Test patients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.appointments.length}</div>
              <p className="text-xs text-muted-foreground">
                Test appointments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{"Role Distribution"}</CardTitle>
            <CardDescription>
              Breakdown of users by role across all organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(roleStats).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{role}</Badge>
                    </div>
                    <div className="text-lg font-semibold">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{"Organization Distribution"}</CardTitle>
            <CardDescription>
              Number of users per organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(orgStats).map(([orgName, count]) => (
                  <div key={orgName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{orgName}</span>
                    </div>
                    <div className="text-lg font-semibold">{count} users</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>{"Test Users"}</CardTitle>
            <CardDescription>
              Complete list of all test users with their roles and organizations
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
                    <TableHead>{"Specialization"}</TableHead>
                    <TableHead>{"Status"}</TableHead>
                    <TableHead>{"Email"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      </TableRow>
                    ))
                  ) : data.users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No test users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.users.map((userData: any) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{userData.roleColor}</span>
                            <div>
                              <div className="font-medium">
                                {userData.firstName} {userData.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userData.licenseNumber}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{userData.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {data.organizations.find(o => o.id === userData.organization)?.name || 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{userData.specialization}</span>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Test Organizations */}
        <Card>
          <CardHeader>
            <CardTitle>{"Test Organizations"}</CardTitle>
            <CardDescription>
              All test organizations created for testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))
              ) : data.organizations.map((org: any) => (
                <div key={org.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">{org.name}</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Type:</strong> {org.type}</div>
                    <div><strong>Phone:</strong> {org.phone}</div>
                    <div><strong>Email:</strong> {org.email}</div>
                    <div><strong>Status:</strong> 
                      <Badge 
                        className={org.isActive ? 'bg-green-100 text-green-800 ml-1' : 'bg-red-100 text-red-800 ml-1'}
                      >
                        {org.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Testing Instructions
            </CardTitle>
            <CardDescription>
              How to use the test data for comprehensive testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Available Test Users:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>SuperAdmin:</strong> Full system access</li>
                    <li>• <strong>Doctors:</strong> Clinical access, prescriptions</li>
                    <li>• <strong>Nurses:</strong> Patient care, vital signs</li>
                    <li>• <strong>Admins:</strong> User management, settings</li>
                    <li>• <strong>Pharmacists:</strong> Medication management</li>
                    <li>• <strong>Lab Technicians:</strong> Lab orders, results</li>
                    <li>• <strong>Billing Specialists:</strong> Financial access</li>
                    <li>• <strong>Receptionists:</strong> Scheduling, check-in</li>
                    <li>• <strong>Staff:</strong> Basic access</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Test Organizations:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>TestMediFlow Medical Center:</strong> Hospital</li>
                    <li>• <strong>TestCity Urgent Care:</strong> Clinic</li>
                    <li>• <strong>Metro Health Clinic:</strong> Clinic</li>
                    <li>• <strong>Sunrise Pediatrics:</strong> Specialty Clinic</li>
                    <li>• <strong>Elite Cardiology Center:</strong> Specialty Clinic</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Testing Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use different user accounts to test role-based access control</li>
                  <li>• Test cross-organization functionality with users from different orgs</li>
                  <li>• Verify permission restrictions work correctly for each role</li>
                  <li>• Test the Super Admin Dashboard with SuperAdmin user</li>
                  <li>• Use the Role Permission Manager to create custom roles</li>
                  <li>• Generate additional test users as needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
