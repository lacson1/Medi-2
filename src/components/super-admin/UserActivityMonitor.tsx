import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Users,
  Activity,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  UserCheck,
  UserX,
  Building2
} from 'lucide-react';
import { useUserActivity } from '@/hooks/useSuperAdminData';

// Simple role distribution chart
const RoleDistributionChart = ({ data }: any) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const total = Object.values(data).reduce((sum: any, count: any) => sum + count, 0);
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500'
  ];

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([role, count], index) => {
        const percentage = (count / total) * 100;
        return (
          <div key={role} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{role}</span>
              <span className="font-medium">{count} users</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${colors[index % colors.length]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
          </div>
        );
      })}
    </div>
  );
};

// Activity heatmap component
const ActivityHeatmap = ({ data }: any) => {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const maxActivity = Math.max(...data.map(d => d.count));

  return (
    <div className="grid grid-cols-7 gap-1">
      {data.map((day, index) => {
        const intensity = day.count / maxActivity;
        const bgColor = intensity > 0.8 ? 'bg-green-500' :
          intensity > 0.6 ? 'bg-green-400' :
            intensity > 0.4 ? 'bg-yellow-400' :
              intensity > 0.2 ? 'bg-yellow-300' : 'bg-gray-200';

        return (
          <div
            key={index}
            className={`h-8 w-8 rounded ${bgColor} flex items-center justify-center text-xs font-medium`}
            title={`${day.day}: ${day.count} logins`}
          >
            {day.count > 0 && day.count}
          </div>
        );
      })}
    </div>
  );
};

export default function UserActivityMonitor() {
  const { data: users, isLoading, error, refresh } = useUserActivity();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('lastLogin');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields
      if (sortField === 'lastLogin' || sortField === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!users) return null;

    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = users.filter(user => !user.isActive).length;
    const usersToday = users.filter(user => {
      const lastLogin = new Date(user.lastLogin);
      const today = new Date();
      return lastLogin.toDateString() === today.toDateString();
    }).length;

    const usersThisWeek = users.filter(user => {
      const lastLogin = new Date(user.lastLogin);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastLogin > weekAgo;
    }).length;

    // Role distribution
    const roleDistribution = users.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Organization distribution
    const orgDistribution = users.reduce((acc: any, user) => {
      acc[user.organization] = (acc[user.organization] || 0) + 1;
      return acc;
    }, {});

    // Activity heatmap data (mock data for demonstration)
    const activityHeatmap = Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      count: Math.floor(Math.random() * 20)
    }));

    return {
      total: users.length,
      active: activeUsers,
      inactive: inactiveUsers,
      usersToday,
      usersThisWeek,
      roleDistribution,
      orgDistribution,
      activityHeatmap
    };
  }, [users]);

  const handleSort = (field: any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortButton = ({ field, children }: any) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 px-2 lg:px-3"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: any) => {
    const colors = {
      'SuperAdmin': 'bg-purple-100 text-purple-800',
      'Doctor': 'bg-green-100 text-green-800',
      'Nurse': 'bg-blue-100 text-blue-800',
      'Admin': 'bg-orange-100 text-orange-800',
      'Pharmacist': 'bg-yellow-100 text-yellow-800',
      'Staff': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={refresh} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Activity Monitor</h2>
          <p className="text-sm text-gray-600">
            Track user activity, roles, and engagement across all organizations
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> : stats?.total || 0}
            </div>
            <p className="text-xs text-gray-500">
              {stats?.active || 0} active, {stats?.inactive || 0} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> : stats?.usersToday || 0}
            </div>
            <p className="text-xs text-gray-500">
              Users logged in today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active This Week</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> : stats?.usersThisWeek || 0}
            </div>
            <p className="text-xs text-gray-500">
              Users active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">User Roles</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-8" /> : Object.keys(stats?.roleDistribution || {}).length}
            </div>
            <p className="text-xs text-gray-500">
              Different role types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-8" /> : Object.keys(stats?.orgDistribution || {}).length}
            </div>
            <p className="text-xs text-gray-500">
              Organizations with users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Role Distribution
            </CardTitle>
            <CardDescription>
              Distribution of users across different roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoleDistributionChart data={stats?.roleDistribution} />
          </CardContent>
        </Card>

        {/* Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Activity Heatmap
            </CardTitle>
            <CardDescription>
              User login activity over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap data={stats?.activityHeatmap} />
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="Nurse">Nurse</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {filteredAndSortedUsers.length} of {users?.length || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{"User Activity Details"}</CardTitle>
          <CardDescription>
            Detailed view of all users and their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="name">User</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="role">Role</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="organization">Organization</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="isActive">Status</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="lastLogin">Last Login</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="loginCount">Login Count</SortButton>
                  </TableHead>
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
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUsers.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{user.organization}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(user.lastLogin)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{user.loginCount}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
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
    </div>
  );
}
