// Error Monitoring Component with AI Insights
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertTriangle, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Shield,
  Bug,
  Server,
  Database,
  Globe,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApiClient } from "@/api/mockApiClient";

export default function ErrorMonitoring() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [filters, setFilters] = useState({
    severity: '',
    component: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Fetch error logs from database
  const { data: errorData, isLoading, error, refetch } = useQuery({
    queryKey: ['error-logs', page, limit, filters],
    queryFn: async () => {
      const logs = await mockApiClient.entities.ErrorLog.list();
      
      // Apply filters
      let filteredLogs = logs;
      
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
      
      if (filters.component) {
        filteredLogs = filteredLogs.filter(log => 
          log.component.toLowerCase().includes(filters.component.toLowerCase())
        );
      }
      
      if (filters.search) {
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
          log.stack_trace.toLowerCase().includes(filters.search.toLowerCase())
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

  // Generate AI insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const logs = await mockApiClient.entities.ErrorLog.list();
      
      // Prepare error data for AI analysis
      const errorSummary = {
        totalErrors: logs.length,
        errorsBySeverity: logs.reduce((acc: any, log) => {
          acc[log.severity] = (acc[log.severity] || 0) + 1;
          return acc;
        }, {}),
        errorsByComponent: logs.reduce((acc: any, log) => {
          acc[log.component] = (acc[log.component] || 0) + 1;
          return acc;
        }, {}),
        recentErrors: logs.slice(0, 10).map(log => ({
          message: log.message,
          severity: log.severity,
          component: log.component,
          timestamp: log.timestamp
        })),
        errorTrends: logs.slice(0, 30).map(log => ({
          date: log.timestamp.split('T')[0],
          count: 1
        }))
      };

      // Use Base44 LLM integration for AI insights
      const prompt = `
        Analyze the following error data from a healthcare management system and provide insights for system performance improvement:
        
        Total Errors: ${errorSummary.totalErrors}
        Errors by Severity: ${JSON.stringify(errorSummary.errorsBySeverity)}
        Errors by Component: ${JSON.stringify(errorSummary.errorsByComponent)}
        Recent Errors: ${JSON.stringify(errorSummary.recentErrors)}
        
        Please provide:
        1. Key patterns and trends
        2. Critical issues that need immediate attention
        3. Recommendations for system optimization
        4. Preventive measures to reduce future errors
        5. Performance improvement suggestions
        
        Format the response as a structured analysis with actionable insights.
      `;

      const response = await mockApiClient.integrations.Core.GenerateText({
        prompt: prompt,
        max_tokens: 1000,
        temperature: 0.3
      });

      return response.generated_text;
    },
    onSuccess: (insights: any) => {
      setAiInsights(insights);
      setIsGeneratingInsights(false);
    },
    onError: (error: any) => {
      console.error('Failed to generate AI insights:', error);
      setIsGeneratingInsights(false);
    }
  });

  const handleFilterChange = (key: any, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      severity: '',
      component: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setPage(1);
  };

  const handleGenerateInsights = () => {
    setIsGeneratingInsights(true);
    generateInsightsMutation.mutate();
  };

  const handleExport = async (format = 'csv') => {
    try {
      const logs = await mockApiClient.entities.ErrorLog.list();
      
      // Apply same filters as the table
      let filteredLogs = logs;
      
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
      
      if (filters.component) {
        filteredLogs = filteredLogs.filter(log => 
          log.component.toLowerCase().includes(filters.component.toLowerCase())
        );
      }
      
      if (filters.search) {
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
          log.stack_trace.toLowerCase().includes(filters.search.toLowerCase())
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
        const headers = ['Timestamp', 'Severity', 'Component', 'Message', 'User ID', 'Session ID'];
        const csvContent = [
          headers.join(','),
          ...filteredLogs.map(log => [
            `"${formatDate(log.timestamp)}"`,
            `"${log.severity}"`,
            `"${log.component}"`,
            `"${log.message}"`,
            `"${log.user_id || 'N/A'}"`,
            `"${log.session_id || 'N/A'}"`
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `error-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      console.log(`Exported ${filteredLogs.length} error records as ${format.toUpperCase()}`);
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

  const getSeverityColor = (severity: any) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: any) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <Bug className="h-4 w-4" />;
      case 'warning': return <Shield className="h-4 w-4" />;
      case 'info': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getComponentIcon = (component: any) => {
    switch (component.toLowerCase()) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'server': return <Server className="h-4 w-4" />;
      case 'frontend': return <Globe className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const pagination = errorData?.pagination;

  // Calculate error statistics
  const errorStats = errorData?.logs ? {
    total: errorData.pagination.total,
    critical: errorData.logs.filter(log => log.severity === 'critical').length,
    error: errorData.logs.filter(log => log.severity === 'error').length,
    warning: errorData.logs.filter(log => log.severity === 'warning').length,
    info: errorData.logs.filter(log => log.severity === 'info').length
  } : { total: 0, critical: 0, error: 0, warning: 0, info: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Error Monitoring</h2>
          <p className="text-sm text-gray-600">
            System error tracking and AI-powered performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={handleGenerateInsights} 
            variant="outline" 
            size="sm"
            disabled={isGeneratingInsights}
          >
            <Brain className={`h-4 w-4 mr-2 ${isGeneratingInsights ? 'animate-pulse' : ''}`} />
            {isGeneratingInsights ? 'Generating...' : 'AI Insights'}
          </Button>
          <Button onClick={refetch} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Brain className="h-5 w-5" />
              AI Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-blue-800">
              <pre className="whitespace-pre-wrap font-sans">{aiInsights}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-16" /> : errorStats.total}
            </div>
            <p className="text-xs text-gray-500">
              All error types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? <Skeleton className="h-8 w-8" /> : errorStats.critical}
            </div>
            <p className="text-xs text-gray-500">
              System critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Errors</CardTitle>
            <Bug className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? <Skeleton className="h-8 w-8" /> : errorStats.error}
            </div>
            <p className="text-xs text-gray-500">
              Application errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Warnings</CardTitle>
            <Shield className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? <Skeleton className="h-8 w-8" /> : errorStats.warning}
            </div>
            <p className="text-xs text-gray-500">
              Warning messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Info</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? <Skeleton className="h-8 w-8" /> : errorStats.info}
            </div>
            <p className="text-xs text-gray-500">
              Information logs
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
            Filter error logs by severity, component, or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search errors..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.component} onValueChange={(value) => handleFilterChange('component', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Components</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>

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

      {/* Error Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{"Error Logs"}</CardTitle>
          <CardDescription>
            Detailed error tracking and system monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{"Timestamp"}</TableHead>
                  <TableHead>{"Severity"}</TableHead>
                  <TableHead>{"Component"}</TableHead>
                  <TableHead>{"Message"}</TableHead>
                  <TableHead>{"User ID"}</TableHead>
                  <TableHead>{"Session ID"}</TableHead>
                  <TableHead>{"Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : errorData?.logs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No error logs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  errorData?.logs?.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(log.timestamp)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          <span className="mr-1">{getSeverityIcon(log.severity)}</span>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getComponentIcon(log.component)}
                          <span className="text-sm">{log.component}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono text-gray-500">
                          {log.user_id || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono text-gray-500">
                          {log.session_id || 'N/A'}
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
