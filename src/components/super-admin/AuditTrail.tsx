import React, { useState, useEffect } from 'react';
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
  FileText, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Building2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useAuditTrail, useExportData } from '@/hooks/useSuperAdminData';
import { useQuery } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";

export default function AuditTrail() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    organization: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch audit logs from database
  const { data: auditData, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', page, limit, filters],
    queryFn: async () => {
      const logs = await mockApiClient.entities.AuditLog.list();
      
      // Apply filters
      let filteredLogs = logs;
      
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filters.action.toLowerCase())
        );
      }
      
      if (filters.user) {
        filteredLogs = filteredLogs.filter(log => 
          log.user.toLowerCase().includes(filters.user.toLowerCase())
        );
      }
      
      if (filters.organization) {
        filteredLogs = filteredLogs.filter(log => 
          log.organization.toLowerCase().includes(filters.organization.toLowerCase())
        );
      }
      
      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= new Date(filters.dateTo)
        );
      }
      
      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
      
      return {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / limit),
          hasPrev: page > 1,
          hasNext: endIndex < filteredLogs.length
        }
      };
    }
  });

  const handleFilterChange = (key: any, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      user: '',
      organization: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  const handleExport = async (format = 'csv') => {
    try {
      const logs = await mockApiClient.entities.AuditLog.list();
      
      // Apply same filters as the table
      let filteredLogs = logs;
      
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filters.action.toLowerCase())
        );
      }
      
      if (filters.user) {
        filteredLogs = filteredLogs.filter(log => 
          log.user.toLowerCase().includes(filters.user.toLowerCase())
        );
      }
      
      if (filters.organization) {
        filteredLogs = filteredLogs.filter(log => 
          log.organization.toLowerCase().includes(filters.organization.toLowerCase())
        );
      }
      
      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= new Date(filters.dateTo)
        );
      }
      
      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (format === 'csv') {
        // Generate CSV
        const headers = ['Timestamp', 'Action', 'User', 'Organization', 'Details', 'IP Address'];
        const csvContent = [
          headers.join(','),
          ...filteredLogs.map(log => [
            `"${formatDate(log.timestamp)}"`,
            `"${log.action}"`,
            `"${log.user}"`,
            `"${log.organization}"`,
            `"${log.details}"`,
            `"${log.ip_address}"`
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (format === 'txt') {
        // Generate TXT
        const txtContent = filteredLogs.map(log => 
          `[${formatDate(log.timestamp)}] ${log.action} - ${log.user} (${log.organization})\n` +
          `Details: ${log.details}\n` +
          `IP: ${log.ip_address}\n` +
          '---\n'
        ).join('\n');
        
        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      console.log(`Exported ${filteredLogs.length} audit records as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action: any) => {
    switch (action) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      case 'create_patient': return 'bg-blue-100 text-blue-800';
      case 'update_appointment': return 'bg-purple-100 text-purple-800';
      case 'delete_user': return 'bg-red-100 text-red-800';
      case 'create_organization': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: any) => {
    switch (action) {
      case 'login': return '🔓';
      case 'logout': return '🔒';
      case 'create_patient': return '👤';
      case 'update_appointment': return '📅';
      case 'delete_user': return '🗑️';
      case 'create_organization': return '🏢';
      default: return '📝';
    }
  };

  const pagination = auditData?.pagination;

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Loading Audit Trail
          </CardTitle>
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
          <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
          <p className="text-sm text-gray-600">
            System-wide audit logs and user activity tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport('txt')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export TXT
          </Button>
          <Button onClick={refetch} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-16" /> : pagination?.total || 0}
            </div>
            <p className="text-xs text-gray-500">
              System-wide audit records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Showing</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> : auditData?.logs?.length || 0}
            </div>
            <p className="text-xs text-gray-500">
              Records on this page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Page</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-8" /> : pagination?.page || 1}
            </div>
            <p className="text-xs text-gray-500">
              of {pagination?.totalPages || 1} pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Per Page</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-8" /> : pagination?.limit || 50}
            </div>
            <p className="text-xs text-gray-500">
              Records per page
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
          <CardDescription>
            Filter audit logs by action, user, organization, or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search action..."
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search user..."
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search organization..."
                value={filters.organization}
                onChange={(e) => handleFilterChange('organization', e.target.value)}
                className="pl-10"
              />
            </div>

            <Input
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            <Input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />

            <div className="flex items-center gap-2">
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear
              </Button>
              <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Detailed audit trail of all system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : auditData?.logs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No audit logs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  auditData?.logs?.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(log.timestamp)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          <span className="mr-1">{getActionIcon(log.action)}</span>
                          {log.action.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {log.user.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{log.organization}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {log.details}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono text-gray-500">
                          {log.ip_address}
                        </div>
                      </TableCell>
                      <TableCell>
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        disabled={isLoading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
