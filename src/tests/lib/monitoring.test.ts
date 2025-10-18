/**
 * Type-safe tests for monitoring utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    initializeSentry,
    ErrorLogger,
    PerformanceMonitor,
    HealthChecker,
    AnalyticsTracker,
    initializeMonitoring,
} from '@/lib/monitoring';

// Mock Sentry
vi.mock('@sentry/react', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    addBreadcrumb: vi.fn(),
    setUser: vi.fn(),
    setTag: vi.fn(),
    setContext: vi.fn(),
    withScope: vi.fn((callback) => callback({ setTag: vi.fn(), setContext: vi.fn() })),
}));

// Mock environment variables
vi.mock('import.meta.env', () => ({
    MODE: 'test',
    VITE_SENTRY_DSN: 'https://test@sentry.io/test',
    VITE_APP_VERSION: '1.0.0',
}));

describe('Monitoring Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear localStorage
        localStorage.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Sentry Initialization', () => {
        it('should initialize Sentry with proper configuration', () => {
            const Sentry = require('@sentry/react');

            initializeSentry();

            expect(Sentry.init).toHaveBeenCalledWith(
                expect.objectContaining({
                    dsn: 'https://test@sentry.io/test',
                    environment: 'test',
                    tracesSampleRate: 1.0,
                    replaysSessionSampleRate: 0.5,
                    replaysOnErrorSampleRate: 1.0,
                })
            );
        });

        it('should handle missing Sentry DSN', () => {
            vi.mocked(import.meta.env).VITE_SENTRY_DSN = undefined as any;
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            initializeSentry();

            expect(consoleSpy).toHaveBeenCalledWith('Sentry DSN not configured. Error tracking disabled.');

            consoleSpy.mockRestore();
        });

        it('should filter out ResizeObserver errors in development', () => {
            const Sentry = require('@sentry/react');
            vi.mocked(import.meta.env).MODE = 'development';

            initializeSentry();

            const initCall = Sentry.init.mock.calls[0][0];
            const beforeSend = initCall.beforeSend;

            const resizeObserverError = new Error('ResizeObserver loop limit exceeded');
            const result = beforeSend({ exception: { values: [] } }, { originalException: resizeObserverError });

            expect(result).toBeNull();
        });
    });

    describe('ErrorLogger', () => {
        it('should log errors with context', () => {
            const Sentry = require('@sentry/react');
            const error = new Error('Test error');
            const context = {
                tags: { component: 'test' },
                extra: { data: 'test' },
                user: { id: 'user-1' },
            };

            ErrorLogger.log(error, context);

            expect(Sentry.captureException).toHaveBeenCalledWith(error, {
                tags: context.tags,
                extra: context.extra,
                user: context.user,
            });
        });

        it('should store errors locally', () => {
            const error = new Error('Test error');
            const context = { tags: { component: 'test' } };

            ErrorLogger.log(error, context);

            const storedErrors = ErrorLogger.getStoredErrors();
            expect(storedErrors).toHaveLength(1);
            expect(storedErrors[0]?.message).toBe('Test error');
        });

        it('should clear stored errors', () => {
            const error = new Error('Test error');
            ErrorLogger.log(error);

            ErrorLogger.clearStoredErrors();

            const storedErrors = ErrorLogger.getStoredErrors();
            expect(storedErrors).toHaveLength(0);
        });

        it('should handle errors without context', () => {
            const Sentry = require('@sentry/react');
            const error = new Error('Test error');

            ErrorLogger.log(error);

            expect(Sentry.captureException).toHaveBeenCalledWith(error, {});
        });

        it('should log errors in development mode', () => {
            vi.mocked(import.meta.env).MODE = 'development';
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const error = new Error('Test error');
            ErrorLogger.log(error);

            expect(consoleSpy).toHaveBeenCalledWith('🚨 Error logged:', expect.any(Object));

            consoleSpy.mockRestore();
        });
    });

    describe('PerformanceMonitor', () => {
        it('should start timing', () => {
            const startTime = PerformanceMonitor.startTiming('test-operation');

            expect(typeof startTime).toBe('number');
            expect(startTime).toBeGreaterThan(0);
        });

        it('should end timing and return duration', () => {
            const startTime = PerformanceMonitor.startTiming('test-operation');
            const duration = PerformanceMonitor.endTiming('test-operation', startTime);

            expect(typeof duration).toBe('number');
            expect(duration).toBeGreaterThan(0);
        });

        it('should measure API calls', async () => {
            const mockApiCall = vi.fn().mockResolvedValue('success');
            const context = { endpoint: '/api/test' };

            const result = await PerformanceMonitor.measureApiCall(mockApiCall, context);

            expect(result).toBe('success');
            expect(mockApiCall).toHaveBeenCalled();
        });

        it('should handle API call errors', async () => {
            const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'));
            const context = { endpoint: '/api/test' };

            await expect(PerformanceMonitor.measureApiCall(mockApiCall, context)).rejects.toThrow('API Error');
        });

        it('should track page load', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            PerformanceMonitor.trackPageLoad('test-page');

            expect(consoleSpy).toHaveBeenCalledWith('📊 Page load tracked:', expect.any(Object));

            consoleSpy.mockRestore();
        });
    });

    describe('UserActivityTracker', () => {
        // it('should track user actions', () => {
        //     const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        //     
        //     UserActivityTracker.trackAction('button_click', { buttonId: 'test-button' });
        //     
        //     expect(consoleSpy).toHaveBeenCalledWith('👤 User action tracked:', expect.any(Object));
        //     
        //     consoleSpy.mockRestore();
        // });

        // it('should track page views', () => {
        //     const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        //     
        //     UserActivityTracker.trackPageView('/test-page');
        //     
        //     expect(consoleSpy).toHaveBeenCalledWith('📄 Page view tracked:', expect.any(Object));
        //     
        //     consoleSpy.mockRestore();
        // });

        // it('should track form submissions', () => {
        //     const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        //     
        //     UserActivityTracker.trackFormSubmission('contact-form', { fields: ['name', 'email'] });
        //     
        //     expect(consoleSpy).toHaveBeenCalledWith('📝 Form submission tracked:', expect.any(Object));
        //     
        //     consoleSpy.mockRestore();
        // });

        // it('should track search queries', () => {
        //     const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        //     
        //     UserActivityTracker.trackSearch('test query', { results: 10 });
        //     
        //     expect(consoleSpy).toHaveBeenCalledWith('🔍 Search tracked:', expect.any(Object));
        //     
        //     consoleSpy.mockRestore();
        // });
    });

    describe('HealthChecker', () => {
        it('should perform health check', async () => {
            const result = await HealthChecker.checkApiHealth();

            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('timestamp');
            expect(['healthy', 'unhealthy']).toContain(result.status);
        });

        it('should check API health', async () => {
            const result = await HealthChecker.checkApiHealth();

            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('timestamp');
        });

        // it('should check database health', async () => {
        //     const result = await HealthChecker.checkDatabaseHealth();
        //     
        //     expect(result).toHaveProperty('status');
        //     expect(result).toHaveProperty('timestamp');
        // });

        // it('should check external services', async () => {
        //     const result = await HealthChecker.checkExternalServices();
        //     
        //     expect(result).toHaveProperty('status');
        //     expect(result).toHaveProperty('timestamp');
        // });
    });

    describe('AnalyticsTracker', () => {
        it('should track events', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            AnalyticsTracker.trackEvent('test_event', { value: 100 });

            expect(consoleSpy).toHaveBeenCalledWith('📈 Event tracked:', expect.any(Object));

            consoleSpy.mockRestore();
        });

        // it('should track conversions', () => {
        //     const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        //     
        //     AnalyticsTracker.trackConversion('purchase', { amount: 99.99 });
        //     
        //     expect(consoleSpy).toHaveBeenCalledWith('💰 Conversion tracked:', expect.any(Object));
        //     
        //     consoleSpy.mockRestore();
        // });

        // it('should track user properties', () => {
        //     const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        //     
        //     AnalyticsTracker.trackUserProperties({ plan: 'premium', age: 25 });
        //     
        //     expect(consoleSpy).toHaveBeenCalledWith('👤 User properties tracked:', expect.any(Object));
        //     
        //     consoleSpy.mockRestore();
        // });

        // it('should track page performance', () => {
        //     const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        //     
        //     AnalyticsTracker.trackPagePerformance({ loadTime: 1000, renderTime: 500 });
        //     
        //     expect(consoleSpy).toHaveBeenCalledWith('⚡ Performance tracked:', expect.any(Object));
        //     
        //     consoleSpy.mockRestore();
        // });
    });

    describe('Monitoring Initialization', () => {
        it('should initialize all monitoring components', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            initializeMonitoring();

            expect(consoleSpy).toHaveBeenCalledWith('🔧 Monitoring initialized');

            consoleSpy.mockRestore();
        });

        it('should set up error boundaries', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            initializeMonitoring();

            expect(consoleSpy).toHaveBeenCalledWith('🛡️ Error boundaries set up');

            consoleSpy.mockRestore();
        });

        it('should set up performance monitoring', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            initializeMonitoring();

            expect(consoleSpy).toHaveBeenCalledWith('📊 Performance monitoring set up');

            consoleSpy.mockRestore();
        });

        it('should set up user activity tracking', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            initializeMonitoring();

            expect(consoleSpy).toHaveBeenCalledWith('👤 User activity tracking set up');

            consoleSpy.mockRestore();
        });
    });

    describe('Integration Tests', () => {
        it('should work together in a complete monitoring setup', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            // Initialize monitoring
            initializeMonitoring();

            // Log an error
            const error = new Error('Test error');
            ErrorLogger.log(error, { tags: { component: 'test' } });

            // Track performance
            const startTime = PerformanceMonitor.startTiming('test-operation');
            PerformanceMonitor.endTiming('test-operation', startTime);

            // Track user activity
            // UserActivityTracker.trackAction('button_click', { buttonId: 'test-button' });

            // Track analytics
            AnalyticsTracker.trackEvent('test_event', { value: 100 });

            expect(consoleSpy).toHaveBeenCalledWith('🔧 Monitoring initialized');
            expect(consoleSpy).toHaveBeenCalledWith('🚨 Error logged:', expect.any(Object));
            expect(consoleSpy).toHaveBeenCalledWith('👤 User action tracked:', expect.any(Object));
            expect(consoleSpy).toHaveBeenCalledWith('📈 Event tracked:', expect.any(Object));

            consoleSpy.mockRestore();
        });

        it('should handle errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            // Initialize monitoring
            initializeMonitoring();

            // Log an error
            const error = new Error('Test error');
            ErrorLogger.log(error);

            // Check that error was stored
            const storedErrors = ErrorLogger.getStoredErrors();
            expect(storedErrors).toHaveLength(1);

            // Clear errors
            ErrorLogger.clearStoredErrors();
            const clearedErrors = ErrorLogger.getStoredErrors();
            expect(clearedErrors).toHaveLength(0);

            consoleSpy.mockRestore();
        });
    });
});
