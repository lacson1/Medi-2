import './App.css'
import { lazy, Suspense, useEffect, memo } from 'react'
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { useAuth } from "@/hooks/useAuth"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ErrorBoundary from '@/components/ErrorBoundary'
// import { initializeMonitoring, PerformanceMonitor } from '@/lib/monitoring'
import Loading from '@/components/Loading'

// Lazy load Pages component for better initial bundle size
const Pages = lazy(() => import("@/pages/index.tsx"))
const OrganizationSelectorModal = lazy(() => import('@/components/auth/OrganizationSelectorModal'))

// Initialize monitoring on app start
// initializeMonitoring();

// Handle browser extension connection errors gracefully
window.addEventListener('error', (event) => {
    if (event.error && typeof event.error === 'object' && 'message' in event.error) {
        const errorMessage = (event.error as Error).message;
        if (errorMessage && errorMessage.includes('Could not establish connection')) {
            // This is typically a browser extension error, not our app error
            console.warn('Browser extension connection error (ignored):', errorMessage);
            event.preventDefault(); // Prevent the error from being logged as an unhandled error
        }
    }
});

// Create optimized query client with performance settings
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Retry configuration
            retry: (failureCount: number, error: unknown) => {
                // Don't retry on 4xx errors (client errors)
                if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    if (status >= 400 && status < 500) {
                        return false;
                    }
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Caching configuration
            staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - data stays in cache (renamed from cacheTime)

            // Refetch configuration
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,

            // Background refetch
            refetchInterval: false,
            refetchIntervalInBackground: false,
        },
        mutations: {
            // Retry mutations once on failure
            retry: 1,
            retryDelay: 1000,
        },
    },
})

// App Content Component that uses Auth context - memoized for performance
const AppContent = memo(function AppContent() {
    const { showOrgSelector, userOrganizations, handleOrganizationSelect, closeOrgSelector } = useAuth();

    useEffect(() => {
        // Track app initialization
        // PerformanceMonitor.trackPageLoad('App');
        console.log('App initialized');
    }, []);

    return (
        <>
            <Suspense fallback={<Loading />}>
                <Pages />
            </Suspense>
            <Toaster />

            {/* Organization Selector Modal */}
            <Suspense fallback={null}>
                <OrganizationSelectorModal
                    isOpen={showOrgSelector}
                    onClose={closeOrgSelector}
                    userOrganizations={userOrganizations}
                    onOrganizationSelect={handleOrganizationSelect}
                />
            </Suspense>
        </>
    );
});

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <AppContent />
                    {/* Add React Query Devtools in development */}
                    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}

export default App
