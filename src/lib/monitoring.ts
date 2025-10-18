/**
 * Monitoring and Error Tracking Configuration
 * Comprehensive monitoring setup for Bluequee2 application
 */

import * as Sentry from '@sentry/react';
import type { ErrorInfo, AuthUser } from '@/types';

// Environment-based configuration
const isProduction: boolean = import.meta.env.MODE === 'production';
const isDevelopment: boolean = import.meta.env.MODE === 'development';

// Sentry configuration
const SENTRY_DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT: string = import.meta.env.MODE || 'development';

// Error context interface
interface ErrorContext {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: Record<string, unknown>;
    [key: string]: unknown;
}

// Health check result interface
interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    statusCode?: number;
    error?: string;
    timestamp: string;
}

// Health check results interface
interface HealthCheckResults {
    timestamp: string;
    checks: Array<{
        name: string;
        status: 'healthy' | 'unhealthy';
        statusCode?: number;
        error?: string;
    }>;
}

// API call context interface
interface ApiCallContext {
    operation?: string;
    [key: string]: unknown;
}

/**
 * Initialize Sentry for error tracking
 */
export const initializeSentry = (): void => {
    if (!SENTRY_DSN) {
        console.warn('Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: SENTRY_ENVIRONMENT,
        integrations: [
            // BrowserTracing integration removed due to compatibility issues
            // Can be re-added when Sentry versions are aligned
        ],
        // Performance Monitoring
        tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
        // Session Replay
        replaysSessionSampleRate: isProduction ? 0.1 : 0.5,
        replaysOnErrorSampleRate: 1.0,
        // Error filtering
        beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint): Sentry.ErrorEvent | null {
            // Filter out development-only errors
            if (isDevelopment && event.exception) {
                const error = hint.originalException;
                if (error && error instanceof Error && error.message.includes('ResizeObserver loop limit exceeded')) {
                    return null; // Ignore ResizeObserver errors
                }
            }
            return event;
        },
        // User context
        initialScope: {
            tags: {
                component: 'mediflow-frontend',
                version: import.meta.env.VITE_APP_VERSION || '1.0.0',
            },
        },
    });

    // Sentry initialized successfully
};

/**
 * Custom error logger with context
 */
export class ErrorLogger {
    static log(error: Error, context: ErrorContext = {}): void {
        const errorInfo: ErrorInfo = {
            message: error.message || 'Unknown error',
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context,
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        // Log to console in development only
        if (isDevelopment) {
            console.error('🚨 Caught application error:', errorInfo);
        }

        // Send to Sentry
        Sentry.captureException(error, {
            tags: context.tags || {},
            extra: context.extra || {},
            user: context.user || {},
        });

        // Store in localStorage for debugging
        this.storeErrorLocally(errorInfo);
    }

    static storeErrorLocally(errorInfo: ErrorInfo): void {
        try {
            const errors: ErrorInfo[] = JSON.parse(localStorage.getItem('mediflow_errors') || '[]') as ErrorInfo[];
            errors.push(errorInfo);

            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }

            localStorage.setItem('mediflow_errors', JSON.stringify(errors));
        } catch {
            // Silently fail to avoid infinite error loops
        }
    }

    static getStoredErrors(): ErrorInfo[] {
        try {
            return JSON.parse(localStorage.getItem('mediflow_errors') || '[]') as ErrorInfo[];
        } catch {
            return [];
        }
    }

    static clearStoredErrors(): void {
        localStorage.removeItem('mediflow_errors');
    }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    static startTiming(label: string): number {
        if (isDevelopment) {
            console.time(label);
        }
        return performance.now();
    }

    static endTiming(label: string, startTime: number): number {
        if (isDevelopment) {
            console.timeEnd(label);
        }

        const duration = performance.now() - startTime;

        // Send to Sentry if duration is significant
        if (duration > 1000) { // More than 1 second
            Sentry.addBreadcrumb({
                message: `Slow operation: ${label}`,
                category: 'performance',
                level: 'warning',
                data: { duration },
            });
        }

        return duration;
    }

    static measureApiCall<T>(apiCall: () => Promise<T>, context: ApiCallContext = {}): Promise<T> {
        const startTime = this.startTiming(`API: ${context.operation || 'unknown'}`);

        return apiCall()
            .then(result => {
                this.endTiming(`API: ${context.operation || 'unknown'}`, startTime);
                return result;
            })
            .catch(error => {
                this.endTiming(`API: ${context.operation || 'unknown'}`, startTime);

                // Log API errors with context
                ErrorLogger.log(error instanceof Error ? error : new Error(String(error)), {
                    ...context,
                    tags: { type: 'api_error' },
                });

                throw error;
            });
    }

    static trackPageLoad(pageName: string): void {
        const startTime = performance.now();

        // Track page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.now() - startTime;

            Sentry.addBreadcrumb({
                message: `Page loaded: ${pageName}`,
                category: 'navigation',
                level: 'info',
                data: { loadTime },
            });
        });
    }
}

/**
 * User activity tracking
 */
export class UserActivityTracker {
    static trackUserAction(action: string, context: Record<string, unknown> = {}): void {
        Sentry.addBreadcrumb({
            message: `User action: ${action}`,
            category: 'user',
            level: 'info',
            data: context,
        });
    }

    static setUserContext(user: AuthUser): void {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            role: user.role,
            organization: user.organization,
        });
    }

    static clearUserContext(): void {
        Sentry.setUser(null);
    }
}

/**
 * Health check utilities
 */
export class HealthChecker {
    static async checkApiHealth(): Promise<HealthCheckResult> {
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            return {
                status: response.ok ? 'healthy' : 'unhealthy',
                statusCode: response.status,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    static checkLocalStorage(): HealthCheckResult {
        try {
            const testKey = 'mediflow_health_check';
            const testValue = Date.now().toString();

            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            return {
                status: retrieved === testValue ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    static async runHealthChecks(): Promise<HealthCheckResults> {
        const apiCheck = await this.checkApiHealth();
        const localStorageCheck = this.checkLocalStorage();

        const results: HealthCheckResults = {
            timestamp: new Date().toISOString(),
            checks: [
                {
                    name: 'api',
                    ...apiCheck,
                },
                {
                    name: 'localStorage',
                    ...localStorageCheck,
                },
            ],
        };

        // Log health check results in development
        if (isDevelopment) {
            console.log('🏥 Health check results:', results);
        }

        return results;
    }
}

/**
 * Analytics tracking (placeholder for future implementation)
 */
export class AnalyticsTracker {
    static trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
        // Placeholder for analytics implementation
        // Can be integrated with Google Analytics, Mixpanel, etc.

        if (isDevelopment) {
            console.log('📊 Analytics event:', eventName, properties);
        }

        // Send to Sentry as breadcrumb
        Sentry.addBreadcrumb({
            message: `Analytics: ${eventName}`,
            category: 'analytics',
            level: 'info',
            data: properties,
        });
    }

    static trackPageView(pageName: string, properties: Record<string, unknown> = {}): void {
        this.trackEvent('page_view', {
            page: pageName,
            ...properties,
        });
    }

    static trackUserAction(action: string, properties: Record<string, unknown> = {}): void {
        this.trackEvent('user_action', {
            action,
            ...properties,
        });
    }
}

/**
 * Initialize all monitoring systems
 */
export const initializeMonitoring = (): void => {
    // Initialize Sentry
    initializeSentry();

    // Set up global error handlers
    window.addEventListener('error', (event: ErrorEvent) => {
        ErrorLogger.log(event.error instanceof Error ? event.error : new Error(event.error ? String(event.error) : 'Unknown error'), {
            tags: { type: 'global_error' },
            extra: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            },
        });
    });

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        ErrorLogger.log(new Error(String(event.reason)), {
            tags: { type: 'unhandled_promise_rejection' },
            extra: { reason: event.reason },
        });
    });

    // Periodic health checks
    if (isProduction) {
        void setInterval(() => {
            void HealthChecker.runHealthChecks();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    // Monitoring systems initialized successfully
};

// Export default monitoring utilities
export default {
    ErrorLogger,
    PerformanceMonitor,
    UserActivityTracker,
    HealthChecker,
    AnalyticsTracker,
    initializeMonitoring,
};
