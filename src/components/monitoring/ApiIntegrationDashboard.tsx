/**
 * API Integration Monitoring Dashboard
 * Real-time monitoring of API performance, errors, and health
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Server,
  Users,
  Calendar,
  FileText
} from 'lucide-react';
import { api } from '@/api/apiClient';
import { useApiHealth } from '@/hooks/useApi';

export default function ApiIntegrationDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  
  // Health check
  const { data: healthData, isLoading: healthLoading } = useApiHealth({
    refetchInterval: refreshInterval
  });
  
  // Mock metrics data (in real implementation, this would come from your monitoring system)
  const [metrics, setMetrics] = useState({
    requests: {
      total: 1247,
      successful: 1189,
      failed: 58,
      successRate: 95.3
    },
    performance: {
      averageResponseTime: 245,
      p95ResponseTime: 890,
      p99ResponseTime: 1200
    },
    errors: {
      total: 58,
      byType: {
        '4xx': 23,
        '5xx': 12,
        'Network': 15,
        'Timeout': 8
      },
      recent: [
        { id: 1, timestamp: '2024-01-20T10:30:00Z', type: '4xx', message: 'Patient not found', endpoint: '/api/patients/999' },
        { id: 2, timestamp: '2024-01-20T10:25:00Z', type: '5xx', message: 'Internal server error', endpoint: '/api/appointments' },
        { id: 3, timestamp: '2024-01-20T10:20:00Z', type: 'Network', message: 'Connection timeout', endpoint: '/api/users' }
      ]
    },
    endpoints: {
      '/api/patients': { requests: 456, avgTime: 180, errors: 12 },
      '/api/appointments': { requests: 234, avgTime: 320, errors: 8 },
      '/api/users': { requests: 189, avgTime: 150, errors: 5 },
      '/api/organizations': { requests: 98, avgTime: 200, errors: 3 }
    }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        requests: {
          ...prev.requests,
          total: prev.requests.total + Math.floor(Math.random() * 5),
          successful: prev.requests.successful + Math.floor(Math.random() * 4),
          successRate: ((prev.requests.successful + Math.floor(Math.random() * 4)) / 
                       (prev.requests.total + Math.floor(Math.random() * 5))) * 100
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Integration Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of API performance and health
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
            {getStatusIcon(healthData?.status || 'unknown')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {healthData?.status || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Response time: {healthData?.responseTime || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.requests.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.requests.successful} of {metrics.requests.total} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.performance.averageResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              P95: {metrics.performance.p95ResponseTime}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.errors.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Request Volume
                </CardTitle>
                <CardDescription>
                  Total requests in the last hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Requests</span>
                    <span className="text-2xl font-bold">{metrics.requests.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Successful</span>
                    <span className="text-lg text-green-600">{metrics.requests.successful}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Failed</span>
                    <span className="text-lg text-red-600">{metrics.requests.failed}</span>
                  </div>
                  <Progress 
                    value={metrics.requests.successRate} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Response Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Response Time Distribution
                </CardTitle>
                <CardDescription>
                  Performance metrics for API responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average</span>
                    <span className="text-lg">{metrics.performance.averageResponseTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">95th Percentile</span>
                    <span className="text-lg">{metrics.performance.p95ResponseTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">99th Percentile</span>
                    <span className="text-lg">{metrics.performance.p99ResponseTime}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{"Endpoint Performance"}</CardTitle>
              <CardDescription>
                Performance metrics by API endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.endpoints).map(([endpoint, data]) => (
                  <div key={endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Database className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{endpoint}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.requests} requests
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{data.avgTime}ms</div>
                        <div className="text-xs text-muted-foreground">Avg Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-red-600">{data.errors}</div>
                        <div className="text-xs text-muted-foreground">Errors</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Types */}
            <Card>
              <CardHeader>
                <CardTitle>{"Error Types"}</CardTitle>
                <CardDescription>
                  Distribution of errors by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.errors.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <Badge variant={type === '4xx' ? 'destructive' : type === '5xx' ? 'destructive' : 'secondary'}>
                        {type}
                      </Badge>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Errors */}
            <Card>
              <CardHeader>
                <CardTitle>{"Recent Errors"}</CardTitle>
                <CardDescription>
                  Latest error occurrences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.errors.recent.map((error: any) => (
                    <div key={error.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="destructive">{error.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm font-medium">{error.message}</div>
                      <div className="text-xs text-muted-foreground">{error.endpoint}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cache Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hit Rate</span>
                    <span className="font-medium">87.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Miss Rate</span>
                    <span className="font-medium">12.7%</span>
                  </div>
                  <Progress value={87.3} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Database Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Query Time</span>
                    <span className="font-medium">45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connections</span>
                    <span className="font-medium">12/50</span>
                  </div>
                  <Progress value={24} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Heap Used</span>
                    <span className="font-medium">256MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Heap Total</span>
                    <span className="font-medium">512MB</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
