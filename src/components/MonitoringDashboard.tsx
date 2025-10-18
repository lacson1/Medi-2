import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Download,
  Clock
} from 'lucide-react';
import { ErrorLogger, HealthChecker } from '@/lib/monitoring';

/**
 * System Monitoring Dashboard
 * Provides real-time monitoring and error tracking for administrators
 */
export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [storedErrors, setStoredErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load stored errors on component mount
  useEffect(() => {
    loadStoredErrors();
  }, []);

  const loadStoredErrors = () => {
    const errors = ErrorLogger.getStoredErrors();
    setStoredErrors(errors);
  };

  const runHealthChecks = async () => {
    setIsLoading(true);
    try {
      const results = await HealthChecker.runHealthChecks();
      setHealthStatus(results);
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearStoredErrors = () => {
    ErrorLogger.clearStoredErrors();
    setStoredErrors([]);
  };

  const exportErrors = () => {
    const dataStr = JSON.stringify(storedErrors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medi-2-errors-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Monitor application health and track errors</p>
        </div>
        <Button
          onClick={runHealthChecks}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Run Health Checks
        </Button>
      </div>

      {lastUpdate && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Last updated: {new Date(lastUpdate).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="errors">Error Log</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          {healthStatus ? (
            <div className="grid gap-4 md:grid-cols-2">
              {healthStatus.checks.map((check, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {check.name.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                    {getStatusIcon(check.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(check.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(check.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {check.error && (
                      <p className="mt-2 text-xs text-red-600">
                        Error: {check.error}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No health check data available</p>
                  <p className="text-sm text-gray-400">Click &quot;Run Health Checks&quot; to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Stored Errors</h3>
              <p className="text-sm text-gray-600">
                {storedErrors.length} errors stored locally
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportErrors}
                disabled={storedErrors.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearStoredErrors}
                disabled={storedErrors.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          {storedErrors.length > 0 ? (
            <div className="space-y-2">
              {storedErrors.slice(-10).reverse().map((error, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-sm">
                            {error.message || 'Unknown error'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(error.timestamp).toLocaleString()}
                        </p>
                        {error.context && (
                          <div className="text-xs text-gray-600">
                            <p>URL: {error.url}</p>
                            {error.context.tags && (
                              <p>Tags: {Object.entries(error.context.tags).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-500">No errors stored</p>
                  <p className="text-sm text-gray-400">Application is running smoothly</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Real-time performance monitoring and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(performance.now())}ms
                  </div>
                  <p className="text-sm text-gray-600">Page Load Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {navigator.hardwareConcurrency || 'N/A'}
                  </div>
                  <p className="text-sm text-gray-600">CPU Cores</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(navigator.deviceMemory || 0)}GB
                  </div>
                  <p className="text-sm text-gray-600">Device Memory</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{"System Information"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">User Agent:</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {navigator.userAgent.substring(0, 50)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="text-gray-900">{navigator.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="text-gray-900">{navigator.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Online:</span>
                  <span className="text-gray-900">
                    {navigator.onLine ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
