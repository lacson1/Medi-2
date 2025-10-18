import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, Users, Building2, Activity, DollarSign, FileText, BarChart3, Key, UserPlus, Settings, Monitor, Server, TrendingUp, Lock, UserCheck, TestTube } from 'lucide-react';
import { PageLoading } from '@/components/Loading';
import { getPersonalizedGreeting } from '@/utils/greeting';

// Lazy load dashboard components for better performance
const SystemMetricsOverview = React.lazy(() => import('@/components/super-admin/SystemMetricsOverview'));
const OrganizationManagement = React.lazy(() => import('@/components/super-admin/OrganizationManagement'));
const OrganizationPerformance = React.lazy(() => import('@/components/super-admin/OrganizationPerformance'));
const FinancialAnalytics = React.lazy(() => import('@/components/super-admin/FinancialAnalytics'));
const UserActivityMonitor = React.lazy(() => import('@/components/super-admin/UserActivityMonitor'));
const ClinicalOperations = React.lazy(() => import('@/components/super-admin/ClinicalOperations'));
const AuditTrail = React.lazy(() => import('@/components/super-admin/AuditTrail'));
const RolePermissionManager = React.lazy(() => import('@/components/super-admin/RolePermissionManager'));
const UserManagement = React.lazy(() => import('@/components/super-admin/UserManagement'));
const GlobalSettings = React.lazy(() => import('@/components/super-admin/GlobalSettings'));
const SecuritySettings = React.lazy(() => import('@/components/super-admin/SecuritySettings'));
const TestUserGenerator = React.lazy(() => import('@/components/super-admin/TestUserGenerator'));
const TestDataSummary = React.lazy(() => import('@/components/super-admin/TestDataSummary'));
const MonitoringDashboard = React.lazy(() => import('@/components/MonitoringDashboard'));
const SystemSettings = React.lazy(() => import('@/components/super-admin/SystemSettings'));

export default function SuperAdminDashboard() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user has SuperAdmin role
  if (!hasRole('SuperAdmin')) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the Super Admin Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              This dashboard is restricted to Super Admin users only.
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('superAdminRefresh'));
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const tabConfig = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'System-wide metrics and KPIs',
      category: 'analytics'
    },
    {
      id: 'organization-management',
      label: 'Organizations',
      icon: Building2,
      description: 'Manage organizations with full CRUD',
      category: 'management'
    },
    {
      id: 'organizations',
      label: 'Performance',
      icon: TrendingUp,
      description: 'Organization performance and metrics',
      category: 'analytics'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'User activity and role distribution',
      category: 'management'
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: DollarSign,
      description: 'Revenue and billing analytics',
      category: 'analytics'
    },
    {
      id: 'clinical',
      label: 'Clinical',
      icon: Activity,
      description: 'Clinical operations and activity',
      category: 'operations'
    },
    {
      id: 'audit',
      label: 'Audit',
      icon: FileText,
      description: 'System-wide audit logs',
      category: 'security'
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: Key,
      description: 'Role and permission management',
      category: 'security'
    },
    {
      id: 'user-management',
      label: 'User Mgmt',
      icon: UserCheck,
      description: 'User account management',
      category: 'management'
    },
    {
      id: 'global-settings',
      label: 'Settings',
      icon: Settings,
      description: 'System-wide configuration',
      category: 'system'
    },
    {
      id: 'security-settings',
      label: 'Security',
      icon: Lock,
      description: 'Security policies and settings',
      category: 'security'
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Monitor,
      description: 'System monitoring and error tracking',
      category: 'system'
    },
    {
      id: 'system-settings',
      label: 'System',
      icon: Server,
      description: 'System status, performance, and configuration',
      category: 'system'
    },
    {
      id: 'test-generator',
      label: 'Test Users',
      icon: UserPlus,
      description: 'Generate test users',
      category: 'testing'
    },
    {
      id: 'test-data',
      label: 'Test Data',
      icon: TestTube,
      description: 'Test data summary and overview',
      category: 'testing'
    }
  ];

  // Group tabs by category for better organization
  const tabCategories = {
    analytics: { label: 'Analytics', icon: BarChart3, color: 'text-blue-600' },
    management: { label: 'Management', icon: Users, color: 'text-green-600' },
    operations: { label: 'Operations', icon: Activity, color: 'text-purple-600' },
    security: { label: 'Security', icon: Shield, color: 'text-red-600' },
    system: { label: 'System', icon: Server, color: 'text-orange-600' },
    testing: { label: 'Testing', icon: TestTube, color: 'text-cyan-600' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-8xl mx-auto p-3 space-y-3">
        {/* Compact Header */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {getPersonalizedGreeting(user?.first_name)}
                </h1>
                <p className="text-xs text-gray-600">
                  System-wide management across all organizations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs px-2 py-1">
                {user?.role || 'SuperAdmin'}
              </Badge>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Smart Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
            {/* Category-based Tab Groups */}
            <div className="space-y-2">
              {Object.entries(tabCategories).map(([categoryKey, category]) => {
                const categoryTabs = tabConfig.filter(tab => tab.category === categoryKey);
                if (categoryTabs.length === 0) return null;

                const CategoryIcon = category.icon;

                return (
                  <div key={categoryKey} className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {category.label}
                      </span>
                    </div>
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 h-auto bg-transparent p-0">
                      {categoryTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex flex-col items-center gap-1 h-auto py-2 px-2 text-xs data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 hover:bg-gray-50 transition-colors"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{tab.label}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                );
              })}
            </div>

            {/* Tab Content with reduced spacing */}
            <div className="space-y-2">
              <TabsContent value="overview" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <SystemMetricsOverview />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="organization-management" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <OrganizationManagement />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="organizations" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <OrganizationPerformance />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="users" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <UserActivityMonitor />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="financial" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <FinancialAnalytics />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="clinical" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <ClinicalOperations />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="audit" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <AuditTrail />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="roles" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <RolePermissionManager />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="user-management" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <UserManagement />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="global-settings" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <GlobalSettings />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="security-settings" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <SecuritySettings />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <MonitoringDashboard />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="system-settings" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <SystemSettings />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="test-generator" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <TestUserGenerator />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="test-data" className="space-y-2 m-0">
                <React.Suspense fallback={<PageLoading />}>
                  <TestDataSummary />
                </React.Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
