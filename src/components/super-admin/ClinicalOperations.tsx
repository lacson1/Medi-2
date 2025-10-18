import React, { useState, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Calendar,
  Users,
  Stethoscope,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Building2,
  FileText,
  Pill
} from 'lucide-react';
import { useClinicalOperations } from '@/hooks/useSuperAdminData';

// Simple activity chart component
const ActivityChart = ({ data, height = 200 }: any) => {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-2">
      {data.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div
              className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            >
              <span className="text-xs text-white font-medium">
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Provider performance chart
const ProviderChart = ({ data }: any) => {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-500">No data available</div>;
  }

  return (
    <div className="space-y-3">
      {data.map((provider, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {provider.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{provider.name}</div>
              <div className="text-sm text-gray-500">{provider.specialization}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{provider.appointments}</div>
            <div className="text-xs text-gray-500">appointments</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ClinicalOperations() {
  const { data: clinical, isLoading, error, refresh } = useClinicalOperations();
  const [viewType, setViewType] = useState('overview');
  const [timeRange, setTimeRange] = useState('30days');

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: any) => {
    switch (type) {
      case 'consultation': return 'bg-purple-100 text-purple-800';
      case 'follow_up': return 'bg-blue-100 text-blue-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'routine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Prepare chart data
  const orgActivityData = clinical?.byOrganization?.map(org => ({
    label: org.name,
    value: org.appointments
  })) || [];

  // Use real provider data from clinical operations or fallback to empty array
  const providerData = clinical?.topProviders?.map(provider => ({
    name: provider.name || 'Unknown Provider',
    specialization: provider.specialization || 'General Practice',
    appointments: provider.appointments || 0
  })) || [];

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Clinical Data</CardTitle>
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
          <h2 className="text-xl font-semibold text-gray-900">Clinical Operations</h2>
          <p className="text-sm text-gray-600">
            Monitor clinical activities, appointments, and provider performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-16" /> : clinical?.summary?.totalAppointments || 0}
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <TrendingUp className="h-3 w-3" />
              <span>+8.2% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-16" /> : clinical?.summary?.totalPatients || 0}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Patients</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-16" /> : clinical?.summary?.activePatients || 0}
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Activity className="h-3 w-3" />
              <span>Currently active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Encounters</CardTitle>
            <Stethoscope className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-16" /> : clinical?.summary?.totalEncounters || 0}
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <TrendingUp className="h-3 w-3" />
              <span>+5.8% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Appointments by Organization
            </CardTitle>
            <CardDescription>
              Clinical activity distribution across organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={orgActivityData} />
          </CardContent>
        </Card>

        {/* Top Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Top Providers by Volume
            </CardTitle>
            <CardDescription>
              Most active healthcare providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderChart data={providerData} />
          </CardContent>
        </Card>
      </div>

      {/* Organization Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Clinical Breakdown
          </CardTitle>
          <CardDescription>
            Detailed clinical metrics for each organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : clinical?.byOrganization?.map((org, index) => (
              <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{org.name}</h4>
                  <p className="text-sm text-gray-600">
                    Clinical activity overview
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{org.appointments}</div>
                    <div className="text-xs text-gray-500">Appointments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{org.patients}</div>
                    <div className="text-xs text-gray-500">Patients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{org.encounters}</div>
                    <div className="text-xs text-gray-500">Encounters</div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Clinical Activity
          </CardTitle>
          <CardDescription>
            Latest appointments and clinical activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{"Patient"}</TableHead>
                  <TableHead>{"Type"}</TableHead>
                  <TableHead>{"Status"}</TableHead>
                  <TableHead>{"Provider"}</TableHead>
                  <TableHead>{Date & Time}</TableHead>
                  <TableHead>{"Organization"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : clinical?.recentActivity?.map((activity, index) => (
                  <TableRow key={activity.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {activity.patient.charAt(0)}
                          </span>
                        </div>
                        <span>{activity.patient}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(activity.type)}>
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Stethoscope className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{activity.provider}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{formatDate(activity.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{activity.organization || 'Medical Center'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )) || []}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Today</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="text-sm font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-medium">342</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Notes Created</span>
                <span className="text-sm font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reports Generated</span>
                <span className="text-sm font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Documents Uploaded</span>
                <span className="text-sm font-medium">67</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Prescribed Today</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Refills Requested</span>
                <span className="text-sm font-medium">15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Drug Interactions</span>
                <span className="text-sm font-medium text-red-600">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
