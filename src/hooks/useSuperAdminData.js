import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { superAdminClient, cacheManager } from '@/api/superAdminClient';

// Custom hook for super admin data with React Query optimization
export function useSuperAdminData(queryKey, queryFn, options = {}) {
    const queryClient = useQueryClient();

    const defaultOptions = {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        ...options
    };

    const query = useQuery({
        queryKey,
        queryFn,
        ...defaultOptions
    });

    // Manual refresh function
    const refresh = useCallback(() => {
        queryClient.invalidateQueries(queryKey);
    }, [queryClient, queryKey]);

    // Force refresh (bypass cache)
    const forceRefresh = useCallback(() => {
        queryClient.invalidateQueries(queryKey);
        queryClient.refetchQueries(queryKey);
    }, [queryClient, queryKey]);

    return {
        ...query,
        refresh,
        forceRefresh
    };
}

// System overview metrics hook
export function useSystemOverview() {
    return useSuperAdminData(
        ['superAdmin', 'systemOverview'],
        () => superAdminClient.getSystemOverview(), {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        }
    );
}

// Organization performance hook
export function useOrganizationPerformance() {
    return useSuperAdminData(
        ['superAdmin', 'organizationPerformance'],
        () => superAdminClient.getOrganizationPerformance(), {
            staleTime: 10 * 60 * 1000, // 10 minutes
        }
    );
}

// User activity monitoring hook
export function useUserActivity() {
    return useSuperAdminData(
        ['superAdmin', 'userActivity'],
        () => superAdminClient.getUserActivity(), {
            staleTime: 2 * 60 * 1000, // 2 minutes
            refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
        }
    );
}

// Financial analytics hook
export function useFinancialAnalytics() {
    return useSuperAdminData(
        ['superAdmin', 'financialAnalytics'],
        () => superAdminClient.getFinancialAnalytics(), {
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    );
}

// Clinical operations hook
export function useClinicalOperations() {
    return useSuperAdminData(
        ['superAdmin', 'clinicalOperations'],
        () => superAdminClient.getClinicalOperations(), {
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    );
}

// Audit trail hook with pagination and filtering
export function useAuditTrail(page = 1, limit = 50, filters = {}) {
    const queryKey = ['superAdmin', 'auditTrail', page, limit, filters];

    return useSuperAdminData(
        queryKey,
        () => superAdminClient.getAuditTrail(page, limit, filters), {
            staleTime: 1 * 60 * 1000, // 1 minute
            keepPreviousData: true, // Keep previous data while loading new page
        }
    );
}

// Organization details hook
export function useOrganizationDetails(organizationId) {
    return useSuperAdminData(
        ['superAdmin', 'organizationDetails', organizationId],
        () => superAdminClient.getOrganizationDetails(organizationId), {
            staleTime: 5 * 60 * 1000, // 5 minutes
            enabled: !!organizationId, // Only run if organizationId is provided
        }
    );
}

// Aggregated metrics hook for client-side calculations
export function useAggregatedMetrics() {
    const { data: overview } = useSystemOverview();
    const { data: organizations } = useOrganizationPerformance();
    const { data: users } = useUserActivity();
    const { data: financial } = useFinancialAnalytics();

    return useMemo(() => {
        if (!overview || !organizations || !users || !financial) {
            return {
                isLoading: true,
                metrics: null
            };
        }

        // Calculate additional aggregated metrics
        const activeOrganizations = organizations.filter(org => org.status === 'active').length;
        const totalRevenue = organizations.reduce((sum, org) => sum + org.revenue, 0);
        const averageRevenuePerOrg = activeOrganizations > 0 ? totalRevenue / activeOrganizations : 0;

        // User role distribution
        const roleDistribution = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});

        // Organization type distribution
        const orgTypeDistribution = organizations.reduce((acc, org) => {
            acc[org.type] = (acc[org.type] || 0) + 1;
            return acc;
        }, {});

        // Top performing organizations by revenue
        const topOrganizations = organizations
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Recent activity summary
        const recentActivity = {
            newUsersThisWeek: users.filter(user =>
                new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            activeUsersToday: users.filter(user =>
                new Date(user.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length,
        };

        return {
            isLoading: false,
            metrics: {
                // System overview
                ...overview,

                // Calculated metrics
                activeOrganizations,
                averageRevenuePerOrg,
                totalRevenue,

                // Distributions
                roleDistribution,
                orgTypeDistribution,

                // Top performers
                topOrganizations,

                // Activity metrics
                recentActivity,

                // Financial summary
                financialSummary: financial?.summary || {},

                // Health indicators
                systemHealth: {
                    overall: 'healthy',
                    userActivity: recentActivity.activeUsersToday > 0 ? 'active' : 'low',
                    revenueGrowth: financial?.summary?.revenueGrowth || 0,
                    organizationHealth: activeOrganizations / organizations.length > 0.8 ? 'good' : 'needs_attention'
                }
            }
        };
    }, [overview, organizations, users, financial]);
}

// Cache management hook
export function useCacheManagement() {
    const queryClient = useQueryClient();

    const clearAllCache = useCallback(() => {
        cacheManager.clear();
        queryClient.clear();
    }, [queryClient]);

    const invalidateCache = useCallback((pattern) => {
        cacheManager.invalidate(pattern);
        queryClient.invalidateQueries(['superAdmin']);
    }, [queryClient]);

    const refreshAllData = useCallback(() => {
        queryClient.invalidateQueries(['superAdmin']);
    }, [queryClient]);

    const getCacheStats = useCallback(() => {
        return {
            cacheSize: cacheManager.cache.size,
            queryCacheSize: queryClient.getQueryCache().getAll().length,
            memoryUsage: JSON.stringify(cacheManager.cache).length
        };
    }, [queryClient]);

    return {
        clearAllCache,
        invalidateCache,
        refreshAllData,
        getCacheStats
    };
}

// Export data hook
export function useExportData() {
    const exportData = useCallback(async(type, filters = {}) => {
        try {
            const data = await superAdminClient.exportData(type, filters);

            // Convert to CSV format
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                const csvContent = [
                    headers.join(','),
                    ...data.map(row =>
                        headers.map(header =>
                            JSON.stringify(row[header] || '')
                        ).join(',')
                    )
                ].join('\n');

                // Download CSV
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `super_admin_${type}_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }

            return { success: true, count: data.length };
        } catch (error) {
            console.error('Export failed:', error);
            return { success: false, error: error.message };
        }
    }, []);

    return { exportData };
}

// Real-time updates hook
export function useRealTimeUpdates(enabled = true) {
    const queryClient = useQueryClient();

    const startPolling = useCallback(() => {
        if (!enabled) return;

        const interval = setInterval(() => {
            // Refresh critical data every 30 seconds
            queryClient.invalidateQueries(['superAdmin', 'systemOverview']);
            queryClient.invalidateQueries(['superAdmin', 'userActivity']);
        }, 30000);

        return () => clearInterval(interval);
    }, [enabled, queryClient]);

    return { startPolling };
}